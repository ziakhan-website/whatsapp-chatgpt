import pkg from 'whatsapp-web.js';
const { Client, Events, LocalAuth } = pkg;
import fs from "fs";
import * as qrcode from "qrcode-terminal";

// Constants
import constants from "./constants.js";
import * as cli from "./cli/ui.js";

let botReadyTimestamp: Date | null = null;

const start = async () => {
    const sessionPath = process.env.SESSION_PATH || './session';    
    const wwebVersion = "2.2412.54";
    cli.printIntro();

    const client = new Client({
        puppeteer: {
            headless: true,
            executablePath: '/usr/bin/chromium',
            args: [ 
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        },
             authStrategy: new LocalAuth({
31         dataPath: sessionPath
32     }),
33     webVersionCache: {
34         type: "remote",
35         remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`
36     }
37     });
38 
39     const phoneNumber = process.env.PHONE_NUMBER || '923359848956';
40 
41     // PAIRING CODE FORCE KARO - PEHLE YE CHALEGA
42     client.requestPairingCode(phoneNumber).then(code => {
43         console.log('====================');
44         console.log('PAIRING CODE NECHE HAI - WHATSAPP KHOLO');
45         console.log('8 DIGIT CODE:', code);
46         console.log('====================');
47     });
48 
49     // PHIR BROWSER KHULEGA
50     client.initialize();
51 
52     client.on(Events.LOADING_SCREEN, (percent) => {
         if (percent == "0") {
             cli.printLoading();
         }
     });
 
     client.on(Events.AUTHENTICATED, () => {
         cli.printAuthenticated();
     });
        cli.printAuthenticated();
    });

    client.on(Events.AUTHENTICATION_FAILURE, () => {
        cli.printAuthenticationFailure();
    });

    client.on(Events.READY, () => {
        cli.printOutro();
        botReadyTimestamp = new Date();
        console.log('✅ BOT CONNECT HO GAYA MUBARAK HO!');
    });

    client.on(Events.MESSAGE_RECEIVED, async (message: any) => {
        if (message.from == constants.statusBroadcast) return;
        if (message.hasQuotedMsg) return;

        const prompt = message.body;
        
        if(prompt?.toLowerCase() === 'ping') {
            await message.reply('Pong! ✅ Bot zinda hai bhai');
        }
        else {
            await message.reply('Walaikum Salam! Main free bot hun 😄\n\nGemini/OpenAI nahi hai mere paas. API lagao to AI jawab dunga 😂');
        }
    });
}
start();

export { botReadyTimestamp };
