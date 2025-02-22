sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("sapbtp.controller.SAP-BTP", {

        onInit: function () {
            this.getView().setModel(sap.ui.getCore().getModel());
            this.startCarouselRotation();
          
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
        },onBookPress: function (oEvent) {
    var oBindingContext = oEvent.getSource().getBindingContext();
    if (!oBindingContext) {
        console.error("No binding context found");
        return;
    }

    var bookId = oBindingContext.getProperty("id"); // Ensure the property matches your data model
    if (!bookId) {
        console.error("Book ID not found in binding context");
        return;
    }

    this.getOwnerComponent().getRouter().navTo("BookDetails", {
        bookId: bookId
    });
},
onBookPress: function (oEvent) {
    console.log("Book Pressed!"); // Debugging step 1

    var oBindingContext = oEvent.getSource().getBindingContext();
    if (!oBindingContext) {
        console.error("No binding context found");
        return;
    }

    var bookId = oBindingContext.getProperty("id"); // Ensure your book ID is correct
    console.log("Book ID:", bookId); // Debugging step 2

    if (!bookId) {
        console.error("Book ID not found in binding context");
        return;
    }

    this.getOwnerComponent().getRouter().navTo("BookDetails", {
        bookId: bookId
    });

    console.log("Navigating to BookDetails with ID:", bookId); // Debugging step 3
}
,
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
}
,


        // Add book to Cart
        onAddToCartPress: function (oEvent) {
            let oItem = oEvent.getSource().getParent().getParent();
            let oBindingContext = oItem.getBindingContext();
            let oBook = oBindingContext.getObject();

            let oModel = this.getView().getModel();
            let aCart = oModel.getProperty("/Cart") || [];

            // Prevent duplicates in Cart
            if (!aCart.some(book => book.title === oBook.title)) {
                aCart.push(oBook);
                oModel.setProperty("/Cart", aCart);
                MessageToast.show("Added to Cart 🛒");
            } else {
                MessageToast.show("Already in Cart 🛒");
            }
        },

        // Automatically rotate the carousel every 10 seconds
        startCarouselRotation: function () {
            var oCarousel = this.getView().byId("promoCarousel");
            if (!oCarousel) return;

            var iIndex = 0;
            var aItems = oCarousel.getPages();

            setInterval(() => {
                if (aItems.length > 0) {
                    iIndex = (iIndex + 1) % aItems.length;
                    oCarousel.setActivePage(aItems[iIndex]);
                }
            }, 30000);
        }
    });
});
