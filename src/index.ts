import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';

const start = async () => {
    const phoneNumber = process.env.PHONE_NUMBER;
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    if (!state.creds.registered) {
    await new Promise(resolve => setTimeout(resolve, 3000));

    await new Promise(resolve => {
        sock.ev.on('connection.update', (update) => {
            if (update.connection === 'connecting') resolve(true);
        });
    });
    
    const code = await sock.requestPairingCode(phoneNumber);
    console.log('8 DIGIT CODE:', code);
    }

    sock.ev.on('connection.update', (update) => {
        if (update.connection === 'open') {
            console.log('BOT CONNECTED!');
        }
    });
}

start();
