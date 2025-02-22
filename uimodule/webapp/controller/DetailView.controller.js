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
			var _self = this;

			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.subscribe("DetailView", "ShowDetailView", this.onShowDetailView, this);

			//Show the floating footer...
			var oObjectPage = this.byId("ObjectPageLayout");
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
			console.log(data);
			var _self = this;
			var dataModel = _self.getView().getModel("dataSet");
			dataModel.setProperty("/SelfAppraisal", data.ToDetails.results[0]);

			var dataModel = _self.getView().getModel("dataSet");
			console.log(dataModel);
			
			console.log(data.Pernr);
			
			var dropSet1 = [{
				"No_1": 0,
				"No1": 0
			}, {
				"No_1": 1,
				"No1": 1
			}, {
				"No_1": 2,
				"No1": 2
			}];

			var dropSet2 = [{
				"No_2": 0,
				"No2": 0
			}, {
				"No_2": 1,
				"No2": 1
			}, {
				"No_2": 2,
				"No2": 2
			}];

			dataModel.setProperty("/dropSet1", dropSet1);
			dataModel.setProperty("/dropSet2", dropSet2);

			var currAppraiserURI = "/currappraiserSet('" + data.Pernr + "')";
			sap.ui.core.BusyIndicator.show();
			console.log('Calling curr appriserset service....')
			_self.getView().getModel().read(currAppraiserURI, {
				success: function(response) {
					sap.ui.core.BusyIndicator.hide();
					console.log(response);
					
					data.CurrAssgnLvl = response.AppraiserLevel;
					dataModel.setProperty("/AppraiserLevel", data.CurrAssgnLvl);
					dataModel.setProperty("/AppraiserID", data.CurrAssgnTo);
					dataModel.setProperty("/EmpID", data.Pernr);

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

							dataModel.setProperty("/FormType", response.ExFormType);
							console.log('Form Type: ' + response.ExFormType);
							_self.formatAllEmpData(response);

							_self.fetchAllCommentsAndRecommendation();

							_self.publishApproverLevelToMarksView({
								approverLevel: data.CurrAssgnLvl
							});
						},
						error: function(error) {
							sap.ui.core.BusyIndicator.hide();
							console.log('Error in fetching employeeset...');
							console.log(error);
						}

					});
				},
				error: function(err) {
					console.log('Error in fetching appriser details...');
					console.log(err)
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
					includeItemInSelection: false
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
			var oObjectPage = this.byId("ObjectPageLayout"),
				bCurrentShowFooterState = oObjectPage.getShowFooter();

			oObjectPage.setShowFooter(!bCurrentShowFooterState);
		},
		publishApproverLevelToMarksView: function(data) {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("DetailsView", "updateApproverLevel", data);

			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("MarksView", "showFactors", {
				message: 'MODEL INITIALIZED....'
			});
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
			var _self = this;
			var isValid = _self.validateAll();
			//var isValid = true;
			var rootModel = _self.getView().getModel();
			var dataModel = _self.getView().getModel("dataSet");
			if (!isValid) {
				MessageBox.alert('Some fields contains invalid values. Please fill all of them correctly.');
			} else {
				var dataModel = _self.getView().getModel("dataSet")
					//------------------------ Save all Marks --------------------
				var AppraiserLevel = dataModel.getProperty("/AppraiserLevel");
				var AppraiserID = dataModel.getProperty("/AppraiserID");
				var factors = dataModel.getProperty("/factors");
				var empID = dataModel.getProperty('/EmpID');

				//----Collecting comments for update to server------------
				var comments = dataModel.getProperty('/comments');
				/*var recommendations = [{
						Appraiser: "1st Appraiser",
						ApprCommIncr: comments.ApprCommIncr,
						ApprCommProm: comments.ApprCommProm,
						ApprCommJob: comments.ApprCommJob
					}];*/
				var currRecomm = dataModel.getProperty('/recommendations/' + (parseInt(AppraiserLevel) - 1));
				comments.ApprCommIncr = currRecomm.ApprCommIncr;
				comments.ApprCommProm = currRecomm.ApprCommProm;
				comments.ApprCommJob = currRecomm.ApprCommJob;

				var marksList = [];
				console.log('Saving from factors data: ');
				console.log(factors);
				for (let i in factors) {
					var marks = AppraiserLevel == "1" ? factors[i].M1 : AppraiserLevel == "2" ? factors[i].M2 : factors[i].M3;
					marksList.push({
						FactorId: factors[i].FactorId,
						Marks: marks,
						Pernr: empID
					});
					
					console.log(marks);
					console.log(marksList);
					
/*					if(marks){
						marksList.Editable= false;
					}
					dataModel.setProperty('/marksList',marksList);*/
				}

				var marksData = {
					Pernr: empID,
					ApprId: AppraiserID,
					ApprLevel: AppraiserLevel + '',
					Toempmarks: {
						results: marksList
					},
					Tocomments: {
						results: [comments]
					}
				}
				console.log('Saving details: ');
				console.log(marksData);
				

				var saveMarksURI = "/empSet";
				var saveCommentsURI = "";
				sap.ui.core.BusyIndicator.show();
				rootModel.create(saveMarksURI, marksData, {
					success: function(response) {
						sap.ui.core.BusyIndicator.hide();
						console.log(response);
						console.log(response.ApprId);
						MessageBox.success('The appraisal saved correctly.');
						
					},
					error: function(error) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.alert('Save appraisal data failed.');
						console.log('Error in fetching employeeset...');
						console.log(error);
					}
				});

				//------------------------------------------------------------

			}
		},
		validateAll: function() {
			var _dataModel = this.getView().getModel("dataSet");
			var factors = _dataModel.getProperty("/factors");
			var appraiserLevel = _dataModel.getProperty("/AppraiserLevel");
			for (let item of factors) {
				console.log(item);
				var val = appraiserLevel == 1 ? item.M1 : appraiserLevel == 2 ? item.M2 : item.M3;
				console.log(val);
				if (val < 0 || val >20) {
					return false;
				}
			}

			var i = 1;
			var isFormValid = true;
			while (i <= 3) {
				var selfAppraisal = _dataModel.getProperty("/comments/ApprCommMta" + i);
				console.log('Comment data: '+selfAppraisal);
				var fragId = this.getView().createId("comments");;
				console.log('Fragment id:' + fragId);
				var commControl = sap.ui.core.Fragment.byId(fragId, 'comment' + i);
				commControl.setValueState(sap.ui.core.ValueState.Error);

				if (!selfAppraisal || (selfAppraisal && selfAppraisal.trim().length == 0)) {
					commControl.setValueState(sap.ui.core.ValueState.Error);
					isFormValid = false;
				} else {
					commControl.setValueState(sap.ui.core.ValueState.Success);
				}
				console.log(commControl);
				i += 1;
			}

			return isFormValid;
		},
		handleLiveChange: function(oEvent) {
			var _oInput = oEvent.getSource();
			var val = _oInput.getValue();
			//val = val.replace(/[^\d]/g, '');
			//_oInput.setValue(val);
			var isValid = val.length > 0;
			if (!isValid) {
				_oInput.setValueState(sap.ui.core.ValueState.Error);
			} else {
				_oInput.setValueState(sap.ui.core.ValueState.Success);
			}
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
		fetchAllCommentsAndRecommendation: function() {
			var _self = this;
			var _model = _self.getView().getModel();
			var dataModel = _self.getView().getModel('dataSet');
			var AppraiserLevel = dataModel.getProperty("/AppraiserLevel");
			var commentsAPI = "/empSet('" + dataModel.getProperty('/EmpID') + "')";
			sap.ui.core.BusyIndicator.show();
			_model.read(commentsAPI, {
				urlParameters: {
					"$expand": "Tocomments"
				},
				success: function(response) {
					sap.ui.core.BusyIndicator.hide();
					console.log('Comments received:');
					console.log(response);
					var recommendations = response.Tocomments.results;
					recommendations.sort((a, b) => {
						return parseInt(a.AppraiserLevel) - parseInt(b.AppraiserLevel)
					});

					var comments = recommendations[AppraiserLevel - 1];
					if (!comments) {
						comments = {
							ApprCommIncr: "",
							ApprCommProm: "",
							ApprCommJob: ""
						};
					} else {
						comments = {
							ApprCommConcern: comments.ApprCommConcern,
							ApprCommMta1: comments.ApprCommMta1,
							ApprCommMta2: comments.ApprCommMta2,
							ApprCommMta3: comments.ApprCommMta3,
							ApprCommPotential: comments.ApprCommPotential,
							ApprCommWork: comments.ApprCommWork
						}
					}
					dataModel.setProperty('/comments', comments);

					for (let i = recommendations.length; i < 3; i++) {
						recommendations.push({
							ApprCommIncr: "",
							ApprCommProm: "",
							ApprCommJob: ""
						});
					}

					var levels = ["1st Appraiser", "2nd Appraiser", "3rd Appraiser"];
					var i = 0;
					for (let rec of recommendations) {
						rec.Appraiser = levels[i++];
					}

					for (let i = recommendations.length - 1; i >= AppraiserLevel; i--) {
						console.log('i=' + i + ' appLvl=' + AppraiserLevel);
						recommendations.splice(i, 1);
					}

					for (let i in recommendations) {
						if (i == AppraiserLevel - 1) {
							recommendations[i].Editable = true;
						} else {
							recommendations[i].Editable = false;
						}
					}

					dataModel.setProperty('/recommendations', recommendations);
					console.log(recommendations);
				},
				error: function() {
					sap.ui.core.BusyIndicator.hide();
					console.log('Error on /empSet set GET');
					console.log(error);
				}
			});
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