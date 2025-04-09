FROM node:18

WORKDIR /app

# Installe Dockerize
RUN apt-get update && apt-get install -y wget && \
    wget https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz && \
    tar -xzvf dockerize-linux-amd64-v0.6.1.tar.gz && \
    mv dockerize /usr/local/bin

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["dockerize", "-wait", "tcp://mysql:3306", "-timeout", "120s", "node", "bin/www.js"]
