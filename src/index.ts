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
        console.log('OLD SESSION DELETED');
    }

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    console.log('AUTH STATE CREATED');
    
    // Ye line sabse important hai - latest version auto fetch karega
    const { version } = await fetchLatestBaileysVersion();
    console.log('USING WA VERSION:', version);
    
    const sock = makeWASocket({
        logger: pino.default({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['Baileys', 'Chrome', '121.0.0'],
        version: version, // Hardcoded version hata diya
    });
    
    console.log('SOCKET CREATED - WAITING FOR CONNECTION');

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        console.log('CONNECTION STATUS:', connection);
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('CONNECTION CLOSED:', lastDisconnect?.error);
            if (shouldReconnect) {
                console.log('RECONNECTING...');
                startBot();
            }
        }
        
        if (connection === 'open') {
            console.log('CONNECTED TO WHATSAPP!');
            
            if (!state.creds.registered) {
                console.log('REQUESTING PAIRING CODE...');
                await new Promise(r => setTimeout(r, 3000));
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('================================');
                console.log('8 DIGIT CODE:', code);
                console.log('================================');
            }
        }
    });
}

startBot();
