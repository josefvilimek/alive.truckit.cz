// Povolené ID linek
const allowedLineIds = ["9100", "9103"];

// Funkce pro načtení parametru z URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param); // Načte hodnotu parametru, např. "id"
}

// Načtení parametru "id" z URL a předvyplnění formuláře
document.addEventListener("DOMContentLoaded", () => {
    const idFromUrl = getQueryParam("id"); // Načítá "id" z URL
    const lineIdInput = document.getElementById("lineId");
    const confirmBtn = document.getElementById("confirmBtn");

    if (idFromUrl) {
        lineIdInput.value = idFromUrl.trim(); // Předvyplnění formuláře
        confirmBtn.disabled = idFromUrl.trim() === ""; // Deaktivace tlačítka, pokud je hodnota prázdná
    }

    // Povolení tlačítka při zadání validní hodnoty
    lineIdInput.addEventListener("input", (event) => {
        const lineId = event.target.value.trim();
        confirmBtn.disabled = lineId === ""; // Deaktivace tlačítka pro prázdný vstup
    });
});

// Obsluha odeslání potvrzení
document.getElementById("confirmBtn").addEventListener("click", async () => {
    const lineId = document.getElementById("lineId").value.trim();

    // Validace lineId
    if (!allowedLineIds.includes(lineId)) {
        alert(`ID trasy ${lineId} není povoleno.`);
        return;
    }

    try {
        const response = await fetch("https://alive-truckit-cz.vercel.app/api/handler", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lineId }),
        });

        if (response.ok) {
            document.body.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 24px; color: #ffffff;">
                    Vaše přítomnost byla potvrzena!
                </div>
            `;
            return;
        } else {
            const data = await response.json();
            alert(`Chyba: ${data.error || "Neznámá chyba"}`);
        }
    } catch (error) {
        alert("Chyba při potvrzení. Zkuste to znovu později.");
        console.error(error);
    }
});
