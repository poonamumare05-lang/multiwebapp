
const stocks = [
    { name: "Reliance Industries", symbol: "RELIANCE", price: 1450.00, change: 1.25 },
    { name: "Tata Consultancy Services", symbol: "TCS", price: 3200.00, change: 0.75 },
    { name: "HDFC Bank", symbol: "HDFCBANK", price: 1750.00, change: -0.45 },
    { name: "Infosys", symbol: "INFY", price: 1500.00, change: 1.10 },
    { name: "ICICI Bank", symbol: "ICICIBANK", price: 1250.00, change: -0.65 },
    { name: "Tata Motors", symbol: "TATAMOTORS", price: 700.00, change: 2.30 },
    { name: "ITC", symbol: "ITC", price: 450.00, change: 0.35 },
    { name: "Wipro", symbol: "WIPRO", price: 280.00, change: -1.20 }
];

const initialHoldings = [
    { symbol: "RELIANCE", quantity: 10, buyPrice: 1400 },
    { symbol: "TCS", quantity: 5, buyPrice: 3100 },
    { symbol: "INFY", quantity: 12, buyPrice: 1450 }
];

const money = value =>
    "₹" + value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const numberClass = value => value >= 0 ? "positive" : "negative";

function getSavedList(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved === null ? fallback : JSON.parse(saved);
    } catch {
        return fallback;
    }
}

function saveList(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // The app still works for the current page if storage is unavailable.
    }
}

let watchlist = getSavedList("sharemarket-watchlist", []);
let holdings = getSavedList("sharemarket-holdings", initialHoldings);

function renderDashboard() {
    const table = document.getElementById("dashboardStocks");
    if (!table) return;

    table.innerHTML = stocks.slice(0, 5).map(stock => `
        <tr>
            <td>
                <strong>${stock.name}</strong><br>
                <span class="muted">${stock.symbol}</span>
            </td>
            <td>${money(stock.price)}</td>
            <td class="${numberClass(stock.change)}">
                ${stock.change > 0 ? "+" : ""}${stock.change.toFixed(2)}%
            </td>
            <td>
                <a class="text-link" href="stocks.html">View</a>
            </td>
        </tr>
    `).join("");
}

function renderStocks() {
    const table = document.getElementById("stocksTable");
    if (!table) return;

    const search = document.getElementById("stockSearch");
    const count = document.getElementById("stockCount");
    const buttons = document.querySelectorAll(".filter-btn");
    let activeFilter = "all";

    function updateTable() {
        const query = search.value.trim().toLowerCase();

        const filtered = stocks.filter(stock => {
            const matchesSearch =
                stock.name.toLowerCase().includes(query) ||
                stock.symbol.toLowerCase().includes(query);

            const matchesFilter =
                activeFilter === "all" ||
                (activeFilter === "positive" && stock.change > 0) ||
                (activeFilter === "negative" && stock.change < 0) ||
                (activeFilter === "watchlist" && watchlist.includes(stock.symbol));

            return matchesSearch && matchesFilter;
        });

        table.innerHTML = filtered.length
            ? filtered.map(stock => `
                <tr>
                    <td><strong>${stock.name}</strong></td>
                    <td>${stock.symbol}</td>
                    <td>${money(stock.price)}</td>
                    <td class="${numberClass(stock.change)}">
                        ${stock.change > 0 ? "+" : ""}${stock.change.toFixed(2)}%
                    </td>
                    <td>
                        <button
                            class="watch-btn ${watchlist.includes(stock.symbol) ? "saved" : ""}"
                            data-symbol="${stock.symbol}"
                            aria-label="Toggle ${stock.symbol} watchlist"
                            aria-pressed="${watchlist.includes(stock.symbol)}">
                            ${watchlist.includes(stock.symbol) ? "★ Saved" : "☆ Add"}
                        </button>
                    </td>
                </tr>
            `).join("")
            : `<tr><td colspan="5">No stocks found.</td></tr>`;

        count.textContent = `${filtered.length} stock(s) displayed`;
    }

    search.addEventListener("input", updateTable);

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter;
            buttons.forEach(item => item.classList.remove("selected"));
            button.classList.add("selected");
            updateTable();
        });
    });

    document.getElementById("showAll").addEventListener("click", () => {
        search.value = "";
        activeFilter = "all";
        buttons.forEach(item => {
            item.classList.toggle("selected", item.dataset.filter === "all");
        });
        updateTable();
    });

    table.addEventListener("click", event => {
        const button = event.target.closest(".watch-btn");
        if (!button) return;

        const symbol = button.dataset.symbol;

        watchlist = watchlist.includes(symbol)
            ? watchlist.filter(item => item !== symbol)
            : [...watchlist, symbol];

        saveList("sharemarket-watchlist", watchlist);
        updateTable();
    });

    updateTable();
}

function renderPortfolio() {
    const table = document.getElementById("portfolioTable");
    if (!table) return;

    const totalInvestment = holdings.reduce(
        (sum, holding) => sum + holding.quantity * holding.buyPrice, 0
    );

    const currentValue = holdings.reduce( (sum, holding) => {
        const stock = stocks.find(item => item.symbol === holding.symbol);
        return sum + holding.quantity * (stock ? stock.price : holding.buyPrice);
    }, 0);

    const profit = currentValue - totalInvestment;
    const profitPercent = totalInvestment
        ? (profit / totalInvestment) * 100
        : 0;

    document.getElementById("totalInvestment").textContent =
        money(totalInvestment);

    document.getElementById("currentValue").textContent =
        money(currentValue);

    const profitElement = document.getElementById("totalProfit");
    profitElement.textContent = money(profit);
    profitElement.className = numberClass(profit);

    const percentElement = document.getElementById("profitPercent");
    percentElement.textContent =
        `${profit >= 0 ? "+" : ""}${profitPercent.toFixed(2)}%`;
    percentElement.className = numberClass(profit);

    table.innerHTML = holdings.length
        ? holdings.map(holding => {
            const stock = stocks.find(
                item => item.symbol === holding.symbol
            );
            const price = stock ? stock.price : holding.buyPrice;
            const gain = (price - holding.buyPrice) * holding.quantity;

            return `
                <tr>
                    <td><strong>${stock ? stock.name : holding.symbol}</strong></td>
                    <td>${holding.quantity}</td>
                    <td>${money(holding.buyPrice)}</td>
                    <td>${money(price)}</td>
                    <td class="${numberClass(gain)}">${money(gain)}</td>
                </tr>
            `;
        }).join("")
        : `<tr><td colspan="5">Your portfolio is empty.</td></tr>`;

    document.getElementById("resetPortfolio").onclick = () => {
        holdings = initialHoldings.map(item => ({ ...item }));
        saveList("sharemarket-holdings", holdings);
        renderPortfolio();
    };
}

renderDashboard();
renderStocks();
renderPortfolio();