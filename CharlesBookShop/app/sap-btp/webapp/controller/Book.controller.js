sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("sapbtp.controller.Book", {
        // =====================================================
        // Lifecycle Methods
        // =====================================================
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Book").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var bookId = oEvent.getParameter("arguments").bookId;
            console.log("Book ID received:", bookId);

            if (!bookId) {
                console.error("Book ID is missing in URL");
                return;
            }

            this._loadBookDetails(bookId);
        },

        onHomePress: function () {
            this.getOwnerComponent().getRouter().navTo("RouteSAP-BTP");
            location.reload();
        },

        // =====================================================
        // Book Data Loading Methods
        // =====================================================
        _loadBookDetails: function (bookId) {
            var oView = this.getView();
            var sBookUrl = `http://localhost:4004/odata/v4/catalog/getBookByID(bookId=${bookId})`;

            $.ajax({
                url: sBookUrl,
                type: "GET",
                contentType: "application/json",
                success: function (oBookData) {
                    if (oBookData) {
                        oView.byId("imgBookCover").setSrc(oBookData.imageUrl);
                        oView.byId("titleBook").setText(oBookData.title);
                      
                      
                        if (oBookData.author_ID) {
                            this._fetchAuthorName(oBookData.author_ID, function (authorName) {
                                oView.byId("txtBookAuthor").setText("by " + (authorName || "Unknown"));
                            });
                        } else {
                            oView.byId("txtBookAuthor").setText("by Unknown");
                        }

                        this._fetchBookReviews(bookId, function (reviewsText) {
                            oView.byId("reviewList").destroyItems();
                            reviewsText.forEach(review => {
                                oView.byId("reviewList").addItem(new sap.m.StandardListItem({
                                    title: review.reviewer,
                                    description: review.review
                                }));
                            });
                        });
                    }
                }.bind(this),
                error: function () {
                    MessageToast.show("Failed to load book details.");
                }
            });
        },

        

       

        // =====================================================
        // Wishlist Methods
        // =====================================================
        onAddToWishlist: function (oEvent) {
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
                    MessageToast.show("Failed to add book to wishlist.");
                }
            });
        },

        // =====================================================
        // Cart Methods
        // =====================================================
        onBuyNow: function (oEvent) {
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
                    MessageToast.show("Failed to add to Cart.");
                }
            });
        },

        // =====================================================
        // Navigation Methods
        // =====================================================
        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteSAP-BTP");
        }
    });
});
