#!/bin/sh
set -eu

mode=${1:-renew}
deploy_root=${KIASHI_DEPLOY_ROOT:-/opt/kiashi}
public_ip=${KIASHI_PUBLIC_IP:?set KIASHI_PUBLIC_IP to the public IPv4 or IPv6 address}
certbot_image=${KIASHI_CERTBOT_IMAGE:-docker.io/certbot/certbot:v5.4.0}
proxy_container=${KIASHI_PROXY_CONTAINER:-kiashi-proxy-1}

letsencrypt_dir="$deploy_root/letsencrypt"
acme_dir="$deploy_root/acme"
certificate_dir="$deploy_root/certs"
live_dir="$letsencrypt_dir/live/$public_ip"

if [ "$(id -u)" -ne 0 ]; then
  echo "manage-ip-certificate must run as root" >&2
  exit 1
fi

mkdir -p "$letsencrypt_dir" "$acme_dir" "$certificate_dir"

run_certbot() {
  docker run --rm \
    --volume "$letsencrypt_dir:/etc/letsencrypt" \
    --volume "$acme_dir:/var/www/certbot" \
    "$certbot_image" "$@"
}

case "$mode" in
  issue)
    run_certbot certonly \
      --non-interactive \
      --agree-tos \
      --register-unsafely-without-email \
      --preferred-profile shortlived \
      --webroot \
      --webroot-path /var/www/certbot \
      --ip-address "$public_ip" \
      --cert-name "$public_ip"
    ;;
  renew)
    run_certbot renew \
      --non-interactive \
      --quiet \
      --preferred-profile shortlived \
      --cert-name "$public_ip"
    ;;
  *)
    echo "usage: $0 issue|renew" >&2
    exit 2
    ;;
esac

test -s "$live_dir/fullchain.pem"
test -s "$live_dir/privkey.pem"

install -m 0644 "$live_dir/fullchain.pem" "$certificate_dir/fullchain.pem.new"
install -m 0600 "$live_dir/privkey.pem" "$certificate_dir/privkey.pem.new"
mv -f "$certificate_dir/fullchain.pem.new" "$certificate_dir/fullchain.pem"
mv -f "$certificate_dir/privkey.pem.new" "$certificate_dir/privkey.pem"

docker exec "$proxy_container" nginx -t
docker kill --signal HUP "$proxy_container" >/dev/null

openssl x509 -in "$certificate_dir/fullchain.pem" \
  -noout -subject -issuer -dates -ext subjectAltName
