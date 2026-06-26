window.HapyCureAdmin = window.HapyCureAdmin || {};

(function (Admin) {
  async function refreshData(showSuccess = true) {
    const loaded = await Admin.api.loadKitchens();

    if (loaded && showSuccess) {
      Admin.utils.showMessage("Requests refreshed.", "success");
    }

    Admin.pages.renderPage();
  }

  async function changeKitchenStatus(id, action) {
    await Admin.api.updateKitchenStatus(id, action);
    Admin.pages.renderPage();
  }

  function handleNavClick(target) {
    const button = target.closest("[data-page]");
    if (!button) return false;

    Admin.state.activePage = button.dataset.page;
    Admin.state.selectedKitchenId = null;
    Admin.state.requestSearch = "";
    Admin.utils.clearMessage();
    Admin.pages.renderPage();
    return true;
  }

  function handleTableClick(target) {
    const row = target.closest("[data-select]");
    if (!row) return false;

    Admin.state.selectedKitchenId = row.dataset.select;
    Admin.utils.clearMessage();
    Admin.pages.renderPage();
    return true;
  }

  function handleSettingsClick(target) {
    const switchButton = target.closest("#maintenanceSwitch");
    if (!switchButton) return false;

    Admin.state.maintenanceMode = !Admin.state.maintenanceMode;
    Admin.pages.renderPage();
    return true;
  }

  async function handleActionClick(target) {
    const refreshButton = target.closest("[data-refresh]");
    const approveButton = target.closest("[data-approve]");
    const rejectButton = target.closest("[data-reject]");

    if (refreshButton) {
      await refreshData(true);
      return true;
    }

    if (approveButton) {
      await changeKitchenStatus(approveButton.dataset.approve, "approve");
      return true;
    }

    if (rejectButton) {
      await changeKitchenStatus(rejectButton.dataset.reject, "reject");
      return true;
    }

    return false;
  }

  document.addEventListener("click", async event => {
    if (handleNavClick(event.target)) return;
    if (await handleActionClick(event.target)) return;
    if (handleTableClick(event.target)) return;
    handleSettingsClick(event.target);
  });

  document.addEventListener("input", event => {
    if (event.target.id !== "requestSearch") return;

    Admin.state.requestSearch = event.target.value;
    Admin.pages.renderPage();

    const input = document.getElementById("requestSearch");
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });

  Admin.pages.renderPage();
  refreshData(false);
})(window.HapyCureAdmin);
