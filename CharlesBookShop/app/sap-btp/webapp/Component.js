sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sapbtp/model/models"  
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
       
            UIComponent.prototype.init.apply(this, arguments);


            var oDeviceModel = new sap.ui.model.json.JSONModel(Device);
            this.setModel(oDeviceModel, "device");

            
            this.getRouter().initialize();
        }
    });
});
