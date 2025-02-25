sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function(Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("sapbtp.controller.Login", {
        // =====================================================
        // Lifecycle Methods
        // =====================================================
        onInit: function() {
            this._initializeSession();
        },

        _initializeSession: function() {
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

        _persistSession: function() {
            var sessionModel = sap.ui.getCore().getModel("sessionModel");
            if (sessionModel) {
                localStorage.setItem("sessionData", JSON.stringify(sessionModel.getData()));
            }
        },

        // =====================================================
        // Login Handling
        // =====================================================
        onLoginPress: function() {
            var email = this.getView().byId("loginEmail").getValue();
            var password = this.getView().byId("loginPassword").getValue();
            var that = this;

            if (!email || !password) {
                MessageToast.show("Please enter email and password.");
                return;
            }

            $.ajax({
                url: "/odata/v4/catalog/login",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ email: email, password: password }),
                success: function(response) {
                    console.log("Login successful:", response);

                    if (!response || !response.ID) {
                        MessageToast.show("Unexpected response from server.");
                        return;
                    }

                    var sessionModel = sap.ui.getCore().getModel("sessionModel");
                    sessionModel.setProperty("/isLoggedIn", true);
                    sessionModel.setProperty("/LoggedId", 1);
                    sessionModel.setProperty("/user", {
                        ID: response.ID,
                        email: response.email,
                        username: response.username
                    });

                    that._persistSession();
                    MessageToast.show("Login successful!");
                    that.getOwnerComponent().getRouter().navTo("RouteSAP-BTP");
                },
                error: function(xhr) {
                    console.error("Login failed:", xhr.responseText);
                    let errorMessage = "Login failed. Check your credentials.";
                    if (xhr.responseJSON && xhr.responseJSON.error) {
                        errorMessage = xhr.responseJSON.error.message;
                    }
                    MessageToast.show(errorMessage);
                }
            });
        },

        // =====================================================
        // Logout Handling
        // =====================================================
        onLogoutPress: function() {
            var that = this;

            $.ajax({
                url: "/odata/v4/catalog/logout",
                method: "POST",
                success: function(response) {
                    MessageToast.show(response.message);

                    var sessionModel = sap.ui.getCore().getModel("sessionModel");
                    sessionModel.setProperty("/isLoggedIn", false);
                    sessionModel.setProperty("/LoggedId", 0);
                    sessionModel.setProperty("/user", {});

                    localStorage.removeItem("sessionData"); // Clear session on logout
                    that.getOwnerComponent().getRouter().navTo("RouteSAP-BTP");
                },
                error: function() {
                    MessageToast.show("Logout failed.");
                }
            });
        },

        // =====================================================
        // Navigation Methods
        // =====================================================
        onHomePress: function() {
            this.getOwnerComponent().getRouter().navTo("RouteSAP-BTP");
            location.reload();
        }
    });
});
