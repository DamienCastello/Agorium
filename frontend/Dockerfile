FROM node:18 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_APP_MODE

ENV VITE_APP_MODE=${VITE_APP_MODE}

RUN echo "Building with VITE_APP_MODE=${VITE_APP_MODE}" && npm run build -- --mode ${VITE_APP_MODE}

FROM nginx:stable-alpine as production-stage

# Crée une nouvelle variable d'environnement dans la production-stage pour utiliser VITE_APP_MODE
ARG VITE_APP_MODE
ENV VITE_APP_MODE=${VITE_APP_MODE}

# Copie du frontend compilé
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copie des fichiers de conf
COPY nginx.conf /etc/nginx/nginx.conf
#COPY default.conf /etc/nginx/conf.d/default.conf

RUN echo "CHECK VITE_APP_MODE=${VITE_APP_MODE}"

# Utilise la variable ARG pour personnaliser la copie du fichier de conf
COPY default-${VITE_APP_MODE}.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

COPY ./run.sh /run.sh

CMD ["/bin/sh", "/run.sh"]
