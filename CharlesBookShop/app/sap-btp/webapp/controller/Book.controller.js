sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("sapbtp.controller.Book", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Book").attachPatternMatched(this._onObjectMatched, this);
        },
        
        _onObjectMatched: function (oEvent) {
            var bookId = oEvent.getParameter("arguments").bookId;
            console.log("Book ID received in BookDetails:", bookId);
        
            if (!bookId) {
                console.error("Book ID is missing in URL");
                return;
            }

            this._loadBookDetails(bookId);
        },        

        _loadBookDetails: function (bookId) {
            var oView = this.getView();
            var sUrl = "http://localhost:4004/odata/v4/catalog/Book(" + bookId + ")";

            $.ajax({
                url: sUrl,
                type: "GET",
                contentType: "application/json",
                success: function (oData) {
                    if (oData) {
                        oView.byId("bookImage").setSrc(oData.imageUrl);
                        oView.byId("bookTitle").setText(oData.title);
                        oView.byId("bookAuthor").setText("by " + (oData.authorName || "Unknown"));
                        oView.byId("bookRating").setValue(oData.avgRating / 2);

                        // Format reviews
                        if (oData.reviews && oData.reviews.length > 0) {
                            var formattedReviews = oData.reviews.map(review => 
                                `Rating: ${review.rating}/5\n${review.review}`
                            ).join("\n\n");
                            oView.byId("bookReviews").setText(formattedReviews);
                        } else {
                            oView.byId("bookReviews").setText("No reviews yet.");
                        }
                    }
                },
                error: function () {
                    MessageToast.show("Failed to load book details.");
                }
            });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteSAP-BTP");
        }
    });
});
