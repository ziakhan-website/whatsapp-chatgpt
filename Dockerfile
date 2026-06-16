FROM node:bullseye-slim

# Git + FFmpeg install karo
RUN apt-get update && apt-get install -y git ffmpeg --no-install-recommends && rm -rf /var/lib/apt/lists/*

# SSH ko HTTPS me convert karo - YE NAYI LINE HAI
RUN git config --global url."https://github.com/".insteadOf git@github.com:

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
