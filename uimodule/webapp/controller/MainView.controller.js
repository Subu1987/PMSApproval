sap.ui.define([
	"com/infocus/PMSApproval/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], function(Controller, JSONModel, Filter, FilterOperator, MessageToast) {
	"use strict";

	return Controller.extend("com.infocus.PMSApproval.controller.MainView", {
		onInit: function() {
			// set explored app's demo model on this sample
			var oModel = new JSONModel({
				"employees": [{
					Id:1,
					Name:"Amit Bose",
					Designation:"Manager - Systems",
					Gender:0,
				},{
					Id:1,
					Name:"Surajit Banerjee",
					Designation:"Manager",
					Gender:0,
				},],
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
					"Sample achievement 1",
					"Sample achievement 2",
					"Sample achievement 3",
				],
				"Failures":[
					"Failure 1",
					"Failure 2",
					"Failure 3",
				],
			});
			this.getView().setModel(oModel);
		},
		onSearch: function(oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("Name", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

			// update list binding
			var oList = this.byId("idList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters, "Application");
		},

		onSelectionChange: function(oEvent) {
			var oList = oEvent.getSource();
			//var oLabel = this.byId("idFilterLabel");
			//var oInfoToolbar = this.byId("idInfoToolbar");

			// With the 'getSelectedContexts' function you can access the context paths
			// of all list items that have been selected, regardless of any current
			// filter on the aggregation binding.
			var aContexts = oList.getSelectedContexts(true);

			// update UI
			var bSelected = (aContexts && aContexts.length > 0);
			//var sText = (bSelected) ? aContexts.length + " selected" : null;
			//oInfoToolbar.setVisible(bSelected);
			//oLabel.setText(sText);
	
			var sText=oList._oSelectedItem.mProperties.title;
			
			MessageToast.show("Selected Employee: "+sText);
			
			//MessageToast.show(aContexts[0].sPath);
		}
	});
});