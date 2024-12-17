import { kv } from "@vercel/kv";
import twilio from "twilio";

// ENV variables from Vercel
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export default async function handler(req, res) {   
    // Ověření API klíče
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || apiKey !== process.env.CRON_API_KEY) {
        return res.status(403).json({ error: "Forbidden: Invalid API key" });
    }

    const { lineId } = req.query;

    if (!lineId) {
        return res.status(400).json({ error: "Missing lineId in URL" });
    }

    const confirmationTime = await kv.get(`Line:${lineId}`);

    if (!confirmationTime) {
        console.log(`Line ${lineId} missed the confirmation! Sending SMS.`);
        await sendSMS(lineId); 
        return res.status(200).json({ message: `Line ${lineId} missed the confirmation. SMS and call were sent.` });
    }

    return res.status(200).json({ message: `Line ${lineId} confirmed at ${confirmationTime}.` });
}

async function sendSMS(lineId) {
    const phoneNumbers = process.env.DESTINATION_PHONE_NUMBERS.split(",");
    console.log(`Starting SMS sending process for line ${lineId}...`);

    for (const phoneNumber of phoneNumbers) {
        try {
            console.log(`Sending SMS to ${phoneNumber} for line ${lineId}...`);
            const message = await client.messages.create({
                body: `Linka ${lineId} nepotvrdila odjezd!`,
                from: "TRUCKIT",
                to: phoneNumber,
            });
            console.log(`SMS successfully sent to ${phoneNumber}: SID ${message.sid}`);
        } catch (error) {
            console.error(`Error sending SMS to ${phoneNumber} for line ${lineId}:`, error.message);
        }

        console.log(`Waiting 650 milliseconds before processing the next phone number...`);
        await new Promise((resolve) => setTimeout(resolve, 650));
    }

    console.log(`Finished SMS sending process for line ${lineId}`);
}
