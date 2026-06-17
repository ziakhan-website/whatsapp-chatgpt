console.log('SCRIPT STARTED');

import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
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
    
    const sock = makeWASocket({
        logger: pino.default({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['Ubuntu', 'Chrome', '120.0.0'],
        version: [2, 2413, 1],
    });
    
    console.log('SOCKET CREATED - WAITING FOR CONNECTION');

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        console.log('CONNECTION STATUS:', connection);
        
        if (connection === 'close') {
            console.log('CONNECTION CLOSED:', lastDisconnect?.error);
        }
        
        if (connection === 'open') {
            console.log('CONNECTED TO WHATSAPP!');
            
            if (!state.creds.registered) {
                console.log('REQUESTING PAIRING CODE...');
                await new Promise(r => setTimeout(r, 2000));
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('================================');
                console.log('8 DIGIT CODE:', code);
                console.log('================================');
            }
        }
    });
}

startBot();
