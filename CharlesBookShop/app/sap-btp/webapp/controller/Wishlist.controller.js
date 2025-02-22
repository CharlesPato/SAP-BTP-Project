sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("sapbtp.controller.Wishlist", {
        onInit: function () {
            this.getView().setModel(sap.ui.getCore().getModel());
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
        },

        // Remove book from Wishlist
        onRemoveWishlistPress: function (oEvent) {
            let oItem = oEvent.getSource().getParent().getParent();
            let oBindingContext = oItem.getBindingContext();
            let oBook = oBindingContext.getObject();

            let oModel = this.getView().getModel();
            let aWishlist = oModel.getProperty("/Wishlist") || [];

            // Remove book from Wishlist
            aWishlist = aWishlist.filter(book => book.title !== oBook.title);
            oModel.setProperty("/Wishlist", aWishlist);

            MessageToast.show("Removed from Wishlist");
        },

        // Move book from Wishlist to Cart
        onMoveToCartPress: function (oEvent) {
            let oItem = oEvent.getSource().getParent().getParent();
            let oBindingContext = oItem.getBindingContext();
            let oBook = oBindingContext.getObject();

            let oModel = this.getView().getModel();
            let aWishlist = oModel.getProperty("/Wishlist") || [];
            let aCart = oModel.getProperty("/Cart") || [];

            // Add to Cart if not already in Cart
            if (!aCart.some(book => book.title === oBook.title)) {
                aCart.push(oBook);
                oModel.setProperty("/Cart", aCart);
            }

            // Remove from Wishlist
            aWishlist = aWishlist.filter(book => book.title !== oBook.title);
            oModel.setProperty("/Wishlist", aWishlist);

            MessageToast.show("Moved to Cart");
        }
    });
});
