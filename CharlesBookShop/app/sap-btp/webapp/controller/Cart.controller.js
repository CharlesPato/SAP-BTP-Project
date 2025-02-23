sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("sapbtp.controller.Cart", {
        
        // ------------------------- Initialization -------------------------
        onInit: function () {
            this.getView().setModel(new JSONModel(), "cartModel");
            this._loadCart();
        },

        // ------------------------- Load Cart -------------------------
        _loadCart: function () {
            var that = this;
            $.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Cart",
                method: "GET",
                success: function (cartData) {
                    if (!cartData.value || cartData.value.length === 0) {
                        MessageToast.show("Your cart is empty.");
                        return;
                    }
                    var bookIds = cartData.value.map(item => item.book_ID);
                    that._fetchBookDetails(bookIds, cartData.value);
                },
                error: function (xhr) {
                    console.error("Failed to load cart:", xhr.responseText);
                }
            });
        },

        _fetchBookDetails: function (bookIds, userCart) {
            var that = this;
            $.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Books",
                method: "GET",
                success: function (booksData) {
                    var cartBooks = booksData.value.filter(book => bookIds.includes(book.ID));
                    var enrichedCart = userCart.map(cartItem => {
                        var bookDetails = cartBooks.find(book => book.ID === cartItem.book_ID);
                        return {
                            ...cartItem,
                            ...bookDetails,
                            totalCost: bookDetails.stock * cartItem.quantity
                        };
                    });

                    var oModel = that.getView().getModel("cartModel");
                    oModel.setProperty("/Cart", enrichedCart);
                    that._calculateTotalCost();
                },
                error: function (xhr) {
                    console.error("Failed to load book details:", xhr.responseText);
                }
            });
        },

        // ------------------------- Quantity Management -------------------------
        onIncreaseQuantity: function (oEvent) {
            let oBindingContext = oEvent.getSource().getBindingContext("cartModel");
            let oCartItem = oBindingContext.getObject();
            let oModel = this.getView().getModel("cartModel");

            oCartItem.quantity += 1;
            oCartItem.totalCost = oCartItem.stock * oCartItem.quantity;
            oModel.refresh(true);
        },

        onDecreaseQuantity: function (oEvent) {
            let oBindingContext = oEvent.getSource().getBindingContext("cartModel");
            let oCartItem = oBindingContext.getObject();
            let oModel = this.getView().getModel("cartModel");

            if (oCartItem.quantity > 1) {
                oCartItem.quantity -= 1;
                oCartItem.totalCost = oCartItem.stock * oCartItem.quantity;
                oModel.refresh(true);
            }
        },

        _updateCartQuantity: function (oCartItem) {
            let book_ID = oCartItem.book_ID;
            $.ajax({
                url: `http://localhost:4004/odata/v4/catalog/Cart?$filter=book_ID eq ${book_ID}`,
                method: "GET",
                success: function (data) {
                    if (!data.value || data.value.length === 0) {
                        MessageToast.show("Cart item not found.");
                        return;
                    }

                    let cartId = data.value[0].ID;
                    let updateUrl = `http://localhost:4004/odata/v4/catalog/Cart(${cartId})`;

                    $.ajax({
                        url: updateUrl,
                        method: "PATCH",
                        contentType: "application/json",
                        data: JSON.stringify({
                            quantity: oCartItem.quantity,
                            totalCost: oCartItem.stock * oCartItem.quantity
                        }),
                        success: function () {
                            location.reload();
                            MessageToast.show("Cart updated successfully.");
                        },
                        error: function (xhr) {
                            console.error("Error updating cart:", xhr.responseText);
                            MessageToast.show("Error updating cart.");
                        }
                    });
                },
                error: function (xhr) {
                    console.error("Error finding cart item:", xhr.responseText);
                }
            });
        },

        _calculateTotalCost: function () {
            let oModel = this.getView().getModel("cartModel");
            let aCartItems = oModel.getProperty("/Cart") || [];
            let totalCost = aCartItems.reduce((sum, item) => sum + item.totalCost, 0);
            oModel.setProperty("/TotalCost", parseFloat(totalCost).toFixed(2));
        },

        // ------------------------- Cart Actions -------------------------
        onUpdateCartPress: function (oEvent) {
            let oBindingContext = oEvent.getSource().getBindingContext("cartModel");
            let oCartItem = oBindingContext.getObject();
            if (!oCartItem.book_ID) {
                MessageToast.show("Error: Book ID missing.");
                return;
            }
            this._updateCartQuantity(oCartItem);
        },

        onRemoveCartPress: function (oEvent) {
            let oBindingContext = oEvent.getSource().getBindingContext("cartModel");
            let oCartItem = oBindingContext.getObject();
            let book_ID = oCartItem.book_ID;
            if (!book_ID) {
                MessageToast.show("Error: Book ID missing.");
                return;
            }
            let that = this;

            $.ajax({
                url: `http://localhost:4004/odata/v4/catalog/Cart?$filter=book_ID eq ${book_ID}`,
                method: "GET",
                success: function (data) {
                    if (!data.value || data.value.length === 0) {
                        MessageToast.show("Cart entry not found.");
                        return;
                    }

                    let cartId = data.value[0].ID;
                    $.ajax({
                        url: `http://localhost:4004/odata/v4/catalog/Cart(${cartId})`,
                        method: "DELETE",
                        success: function () {
                            location.reload();
                            MessageToast.show("Book removed from Cart!");
                           
                        },
                        error: function (xhr) {
                            console.error("Error removing item from cart:", xhr.responseText);
                        }
                    });
                },
                error: function (xhr) {
                    console.error("Failed to retrieve Cart entry:", xhr.responseText);
                }
            });
        },

        // ------------------------- Navigation -------------------------
        onHomePress: function () { this.getOwnerComponent().getRouter().navTo("RouteSAP-BTP"); location.reload(); },
        onWishlistPress: function () { this.getOwnerComponent().getRouter().navTo("Wishlist"); location.reload(); },
        onCartPress: function () { this.getOwnerComponent().getRouter().navTo("Cart"); location.reload(); },
        onAccountPress: function () { this.getOwnerComponent().getRouter().navTo("Account"); location.reload(); },
    });
});
