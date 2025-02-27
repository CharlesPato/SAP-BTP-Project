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
                        let avgRating = oBookData.avgRating || 0; 
                        let convertedRating = avgRating / 2;
        
                       
                        oView.setModel(new sap.ui.model.json.JSONModel(oBookData), "bookData");
        
                        oView.byId("imgBookCover").setSrc(oBookData.imageUrl);  
                        oView.byId("titleBook").setText(oBookData.title);       
                        oView.byId("txtAuthor").setText(oBookData.authorName);   
                        oView.byId("txtAvailable").setText("NOW AVAILABLE");     
        
                       
                        oView.byId("ratingIndicator").setValue(convertedRating);
                        oView.byId("txtAvgRating").setText(`(${avgRating}/10)`); 
        
                        if (oBookData.reviews && oBookData.reviews.length > 0) {
                           
                            var oReviewModel = new sap.ui.model.json.JSONModel(oBookData.reviews);
                            oView.setModel(oReviewModel, "reviews");
        
                          
                            oView.byId("vboxReviews").setVisible(true);
                        } else {
                            
                            oView.byId("vboxReviews").setVisible(false);
                        }
                    }
                }.bind(this),
                error: function () {
                 
                    sap.m.MessageToast.show("Failed to load book details.");
                }
            });
        }, onAddReview: function () {
       
            var oDialog = this.byId("ratingDialog");
            if (!oDialog) {
                oDialog = sap.ui.xmlfragment(this.getView().getId(), "sapbtp.view.fragments.RatingDialog", this);
                this.getView().addDependent(oDialog);
            }
            oDialog.open();
        },

        onSubmitRating: function () {
            var oView = this.getView();
            var rating = this.byId("newRatingIndicator").getValue();
            var review = this.byId("reviewTextArea").getValue();
            var bookId = oView.getModel("bookData").getProperty("/ID");

            if (!review || !rating) {
                MessageToast.show("Please provide a rating and review.");
                return;
            }

           
            $.ajax({
                url: `http://localhost:4004/odata/v4/catalog/Ratings`,
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    rating: rating*2,
                    review: review,
                    book_ID: bookId
                }),
                success: function () {
                    MessageToast.show("Thank you for your review!");
                    oView.byId("ratingDialog").close();
                    this._loadBookDetails(bookId); 
                    location.reload();
                }.bind(this),
                error: function () {
                    location.reload();
                    MessageToast.show("Thank you for your review!");
                }
            });
            
        }
        ,

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
