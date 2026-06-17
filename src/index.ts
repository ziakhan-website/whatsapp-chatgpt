import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';

const start = async () => {
    console.log('BOT STARTING...');
    
    const phoneNumber: string = process.env.PHONE_NUMBER || '';
    console.log('PHONE:', phoneNumber);
    
    if (!phoneNumber) {
        console.log('ERROR: PHONE_NUMBER variable set nahi hai');
        return;
    }
    
    try {
        if (fs.existsSync('./session')) {
            fs.rmSync('./session', { recursive: true, force: true });
            console.log('OLD SESSION DELETED');
        }
    } catch (e) {
        console.log('Session delete failed:', e);
    }

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    console.log('AUTH STATE LOADED');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '110.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        console.log('CONNECTION:', connection);
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnect:', shouldReconnect);
            if (shouldReconnect) start();
        }
        
        if (connection === 'open') {
            console.log('BOT CONNECTED SUCCESSFULLY!');
        }
        
        if (update.qr) {
            console.log('QR RECEIVED - GETTING PAIRING CODE...');
            await new Promise(resolve => setTimeout(resolve, 3000)); // 2 sec wait
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('================================');
                console.log('8 DIGIT CODE:', code);
                console.log('================================');
            } catch (err) {
                console.log('PAIRING ERROR:', err);
            }
        }
    });
}

start().catch(err => console.log('FATAL ERROR:', err));
