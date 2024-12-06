import { kv } from "@vercel/kv";

export default async function handler(req, res) {
    // Ověření Basic Authentication
    const auth = req.headers.authorization;

    // Vygenerování správné hodnoty Basic Auth
    const expectedAuth = `Basic ${Buffer.from(`${process.env.ADMIN_USER}:${process.env.ADMIN_PASS}`).toString("base64")}`;

    // Zkontrolujte, zda hlavička Authorization existuje a odpovídá očekávané hodnotě
    if (!auth || auth !== expectedAuth) {
        res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"'); // Toto je klíčové pro výzvu prohlížeče
        return res.status(401).send("Unauthorized");
    }

    // Povolená metoda
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

            // Vytvoří jednoduchý HTML výstup
            const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Database View</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                            padding: 0;
                            background-color: #f9f9f9;
                            color: #333;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }
                        th, td {
                            padding: 10px;
                            border: 1px solid #ccc;
                            text-align: left;
                        }
                        th {
                            background-color: #f0f0f0;
                        }
                    </style>
                </head>
                <body>
                    <h1>Database View</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>Key</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${values
                                .map(
                                    (entry) =>
                                        `<tr><td>${entry.key}</td><td>${entry.value}</td></tr>`
                                )
                                .join("")}
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            res.setHeader("Content-Type", "text/html");
            res.status(200).send(html);
        } catch (error) {
            console.error("Error fetching KV data:", error);
            res.status(500).send("Unable to fetch KV data");
        }
    } else {
        res.status(405).send("Method Not Allowed");
    }
}
