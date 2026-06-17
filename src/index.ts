console.log('SCRIPT STARTED');

import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';

const phoneNumber = process.env.PHONE_NUMBER || '';
console.log('PHONE FROM RAILWAY:', phoneNumber);

async function startBot() {
    console.log('FUNCTION STARTBOT CALLED');
    
    if (fs.existsSync('./session')) {
        fs.rmSync('./session', { recursive: true, force: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();
    console.log('USING WA VERSION:', version);
    
    const sock = makeWASocket({
        logger: pino.default({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['Baileys', 'Chrome', '121.0.0'],
        version,
    });

    sock.ev.on('creds.update', saveCreds);

    // Pairing code turant mango - connection ka wait nahi karna
    if (!state.creds.registered) {
        console.log('WAITING 3 SECONDS...');
        await new Promise(r => setTimeout(r, 3000));
        console.log('REQUESTING PAIRING CODE NOW...');
        try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log('================================');
            console.log('8 DIGIT CODE:', code);
            console.log('================================');
        } catch (err) {
            console.log('PAIRING ERROR:', err);
        }
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        console.log('CONNECTION STATUS:', connection);
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('CONNECTION CLOSED:', lastDisconnect?.error?.message);
            if (shouldReconnect) {
                console.log('RECONNECTING IN 5 SEC...');
                setTimeout(startBot, 5000);
            }
        }
        
        if (connection === 'open') {
            console.log('CONNECTED TO WHATSAPP!');
        }
    });
}

startBot();
