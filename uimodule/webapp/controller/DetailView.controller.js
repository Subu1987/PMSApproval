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
	'sap/m/Label',
	'sap/m/Text',
	'sap/m/TextArea',
	'sap/ui/layout/HorizontalLayout',
	'sap/ui/layout/VerticalLayout'
], function(Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox,
	Fragment, Button, Dialog, List, StandardListItem, Label, Text, TextArea, HorizontalLayout, VerticalLayout) {
	"use strict";
	return Controller.extend("com.infocus.PMSApproval.controller.DetailView", {
		onInit: function() {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.subscribe("DetailView", "ShowDetailView", this.onShowDetailView, this);

			//Show the floating footer...
			var oObjectPage = this.getView().byId("ObjectPageLayout");
			oObjectPage.setShowFooter(true);

			console.log("Inside detail view....");
		},
		onShowDetailView: function(source, event, data) {
			//Binding data dynamically from the controller.....
			//--------------------------------------------------------------------------------
			/*var form = this.getView().byId('container-PMSApproval---app--DetailView--comments--commentsForm');
			console.log(form);
			form.bindElement({
				path: "dataSet>/SelfAppraisal",
				events: {
					change: function() {
						//triggers on error too I think
						form.setBusy(false);
					},
					dataRequested: function() {
						form.setBusy(true);
					},
					dataReceived: function(oEv) {
						console.log('data received...');
					}
				}
			});*/
			//--------------------------------------------------------------------------------

			var _self = this;
			var dataModel = _self.getView().getModel("dataSet");
			dataModel.setProperty("/SelfAppraisal", data.ToDetails.results[0]);
			data.CurrAssgnLvl=2;
			dataModel.setProperty("/AppraiserLevel", data.CurrAssgnLvl);
			_self.publishApproverLevelToMarksView({
				approverLevel: data.CurrAssgnLvl
			});

			var empDetailsURI = "/ConcurrentEmploymentSet('" + data.Pernr + "')";
			sap.ui.core.BusyIndicator.show();
			_self.getView().getModel().read(empDetailsURI, {
				urlParameters: {
					"$expand": "ToItems"
				},
				success: function(response) {
					sap.ui.core.BusyIndicator.hide();
					console.log("Emp full Details Service Response...");
					console.log(response);
					var dataSetModel = _self.getView().getModel("dataSet");
					dataSetModel.setProperty("/EmpData", response);
					_self.formatAllEmpData(response);
				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log('Error in fetching employeeset...');
					console.log(error);
				}

			});
		},
		formatAllEmpData: function(emp) {
			var _self = this;
			_self.empDetails = emp;
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
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd-MM-yyyy"
			});
			_self.empDetails.ExDOBText = oDateFormat.format(_self.empDetails.ExDob);
			_self.empDetails.ExDOJText = oDateFormat.format(_self.empDetails.ExDoj);

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
		},
		onDesignationPress: function() {
			var that = this;
			if (!that.resizableDialog) {
				var oTable = new sap.m.Table("tab-pos", {
					inset: true,
					mode: sap.m.ListMode.None,
					includeItemInSelection: false,
				});
				var col1 = new sap.m.Column("col1-pos", {
					header: new sap.m.Label({
						text: "Position"
					})
				});
				var col2 = new sap.m.Column("col2-pos", {
					header: new sap.m.Label({
						text: "Period"
					})
				});
				var col3 = new sap.m.Column("col3-pos", {
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
		},
		onEditToggleButtonPress: function() {
			var oObjectPage = this.getView().byId("ObjectPageLayout"),
				bCurrentShowFooterState = oObjectPage.getShowFooter();

			oObjectPage.setShowFooter(!bCurrentShowFooterState);
		},
		publishApproverLevelToMarksView: function(data) {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("DetailsView", "updateApproverLevel", data);
		},
		handleSaveAppraisalPress: function() {
			//Calling the save data function.
			//this._oPopover.close();
			this.saveApprovalData('Y');
		},
		handleCancelAppraisalPress: function() {
			this._oPopover.close();
		},
		handleSaveAsDraft: function() {
			this.saveApprovalData('D');
		},
		saveApprovalData: function(saveFlag) {
			var isValid = this.validateAll();
			if (!isValid) {
				MessageBox.alert('Some fields contains invalid values. Please fill all of them correctly.');
			} else {
				MessageBox.success('The appraisal saved correctly.');
			}
		},
		validateAll: function() {
			var _dataModel= this.getView().getModel("dataSet");
			var factors =_dataModel.getProperty("/factors");
			var appraiserLevel=_dataModel.getProperty("/AppraiserLevel");
			for(let item of factors){
				var val=appraiserLevel==1?item.M1:appraiserLevel==2?item.M2:item.M3;
				if(val < 0 || val > 5){
					return false;
				}
				console.log(val);
			}
			console.log(appraiserLevel);
			return true;
		},
		onAgreeSelectionChanged: function(oEvent) {
			this.IAgreeCheckboxSelected = oEvent.getParameters().selected;
			this.byId("agree").setEnabled(this.IAgreeCheckboxSelected);
		},
		handleIAgreePopoverPress: function(oEvent) {
			//console.log(oEvent);
			var oButton = oEvent.getSource(),
				oView = this.getView();

			// create popover
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment(oView.getId(), "com.infocus.PMSApproval.view.AgreePopover", this)
				oView.addDependent(this._oPopover);
			}

			this._oPopover.openBy(oButton);
		},
		onSubmitDialogPress: function() {
			var _self = this;
			if (!this.oSubmitDialog) {
				this.oSubmitDialog = new Dialog({
					type: sap.m.DialogType.Message,
					title: "Confirm",
					content: [
						/*new Label({
							text: "Do you want to submit this order?",
							labelFor: "submissionNote"
						}),*/
						new sap.m.CheckBox("checkbox1", {
							width: "100%",
							text: "I agree to save the self appraisal for the approval",
							select: function(oEvent) {
								this.oSubmitDialog.getBeginButton().setEnabled(oEvent.getParameters().selected);
							}.bind(this)
						})
					],
					beginButton: new Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Submit",
						enabled: false,
						press: function() {

							_self.handleSaveAppraisalPress();
							this.oSubmitDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function() {
							this.oSubmitDialog.close();
						}.bind(this)
					})
				});
			}

			this.oSubmitDialog.open();
		},
		onExit: function() {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("DetailView", "ShowDetailView", this.onShowDetailView, this);

			//Clean up the popovers...
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		}
	});
});