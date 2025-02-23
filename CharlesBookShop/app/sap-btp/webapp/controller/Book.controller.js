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
            console.log("📖 Book ID received:", bookId);

            if (!bookId) {
                console.error("⚠️ Book ID is missing in URL");
                return;
            }

            this._loadBookDetails(bookId);
        },

        _loadBookDetails: function (bookId) {
            var oView = this.getView();
            var sBookUrl = `http://localhost:4004/odata/v4/catalog/getBookByID(bookId=${bookId})`;

            $.ajax({
                url: sBookUrl,
                type: "GET",
                contentType: "application/json",
                success: function (oBookData) {
                    if (oBookData) {
                        console.log("📚 Book Data:", oBookData);

                        // Update book details
                        oView.byId("imgBookCover").setSrc(oBookData.imageUrl);
                        oView.byId("titleBook").setText(oBookData.title);
                        oView.byId("ratingBook").setValue(oBookData.avgRating / 2);
                        oView.byId("txtRatingValue").setText(`(${oBookData.avgRating})`);

                        // Fetch and update author name
                        if (oBookData.author_ID) {
                            this._fetchAuthorName(oBookData.author_ID);
                        } else {
                            oView.byId("txtBookAuthor").setText("by Unknown");
                        }

                        // Fetch and update book reviews
                        this._fetchBookReviews(bookId);
                    }
                }.bind(this),
                error: function (xhr) {
                    console.error("❌ Failed to fetch book details:", xhr);
                    MessageToast.show("Failed to load book details.");
                }
            });
        },

        _fetchAuthorName: function (authorId) {
            var oView = this.getView();
            var sAuthorUrl = "http://localhost:4004/odata/v4/catalog/Authors";

            $.ajax({
                url: sAuthorUrl,
                type: "GET",
                contentType: "application/json",
                success: function (oData) {
                    console.log("👤 Authors Data:", oData);
                    var author = oData.value.find(author => author.ID === authorId);
                    var authorName = author ? author.name : "Unknown";
                    oView.byId("txtBookAuthor").setText("by " + authorName);
                },
                error: function (xhr) {
                    console.error("❌ Failed to fetch author name:", xhr);
                    oView.byId("txtBookAuthor").setText("by Unknown");
                }
            });
        },

        _fetchBookReviews: function (bookId) {
            var oView = this.getView();
            var sReviewsUrl = `http://localhost:4004/odata/v4/catalog/Ratings?$filter=book_ID eq ${bookId}`;

            $.ajax({
                url: sReviewsUrl,
                type: "GET",
                contentType: "application/json",
                success: function (oData) {
                    console.log("📝 Reviews Data:", oData);
                    var reviews = oData.value;
                    if (reviews.length > 0) {
                        var formattedReviews = reviews.map(review => 
                            `⭐ Rating: ${review.rating}/10\n${review.review}`
                        ).join("\n\n");
                        oView.byId("txtBookReviews").setText(formattedReviews);
                    } else {
                        oView.byId("txtBookReviews").setText("No reviews yet.");
                    }
                },
                error: function (xhr) {
                    console.error("❌ Failed to fetch book reviews:", xhr);
                    oView.byId("txtBookReviews").setText("No reviews yet.");
                }
            });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteSAP-BTP");
        }
    });
});
