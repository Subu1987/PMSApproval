sap.ui.define(
    [
        "com/infocus/PMSApproval/controller/BaseController",
        "sap/ui/core/Fragment",
		"sap/ui/model/json/JSONModel"
    ], function (Controller,Fragment,JSONModel) {
    "use strict";

    return Controller.extend("com.infocus.PMSApproval.controller.CriticalAppraisal", {
        onInit: function (oEvent) {
        	console.log("init called...")

			// set explored app's demo model on this sample
			var oModel = new JSONModel({
                "CreticalAttributes":[
                    {
                        "SlNo":1,
                        "Factor":"Integrity & Trust",
                        "CriticalAttr":"Action and thoughts which decipt loyality and honesty towards the organisation",
                        "M1":20,
                        "M2":40,
                        "M3":60
                    },
                    {
                        "SlNo":2,
                        "Factor":"Peer Relationships",
                        "CriticalAttr":"Ability to develop and maintain healthy professional relationship with peers",
                        "M1":10,
                        "M2":40,
                        "M3":60
                    },
                    {
                        "SlNo":3,
                        "Factor":"Mentoring / Coaching",
                        "CriticalAttr":"Shares wishdom knowledge and professinoal expertise with subordinates",
                        "M1":20,
                        "M2":45,
                        "M3":41
                    }
                ],
				"Acheivements":[
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
				],
				"Employee":{
                    "img":"https://sapui5.hana.ondemand.com/test-resources/sap/m/images/Woman_04.png"
                }
            });
            this.getView().setModel(oModel);

            console.log(oModel);

			//this.getView().bindElement("/CreticalAttributes");

			this._formFragments = {};

			// Set the initial form to be the display one
			this._showFormFragment("Comment");
		},

		handleEditPress : function () {

			//Clone the data
			//this._oSupplier = Object.assign({}, this.getView().getModel().getData().SupplierCollection[0]);
			this._toggleButtonsAndView(true);

		},

		handleCancelPress : function () {

			//Restore the data
			// var oModel = this.getView().getModel();
			// var oData = oModel.getData();

			// //oData.SupplierCollection[0] = this._oSupplier;

			// oModel.setData(oData);
			// this._toggleButtonsAndView(false);

		},

		handleSavePress : function () {


		},

		handleNextPress: function(){
			var oView = this.getView();
			// Set the right form type
			this._showFormFragment("Marks");

			oView.byId("btnNext").setVisible(false);
			oView.byId("btnPrev").setVisible(true);
		},

		handlePrevPress: function(){
			var oView = this.getView();
			// Set the right form type
			this._showFormFragment("Comment");

			oView.byId("btnNext").setVisible(true);
			oView.byId("btnPrev").setVisible(false);
		},

		_getFormFragment: function (sFragmentName) {
			var pFormFragment = this._formFragments[sFragmentName],
				oView = this.getView();
            
            

			if (!pFormFragment) {
				pFormFragment = Fragment.load({
					id: oView.getId(),
					name: "com.infocus.PMSApproval.view.CriticalAppraisal" + sFragmentName
				});
				this._formFragments[sFragmentName] = pFormFragment;
			}

			return pFormFragment;
		},

		_showFormFragment : function (sFragmentName) {
			var oPage = this.byId("page");

			oPage.removeAllContent();
			this._getFormFragment(sFragmentName).then(function(oVBox){
				oPage.insertContent(oVBox);
			});
		}
    });
});