import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';

const start = async () => {
    const phoneNumber = process.env.PHONE_NUMBER || '923359848956';
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    if (!state.creds.registered) {
        await new Promise(resolve => setTimeout(resolve, 5000));
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
