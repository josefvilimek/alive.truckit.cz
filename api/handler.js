import { kv } from "@vercel/kv";

const allowedLineIds = ["9100", "9103"]; // Povolené ID linek

export default async function handler(req, res) {
    // Nastavení CORS pro konkrétní doménu
    res.setHeader("Access-Control-Allow-Origin", "http://alive.truckit.cz");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end(); // Odpověď na preflight request
    }
    if (req.method === "POST") {
        const { lineId } = req.body;

        // Validace lineId
        if (!allowedLineIds.includes(lineId)) {
            return res.status(400).json({ error: `Invalid lineId: ${lineId}` });
        }

        const now = new Date();
        const localTime = now.toLocaleString("cs-CZ", { timeZone: "Europe/Prague" });

        // Uložení potvrzení do KV Database
        await kv.set(`confirmation:${lineId}`, localTime);

        return res.status(200).json({ message: `Confirmation received for lineId: ${lineId}` });
    }

    res.status(405).json({ error: "Method Not Allowed" });
}
