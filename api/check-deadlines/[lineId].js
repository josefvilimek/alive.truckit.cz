import { kv } from "@vercel/kv";
import twilio from "twilio";

// ENV variables from Vercelo
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const destinationPhoneNumber = process.env.DESTINATION_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export default async function handler(req, res) {   
    const { lineId } = req.query;

    if (!lineId) {
        return res.status(400).json({ error: "Missing lineId in URL" });
    }

    const confirmationTime = await kv.get(`confirmation:${lineId}`);

    if (!confirmationTime) {
        console.log(`Line ${lineId} missed the confirmation! Sending SMS.`);
        sendSMS(lineId);

        return res.status(200).json({ message: `Line ${lineId} missed the confirmation. SMS and call were sent.` });
    }

    return res.status(200).json({ message: `Line ${lineId} confirmed at ${confirmationTime}.` });
}

function sendSMS(lineId) {
    const phoneNumbers = process.env.DESTINATION_PHONE_NUMBERS.split(",");

    phoneNumbers.forEach((phoneNumber) => {
        client.messages
            .create({
                body: `Linka ${lineId} nepotvrdila odjezd!`,
                from: "TRUCKIT",
                to: phoneNumber,
            })
            .then((message) => console.log(`SMS sent to ${phoneNumber}: ${message.sid}`))
            .catch((error) => console.error(`Error sending SMS to ${phoneNumber}:`, error));
    });
}
