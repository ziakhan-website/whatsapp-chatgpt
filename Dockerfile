FROM node:18-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
