sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("sapbtp.controller.Wishlist", {
        onInit: function () {
            this.getView().setModel(new sap.ui.model.json.JSONModel(), "wishlistModel");
            this._loadWishlist();
        },
        
        _loadWishlist: function () {
            var that = this;
            var username = "CharlesPato"; // Set dynamically if needed
        
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
        
                    // Set the model so XML can bind it properly
                    var oModel = that.getView().getModel("wishlistModel");
                    oModel.setProperty("/Wishlist", wishlistBooks);
        
                    MessageToast.show("Wishlist loaded successfully!");
                },
                error: function (xhr) {
                    console.error("Failed to load book details:", xhr.responseText);
                }
            });
        }
        ,

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

        onRemoveWishlistPress: function (oEvent) {
            var bookId = oEvent.getSource().getBindingContext("wishlistModel").getProperty("ID");
            var username = "CharlesPato";
            var sFilter = `book_ID eq ${bookId}`;
        
            
        
            // Step 1: Retrieve the Wishlist Entry ID
            $.ajax({
                url: `http://localhost:4004/odata/v4/catalog/Wishlist?$filter=${encodeURIComponent(sFilter)}`,
                method: "GET",
                success: function (data) {
                   
        
                    if (data && data.value && data.value.length > 0) {
                        var wishlistId = data.value[0].ID;
                      
        
                      
                        $.ajax({
                            url: `http://localhost:4004/odata/v4/catalog/Wishlist(${wishlistId})`,
                            method: "DELETE",
                            success: function () {
                              
                                MessageToast.show("Book removed from wishlist!");
                            },
                            error: function (xhr) {
                                
                                MessageToast.show("Error: " + xhr.responseText);
                            }
                        });
                    } else {
                        console.warn("Wishlist entry not found for Book ID:", bookId);
                        MessageToast.show("Wishlist entry not found.");
                    }
                },
                error: function (xhr) {
                    console.error("Failed to retrieve wishlist entry. Response:", xhr.responseText);
                    MessageToast.show("Error: " + xhr.responseText);
                }
            });
        }
        
        
        ,

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
