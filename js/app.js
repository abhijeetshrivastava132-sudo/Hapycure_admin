const API_URL = "https://hapycure-register.onrender.com";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "requests", label: "Requests" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" }
];

let activePage = "dashboard";
let kitchens = [];
let selectedKitchenId = "";
let message = "";
let messageType = "success";

const nav = document.getElementById("nav");
const main = document.getElementById("main");

function getStatusClass(status) {
  return String(status || "Pending").toLowerCase();
}

function getStatusBadge(status) {
  const finalStatus = status || "Pending";
  return `<span class="badge ${getStatusClass(finalStatus)}">${finalStatus}</span>`;
}

function showMessage(text, type) {
  message = text;
  messageType = type || "success";
  renderPage(false);
}

function clearMessage() {
  message = "";
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function statCard(label, value) {
  return `
    <div class="stat-card">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
    </div>
  `;
}

function infoRow(label, value) {
  return `
    <div class="info-row">
      <span class="info-label">${label}</span>
      <span class="info-value">${value || "—"}</span>
    </div>
  `;
}

function emptyState(title, text) {
  return `
    <div class="empty-state">
      <div class="empty-title">${title}</div>
      <div>${text}</div>
    </div>
  `;
}

function getSelectedKitchen(list) {
  if (!list.length) return null;
  return list.find(item => item.id === selectedKitchenId) || list[0];
}

function renderNav() {
  nav.innerHTML = NAV_ITEMS.map(item => `
    <button class="nav-btn ${activePage === item.id ? "active" : ""}" data-page="${item.id}">
      ${item.label}
    </button>
  `).join("");

  document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", function () {
      activePage = this.dataset.page;
      selectedKitchenId = "";
      clearMessage();
      renderPage();
    });
  });
}

async function loadKitchens() {
  try {
    const response = await fetch(`${API_URL}/api/admin/kitchen-requests`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      kitchens = [];
      showMessage(result.message || "Requests load nahi ho rahi.", "error");
      return;
    }

    kitchens = result.kitchens || [];
  } catch (error) {
    kitchens = [];
    showMessage("Backend connect nahi ho raha. Render backend live check karo.", "error");
  }
}

function getFilteredKitchens() {
  if (activePage === "approved") {
    return kitchens.filter(item => item.status === "Approved");
  }

  if (activePage === "rejected") {
    return kitchens.filter(item => item.status === "Rejected");
  }

  if (activePage === "requests") {
    return kitchens.filter(item => item.status === "Pending");
  }

  return kitchens;
}

function renderTopbar(title, subtitle) {
  return `
    <div class="topbar">
      <div>
        <h1 class="page-title">${title}</h1>
        <p class="page-subtitle">${subtitle}</p>
      </div>
      <div class="api-pill">Backend: ${API_URL}</div>
    </div>
  `;
}

function renderStats() {
  const total = kitchens.length;
  const pending = kitchens.filter(item => item.status === "Pending").length;
  const approved = kitchens.filter(item => item.status === "Approved").length;
  const rejected = kitchens.filter(item => item.status === "Rejected").length;

  return `
    <div class="stats-grid">
      ${statCard("Total", total)}
      ${statCard("Pending", pending)}
      ${statCard("Approved", approved)}
      ${statCard("Rejected", rejected)}
    </div>
  `;
}

