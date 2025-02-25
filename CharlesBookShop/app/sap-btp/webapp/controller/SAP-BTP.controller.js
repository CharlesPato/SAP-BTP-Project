sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("sapbtp.controller.SAPBTP", {
        // =====================================================
        // Lifecycle Methods
        // =====================================================
        onInit: function () {
            this._initializeSession();
            this.startCarouselRotation();
        },

        _initializeSession: function () {
            var sessionModel = sap.ui.getCore().getModel("sessionModel");
            if (!sessionModel) {
                var storedSession = localStorage.getItem("sessionData");
                try {
                    storedSession = storedSession ? JSON.parse(storedSession) : { isLoggedIn: false, LoggedId: 0, user: {} };
                } catch (error) {
                    console.error("Error parsing session data:", error);
                    storedSession = { isLoggedIn: false, LoggedId: 0, user: {} };
                }
                sessionModel = new JSONModel(storedSession);
                sap.ui.getCore().setModel(sessionModel, "sessionModel");
            }
            this.getView().setModel(sessionModel, "sessionModel");
        },

        _persistSession: function () {
            var sessionModel = sap.ui.getCore().getModel("sessionModel");
            if (sessionModel) {
                localStorage.setItem("sessionData", JSON.stringify(sessionModel.getData()));
            }
        },

        _restoreSession: function () {
            var storedSession = localStorage.getItem("sessionData");
            if (storedSession) {
                var sessionModel = new JSONModel(JSON.parse(storedSession));
                sap.ui.getCore().setModel(sessionModel, "sessionModel");
                this.getView().setModel(sessionModel, "sessionModel");
            }
        },

        // =====================================================
        // Login & Logout Handling
        // =====================================================
        onLoginPress: function () {
            this.getOwnerComponent().getRouter().navTo("Login");
        },

        onLogoutPress: function () {
            var that = this;
            $.ajax({
                url: "/odata/v4/catalog/logout",
                method: "POST",
                contentType: "application/json",
                success: function (response) {
                    MessageToast.show(response.value.message);
                    var sessionModel = sap.ui.getCore().getModel("sessionModel");
                    sessionModel.setProperty("/isLoggedIn", false);
                    sessionModel.setProperty("/LoggedId", 0);
                    sessionModel.setProperty("/user", {});
                    localStorage.removeItem("sessionData");
                    that.getOwnerComponent().getRouter().navTo("RouteSAP-BTP");
                },
                error: function (xhr) {
                    console.error("Logout failed:", xhr.responseText);
                    MessageToast.show("Logout failed. Try again.");
                }
            });
        },

        // =====================================================
        // Navigation Methods
        // =====================================================
        onHomePress: function () {
            this._persistSession();
            this.getOwnerComponent().getRouter().navTo("RouteSAP-BTP");
        },

        onWishlistPress: function () {
            this._persistSession();
            this.getOwnerComponent().getRouter().navTo("Wishlist");
            this._restoreSession();
            location.reload();
        },

        onCartPress: function () {
            this._persistSession();
            this.getOwnerComponent().getRouter().navTo("Cart");
            this._restoreSession();
            location.reload();
        },

        onViewBookDetails: function (oEvent) {
            this._persistSession();
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
            sap.ui.core.UIComponent.getRouterFor(this).navTo("Book", { bookId: bookId }, true);
        },

        // =====================================================
        // Wishlist & Cart Methods
        // =====================================================
        onWishPress: function (oEvent) {
            var bookId = oEvent.getSource().getBindingContext().getProperty("ID");
            if (!bookId) {
                MessageToast.show("Invalid Book ID.");
                return;
            }
            $.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Wishlist",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ username: "CharlesPato", book_ID: bookId }),
                success: function () {
                    MessageToast.show("Book added to wishlist!");
                },
                error: function () {
                    MessageToast.show("Book added to wishlist!");
                }
            });
        },

        onAddToCartPress: function (oEvent) {
            let oItem = oEvent.getSource().getParent().getParent();
            let oBindingContext = oItem.getBindingContext();
            let oBook = oBindingContext.getObject();
            $.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Cart",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ book_ID: oBook.ID, quantity: 1 }),
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