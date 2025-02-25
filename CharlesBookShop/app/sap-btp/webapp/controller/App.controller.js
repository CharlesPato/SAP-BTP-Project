sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
  "use strict";

  return Controller.extend("sapbtp.controller.App", {
      onInit: function() {
          var sessionModel = new JSONModel({ isLoggedIn: false });
          this.getView().setModel(sessionModel, "sessionModel");
      }
  });
});