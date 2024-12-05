let confirmations = []; // Lokální paměť pro uložení potvrzení

export default function handler(req, res) {
    const { method, query } = req;

    // Endpoint pro ukládání potvrzení (např. /api/handler?type=confirm)
    if (query.type === "confirm" && method === "POST") {
        const { employeeId, timestamp } = req.body;
        confirmations.push({ employeeId, timestamp });
        res.status(200).json({ message: "Confirmation received" });
    }

    // Endpoint pro kontrolu opožděných potvrzení (např. /api/handler?type=check-late)
    else if (query.type === "check-late" && method === "GET") {
        const now = new Date();
        const lateConfirmations = confirmations.filter(entry => {
            const clickTime = new Date(entry.timestamp);
            return now - clickTime > 3600000; // 1 hodina zpoždění
        });

        // Logika pro odeslání upozornění (nyní jen log do konzole)
        lateConfirmations.forEach(entry => {
            console.log(`Zaměstnanec ${entry.employeeId} nepotvrdil přítomnost včas!`);
            // Zde integrace s Twilio nebo jiným API pro notifikaci
        });

        res.status(200).json({ message: "Late confirmations processed" });
    }

    // Metoda nebo typ neodpovídá
    else {
        res.status(405).json({ error: "Method Not Allowed or Invalid Type" });
    }
}
