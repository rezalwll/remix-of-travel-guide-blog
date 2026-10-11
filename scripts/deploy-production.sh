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

for command in awk curl dirname docker find flock git grep install; do
  command -v "$command" >/dev/null || {
    echo "Required command is unavailable: $command" >&2
    exit 69
  }
done

app_dir="$deploy_root/app"
backup_dir="$deploy_root/backups"
lock_file="$deploy_root/deploy.lock"

test -d "$app_dir/.git" || {
  echo "Application checkout is missing at $app_dir." >&2
  exit 66
}

env_file=""
for candidate in \
  "$deploy_root/env/.env.production" \
  "$deploy_root/.env.production" \
  "$app_dir/.env.production"; do
  if [[ -r "$candidate" ]]; then
    env_file=$candidate
    break
  fi
done
if [[ -z "$env_file" ]]; then
  env_file=$(find "$deploy_root" -maxdepth 3 -type f -name '.env.production' -print -quit 2>/dev/null || true)
fi
if [[ -z "$env_file" || ! -r "$env_file" ]]; then
  echo "No readable .env.production was found below $deploy_root." >&2
  exit 66
fi

compose_file=""
compose_candidates=(
  "$deploy_root/compose.production.yml"
  "$deploy_root/compose.production.yaml"
  "$deploy_root/docker-compose.production.yml"
  "$deploy_root/docker-compose.production.yaml"
  "$app_dir/compose.production.yml"
  "$app_dir/compose.production.yaml"
  "$app_dir/docker-compose.production.yml"
  "$app_dir/docker-compose.production.yaml"
  "$app_dir/docker-compose.production.example.yml"
)
while IFS= read -r candidate; do
  compose_candidates+=("$candidate")
done < <(find "$deploy_root" -maxdepth 3 -type f \( -name '*compose*.yml' -o -name '*compose*.yaml' \) -print 2>/dev/null || true)

for candidate in "${compose_candidates[@]}"; do
  [[ -r "$candidate" ]] || continue
  services=$(docker compose --env-file "$env_file" -f "$candidate" config --services 2>/dev/null) || continue
  if grep -qx app <<<"$services" && \
     grep -qx web <<<"$services" && \
     grep -qx postgres <<<"$services"; then
    compose_file=$candidate
    if grep -qx migrate <<<"$services"; then
      compose_has_migrate=true
    else
      compose_has_migrate=false
    fi
    break
  fi
done
if [[ -z "$compose_file" ]]; then
  echo "No production Compose file with app, web and postgres services was found below $deploy_root." >&2
  exit 66
fi

env_dir=$(dirname "$env_file")
release_override="$env_dir/compose.release.yml"
echo "Using production Compose file: $compose_file"
echo "Using production environment file: $env_file"

exec 9>"$lock_file"
flock -n 9 || {
  echo "Another production deployment is already running." >&2
  exit 75
}

compose=(docker compose --env-file "$env_file" -f "$compose_file")
previous_env=$(mktemp "$env_dir/.env.production.rollback.XXXXXX")
previous_override=$(mktemp "$env_dir/compose.release.rollback.XXXXXX")
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
  < /dev/null > "$backup_file"
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
new_override=$(mktemp "$env_dir/compose.release.new.XXXXXX")
cat > "$new_override" <<EOF
services:
  app:
    image: $api_image
  web:
    image: $web_image
EOF
if [[ "$compose_has_migrate" == true ]]; then
  cat >> "$new_override" <<EOF
  migrate:
    image: $migrate_image
EOF
fi
install -m 0600 "$new_override" "$release_override"
rm -f "$new_override"

set_env_value() {
  local key=$1
  local value=$2
  local next_env
  next_env=$(mktemp "$env_dir/.env.production.new.XXXXXX")
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
if [[ "$compose_has_migrate" == true ]]; then
  "${compose[@]}" run --rm --no-deps -T migrate < /dev/null
else
  postgres_container=$("${compose[@]}" ps -q postgres)
  test -n "$postgres_container"
  production_network=$(docker inspect --format '{{range $name, $_ := .NetworkSettings.Networks}}{{println $name}}{{end}}' "$postgres_container" | awk 'NR == 1 { print; exit }')
  test -n "$production_network"
  docker run --rm --network "$production_network" --env-file "$env_file" "$migrate_image" < /dev/null
fi

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
