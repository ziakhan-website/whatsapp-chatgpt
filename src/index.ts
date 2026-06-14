import fs from "fs";
import { Client, LocalAuth } from "whatsapp-web.js";

// Har baar naya folder - Railway ki SESSION_PATH ko ignore
const sessionPath = './session-final-' + Date.now();
if (fs.existsSync(sessionPath)) {
  fs.rmSync(sessionPath, { recursive: true, force: true });
}

const clientNumber = "923359848956";

const client = new Client({
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  authStrategy: new LocalAuth({
    dataPath: sessionPath  // Har deploy pe naya folder
  }),
  pairingCode: true,
  qrTimeout: 0  // QR ko band
});

client.initialize();

// QR ko log hi mat karo
client.on('qr', () => {});

client.on('ready', async () => {
  console.log('Client is ready!');
  setTimeout(async () => {
    const code = await client.requestPairingCode(clientNumber);
    console.log('8 DIGIT CODE:', code);
  }, 4000);
});

client.on('message', async (msg) => {
  if (msg.body === 'ping') {
    msg.reply('pong');
  }
});
