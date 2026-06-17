import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';

const start = async () => {
    console.log('BOT STARTING...');
    
    const phoneNumber = process.env.PHONE_NUMBER || '';
    if (!phoneNumber) {
        console.log('ERROR: PHONE_NUMBER variable set karo');
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
        browser: ['Baileys', 'Chrome', '121.0.0'],
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    let alreadyRequested = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        console.log('CONNECTION STATUS:', connection);
        
        // Jab WhatsApp bol de "main ready hun" tabhi code mango
        if (connection === 'connecting' && !state.creds.registered && !alreadyRequested) {
            alreadyRequested = true;
            console.log('WAITING FOR WHATSAPP SERVER...');
            
            // 10 second wait - ye sabse important hai
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            try {
                console.log('REQUESTING PAIRING CODE NOW...');
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('================================');
                console.log('8 DIGIT CODE:', code);
                console.log('================================');
                console.log('WhatsApp > Linked Devices > Link with phone number');
            } catch (err) {
                console.log('PAIRING ERROR:', err);
                alreadyRequested = false;
            }
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('RECONNECTING IN 10 SEC...');
                setTimeout(start, 10000);
            }
        }
        
        if (connection === 'open') {
            console.log('BOT CONNECTED SUCCESSFULLY!');
        }
    });
}

start().catch(err => console.log('FATAL ERROR:', err));
