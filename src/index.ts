import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';

const start = async () => {
    console.log('BOT STARTING...');
    
    const phoneNumber = process.env.PHONE_NUMBER || '';
    console.log('PHONE:', phoneNumber);
    
    if (!phoneNumber) {
        console.log('ERROR: PHONE_NUMBER variable set nahi hai');
        return;
    }
    
    if (fs.existsSync('./session')) {
        fs.rmSync('./session', { recursive: true, force: true });
        console.log('OLD SESSION DELETED');
    }

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    console.log('AUTH STATE LOADED');

    const sock = makeWASocket({
        auth: state,
        logger: pino.default({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '110.0.0'],
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    // Pairing code direct mango - QR ka wait nahi karna
    if (!state.creds.registered) {
        console.log('REQUESTING PAIRING CODE...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log('================================');
            console.log('8 DIGIT CODE:', code);
            console.log('================================');
            console.log('WhatsApp > Linked Devices > Link with phone number pe ye code daalo');
        } catch (err) {
            console.log('PAIRING ERROR:', err);
        }
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        console.log('CONNECTION:', connection);
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnect:', shouldReconnect);
            if (shouldReconnect) {
                console.log('RECONNECTING IN 5 SEC...');
                setTimeout(start, 5000);
            }
        }
        
        if (connection === 'open') {
            console.log('BOT CONNECTED SUCCESSFULLY!');
        }
    });
}

start().catch(err => console.log('FATAL ERROR:', err));
