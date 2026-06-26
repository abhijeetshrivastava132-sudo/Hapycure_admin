window.HapyCureAdmin = window.HapyCureAdmin || {};

(function (Admin) {
  const { safe, getStatus, getField, sortByNewest } = Admin.utils;
  const { emptyState, messageBox, renderStats, renderKitchenTable, renderDetailsPanel, statCard } = Admin.components;

  function renderNav() {
    const nav = document.getElementById("nav");

    nav.innerHTML = Admin.NAV_ITEMS.map(item => `
      <button class="nav-btn ${Admin.state.activePage === item.id ? "active" : ""}" data-page="${safe(item.id)}">
        <span class="nav-icon">${safe(item.icon)}</span>
        <span class="nav-label">${safe(item.label)}</span>
      </button>
    `).join("");
  }

  function pageTitle() {
    const titles = {
      overview: ["Dashboard", "HapyCure admin overview."],
      requests: ["Kitchen Requests", "Review, approve, or reject kitchen applications."],
      kitchens: ["Approved Kitchens", "Approved kitchens from backend."],
      orders: ["Orders", "Orders overview."],
      customers: ["Customers", "Customer overview."],
      analytics: ["Analytics", "HapyCure admin analytics."],
      settings: ["Settings", "Basic admin settings."]
    };

    return titles[Admin.state.activePage] || titles.overview;
  }

  function filterBySearch(list) {
    const query = Admin.state.requestSearch.trim().toLowerCase();
    if (!query) return list;

    return list.filter(item => {
      const values = [
        getField(item, ["id", "_id"]),
        getField(item, ["kitchenName", "name", "businessName"]),
        getField(item, ["owner", "ownerName", "fullName"]),
        getField(item, ["phone", "mobile", "phoneNumber"]),
        getField(item, ["email", "ownerEmail"]),
        getField(item, ["city", "location"]),
        getField(item, ["foodType", "category"]),
        getStatus(item)
      ];

      return values.some(value => String(value || "").toLowerCase().includes(query));
    });
  }

  function getSelectedKitchen(list) {
    if (!Admin.state.selectedKitchenId) return null;

    return list.find(item => String(getField(item, ["id", "_id"])) === String(Admin.state.selectedKitchenId)) || null;
  }

  function renderHeader(title, subtitle) {
    return `
      <h1 class="page-title">${safe(title)}</h1>
      <p class="page-subtitle">${safe(subtitle)}</p>
      ${messageBox()}
    `;
  }

  function renderOverview() {
    const latest = sortByNewest(Admin.state.kitchens).slice(0, 5);
    const [title, subtitle] = pageTitle();

    return `
      ${renderHeader(title, subtitle)}
      ${renderStats()}

      <div class="card">
        <div class="card-title">Latest Kitchen Requests</div>
        ${renderKitchenTable(latest, "No kitchen requests yet", "New kitchen requests will appear here.")}
      </div>

      <div class="card">
        <div class="card-title">Recent Orders</div>
        ${emptyState("No orders yet", "Customer orders will appear here.")}
      </div>
    `;
  }

  function renderRequests() {
    const [title, subtitle] = pageTitle();
    const list = filterBySearch(Admin.state.kitchens);
    const selected = getSelectedKitchen(list);

    return `
      ${renderHeader(title, subtitle)}

      <div class="requests-layout">
        <div class="requests-table">
          <div class="search-row">
            <input
              class="search-input"
              id="requestSearch"
              value="${safe(Admin.state.requestSearch)}"
              placeholder="Search requests..."
            />
            <button class="btn btn-red" data-refresh="true">Refresh</button>
          </div>

          ${renderKitchenTable(list, "No requests yet", "Kitchen approval requests will appear here.")}
        </div>

        <div class="details-panel">
          ${renderDetailsPanel(selected)}
        </div>
      </div>
    `;
  }

  function renderKitchens() {
    const [title, subtitle] = pageTitle();
    const approved = filterBySearch(Admin.state.kitchens.filter(item => getStatus(item) === "Approved"));
    const selected = getSelectedKitchen(approved);

    return `
      ${renderHeader(title, subtitle)}

      <div class="requests-layout">
        <div class="requests-table">
          <div class="search-row">
            <input
              class="search-input"
              id="requestSearch"
              value="${safe(Admin.state.requestSearch)}"
              placeholder="Search approved kitchens..."
            />
            <button class="btn btn-red" data-refresh="true">Refresh</button>
          </div>

          ${renderKitchenTable(approved, "No approved kitchens yet", "Approved kitchens will appear here.")}
        </div>

        <div class="details-panel">
          ${renderDetailsPanel(selected)}
        </div>
      </div>
    `;
  }

  function renderOrders() {
    const [title, subtitle] = pageTitle();

    return `
      ${renderHeader(title, subtitle)}
      ${emptyState("No orders yet", "Orders will appear here after users place them.")}
    `;
  }

  function renderCustomers() {
    const [title, subtitle] = pageTitle();

    return `
      ${renderHeader(title, subtitle)}

      <div class="stats-grid">
        ${statCard("Total Customers", Admin.state.customers.length)}
        ${statCard("Active Customers", 0)}
        ${statCard("Average Order Value", "₹0")}
      </div>

      ${emptyState("No customers yet", "Registered customers will appear here.")}
    `;
  }

  function renderAnalytics() {
    const [title, subtitle] = pageTitle();
    const approved = Admin.state.kitchens.filter(item => getStatus(item) === "Approved").length;

    return `
      ${renderHeader(title, subtitle)}

      <div class="stats-grid">
        ${statCard("Revenue", "₹0")}
        ${statCard("Orders", Admin.state.orders.length)}
        ${statCard("Customers", Admin.state.customers.length)}
        ${statCard("Approved Kitchens", approved)}
      </div>

      <div class="card">
        <div class="card-title">Analytics Data</div>
        ${emptyState("No analytics data yet", "Real analytics will appear after orders and customers are added.")}
      </div>
    `;
  }

  function renderSettings() {
    const [title, subtitle] = pageTitle();

    return `
      ${renderHeader(title, subtitle)}

      <div class="form">
        <div class="form-group">
          <label class="form-label">App Name</label>
          <input class="form-input" value="HapyCure" />
        </div>

        <div class="form-group">
          <label class="form-label">Support Email</label>
          <input class="form-input" placeholder="Enter support email" />
        </div>

        <div class="form-group">
          <label class="form-label">Primary City</label>
          <input class="form-input" placeholder="Enter primary city" />
        </div>

        <div class="switch-row">
          <div class="switch ${Admin.state.maintenanceMode ? "active" : ""}" id="maintenanceSwitch">
            <div class="switch-dot"></div>
          </div>

          <span style="font-size:14px;font-weight:500">Maintenance Mode</span>
          ${Admin.state.maintenanceMode ? Admin.utils.badge("Active") : ""}
        </div>

        <button class="btn btn-primary" type="button">Save Changes</button>
      </div>
    `;
  }

  function renderPage() {
    const main = document.getElementById("main");

    renderNav();

    if (Admin.state.activePage === "overview") main.innerHTML = renderOverview();
    if (Admin.state.activePage === "requests") main.innerHTML = renderRequests();
    if (Admin.state.activePage === "kitchens") main.innerHTML = renderKitchens();
    if (Admin.state.activePage === "orders") main.innerHTML = renderOrders();
    if (Admin.state.activePage === "customers") main.innerHTML = renderCustomers();
    if (Admin.state.activePage === "analytics") main.innerHTML = renderAnalytics();
    if (Admin.state.activePage === "settings") main.innerHTML = renderSettings();
  }

  Admin.pages = {
    renderPage
  };
})(window.HapyCureAdmin);