function renderTable(list) {
  if (!list.length) {
    return emptyState("No requests found", "Kitchen requests yaha show hongi jab user register karega.");
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Kitchen</th>
            <th>Owner</th>
            <th>Phone</th>
            <th>City</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(item => `
            <tr data-id="${item.id}">
              <td class="strong">${item.kitchenName || "—"}</td>
              <td>${item.owner || "—"}</td>
              <td>${item.phone || "—"}</td>
              <td>${item.city || "—"}</td>
              <td>${getStatusBadge(item.status)}</td>
              <td>${formatDate(item.createdAt)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderFiles(files) {
  if (!files || !files.length) {
    return `<div class="food-meta">No documents uploaded.</div>`;
  }

  return files.map(file => `
    <div class="file-item">
      <a class="file-link" href="${file.url}" target="_blank">${file.name || "Open document"}</a>
    </div>
  `).join("");
}

function renderFoodItems(items) {
  if (!items || !items.length) {
    return `<div class="food-meta">No food items added.</div>`;
  }

  return items.map(item => `
    <div class="food-item">
      <div class="food-name">${item.name || "Food Item"} — ₹${item.price || "—"}</div>
      <div class="food-meta">${item.mealType || "—"} · ${item.category || "—"}</div>
      <div class="food-meta">${item.description || "No description"}</div>
      ${item.photo && item.photo.url ? `<img class="food-photo" src="${item.photo.url}" alt="${item.name || "Food photo"}" />` : ""}
    </div>
  `).join("");
}

function renderDetails(kitchen) {
  if (!kitchen) {
    return `
      <aside class="details-panel">
        ${emptyState("Select request", "Table me kisi request pe click karo.")}
      </aside>
    `;
  }

  return `
    <aside class="details-panel">
      <h2 class="details-title">${kitchen.kitchenName || "Kitchen"}</h2>
      <div class="details-id">Tracking ID: ${kitchen.id}</div>

      ${infoRow("Status", getStatusBadge(kitchen.status))}
      ${infoRow("Owner", kitchen.owner)}
      ${infoRow("Phone", kitchen.phone)}
      ${infoRow("Email", kitchen.email)}
      ${infoRow("City", kitchen.city)}
      ${infoRow("Food Type", kitchen.foodType)}
      ${infoRow("Timing", `${kitchen.openingTime || "—"} - ${kitchen.closingTime || "—"}`)}
      ${infoRow("Address", kitchen.address)}
      ${infoRow("Created", formatDate(kitchen.createdAt))}

      <div class="section-title">Documents</div>
      ${renderFiles(kitchen.documents)}

      <div class="section-title">Food Menu</div>
      ${renderFoodItems(kitchen.foodItems)}

      ${kitchen.status === "Pending" ? `
        <div class="action-row">
          <button class="btn btn-green" onclick="approveKitchen('${kitchen.id}')">Approve</button>
          <button class="btn btn-soft-red" onclick="rejectKitchen('${kitchen.id}')">Reject</button>
        </div>
      ` : ""}
    </aside>
  `;
}

function renderRequestsPage(title, subtitle) {
  const list = getFilteredKitchens();
  const selected = getSelectedKitchen(list);

  return `
    ${renderTopbar(title, subtitle)}
    ${renderStats()}
    ${message ? `<div class="message ${messageType}">${message}</div>` : ""}
    <div class="toolbar">
      <h2 class="card-title">Kitchen Requests</h2>
      <button class="btn btn-red" onclick="refreshData()">Refresh</button>
    </div>
    <div class="layout">
      <section>
        ${renderTable(list)}
      </section>
      ${renderDetails(selected)}
    </div>
  `;
}

function renderPage(shouldLoad = true) {
  renderNav();

  let title = "Dashboard";
  let subtitle = "All kitchen registration requests.";

  if (activePage === "requests") {
    title = "Pending Requests";
    subtitle = "Approve or reject new kitchen requests.";
  }

  if (activePage === "approved") {
    title = "Approved Kitchens";
    subtitle = "Kitchens accepted by admin.";
  }

  if (activePage === "rejected") {
    title = "Rejected Kitchens";
    subtitle = "Kitchens rejected by admin.";
  }

  main.innerHTML = renderRequestsPage(title, subtitle);

  document.querySelectorAll("tbody tr[data-id]").forEach(row => {
    row.addEventListener("click", function () {
      selectedKitchenId = this.dataset.id;
      clearMessage();
      renderPage(false);
    });
  });

  if (shouldLoad) {
    refreshData(false);
  }
}

async function refreshData(showSuccess = true) {
  await loadKitchens();
  if (showSuccess) {
    message = "Requests refreshed.";
    messageType = "success";
  }
  renderPage(false);
}

async function updateKitchenStatus(id, action) {
  try {
    const response = await fetch(`${API_URL}/api/admin/kitchen-requests/${id}/${action}`, {
      method: "PATCH"
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      showMessage(result.message || "Action failed.", "error");
      return;
    }

    await loadKitchens();
    selectedKitchenId = id;
    showMessage(action === "approve" ? "Kitchen approved." : "Kitchen rejected.", "success");
  } catch (error) {
    showMessage("Backend connect nahi ho raha.", "error");
  }
}

function approveKitchen(id) {
  updateKitchenStatus(id, "approve");
}

function rejectKitchen(id) {
  updateKitchenStatus(id, "reject");
}

renderPage();
