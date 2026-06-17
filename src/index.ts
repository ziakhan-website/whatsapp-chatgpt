import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';

const start = async () => {
    console.log('BOT STARTING...');
    
    const phoneNumber = process.env.PHONE_NUMBER;
    console.log('PHONE:', phoneNumber);
    
    // Purana session force delete karo
    if (fs.existsSync('./session')) {
        fs.rmSync('./session', { recursive: true, force: true });
        console.log('OLD SESSION DELETED');
    }

    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '110.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, qr } = update;
        
        if (connection === 'open') {
            console.log('BOT CONNECTED!');
        }
        
        if (qr) {
            console.log('GETTING PAIRING CODE...');
            const code = await sock.requestPairingCode(phoneNumber);
            console.log('8 DIGIT CODE:', code);
        }
    });
}

start();
