FROM node:bullseye-slim

# Git + FFmpeg + SSH client install karo
RUN apt-get update && apt-get install -y git ffmpeg openssh-client --no-install-recommends && rm -rf /var/lib/apt/lists/*

# SSH ko HTTPS me convert karo - YE LINE NPM INSTALL SE PEHLE
RUN git config --global url."https://github.com/".insteadOf git@github.com:

WORKDIR /app

# Package files copy karke install
COPY package.json package-lock.json ./
RUN npm install

# Baaki code copy
COPY . .
RUN npm run build

# Start command  
CMD ["node", "dist/index.js"]
