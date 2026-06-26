const API_URL = "https://hapycure-register.onrender.com";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "requests", label: "Requests", icon: "◫" },
  { id: "kitchens", label: "Kitchens", icon: "⌂" },
  { id: "orders", label: "Orders", icon: "▤" },
  { id: "customers", label: "Customers", icon: "○" },
  { id: "analytics", label: "Analytics", icon: "▥" },
  { id: "settings", label: "Settings", icon: "⚙" }
];

let activePage = "dashboard";
let kitchens = [];
let selectedKitchenId = "";
let message = "";
let messageType = "success";

const nav = document.getElementById("nav");
const main = document.getElementById("main");

function safe(value) {
  return String(value || "—");
}

function statusClass(status) {
  return String(status || "Pending").toLowerCase();
}

function badge(status) {
  const finalStatus = status || "Pending";
  return `<span class="badge ${statusClass(finalStatus)}">${finalStatus}</span>`;
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

function showMessage(text, type = "success") {
  message = text;
  messageType = type;
  renderPage(false);
}

function clearMessage() {
  message = "";
}

function renderNav() {
  nav.innerHTML = NAV_ITEMS.map(item => `
    <button class="nav-btn ${activePage === item.id ? "active" : ""}" data-page="${item.id}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
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

function statCard(label, value, text) {
  return `
    <div class="stat-card">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
      <div class="stat-text">${text}</div>
    </div>
  `;
}

function renderStats() {
  const pending = kitchens.filter(item => item.status === "Pending").length;
  const approved = kitchens.filter(item => item.status === "Approved").length;
  const rejected = kitchens.filter(item => item.status === "Rejected").length;

  return `
    <div class="stats-grid">
      ${statCard("Pending Requests", pending, "Waiting for review")}
      ${statCard("Approved Kitchens", approved, "Ready kitchens")}
      ${statCard("Rejected Requests", rejected, "Rejected applications")}
      ${statCard("Orders Today", 0, "Total orders")}
    </div>
  `;
}

function getFilteredKitchens() {
  if (activePage === "requests") {
    return kitchens.filter(item => item.status === "Pending");
  }

  if (activePage === "kitchens") {
    return kitchens.filter(item => item.status === "Approved");
  }

  return kitchens;
}

function renderRequestList(list) {
  if (!list.length) {
    return `
      <div class="empty-state">
        No kitchen requests<br />yet
      </div>
    `;
  }

  return `
    <div class="request-list">
      ${list.map(item => `
        <div class="request-card" data-id="${item.id}">
          <div class="request-top">
            <div>
              <div class="request-name">${safe(item.kitchenName)}</div>
              <div class="request-meta">
                ${safe(item.owner)} · ${safe(item.phone)}<br />
                ${safe(item.city)} · ${safe(item.foodType)}
              </div>
            </div>
            ${badge(item.status)}
          </div>
        </div>
      `).join("")}
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

function renderDocuments(files) {
  if (!files || !files.length) {
    return `<div class="food-meta">No documents uploaded.</div>`;
  }

  return files.map(file => `
    <div class="file-item">
      <a class="file-link" href="${file.url}" target="_blank">${safe(file.name)}</a>
    </div>
  `).join("");
}

function renderFoodItems(items) {
  if (!items || !items.length) {
    return `<div class="food-meta">No food items added.</div>`;
  }

  return items.map(item => `
    <div class="food-item">
      <div class="food-name">${safe(item.name)} — ₹${safe(item.price)}</div>
      <div class="food-meta">${safe(item.mealType)} · ${safe(item.category)}</div>
      <div class="food-meta">${safe(item.description)}</div>
      ${item.photo && item.photo.url ? `<img class="food-photo" src="${item.photo.url}" alt="Food photo" />` : ""}
    </div>
  `).join("");
}

function getSelectedKitchen(list) {
  if (!list.length) return null;
  return list.find(item => item.id === selectedKitchenId) || list[0];
}

function renderDetails(kitchen) {
  if (!kitchen) return "";

  return `
    <section class="details-panel show">
      <h2 class="details-title">${safe(kitchen.kitchenName)}</h2>
      <div class="details-id">Tracking ID: ${safe(kitchen.id)}</div>

      ${infoRow("Status", badge(kitchen.status))}
      ${infoRow("Owner", safe(kitchen.owner))}
      ${infoRow("Phone", safe(kitchen.phone))}
      ${infoRow("Email", safe(kitchen.email))}
      ${infoRow("City", safe(kitchen.city))}
      ${infoRow("Food Type", safe(kitchen.foodType))}
      ${infoRow("Timing", `${safe(kitchen.openingTime)} - ${safe(kitchen.closingTime)}`)}
      ${infoRow("Address", safe(kitchen.address))}
      ${infoRow("Created", formatDate(kitchen.createdAt))}

      <div class="section-title">Documents</div>
      ${renderDocuments(kitchen.documents)}

      <div class="section-title">Food Menu</div>
      ${renderFoodItems(kitchen.foodItems)}

      ${kitchen.status === "Pending" ? `
        <div class="action-row">
          <button class="btn btn-green" onclick="approveKitchen('${kitchen.id}')">Approve</button>
          <button class="btn btn-soft" onclick="rejectKitchen('${kitchen.id}')">Reject</button>
        </div>
      ` : ""}
    </section>
  `;
}

function pageTitle() {
  if (activePage === "requests") {
    return ["Requests", "Kitchen approval requests."];
  }

  if (activePage === "kitchens") {
    return ["Kitchens", "Approved kitchens."];
  }

  if (activePage === "orders") {
    return ["Orders", "Orders overview."];
  }

  if (activePage === "customers") {
    return ["Customers", "Customer overview."];
  }

  if (activePage === "analytics") {
    return ["Analytics", "HapyCure admin analytics."];
  }

  if (activePage === "settings") {
    return ["Settings", "Backend connected."];
  }

  return ["Dashboard", "HapyCure admin overview."];
}

function renderPage(shouldLoad = true) {
  renderNav();

  const [title, subtitle] = pageTitle();
  const list = getFilteredKitchens();
  const selected = getSelectedKitchen(list);

  if (activePage === "dashboard") {
    const latest = kitchens.slice().reverse().slice(0, 5);

    main.innerHTML = `
      <h1 class="page-title">${title}</h1>
      <p class="page-subtitle">${subtitle}</p>

      ${message ? `<div class="message ${messageType}">${message}</div>` : ""}

      ${renderStats()}

      <section class="card">
        <h2 class="card-title">Latest Kitchen Requests</h2>
        ${renderRequestList(latest)}
      </section>

      ${renderDetails(selected)}
    `;
  } else if (["requests", "kitchens"].includes(activePage)) {
    main.innerHTML = `
      <h1 class="page-title">${title}</h1>
      <p class="page-subtitle">${subtitle}</p>

      ${message ? `<div class="message ${messageType}">${message}</div>` : ""}

      <section class="card">
        <div class="request-top">
          <h2 class="card-title">${title}</h2>
          <button class="btn btn-red" onclick="refreshData()">Refresh</button>
        </div>

        ${renderRequestList(list)}
      </section>

      ${renderDetails(selected)}
    `;
  } else {
    main.innerHTML = `
      <h1 class="page-title">${title}</h1>
      <p class="page-subtitle">${subtitle}</p>

      ${renderStats()}

      <section class="card">
        <h2 class="card-title">${title}</h2>
        <div class="empty-state">
          This section will be added<br />later
        </div>
      </section>
    `;
  }

  document.querySelectorAll(".request-card").forEach(card => {
    card.addEventListener("click", function () {
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
