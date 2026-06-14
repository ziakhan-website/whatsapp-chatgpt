import { Client, Message, Events, LocalAuth } from "whatsapp-web.js";

const clientNumber = "923359848956";

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
    dataPath: process.env.SESSION_PATH || '/tmp/session'
  }),
  pairingCode: true,
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
});

client.initialize();

client.on('qr', (qr) => {
  console.log('PAIRING CODE:', qr);
});

client.on('ready', async () => {
  console.log('Client is ready!');
  const code = await client.requestPairingCode(clientNumber);
  console.log('8 DIGIT CODE:', code);
});

client.on('message', async (msg) => {
  if (msg.body === 'ping') {
    msg.reply('pong');
  }
});
