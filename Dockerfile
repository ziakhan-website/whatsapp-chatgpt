FROM node:bullseye-slim

# Git + FFmpeg install karo
RUN apt-get update && apt-get install -y git ffmpeg --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Package files copy karke install
COPY package.json package-lock.json ./
RUN npm install

# Baaki code copy
COPY . .
RUN npm run build

# Start command  
CMD ["node", "dist/index.js"]
