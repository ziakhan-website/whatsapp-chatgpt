import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';

const phoneNumber = process.env.PHONE_NUMBER || '';

async function startBot() {
    if (fs.existsSync('./session')) {
        fs.rmSync('./session', { recursive: true, force: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    
    const sock = makeWASocket({
        logger: pino.default({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['Ubuntu', 'Chrome', '120.0.0'],
        version: [2, 2413, 1],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        
        if (connection === 'open') {
            console.log('CONNECTED TO WHATSAPP!');
            
            if (!state.creds.registered) {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('================================');
                console.log('8 DIGIT CODE:', code);
                console.log('================================');
            }
        }
    });
}

startBot();
