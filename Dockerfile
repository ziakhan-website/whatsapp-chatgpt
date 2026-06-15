FROM node:bullseye-slim

# System update
RUN apt-get update

# Chromium + saari dependencies whatsapp-web.js ke liye
RUN apt-get install -y \
gconf-service \
libgbm-dev \
libasound2 \
libatk1.0-0 \
libc6 \
libcairo2 \
libcups2 \
libdbus-1-3 \
libexpat1 \
libfontconfig1 \
libgcc1 \
libgconf-2-4 \
libgdk-pixbuf2.0-0 \
libglib2.0-0 \
libgtk-3-0 \
libnspr4 \
libpango-1.0-0 \
libpangocairo-1.0-0 \
libstdc++6 \
libx11-6 \
libx11-xcb1 \
libxcb1 \
libxcomposite1 \
libxcursor1 \
libxdamage1 \
libxext6 \
libxfixes3 \
libxi6 \
libxrandr2 \
libxrender1 \
libxss1 \
libxtst6 \
ca-certificates \
fonts-liberation \
libappindicator1 \
libnss3 \
lsb-release \
xdg-utils \
wget \
chromium \
--no-install-recommends && rm -rf /var/lib/apt/lists/*

# FFmpeg for transcription/voice
RUN apt-get update && apt-get install -y ffmpeg --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Puppeteer ko system chromium use karne ka bolo
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Environment variables
ENV OPENAI_API_KEY=""
ENV PREFIX_ENABLED=""

# Package files copy karke install
COPY package.json package-lock.json ./
RUN npm install


# Baaki code copy
COPY . .
RUN npm run build

# Start command  
CMD ["node", "dist/index.js"]
