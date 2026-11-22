#!/bin/bash

MSP_DOMAIN="<Your Firewalla Domain>"
API_TOKEN="<My API Token>"
TARGET_LIST_ID="<Target List ID>"   # TL-00000000-0000-0000-0000-000000000000
FILE_PATH="<CF Real IP Conf Path>"  # /path/to/cf_real-ip.conf 
NOTE="$(date '+%H:%M:%S %Z %m-%d-%Y')"

# Grab current IPv4 and IPv6 IPs. 
CF_IPS=$(printf "%s\n%s\n" \
  "$(curl -fsSL https://www.cloudflare.com/ips-v4)" \
  "$(curl -fsSL https://www.cloudflare.com/ips-v6)" \
  | grep -Eo '([0-9]{1,3}\.){3}[0-9]{1,3}/[0-9]{1,2}|[0-9a-fA-F:]+/[0-9]{1,3}')

[[ -n "$CF_IPS" ]] || exit 1

JSON_ARRAY=$(printf '"%s",' $CF_IPS | sed 's/,$//')

curl -fsS -X PATCH "https://${MSP_DOMAIN}/v2/target-lists/${TARGET_LIST_ID}" \
  -H "Authorization: Token ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"notes\":\"${NOTE}\",\"targets\":[${JSON_ARRAY}]}" 
