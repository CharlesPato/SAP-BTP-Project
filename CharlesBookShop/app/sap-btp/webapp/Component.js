sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sapbtp/model/models"  // Assuming this is where your models are defined
], function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("sapbtp.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init: function () {
            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Set the device model
            var oDeviceModel = new sap.ui.model.json.JSONModel(Device);
            this.setModel(oDeviceModel, "device");

            // Set other models (if any)
            // Assuming you have custom models, you can define them here

            // Enable routing
            this.getRouter().initialize();
        }
    });
});
