window.HapyCureAdmin = window.HapyCureAdmin || {};

(function (Admin) {
  async function loadKitchens() {
    try {
      const response = await fetch(`${Admin.API_URL}/api/admin/kitchen-requests`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        Admin.state.kitchens = [];
        Admin.utils.showMessage(result.message || "Requests load nahi ho rahi.", "error");
        return false;
      }

      Admin.state.kitchens = Array.isArray(result.kitchens) ? result.kitchens : [];
      return true;
    } catch (error) {
      Admin.state.kitchens = [];
      Admin.utils.showMessage("Backend connect nahi ho raha. Render backend live check karo.", "error");
      return false;
    }
  }

  async function updateKitchenStatus(id, action) {
    try {
      const response = await fetch(`${Admin.API_URL}/api/admin/kitchen-requests/${id}/${action}`, {
        method: "PATCH"
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        Admin.utils.showMessage(result.message || "Action failed.", "error");
        return false;
      }

      await loadKitchens();
      Admin.state.selectedKitchenId = id;
      Admin.utils.showMessage(action === "approve" ? "Kitchen approved." : "Kitchen rejected.", "success");
      return true;
    } catch (error) {
      Admin.utils.showMessage("Backend connect nahi ho raha.", "error");
      return false;
    }
  }

  Admin.api = {
    loadKitchens,
    updateKitchenStatus
  };
})(window.HapyCureAdmin);
