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

			var _model = _self.getView().getModel();
			var factorSetURI = "/FactorSet";
			var gradeSetURI = "/GradeSet";
			var marksSetURI = "/MarksSet";

			/*var empId="40000051";
				var employmentSetURL = "/ConcurrentEmploymentSet";
			_self.getView().getModel("self").read(employmentSetURL, {
				urlParameters: {
					"$expand": "ToItems"
				},
				success: function(response) {
					console.log(response);
					_self.formatAllEmpData(response.results[0]);
				},error:function(error){
					console.log('Error in fetching employeeset...');
					console.log(error);
				}
				
			});*/
			
			sap.ui.core.BusyIndicator.show();
			_model.read(factorSetURI, {
				success: function(response) {
					_self.dataSet = {};
					_self.dataSet.factors = response.results;

					var slNo = 1;
					for (let item in _self.dataSet.factors) {
						_self.dataSet.factors[item].SlNo = slNo;
						slNo += 1;
					}

					_model.read(gradeSetURI, {
						success: function(response) {
							//On seccess collect the grade set.
							_self.dataSet.gradeSet = response.results;

							_model.read(marksSetURI, {
								success: function(response) {
									sap.ui.core.BusyIndicator.hide();
									_self.dataSet.marksSet=response.results;
									
									
								},
								error: function(error) {
									sap.ui.core.BusyIndicator.hide();
									console.log('Error on /employees GET');
									console.log(error);
								}
							});

						},
						error: function(error) {
							sap.ui.core.BusyIndicator.hide();
							console.log('Error on /employees GET');
							console.log(error);
						}
					});

					_self.getView().setModel(new JSONModel(_self.dataSet), "dataSet");
					console.log(_self.dataSet);
				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log('Error on /employees GET');
					console.log(error);
				}
			});

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

			var sText = oList._oSelectedItem.mProperties.title;

			MessageToast.show("Selected Employee: " + sText);

			//MessageToast.show(aContexts[0].sPath);
		},
		onDesignationPress: function() {

			var that = this;
			if (!that.resizableDialog) {
				var oTable = new sap.m.Table("tab-1", {
					inset: true,
					mode: sap.m.ListMode.None,
					includeItemInSelection: false,
				});
				var col1 = new sap.m.Column("col1", {
					header: new sap.m.Label({
						text: "Position"
					})
				});
				var col2 = new sap.m.Column("col2", {
					header: new sap.m.Label({
						text: "Period"
					})
				});
				var col3 = new sap.m.Column("col3", {
					header: new sap.m.Label({
						text: "Location"
					})
				});

				oTable.bindItems("positions>/results", new sap.m.ColumnListItem({
					cells: [new sap.m.Text({
						text: "{positions>Position}"
					}), new sap.m.Text({
						text: "{positions>Period}"
					}), new sap.m.Text({
						text: "{positions>Location}",
					}), ]
				}));

				oTable.addColumn(col1);
				oTable.addColumn(col2);
				oTable.addColumn(col3);

				that.resizableDialog = new Dialog({
					title: 'Details of last three position (Excluding Present)',
					contentWidth: "650px",
					contentHeight: "200px",
					resizable: true,
					content: oTable,
					beginButton: new Button({
						text: 'Close',
						press: function() {
							that.resizableDialog.close();
						}
					})
				});

				//to get access to the global model
				this.getView().addDependent(that.resizableDialog);
			}

			that.resizableDialog.open();

			//this._getDialog().open();
		},
		formatAllEmpData: function(emp) {
			var _self = this;
			this.empDetails = emp;
			//console.log(emp);
			//console.log(this.empDetails);
			for (let item in _self.empDetails.ToItems.results) {
				var pDay = parseInt(_self.empDetails.ToItems.results[item].PeriodDay);
				pDay = pDay > 0 ? (pDay + " Day" + (pDay > 1 ? "s" : "")) : "";
				var pMonth = parseFloat(_self.empDetails.ToItems.results[item].PeriodMonth, 0);
				pMonth = pMonth > 0 ? (pMonth + " Month" + (pMonth > 1 ? "s" : "")) : "";
				var pYear = parseFloat(_self.empDetails.ToItems.results[item].PeriodYear, 0);
				pYear = pYear > 0 ? (pYear + " Year" + (pYear > 1 ? "s" : "")) : "";

				_self.empDetails.ToItems.results[item].Period = pYear + " " + pMonth + " " + pDay;
			}

			_self.getView().setModel(new JSONModel(_self.empDetails.ToItems), "positions");

			//DOB as Text
			/*var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd-MM-yyyy"
			});*/
			/*_self.empDetails.ExDOBText = oDateFormat.format(_self.empDetails.ExDob);
			_self.empDetails.ExDOJText = oDateFormat.format(_self.empDetails.ExDoj);*/

			//Period of Promotion
			var proDay = parseInt(_self.empDetails.ExPromPeriodDay);
			proDay = proDay > 0 ? (proDay + " Day" + (proDay > 1 ? "s" : "")) : "";
			var proMonth = parseFloat(_self.empDetails.ExPromPeriodMonth, 0);
			proMonth = proMonth > 0 ? (proMonth + " Month" + (proMonth > 1 ? "s" : "")) : "";
			var proYear = parseFloat(_self.empDetails.ExPromPeriodYear, 0);
			proYear = proYear > 0 ? (proYear + " Year" + (proYear > 1 ? "s" : "")) : "";
			_self.empDetails.PeriodOfLastPromotion = proYear + " " + proMonth + " " + proDay;

			//Service In Department
			var srvDay = parseInt(_self.empDetails.ExServiceCompDay, 0)
			srvDay = srvDay > 0 ? (srvDay + " Day" + (srvDay > 1 ? "s" : "")) : "";
			var srvMonth = parseFloat(_self.empDetails.ExServiceCompMonth, 0);
			srvMonth = srvMonth > 0 ? (srvMonth + " Month" + (srvMonth > 1 ? "s" : "")) : "";
			var srvYear = parseFloat(_self.empDetails.ExServiceCompYear, 0);
			srvYear = srvYear > 0 ? (srvYear + " Year" + (srvYear > 1 ? "s" : "")) : "";
			_self.empDetails.ServiceInDepartment = srvYear + " " + srvMonth + " " + srvDay;

			var basicPay = parseFloat(_self.empDetails.ExCurrBasic).toFixed(2);
			_self.empDetails.ExCurrBasic = basicPay;

			//Basic Pay format
			/*var oFormat = NumberFormat.getCurrencyInstance({
				"currencyCode": false,
				"customCurrencies": {
					"RS": {
						"symbol": "\u0243",
						"decimals": 2
					}
				}
			});

			_self.empDetails.ExCurrBasic=oFormat.format(_self.empDetails.ExCurrBasic, "RS"); // "Ƀ 123.457"*/

			_self.getView().setModel(new JSONModel(_self.empDetails), "emp");
		}
	});
});