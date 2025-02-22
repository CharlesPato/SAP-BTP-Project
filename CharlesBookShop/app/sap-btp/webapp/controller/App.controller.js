sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
  "use strict";

  return Controller.extend("sapbtp.controller.SAP-BTP", {
      onInit: function () {
          // Optional: Initialize any required models
      },

      onWishPress: function (oEvent) {
        console.log("onWishPress function triggered!"); // Debugging log
        MessageToast.show("Wishlist button clicked!"); // Quick feedback
    
        var oButton = oEvent.getSource();
        var oBindingContext = oButton.getBindingContext();
    
        if (!oBindingContext) {
            console.error("No binding context found!");
            MessageToast.show("Error: No binding context.");
            return;
        }
    
        var bookId = oBindingContext.getProperty("ID");
        console.log("Book ID:", bookId);
    
        if (!bookId) {
            MessageToast.show("Error: Unable to retrieve book ID.");
            return;
        }
    
        var userId = "currentUser123"; // Replace with actual user logic
        console.log("Sending AJAX request...");
    
        $.ajax({
            url: "http://localhost:4004/odata/v4/catalog/Wishlist",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                user: userId,
                book_ID: bookId
            }),
            success: function () {
                console.log("AJAX Success: Book added to wishlist!");
                MessageToast.show("Book added to wishlist!");
            },
            error: function (xhr) {
                console.error("AJAX Error:", xhr.responseText);
                MessageToast.show("Failed to add to wishlist: " + xhr.responseText);
            }
        });
    }
    
  });
});

