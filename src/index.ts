import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';

const start = async () => {
    console.log('Bot starting...');
    console.log('====================');

    const phoneNumber = process.env.PHONE_NUMBER || '923359848956';
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Railway Bot', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    // PAIRING CODE GENERATION
    if (!state.creds.registered) {
        console.log('Waiting 3 seconds for WhatsApp server...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        const code = await sock.requestPairingCode(phoneNumber);
        console.log('====================');
        console.log('PAIRING CODE BELOW - OPEN WHATSAPP');
        console.log('8 DIGIT CODE:', code);
        console.log('====================');
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log('✅ BOT CONNECTED SUCCESSFULLY!');
        } else if (connection === 'close') {
            const statusCode = (lastDisconnect.error as Boom)?.output?.statusCode;
            const shouldReconnect = statusCode!== DisconnectReason.loggedOut;
            console.log('Connection closed, reason:', statusCode);
            if (shouldReconnect) {
                start();
            }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (text?.toLowerCase() === 'ping') {
            await sock.sendMessage(msg.key.remoteJid!, { text: 'Pong! Bot is alive ✅' });
        } else {
            await sock.sendMessage(msg.key.remoteJid!, { text: 'Hello! I am a free bot 😄' });
        }
    });
}

start();
