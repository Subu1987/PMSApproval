sap.ui.define([
	"com/infocus/PMSApproval/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/List',
	'sap/m/StandardListItem',
], function(Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, Fragment, Button, Dialog, List, StandardListItem) {
	"use strict";

	return Controller.extend("com.infocus.PMSApproval.controller.MainView", {
		onInit: function() {
			var _self = this;
			_self.dataSet = {};

			console.log("Inside main view....");

			var _model = _self.getView().getModel();
			var factorSetURI = "/FactorSet";
			var gradeSetURI = "/GradeSet";
			var marksSetURI = "/MarksSet";
			var employmentSetURL = "/empdetailsSet";

			/*_self.dataSet.SelfAppraisal = {
				"Empid": "40000051",
				"Saveflag": "Y",
				"Period": "01",
				"MajorTask1": "1111111111111111111111111ABAP DEVELOPMENT 1 3",
				"MajorTask2": " Hello MM FUNCTIONAL 2",
				"MajorTask3": " ABAP DEVELOPMENT3",
				"AppraiserId": "00000000",
				"ApprComm1": "",
				"ApprComm2": "",
				"ApprComm3": "",
				"ConstrainFaced": "12345       TEST CONSTRA",
				"Failure1": "This is test 1",
				"Failure2": "2 Test FailureÄ«",
				"Failure3": "TEST FAILURE 3",
				"TrainingDevNeed": "FUNCTIONAL TRAINING NEEDED"
			};*/

			/*_self.dataSet.employees = [{
				"Name": "Mrs Bidula Banerjee Ghatak",
				"Designation": "Manager - Systems"
			}, {
				"Name": "Mr Partha Bhattacharya",
				"Designation": "Manager - Systems"
			}];*/

			/*_self.dataSet.recommendation = [{
				"type": "Job Rotation"
			}, {
				"type": "Promotion"
			}, {
				"type": "Increment"
			}];*/

			/*_self.dataSet.EmpData = {
				"Gender": "2",
				"ExFlag": "N",
				"ExFormType": "P",
				"ExHodName": "Mr Partha Bhattacharya",
				"Pernr": "40000051",
				"AssignmentText": "",
				"ExHolName": "Mr Ashutosh Dixit",
				"ExConfFlag": false,
				"ExEmpSubgroup": "11",
				"ExDob": "2014-12-07T00:00:00",
				"ExDoj": "2014-12-07T00:00:00",
				"ExServiceDeptYear": "14.0000",
				"ExServiceDeptMonth": "8.0000",
				"ExServiceDeptDay": "1",
				"ExServiceCompYear": "14.0000",
				"ExServiceCompMonth": "8.0000",
				"ExServiceCompDay": "1",
				"ExQualification": "B. Sc (Hons), GNIIT, Oracle, DBM",
				"ExPromYear": "2020",
				"ExPromPeriodYear": "1.0000",
				"ExPromPeriodMonth": "3.0000",
				"ExPromPeriodDay": "1",
				"ExPeriod": "00",
				"ExName": "Mrs Bidula Banerjee Ghatak",
				"ExLocation": "Kolkata",
				"ExHol": "40000121",
				"ExHod": "40000144",
				"ExDivision": "GIL,Kolkata",
				"ExDesignation": "Manager - Systems",
				"ExDepartment": "Systems",
				"ExCurrBasic": "31635.000",
				"ExAgeYear": "47.0000",
				"ExAgeMonth": "10.0000",
				"ExAgeDay": "13",
				"ToItems": {
					"results": [{
						"Pernr": "40000051",
						"Position": "Dyputy Manager - Systems",
						"PeriodYear": "8.0000",
						"PeriodMonth": "8.0000",
						"PeriodDay": "0",
						"Location": "Delhi"
					}, {
						"Pernr": "40000051",
						"Position": "Dyputy Manager - Systems",
						"PeriodYear": "4.0000",
						"PeriodMonth": "9.0000",
						"PeriodDay": "0",
						"Location": "Delhi"
					}]
				}
			};*/

			_self.getView().getModel().read(employmentSetURL, {
				urlParameters: {
					"$expand": "ToDetails"
				},
				success: function(response) {
					//console.log("Emp Details Service Response...");
					//console.log(response);
					var dataSetModel = _self.getView().getModel("dataSet");
					dataSetModel.setProperty("/employees", response.results);
					
					//console.log(_self.byId('idList'));
					
					//application-zpms_approval-approve-component---app
					var oList = _self.byId('idList');
					//console.log(oList);
					oList.setSelectedItem(oList.getItems()[0], true);
					_self.publishToDetailView(response.results[0]);
				},
				error: function(error) {
					console.log('Error in fetching employeeset...');
					console.log(error);
				}

			});

			_self.getView().setModel(new JSONModel(_self.dataSet), "dataSet");
			console.log(_self.dataSet);

			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("MarksView", "showFactors", {
				message: 'MODEL INITIALIZED....'
			});
		},
		publishToDetailView: function(data) {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("DetailView", "ShowDetailView", data);
		},
		onSearch: function(oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("EmpName", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

			// update list binding
			var oList = this.byId("idList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters, "Application");
		},
		onSelectionChange: function(oEvent) {
			// var oList = oEvent.getSource();
			// //var oLabel = this.byId("idFilterLabel");
			// //var oInfoToolbar = this.byId("idInfoToolbar");

			// // With the 'getSelectedContexts' function you can access the context paths
			// // of all list items that have been selected, regardless of any current
			// // filter on the aggregation binding.
			// var aContexts = oList.getSelectedContexts(true);

			// // update UI
			// var bSelected = (aContexts && aContexts.length > 0);
			// //var sText = (bSelected) ? aContexts.length + " selected" : null;
			// //oInfoToolbar.setVisible(bSelected);
			// //oLabel.setText(sText);

			// var sText = oList._oSelectedItem.mProperties.title;

			var oSelectedItem = oEvent.getParameter("listItem");
			var selectedEmpData = oSelectedItem.getBindingContext("dataSet").getObject();
			
			this.publishToDetailView(selectedEmpData);

			/*var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("DetailView", "ShowDetailView", selectedEmpData);*/

			//MessageToast.show(aContexts[0].sPath);
		},
		onExit: function() {
			console.log("Exit called: MainView");
		}
	});
});