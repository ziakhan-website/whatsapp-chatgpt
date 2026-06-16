FROM node:18-alpine

RUN apk add --no-cache git ffmpeg

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

CMD ["node", "dist/index.js"]
