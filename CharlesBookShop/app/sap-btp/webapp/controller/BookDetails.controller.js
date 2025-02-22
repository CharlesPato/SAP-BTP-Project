sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("sapbtp.controller.BookDetails", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("BookDetails").attachPatternMatched(this._onBookMatched, this);
        },

        _onBookMatched: function (oEvent) {
            let bookId = oEvent.getParameter("arguments").bookId;
            let oModel = this.getView().getModel();

            if (!oModel) {
                console.error("Model not found!");
                return;
            }

            let aBooks = oModel.getProperty("/Books");
            let oBook = aBooks.find(book => book.ID == bookId);

            if (oBook) {
                this.getView().setModel(new JSONModel(oBook), "book");
            } else {
                MessageToast.show("Book details not found!");
            }
        },

        // Add book to Wishlist
        onAddToWishlist: function () {
            let oBook = this.getView().getModel("book").getData();
            let oModel = this.getView().getModel();
            let aWishlist = oModel.getProperty("/Wishlist") || [];

            if (!aWishlist.some(book => book.ID === oBook.ID)) {
                aWishlist.push(oBook);
                oModel.setProperty("/Wishlist", aWishlist);
                MessageToast.show("Added to Wishlist ❤️");
            } else {
                MessageToast.show("Already in Wishlist ❤️");
            }
        },

        // Add book to Cart
        onAddToCart: function () {
            let oBook = this.getView().getModel("book").getData();
            let oModel = this.getView().getModel();
            let aCart = oModel.getProperty("/Cart") || [];

            if (!aCart.some(book => book.ID === oBook.ID)) {
                aCart.push(oBook);
                oModel.setProperty("/Cart", aCart);
                MessageToast.show("Added to Cart 🛒");
            } else {
                MessageToast.show("Already in Cart 🛒");
            }
        }
    });
});
