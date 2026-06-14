import fs from "fs";
import { Client, LocalAuth } from "whatsapp-web.js";

// Purana session folder force delete
const sessionPath = './session-final';
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
    dataPath: sessionPath  // Naya folder har baar
  }),
  pairingCode: true,
  qrTimeout: 0  // QR ko disable kar dega
});

client.initialize();

// QR event ko bilkul log mat karo
client.on('qr', () => {
  console.log('QR disabled, waiting for ready...');
});

client.on('ready', async () => {
  console.log('Client is ready!');
  // 3 second wait phir code mango
  setTimeout(async () => {
    const code = await client.requestPairingCode(clientNumber);
    console.log('8 DIGIT CODE:', code);
  }, 3000);
});

client.on('message', async (msg) => {
  if (msg.body === 'ping') {
    msg.reply('pong');
  }
});
