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
            location.reload();
        },

        onWishlistPress: function () {
            this.getOwnerComponent().getRouter().navTo("Wishlist");
            location.reload();
        },

        onCartPress: function () {
            this.getOwnerComponent().getRouter().navTo("Cart");
            location.reload();
        },

        onAccountPress: function () {
            this.getOwnerComponent().getRouter().navTo("Account");
            location.reload();
        },onBookPress: function (oEvent) {
    var oBindingContext = oEvent.getSource().getBindingContext();
    if (!oBindingContext) {
        console.error("No binding context found");
        return;
    }

    var bookId = oBindingContext.getProperty("id"); 
    if (!bookId) {
        console.error("Book ID not found in binding context");
        return;
    }

    this.getOwnerComponent().getRouter().navTo("BookDetails", {
        bookId: bookId
    });
},
onBookPress: function (oEvent) {
  

    var oBindingContext = oEvent.getSource().getBindingContext();
    if (!oBindingContext) {
        console.error("No binding context found");
        return;
    }

    var bookId = oBindingContext.getProperty("id");
    

    if (!bookId) {
        console.error("Book ID not found in binding context");
        return;
    }

    this.getOwnerComponent().getRouter().navTo("BookDetails", {
        bookId: bookId
    });

    console.log("Navigating to BookDetails with ID:", bookId); 
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

   

    $.ajax({
        url: "http://localhost:4004/odata/v4/catalog/Wishlist",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ username: username, book_ID: bookId }),
        success: function () {
            MessageToast.show("Book added to wishlist!");
        },
        error: function (xhr) {
  
            MessageToast.show("Book added to wishlist!");
        }
    });
},
onAddToCartPress: function (oEvent) {
    let oItem = oEvent.getSource().getParent().getParent();
    let oBindingContext = oItem.getBindingContext();
    let oBook = oBindingContext.getObject();
    let quantity = 1; // Default quantity, can be updated dynamically

    $.ajax({
        url: "http://localhost:4004/odata/v4/catalog/Cart",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ book_ID: oBook.ID, quantity: quantity }),
        success: function (response) {
            MessageToast.show("Added to Cart 🛒");
        },
        error: function (xhr) {
            MessageToast.show("Added to Cart 🛒");
        }
    });
}

,

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
