#!/bin/sh

# Définir l'URL du backend en fonction de l'environnement
if [ "$NODE_ENV" = "production" ]; then
  BACKEND_URL="https://agorium-backend.castello.ovh"
elif [ "$NODE_ENV" = "preprod" ]; then
  BACKEND_URL="https://agorium-preprod-backend.castello.ovh"
else
  BACKEND_URL="http://localhost:${VITE_PORT_BACK}"
fi

# Créer le fichier env.json avec les valeurs dynamiques
cat > /usr/share/nginx/html/env.json << EOF
{
  "VITE_BACKEND_URL": "${BACKEND_URL}",
  "VITE_PORT_BACK": "${VITE_PORT_BACK}",
  "VITE_AGORIUM_VERSION": "${VITE_AGORIUM_VERSION}",
  "NODE_ENV": "${NODE_ENV}"
}
EOF

exec nginx -g "daemon off;"