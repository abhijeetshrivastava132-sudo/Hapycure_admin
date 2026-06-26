window.HapyCureAdmin = window.HapyCureAdmin || {};

(function (Admin) {
  const { safe, badge, getStatus, getField, formatDate } = Admin.utils;

  function statCard(label, value, sub = "") {
    return `
      <div class="stat-card">
        <div class="stat-label">${safe(label)}</div>
        <div class="stat-value">${safe(value)}</div>
        ${sub ? `<div class="stat-sub">${safe(sub)}</div>` : ""}
      </div>
    `;
  }

  function emptyState(title, text) {
    return `
      <div class="empty-state">
        <div class="empty-title">${safe(title)}</div>
        <div>${safe(text)}</div>
      </div>
    `;
  }

  function infoRow(label, value, isHtml = false) {
    return `
      <div class="info-row">
        <span class="info-label">${safe(label)}</span>
        <span class="info-value">${isHtml ? value : safe(value)}</span>
      </div>
    `;
  }

  function messageBox() {
    if (!Admin.state.message) return "";

    return `<div class="message ${safe(Admin.state.messageType)}">${safe(Admin.state.message)}</div>`;
  }

  function renderStats() {
    const kitchens = Admin.state.kitchens;
    const orders = Admin.state.orders;
    const customers = Admin.state.customers;
    const pending = kitchens.filter(item => getStatus(item) === "Pending").length;
    const approved = kitchens.filter(item => getStatus(item) === "Approved").length;
    const rejected = kitchens.filter(item => getStatus(item) === "Rejected").length;

    return `
      <div class="stats-grid">
        ${statCard("Pending Requests", pending, "Waiting for review")}
        ${statCard("Approved Kitchens", approved, "Ready kitchens")}
        ${statCard("Rejected Requests", rejected, "Rejected applications")}
        ${statCard("Orders Today", orders.length, "Total orders")}
        ${customers.length ? statCard("Customers", customers.length, "Registered users") : ""}
      </div>
    `;
  }

  function renderRequestRows(list) {
    return list.map(item => {
      const id = getField(item, ["id", "_id"]);
      const kitchenName = getField(item, ["kitchenName", "name", "businessName"]);
      const owner = getField(item, ["owner", "ownerName", "fullName"]);
      const city = getField(item, ["city", "location"]);
      const foodType = getField(item, ["foodType", "category"]);
      const status = getStatus(item);

      return `
        <tr data-select="${safe(id)}" style="cursor:pointer">
          <td class="strong">${safe(id)}</td>
          <td class="strong">${safe(kitchenName)}</td>
          <td>${safe(owner)}</td>
          <td>${safe(city)}</td>
          <td>${safe(foodType)}</td>
          <td>${badge(status)}</td>
          <td>View</td>
        </tr>
      `;
    }).join("");
  }

  function renderKitchenTable(list, emptyTitle, emptyText) {
    if (!list.length) return emptyState(emptyTitle, emptyText);

    return `
      <div class="table-card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Kitchen</th>
                <th>Owner</th>
                <th>City</th>
                <th>Food Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>${renderRequestRows(list)}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderDocuments(files) {
    if (!Array.isArray(files) || !files.length) {
      return `<div class="food-meta">No documents uploaded.</div>`;
    }

    return files.map(file => {
      const name = getField(file, ["name", "filename", "originalName"]);
      const url = getField(file, ["url", "secure_url", "path"]);

      if (!url) {
        return `<div class="file-item"><span class="food-meta">${safe(name)}</span></div>`;
      }

      return `
        <div class="file-item">
          <a class="file-link" href="${safe(url)}" target="_blank" rel="noopener noreferrer">${safe(name || "Open document")}</a>
        </div>
      `;
    }).join("");
  }

  function renderFoodItems(items) {
    if (!Array.isArray(items) || !items.length) {
      return `<div class="food-meta">No food items added.</div>`;
    }

    return items.map(item => {
      const photo = item?.photo?.url || item?.photoUrl || "";

      return `
        <div class="food-item">
          <div class="food-name">${safe(getField(item, ["name", "title"]))} — ₹${safe(getField(item, ["price", "amount"]))}</div>
          <div class="food-meta">${safe(getField(item, ["mealType", "meal"]))} · ${safe(getField(item, ["category", "foodType"]))}</div>
          <div class="food-meta">${safe(getField(item, ["description", "details"]))}</div>
          ${photo ? `<img class="food-photo" src="${safe(photo)}" alt="Food photo" />` : ""}
        </div>
      `;
    }).join("");
  }

  function renderDetailsPanel(kitchen) {
    if (!kitchen) {
      return emptyState("No request selected", "Select a request to view full details.");
    }

    const id = getField(kitchen, ["id", "_id"]);
    const status = getStatus(kitchen);
    const kitchenName = getField(kitchen, ["kitchenName", "name", "businessName"]);
    const owner = getField(kitchen, ["owner", "ownerName", "fullName"]);
    const phone = getField(kitchen, ["phone", "mobile", "phoneNumber"]);
    const email = getField(kitchen, ["email", "ownerEmail"]);
    const city = getField(kitchen, ["city", "location"]);
    const foodType = getField(kitchen, ["foodType", "category"]);
    const address = getField(kitchen, ["address", "fullAddress"]);
    const openingTime = getField(kitchen, ["openingTime", "startTime"]);
    const closingTime = getField(kitchen, ["closingTime", "endTime"]);
    const createdAt = getField(kitchen, ["createdAt", "created_at"]);

    return `
      <div class="details-head">
        <div>
          <h2 class="details-title">${safe(kitchenName || "Kitchen Details")}</h2>
          <p class="details-id">${safe(id)}</p>
        </div>
        ${badge(status)}
      </div>

      ${infoRow("Owner", owner)}
      ${infoRow("Phone", phone)}
      ${infoRow("Email", email)}
      ${infoRow("City", city)}
      ${infoRow("Address", address)}
      ${infoRow("Food Type", foodType)}
      ${infoRow("Timing", openingTime || closingTime ? `${openingTime || "—"} - ${closingTime || "—"}` : "")}
      ${infoRow("Created", formatDate(createdAt))}

      <div class="section-title">Documents</div>
      ${renderDocuments(kitchen.documents)}

      <div class="section-title">Food Menu</div>
      ${renderFoodItems(kitchen.foodItems)}

      ${status === "Pending" ? `
        <div class="action-row">
          <button class="btn btn-green" data-approve="${safe(id)}">Approve</button>
          <button class="btn btn-red" data-reject="${safe(id)}">Reject</button>
        </div>
      ` : ""}
    `;
  }

  Admin.components = {
    statCard,
    emptyState,
    infoRow,
    messageBox,
    renderStats,
    renderKitchenTable,
    renderDetailsPanel
  };
})(window.HapyCureAdmin);
