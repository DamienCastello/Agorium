#!/bin/sh

cat > /usr/share/nginx/html/env.json << EOF
{
  "VITE_BASE_URL": "${VITE_BASE_URL}",
  "VITE_PORT_BACK": "${VITE_PORT_BACK}",
  "VITE_PORT_FRONT": "${VITE_PORT_FRONT}"
}
EOF

exec nginx -g "daemon off;"