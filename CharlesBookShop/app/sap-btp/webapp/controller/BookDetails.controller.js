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

       // Function to add book to wishlist
onWishPress: function (oEvent) {
    var bookId = oEvent.getSource().getBindingContext().getProperty("ID"); 
    var username = "CharlesPato"; 

    if (!bookId) {
        MessageToast.show("Invalid Book ID.");
        return;
    }

    console.log("Adding to Wishlist:", { username: username, book_ID: bookId });

    $.ajax({
        url: "http://localhost:4004/odata/v4/catalog/Wishlist",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ username: username, book_ID: bookId }),
        success: function () {
            MessageToast.show("Book added to wishlist!");
        },
        error: function (xhr) {
            console.error("Failed to add to wishlist:", xhr.responseText);
            MessageToast.show("Failed to add to wishlist: " + xhr.responseText);
        }
    });
},
onAddToCartPress: function (oEvent) {
    var bookId = oEvent.getSource().getBindingContext().getProperty("ID");

    if (!bookId) {
        MessageToast.show("Invalid Book ID.");
        return;
    }

    console.log("Adding to Cart:", bookId);

    $.ajax({
        url: "http://localhost:4004/odata/v4/catalog/Cart",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ book_ID: bookId }),
        success: function () {
            MessageToast.show("Book added to Cart 🛒");
        },
        error: function (xhr) {
            MessageToast.show("Failed to add to Cart: " + xhr.responseText);
        }
    });
},
        
    });
});
