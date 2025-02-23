sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("sapbtp.controller.Wishlist", {

        // =====================================================
        // Lifecycle Methods
        // =====================================================
        onInit: function () {
            this.getView().setModel(new sap.ui.model.json.JSONModel(), "wishlistModel");
            this._loadWishlist();
        },

        // =====================================================
        // Wishlist Methods
        // =====================================================
        _loadWishlist: function () {
            var that = this;
            var username = "CharlesPato";

            $.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Wishlist",
                method: "GET",
                success: function (wishlistData) {
                    console.log("Wishlist Data:", wishlistData);

                    var userWishlist = wishlistData.value.filter(item => item.username === username);

                    if (userWishlist.length === 0) {
                        MessageToast.show("Your wishlist is empty.");
                        return;
                    }

                    var bookIds = userWishlist.map(item => item.book_ID);
                    that._fetchBookDetails(bookIds);
                },
                error: function (xhr) {
                    console.error("Failed to load wishlist:", xhr.responseText);
                }
            });
        },

        _fetchBookDetails: function (bookIds) {
            var that = this;
            $.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Books",
                method: "GET",
                success: function (booksData) {
                    console.log("Books Data:", booksData);

                    var wishlistBooks = booksData.value.filter(book => bookIds.includes(book.ID));

                    var oModel = that.getView().getModel("wishlistModel");
                    oModel.setProperty("/Wishlist", wishlistBooks);

                    MessageToast.show("Wishlist loaded successfully!");
                },
                error: function (xhr) {
                    console.error("Failed to load book details:", xhr.responseText);
                }
            });
        },

        _removeFromWishlist: function (bookId) {
            var that = this;

            $.ajax({
                url: `http://localhost:4004/odata/v4/catalog/Wishlist?$filter=book_ID eq ${bookId}`,
                method: "GET",
                success: function (wishlistData) {
                    if (wishlistData && wishlistData.value.length > 0) {
                        var wishlistId = wishlistData.value[0].ID;

                        $.ajax({
                            url: `http://localhost:4004/odata/v4/catalog/Wishlist(${wishlistId})`,
                            method: "DELETE",
                            success: function () {
                                MessageToast.show("Removed from Wishlist.");
                                location.reload();
                            },
                            error: function (xhr) {
                                console.error("Error deleting wishlist:", xhr.responseText);
                                MessageToast.show("Error deleting wishlist.");
                            }
                        });
                    } else {
                        MessageToast.show("Wishlist entry not found.");
                    }
                },
                error: function (xhr) {
                    console.error("Failed to retrieve wishlist entry:", xhr.responseText);
                    MessageToast.show("Error retrieving wishlist entry.");
                }
            });
        },

        // =====================================================
        // Cart Methods
        // =====================================================
        onMoveToCartPress: function (oEvent) {
            var that = this;
            var oItem = oEvent.getSource().getParent().getParent();
            var oBindingContext = oItem.getBindingContext("wishlistModel");
            var oBook = oBindingContext.getObject();

            if (!oBook || !oBook.ID) {
                MessageToast.show("Invalid Book ID.");
                return;
            }

            console.log("Moving to Cart:", oBook.ID);

            that.onAddToCartPress(oBook.ID, function (success) {
                if (success) {
                    that._removeFromWishlist(oBook.ID);
                }
            });
        },

        onAddToCartPress: function (bookId, callback) {
            $.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Cart",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ book_ID: bookId, quantity: 1 }),
                success: function () {
                    MessageToast.show("Added to Cart 🛒");

                    if (callback) {
                        callback(true);
                    }
                },
                error: function () {
                    MessageToast.show("Added to Cart 🛒");

                    if (callback) {
                        callback(false);
                    }
                }
            });
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

        // =====================================================
        // Event Handlers
        // =====================================================
        onRemoveWishlistPress: function (oEvent) {
            var that = this;
            var oItem = oEvent.getSource().getParent().getParent();
            var oBindingContext = oItem.getBindingContext("wishlistModel");
            var oBook = oBindingContext.getObject();

            if (!oBook || !oBook.ID) {
                MessageToast.show("Error: Book ID missing.");
                return;
            }

            that._removeFromWishlist(oBook.ID);
        }
    });
});
