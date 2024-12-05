import { kv } from "@vercel/kv";

export default async function handler(req, res) {
    if (req.method === "DELETE") {
        try {
            // Načteme všechny klíče
            const keys = await kv.keys("*");

            // Smažeme všechny klíče
            await Promise.all(keys.map((key) => kv.del(key)));

            res.status(200).json({ message: "All records have been deleted" });
        } catch (error) {
            console.error("Error clearing KV Database:", error);
            res.status(500).json({ error: "Failed to clear KV Database" });
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
