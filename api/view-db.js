import { kv } from "@vercel/kv";

// Získání správných přihlašovacích údajů z environment variables
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

export default async function handler(req, res) {
    // Funkce pro ověření přihlašovacích údajů
    function verifyCredentials(username, password) {
        return username === ADMIN_USER && password === ADMIN_PASS;
    }

    // Získání přihlašovacích údajů z query parametrů
    const { username, password } = req.query;

    // Pokud nejsou přihlašovací údaje správné, zobrazí HTML formulář pro přihlášení
    if (!verifyCredentials(username, password)) {
        const loginForm = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Login Required</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f0f0f0;
                        text-align: center;
                        padding: 50px;
                    }
                    form {
                        display: inline-block;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    input[type="text"], input[type="password"] {
                        width: 100%;
                        padding: 10px;
                        margin: 10px 0;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                    }
                    input[type="submit"] {
                        background-color: #007bff;
                        color: #fff;
                        padding: 10px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        width: 100%;
                    }
                    input[type="submit"]:hover {
                        background-color: #0056b3;
                    }
                </style>
            </head>
            <body>
                <h2>Login Required</h2>
                <form method="GET" action="/api/view-db">
                    <input type="text" name="username" placeholder="Username" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <input type="submit" value="Login">
                </form>
            </body>
            </html>
        `;
        return res.status(401).send(loginForm);
    }

    // Pokud jsou přihlašovací údaje správné, načte a zobrazí data z KV databáze
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

            // Vytvoří jednoduchý HTML výstup s tlačítkem pro smazání záznamů
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
                        button {
                            margin-top: 20px;
                            padding: 10px 20px;
                            background-color: #ff4b5c;
                            color: #fff;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        }
                        button:hover {
                            background-color: #ff1f3b;
                        }
                    </style>
                    <script>
                        async function deleteRecords() {
                            if (confirm("Are you sure you want to delete all records?")) {
                                try {
                                    const response = await fetch("/api/clear-db", {
                                        method: "DELETE",
                                        headers: {
                                            "x-api-key": "${process.env.CRON_API_KEY}"
                                        }
                                    });
                                    if (response.ok) {
                                        alert("All records have been deleted successfully!");
                                        location.reload();
                                    } else {
                                        alert("Failed to delete records.");
                                    }
                                } catch (error) {
                                    alert("An error occurred while deleting records.");
                                    console.error(error);
                                }
                            }
                        }
                    </script>
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
                    <button onclick="deleteRecords()">Delete Records</button>
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