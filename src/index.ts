import fs from "fs";
import { Client, LocalAuth } from "whatsapp-web.js";

async function startBot() {
  // Har baar naya folder
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
      dataPath: sessionPath
    }),
    pairingCode: true,
    qrTimeout: 0
  });

  client.initialize();

  client.on('qr', () => {});

  client.on('ready', async () => {
    console.log('Client is ready!');
    setTimeout(async () => {
      const code = await client.requestPairingCode(clientNumber);
      console.log('8 DIGIT CODE:', code);
    }, 4000);
  });

  client.on('disconnected', (reason) => {
    console.log('Disconnected:', reason);
  });

  client.on('error', (err) => {
    console.log('Error:', err);
  });
}

startBot();

// Railway ko zinda rakhne ke liye
setInterval(() => {}, 1000 * 60 * 60);
