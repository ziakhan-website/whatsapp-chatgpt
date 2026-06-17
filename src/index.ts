import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';

const start = async () => {
    const phoneNumber = process.env.PHONE_NUMBER;
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    version: [2, 3000, 1023223821]
});

    sock.ev.on('creds.update', saveCreds);

    if (!state.creds.registered) {
    sock.ev.on('connection.update', async (update) => {
        if (update.connection === 'open') {
            console.log('BOT CONNECTED!');
        }
        if (update.qr || update.pairingCode) {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log('8 DIGIT CODE:', code);
        }
    });
    }

    
}

start();
