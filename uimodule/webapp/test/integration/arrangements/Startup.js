sap.ui.define(["sap/ui/test/Opa5"], function (Opa5) {
    "use strict";

    return Opa5.extend("com.infocus.PMSApproval.test.integration.arrangements.Startup", {
        iStartMyApp: function () {
            this.iStartMyUIComponent({
                componentConfig: {
                    name: "com.infocus.PMSApproval",
                    async: true,
                    manifest: true
                }
            });
        }
    });
});
