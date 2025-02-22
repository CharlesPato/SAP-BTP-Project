sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("sapbtp.controller.SAP-BTP", {

        onInit: function () {
            this.getView().setModel(sap.ui.getCore().getModel());
            this.startCarouselRotation();
            //this.loadBookImages();
        },
        
        loadBookImages: function () {
            let aBookImages = [
                "images/Book1.png",
                "images/Book2.png",
                "images/Book3.png",
                "images/Book4.png",
                "images/Book5.png"
            ];
        
            // Check if images exist in the folder
            let aBooks = aBookImages.map((img, index) => ({
                title: `Book ${index + 1}`,
                author: `Author ${index + 1}`,
                stock: "In Stock",
                image: img
            }));
        
            let oModel = new JSONModel({ Books: aBooks });
        
            // Set model at the component level to ensure availability
            this.getOwnerComponent().setModel(oModel);
        
            // Also set model at the view level (if necessary)
            this.getView().setModel(oModel);
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

        // Add book to Wishlist
        onAddToWishlistPress: function (oEvent) {
            let oItem = oEvent.getSource().getParent().getParent();
            let oBindingContext = oItem.getBindingContext();
            let oBook = oBindingContext.getObject();

            let oModel = this.getView().getModel();
            let aWishlist = oModel.getProperty("/Wishlist") || [];

            // Prevent duplicates in Wishlist
            if (!aWishlist.some(book => book.title === oBook.title)) {
                aWishlist.push(oBook);
                oModel.setProperty("/Wishlist", aWishlist);
                MessageToast.show("Added to Wishlist ❤️");
            } else {
                MessageToast.show("Already in Wishlist ❤️");
            }
        },

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
