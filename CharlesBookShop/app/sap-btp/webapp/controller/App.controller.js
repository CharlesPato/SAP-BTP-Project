sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("sapbtp.controller.App", {
      onInit: function () {
          // Initial setup if required
      },

      onNavigateToSingleBook: function () {
          this.getOwnerComponent().getRouter().navTo("RouteSingleBook", {
              bookId: "123"
          });
      },

  });
});
