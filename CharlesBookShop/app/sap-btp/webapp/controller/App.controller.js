sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("sapbtp.controller.App", {
      onInit: function () {
          // Initial setup if required
      },

      onNavigateToSingleBook: function () {
          // Navigate to the SingleBook page
          this.getOwnerComponent().getRouter().navTo("RouteSingleBook", {
              bookId: "123"  
          });
      }
  });
});
