sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("sapbtp.controller.Wishlist", {

        onInit: function () {
            // Initialization logic
        },

        onHomePress: function () {
            this.getOwnerComponent().getRouter().navTo("RouteSAP-BTP");
        },

        onWishlistPress: function () {
            this.getOwnerComponent().getRouter().navTo("Wishlist");
        },

        onCartPress: function () {
            this.getOwnerComponent().getRouter().navTo("Cart");
        },

        onAccountPress: function () {
            this.getOwnerComponent().getRouter().navTo("Account");
        }

    });
});
