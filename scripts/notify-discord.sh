#!/usr/bin/env bash
# Uso: DISCORD_WEBHOOK_URL=... scripts/notify-discord.sh "mensaje"
# Nunca falla el pipeline: sin webhook o con error de red solo avisa en el log.
set -u
if [ -z "${DISCORD_WEBHOOK_URL:-}" ]; then
  echo "Sin DISCORD_WEBHOOK_URL: no se envía el aviso."
  exit 0
fi
payload=$(jq -n --arg content "$1" '{content: $content}')
curl -sS -m 15 -H 'Content-Type: application/json' -d "$payload" "$DISCORD_WEBHOOK_URL" \
  || echo "No se pudo enviar el aviso a Discord."
exit 0
