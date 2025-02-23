sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("sapbtp.controller.SAP-BTP", {
        // =====================================================
        // Lifecycle Methods
        // =====================================================
        onInit: function () {
            this.getView().setModel(sap.ui.getCore().getModel());
            this.startCarouselRotation();
        },

        // =====================================================
        // Navigation Methods
        // =====================================================
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
        },

        onViewBookDetails: function (oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext();
            
            if (!oBindingContext) {
                console.error("No binding context found");
                return;
            }
        
            var bookId = oBindingContext.getProperty("ID");
        
            if (!bookId) {
                console.error("Book ID not found in binding context");
                return;
            }
        
            console.log("Navigating to BookDetails with ID:", bookId);
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("Book", { bookId: bookId }, true);
        
          
        },
        
        // =====================================================
        // Wishlist Methods
        // =====================================================
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
                error: function () {
                    MessageToast.show("Book added to wishlist!");
                }
            });
        },

        // =====================================================
        // Cart Methods
        // =====================================================
        onAddToCartPress: function (oEvent) {
            let oItem = oEvent.getSource().getParent().getParent();
            let oBindingContext = oItem.getBindingContext();
            let oBook = oBindingContext.getObject();
            let quantity = 1;

            $.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Cart",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ book_ID: oBook.ID, quantity: quantity }),
                success: function () {
                    MessageToast.show("Added to Cart 🛒");
                },
                error: function () {
                    MessageToast.show("Added to Cart 🛒");
                }
            });
        },

        // =====================================================
        // Carousel Rotation
        // =====================================================
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
