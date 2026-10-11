#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

release_sha=${1:?release SHA is required}
deploy_root=${2:-/opt/kiashi}
site_url=${3:?production site URL is required}

if [[ ! "$release_sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Release SHA must be a full 40-character commit SHA." >&2
  exit 64
fi

if [[ ! "$deploy_root" =~ ^/opt/[a-zA-Z0-9._/-]+$ ]]; then
  echo "Deployment root must be an absolute directory below /opt." >&2
  exit 64
fi

if [[ ! "$site_url" =~ ^https://[a-zA-Z0-9.-]+(:[0-9]+)?$ ]]; then
  echo "Production site URL must be an HTTPS origin without a path." >&2
  exit 64
fi

for command in awk curl docker flock git install; do
  command -v "$command" >/dev/null || {
    echo "Required command is unavailable: $command" >&2
    exit 69
  }
done

app_dir="$deploy_root/app"
compose_file="$deploy_root/compose.production.yml"
env_file="$deploy_root/env/.env.production"
release_override="$deploy_root/env/compose.release.yml"
backup_dir="$deploy_root/backups"
lock_file="$deploy_root/deploy.lock"

test -d "$app_dir/.git" || {
  echo "Application checkout is missing at $app_dir." >&2
  exit 66
}
test -r "$compose_file" || {
  echo "Production compose file is missing at $compose_file." >&2
  exit 66
}
test -r "$env_file" || {
  echo "Production environment file is missing at $env_file." >&2
  exit 66
}

exec 9>"$lock_file"
flock -n 9 || {
  echo "Another production deployment is already running." >&2
  exit 75
}

compose=(docker compose --env-file "$env_file" -f "$compose_file")
previous_env=$(mktemp "$deploy_root/env/.env.production.rollback.XXXXXX")
previous_override=$(mktemp "$deploy_root/env/compose.release.rollback.XXXXXX")
deployment_started=false
rollback_available=false

cleanup() {
  rm -f "$previous_env" "$previous_override"
}

rollback() {
  local exit_code=$?
  trap - ERR

  if [[ "$deployment_started" == true && "$rollback_available" == true ]]; then
    echo "Deployment failed; attempting to restore the previous application images." >&2
    install -m 0600 "$previous_env" "$env_file"
    install -m 0600 "$previous_override" "$release_override"
    compose=(docker compose --env-file "$env_file" -f "$compose_file" -f "$release_override")
    "${compose[@]}" up -d --no-deps app web || true
  fi

  cleanup
  exit "$exit_code"
}

trap rollback ERR
trap cleanup EXIT

cd "$app_dir"

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo "Production checkout contains tracked local changes; refusing to overwrite them." >&2
  exit 65
fi

git fetch --quiet --prune origin main
git cat-file -e "$release_sha^{commit}"
git merge-base --is-ancestor "$release_sha" origin/main || {
  echo "Requested release is not part of origin/main." >&2
  exit 65
}
git checkout --quiet --detach "$release_sha"

short_sha=$(git rev-parse --short=12 "$release_sha")
build_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
api_image="kiashi:$short_sha"
web_image="kiashi-web:$short_sha"
migrate_image="kiashi-migrate:$short_sha"

echo "Building production images for $release_sha."
docker build --build-arg "SITE_URL=$site_url" --target api --tag "$api_image" .
docker build --build-arg "SITE_URL=$site_url" --target web --tag "$web_image" .
docker build --build-arg "SITE_URL=$site_url" --target migrate --tag "$migrate_image" .

install -d -m 0700 "$backup_dir"
backup_file="$backup_dir/pre-deploy-$short_sha-$(date -u +%Y%m%dT%H%M%SZ).dump"
echo "Creating pre-deployment database backup."
"${compose[@]}" exec -T postgres sh -c \
  'pg_dump --format=custom --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  > "$backup_file"
test -s "$backup_file"
chmod 0600 "$backup_file"

install -m 0600 "$env_file" "$previous_env"
if [[ -s "$release_override" ]]; then
  install -m 0600 "$release_override" "$previous_override"
  rollback_available=true
else
  current_api_image=$(docker inspect --format '{{.Config.Image}}' "$("${compose[@]}" ps -q app)")
  current_web_image=$(docker inspect --format '{{.Config.Image}}' "$("${compose[@]}" ps -q web)")
  cat > "$previous_override" <<EOF
services:
  app:
    image: $current_api_image
  web:
    image: $current_web_image
EOF
  rollback_available=true
fi

deployment_started=true
new_override=$(mktemp "$deploy_root/env/compose.release.new.XXXXXX")
cat > "$new_override" <<EOF
services:
  migrate:
    image: $migrate_image
  app:
    image: $api_image
  web:
    image: $web_image
EOF
install -m 0600 "$new_override" "$release_override"
rm -f "$new_override"

set_env_value() {
  local key=$1
  local value=$2
  local next_env
  next_env=$(mktemp "$deploy_root/env/.env.production.new.XXXXXX")
  awk -v key="$key" -v value="$value" '
    BEGIN { replaced = 0 }
    index($0, key "=") == 1 { print key "=" value; replaced = 1; next }
    { print }
    END { if (!replaced) print key "=" value }
  ' "$env_file" > "$next_env"
  install -m 0600 "$next_env" "$env_file"
  rm -f "$next_env"
}

set_env_value APP_VERSION "$short_sha"
set_env_value GIT_SHA "$release_sha"
set_env_value BUILD_TIME "$build_time"

compose=(docker compose --env-file "$env_file" -f "$compose_file" -f "$release_override")

echo "Applying database migrations from the certified release image."
"${compose[@]}" run --rm --no-deps migrate

"${compose[@]}" up -d --no-deps app

wait_for_health() {
  local service=$1
  local container_id status
  container_id=$("${compose[@]}" ps -q "$service")
  test -n "$container_id"
  for _ in {1..60}; do
    status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id")
    case "$status" in
      healthy|running) return 0 ;;
      unhealthy|exited|dead) return 1 ;;
    esac
    sleep 2
  done
  return 1
}

wait_for_health app
"${compose[@]}" up -d --no-deps web
wait_for_health web

site_host=${site_url#https://}
site_host=${site_host%%:*}
for attempt in {1..30}; do
  response=$(curl --fail --silent --show-error --insecure \
    --resolve "$site_host:443:127.0.0.1" \
    --connect-timeout 5 --max-time 10 \
    "$site_url/health/version") && \
    grep -Fq "$release_sha" <<<"$response" && break
  if [[ "$attempt" -eq 30 ]]; then
    echo "Local production proxy did not report release $release_sha." >&2
    exit 1
  fi
  sleep 2
done

deployment_started=false
trap - ERR
cleanup
trap - EXIT

echo "Production successfully deployed at $release_sha."
