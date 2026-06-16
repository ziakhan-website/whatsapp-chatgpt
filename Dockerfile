FROM node:18-alpine

# Git + ffmpeg dono install
RUN apk add --no-cache git ffmpeg

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
