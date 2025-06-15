const form = document.getElementById("entry-form");
const balanceForm = document.getElementById("balance-form");
const transactionList = document.getElementById("transaction-list");
const bankBalanceEl = document.getElementById("bank-balance");
const cashBalanceEl = document.getElementById("cash-balance");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let openingBalance = JSON.parse(localStorage.getItem("openingBalance")) || { bank: 0, cash: 0 };
let editingIndex = -1;

// Save opening balance
balanceForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const bank = parseFloat(document.getElementById("opening-bank").value) || 0;
  const cash = parseFloat(document.getElementById("opening-cash").value) || 0;
  openingBalance = { bank, cash };
  localStorage.setItem("openingBalance", JSON.stringify(openingBalance));
  updateUI();
});

// Pre-fill balance inputs
document.getElementById("opening-bank").value = openingBalance.bank;
document.getElementById("opening-cash").value = openingBalance.cash;

// Update UI
function updateUI() {
  let bank = openingBalance.bank;
  let cash = openingBalance.cash;
  transactionList.innerHTML = "";

  transactions.forEach((tx, index) => {
    const amount = tx.type === "income" ? tx.amount : -tx.amount;
    if (tx.source === "bank") bank += amount;
    else cash += amount;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.date}</td>
      <td>₹${tx.amount}</td>
      <td>${tx.type}</td>
      <td>${tx.source}</td>
      <td>${tx.category}</td>
      <td>${tx.note || "-"}</td>
      <td>
        <button onclick="editTransaction(${index})">Edit</button>
        <button onclick="deleteTransaction(${index})">Delete</button>
      </td>
    `;
    transactionList.appendChild(row);
  });

  bankBalanceEl.textContent = bank.toFixed(2);
  cashBalanceEl.textContent = cash.toFixed(2);
  document.getElementById("total-balance").textContent = (bank + cash).toFixed(2);
}

// Add/Edit Transaction
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const tx = {
    date: document.getElementById("date").value,
    amount: parseFloat(document.getElementById("amount").value),
    source: document.getElementById("source").value,
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    note: document.getElementById("note").value || ""
  };

  if (editingIndex > -1) {
    transactions[editingIndex] = tx;
    editingIndex = -1;
  } else {
    transactions.push(tx);
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));
  form.reset();
  autoFillToday();
  updateUI();
});

// Delete Transaction
function deleteTransaction(index) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateUI();
  }
}

// Edit Transaction
function editTransaction(index) {
  const tx = transactions[index];
  document.getElementById("date").value = tx.date;
  document.getElementById("amount").value = tx.amount;
  document.getElementById("source").value = tx.source;
  document.getElementById("type").value = tx.type;
  document.getElementById("category").value = tx.category;
  document.getElementById("note").value = tx.note || "";
  editingIndex = index;
}

// Export to Excel
function exportToExcel() {
  const ws_data = [
    ["Date", "Amount", "Type", "Source", "Category", "Note"],
    ...transactions.map(tx => [
      tx.date, tx.amount, tx.type, tx.source, tx.category, tx.note || ""
    ])
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  const today = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `${today}_PocketLedger.xlsx`);
}

// Auto-fill today's date
function autoFillToday() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;
}

document.addEventListener("DOMContentLoaded", () => {
  autoFillToday();
  updateUI();
});
