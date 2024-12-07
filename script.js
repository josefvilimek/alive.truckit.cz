// Povolené ID linek
const allowedLineIds = ["9100", "9103"];

// Funkce pro načtení parametru z URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Načtení parametru "id" z URL a předvyplnění formuláře
document.addEventListener("DOMContentLoaded", () => {
    const idFromUrl = getQueryParam("id");
    const pinFromUrl = getQueryParam("pin");

    const lineIdInput = document.getElementById("lineId");
    const pinInput = document.getElementById("pin");
    const confirmBtn = document.getElementById("confirmBtn");

    if (idFromUrl) {
        lineIdInput.value = idFromUrl.trim();
        confirmBtn.disabled = idFromUrl.trim() === "";
    }

    if (pinFromUrl) {
        pinInput.value = pinFromUrl.trim();
    }

    // Povolení tlačítka při zadání validní hodnoty
    lineIdInput.addEventListener("input", (event) => {
        const lineId = event.target.value.trim();
        confirmBtn.disabled = lineId === "";
    });

    // Funkce pro aktualizaci data a času
    function updateDateTime() {
        const now = new Date();
        const formattedDateTime = now.toLocaleString("cs-CZ", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
        document.getElementById("datetime").textContent = formattedDateTime;
    }

    // Aktualizace času každou sekundu
    setInterval(updateDateTime, 1000);

    // Inicializace při načtení stránky
    updateDateTime();
});

// Obsluha odeslání potvrzení
document.getElementById("confirmBtn").addEventListener("click", async () => {
    const lineId = document.getElementById("lineId").value.trim();
    const pin = document.getElementById("pin").value.trim();

    if (!allowedLineIds.includes(lineId)) {
        alert(`ID trasy ${lineId} není povoleno.`);
        return;
    }

    try {
        const response = await fetch("https://alive-truckit-cz.vercel.app/api/handler", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lineId, pin }),
        });

        if (response.ok) {
            document.body.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 24px; color: #ffffff;">
                    Váš výjezd na trasu byl potvrzen!
                </div>
            `;
        } else {
            const data = await response.json();
            alert(`Chyba: ${data.error || "Neznámá chyba"}`);
        }
    } catch (error) {
        alert("Chyba při potvrzení. Zkuste to znovu později.");
        console.error(error);
    }
});
