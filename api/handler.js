import { kv } from "@vercel/kv";

const allowedLineIds = ["9100", "9103"]; // Povolené ID linek
const allowedOrigins = ["http://alive.truckit.cz", "https://alive.truckit.cz"]; // Povolené domény

export default async function handler(req, res) {
    const origin = req.headers.origin || req.headers.referer;

    // Kontrola, jestli je origin povolen
    if (!allowedOrigins.includes(origin)) {
        return res.status(403).json({ error: "Forbidden: Invalid origin" });
    }

    // Nastavení CORS pro konkrétní doménu
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Odpověď na preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method === "POST") {
        const { lineId, pin } = req.body;

        // Validace lineId
        if (!allowedLineIds.includes(lineId)) {
            return res.status(400).json({ error: `Neexistující linka: ${lineId}` });
        }

        // Validace PINu
        if (pin !== process.env.USER_PIN) {
            return res.status(401).json({ error: "Neautorizováno: špatný PIN" });
        }

        const now = new Date();
        const localTime = now.toLocaleString("cs-CZ", { timeZone: "Europe/Prague" });

        // Uložení potvrzení do KV Database
        await kv.set(`Line:${lineId}`, localTime);

        return res.status(200).json({ message: `Confirmation received for lineId: ${lineId}` });
    }

    res.status(405).json({ error: "Method Not Allowed" });
}
