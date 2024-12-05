import { kv } from "@vercel/kv";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            // Vylistuje všechny klíče
            const keys = await kv.keys("*");
            
            // Načte hodnoty pro všechny klíče
            const values = await Promise.all(
                keys.map(async (key) => ({
                    key,
                    value: await kv.get(key),
                }))
            );

            res.status(200).json(values);
        } catch (error) {
            console.error("Error fetching KV data:", error);
            res.status(500).json({ error: "Unable to fetch KV data" });
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
