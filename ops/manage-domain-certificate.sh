#!/bin/sh
set -eu
umask 077

domain=${1:?provide the certificate name}
case "$domain" in
  .*|*.|*..*|*[!a-zA-Z0-9.-]*)
    echo "Invalid certificate name." >&2
    exit 2
    ;;
esac

deploy_root=${KIASHI_DEPLOY_ROOT:-/opt/kiashi}
certbot_image=${KIASHI_CERTBOT_IMAGE:-docker.io/certbot/certbot:v5.4.0}
proxy=${KIASHI_PROXY_CONTAINER:-kiashi-proxy-1}
lineage="$deploy_root/letsencrypt/live/$domain"
cert_dir="$deploy_root/certs/$domain"

exec 9>"$deploy_root/deploy.lock"
flock -w 60 9

docker run --rm --pull=never \
  --volume "$deploy_root/letsencrypt:/etc/letsencrypt" \
  --volume "$deploy_root/acme:/var/www/certbot" \
  "$certbot_image" renew --non-interactive --quiet --cert-name "$domain"

if cmp -s "$lineage/fullchain.pem" "$cert_dir/fullchain.pem" &&
   cmp -s "$lineage/privkey.pem" "$cert_dir/privkey.pem"; then
  exit 0
fi

stage=$(mktemp -d "$cert_dir/.renewal.XXXXXX")
trap 'rm -rf -- "$stage"' EXIT
cp -p "$cert_dir/fullchain.pem" "$stage/fullchain.previous"
cp -p "$cert_dir/privkey.pem" "$stage/privkey.previous"
install -m 0644 "$lineage/fullchain.pem" "$stage/fullchain.pem"
install -m 0600 "$lineage/privkey.pem" "$stage/privkey.pem"
mv -f "$stage/fullchain.pem" "$cert_dir/fullchain.pem"
mv -f "$stage/privkey.pem" "$cert_dir/privkey.pem"

if docker exec "$proxy" nginx -t && docker kill --signal HUP "$proxy" >/dev/null; then
  exit 0
fi

mv -f "$stage/fullchain.previous" "$cert_dir/fullchain.pem"
mv -f "$stage/privkey.previous" "$cert_dir/privkey.pem"
echo "Could not reload the domain certificate. Restored the previous files." >&2
exit 1
