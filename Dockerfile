FROM node:bullseye-slim

# Git + FFmpeg + SSH client install karo
RUN apt-get update && apt-get install -y git ffmpeg openssh-client --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Package files copy karke install - ab lock file nahi hai
COPY package.json ./
RUN npm install

# Baaki code copy
COPY . .
RUN npm run build

# Start command  
CMD ["node", "dist/index.js"]
