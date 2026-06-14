import { Client, Message, Events, LocalAuth } from "whatsapp-web.js";

const client = new Client({
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security'
    ]
  },
  authStrategy: new LocalAuth({
    dataPath: process.env.SESSION_PATH || './session'
  }),
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
});

client.initialize();

client.on('qr', (qr) => {
  console.log('PAIRING CODE:', qr);
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('message', async (msg) => {
  if (msg.body === 'ping') {
    msg.reply('pong');
  }
});
