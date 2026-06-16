FROM node:bullseye-slim

RUN apt-get update && apt-get install -y git ffmpeg openssh-client --no-install-recommends && rm -rf /var/lib/apt/lists/*

# YE LINE JADU KAREGI - SSH ko HTTPS mein badal degi
RUN git config --global url."https://github.com/".insteadOf git@github.com:

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
