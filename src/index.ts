import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';

const start = async () => {
    console.log('BOT STARTING...');
    
    const phoneNumber = process.env.PHONE_NUMBER || '';
    
    if (fs.existsSync('./session')) {
        fs.rmSync('./session', { recursive: true, force: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const sock = makeWASocket({
        auth: state,
        logger: pino.default({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '110.0.0'],
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    // 5 sec wait karo phir code mango
    setTimeout(async () => {
        if (!state.creds.registered) {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('================================');
                console.log('8 DIGIT CODE:', code);
                console.log('================================');
            } catch (err) {
                console.log('PAIRING ERROR:', err);
            }
        }
    }, 5000);

    sock.ev.on('connection.update', (update) => {
        if (update.connection === 'open') {
            console.log('BOT CONNECTED SUCCESSFULLY!');
        }
    });
}

start();
