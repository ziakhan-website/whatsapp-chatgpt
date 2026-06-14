
import { Client, Message, Events, LocalAuth } from "whatsapp-web.js";

// Constants
import constants from "./constants";

// CLI
import * as cli from "./cli/ui";
import { handleIncomingMessage } from "./handlers/message";

// Config
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });

// Ready timestamp of the bot
let botReadyTimestamp: Date | null = null;

// Entrypoint
const start = async () => {
	const wwebVersion = "2.2412.54";
	cli.printIntro();

	// WhatsApp Client
const client = new Client({
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
                        '--single-process',
            '--disable-gpu'
        ]
    },
    authStrategy: new LocalAuth({
    dataPath: process.env.SESSION_PATH || './session'
}),
    webVersionCache: {
        type: "remote",
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`
    }
});

	// WhatsApp auth - Pairing Code
    client.initialize().then(async () => {
    await new Promise(resolve => setTimeout(resolve, 10000));
    const code = await client.requestPairingCode(process.env.PHONE_NUMBER || "");
    console.log('PAIRING CODE:', code);
});
	
	// WhatsApp loading
	client.on(Events.LOADING_SCREEN, (percent) => {
		if (percent == "0") {
			cli.printLoading();
		}
	});

	// WhatsApp authenticated
	client.on(Events.AUTHENTICATED, () => {
		cli.printAuthenticated();
	});

	// WhatsApp authentication failure
	client.on(Events.AUTHENTICATION_FAILURE, () => {
		cli.printAuthenticationFailure();
	});

	// WhatsApp ready
	client.on(Events.READY, () => {
		// Print outro
		cli.printOutro();

		// Set bot ready timestamp
		botReadyTimestamp = new Date();

		initAiConfig();
	});

	// WhatsApp message
	client.on(Events.MESSAGE_RECEIVED, async (message: any) => {
		// Ignore if message is from status broadcast
		if (message.from == constants.statusBroadcast) return;

		// Ignore if it's a quoted message, (e.g. Bot reply)
		if (message.hasQuotedMsg) return;

		const prompt = message.body;
const result = await model.generateContent(prompt);
const response = await result.response;
const text = response.text();
await message.reply(text);
	});

	// Reply to own message
	client.on(Events.MESSAGE_CREATE, async (message: Message) => {
		// Ignore if message is from status broadcast
		if (message.from == constants.statusBroadcast) return;

		// Ignore if it's a quoted message, (e.g. Bot reply)
		if (message.hasQuotedMsg) return;

		// Ignore if it's not from me
		if (!message.fromMe) return;

		await handleIncomingMessage(message);
	});

	// WhatsApp initialization
	client.initialize();
};

start();

export { botReadyTimestamp };
