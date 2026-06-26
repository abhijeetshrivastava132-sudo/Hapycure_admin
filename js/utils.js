window.HapyCureAdmin = window.HapyCureAdmin || {};

(function (Admin) {
  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safe(value) {
    if (value === undefined || value === null || value === "") return "—";
    return escapeHTML(value);
  }

  function getStatus(item) {
    const raw = String(item?.status || "Pending").trim().toLowerCase();

    if (raw === "approved") return "Approved";
    if (raw === "rejected") return "Rejected";
    if (raw === "active") return "Active";

    return "Pending";
  }

  function statusClass(status) {
    return String(status || "Pending").toLowerCase().replaceAll(" ", "");
  }

  function badge(status) {
    const finalStatus = status || "Pending";
    return `<span class="badge ${statusClass(finalStatus)}">${safe(finalStatus)}</span>`;
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getField(item, keys) {
    for (const key of keys) {
      if (item && item[key] !== undefined && item[key] !== null && item[key] !== "") {
        return item[key];
      }
    }

    return "";
  }

  function sortByNewest(list) {
    return list.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  function showMessage(text, type = "success") {
    Admin.state.message = text;
    Admin.state.messageType = type;
  }

  function clearMessage() {
    Admin.state.message = "";
  }

  Admin.utils = {
    escapeHTML,
    safe,
    getStatus,
    statusClass,
    badge,
    formatDate,
    getField,
    sortByNewest,
    showMessage,
    clearMessage
  };
})(window.HapyCureAdmin);
