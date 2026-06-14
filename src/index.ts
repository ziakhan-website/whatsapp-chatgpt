import fs from "fs";
import { Client, Message, Events, LocalAuth } from "whatsapp-web.js";

if (process.env.FORCE_NEW_SESSION === 'true') {
  const sessionPath = process.env.SESSION_PATH || '/tmp/session';
  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
    console.log('Old session deleted');
  }
}

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
    dataPath: './session-new'
  }),
  pairingCode: true,
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
});
await client.destroy();
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
