FROM node:bullseye-slim

RUN apt-get update && apt-get install -y git ffmpeg openssh-client --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./

# NPM ko force karo HTTPS use kare
RUN npm config set registry https://registry.npmjs.org/
RUN npm install --no-git

COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
