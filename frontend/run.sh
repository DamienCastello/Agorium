#!/bin/sh

# Définir l'URL du backend en fonction de l'environnement
if [ "$NODE_ENV" = "production" ]; then
  BACKEND_URL="https://agorium-backend.castello.ovh"
elif [ "$NODE_ENV" = "pre-prod" ]; then
  BACKEND_URL="https://agorium-backend-preprod.castello.ovh"
else
  BACKEND_URL="http://localhost:${VITE_PORT_BACK}"
fi

# Créer le fichier env.json avec les valeurs dynamiques
cat > /usr/share/nginx/html/env.json << EOF
{
  "VITE_BACKEND_URL": "${BACKEND_URL}",
  "VITE_PORT_BACK": "${VITE_PORT_BACK}",
  "VITE_AGORIUM_VERSION": "${VITE_AGORIUM_VERSION}"
}
EOF

exec nginx -g "daemon off;"