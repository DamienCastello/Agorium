FROM node:18

WORKDIR /app

# Install ffmpeg + wget + dockerize (keep your base image and flow)
# (English comments)
# - ffmpeg is required at runtime by fluent-ffmpeg
# - clean apt lists to keep layers smaller (safe)
RUN apt-get update \
 && apt-get install -y wget ffmpeg \
 && wget https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz \
 && tar -xzvf dockerize-linux-amd64-v0.6.1.tar.gz \
 && mv dockerize /usr/local/bin \
 && rm -f dockerize-linux-amd64-v0.6.1.tar.gz \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["dockerize", "-wait", "tcp://mysql:3306", "-timeout", "120s", "node", "bin/www.js"]
