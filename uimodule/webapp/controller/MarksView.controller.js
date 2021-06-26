sap.ui.define([
	"com/infocus/PMSApproval/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(Controller, JSONModel, MessageToast, MessageBox) {
	"use strict";
	return Controller.extend("com.infocus.PMSApproval.controller.MarksView", {
		onInit: function() {
			console.log("Inside marks view....");

			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.subscribe("MarksView", "showFactors", this.onShowFactors, this);
			eventBus.subscribe("DetailsView", "updateApproverLevel", this.updateAppraiserLevel, this);
			
		},
		onShowFactors: function() {
			var _self = this;
			var _model = _self.getView().getModel();
			sap.ui.core.BusyIndicator.show();
			var factorSetURI = "/FactorSet";
			_model.read(factorSetURI, {
				success: function(response) {
					sap.ui.core.BusyIndicator.hide();
					var factors = response.results;

					var slNo = 1;
					for (let item in factors) {
						factors[item].SlNo = slNo;
						slNo += 1;

						//Dummy random marks by the appraisers
						var maxMarks = 5;
						factors[item].M1 = Math.floor(Math.random() * maxMarks) + 1;
						factors[item].M2 = Math.floor(Math.random() * maxMarks) + 1;
						factors[item].M3 = Math.floor(Math.random() * maxMarks) + 1;
					}

					var dataSetModel = _self.getView().getModel("dataSet");
					dataSetModel.setProperty("/factors", factors);

					//console.log(_self.getView().byId("container-PMSApproval---app--DetailView--marksView--factorsTable"));

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log('Error on /factors set GET');
					console.log(error);
				}
			});
		},
		updateAppraiserLevel: function(source, event, data) {
			var approverLevel=parseInt(data.approverLevel);                         
			var factTable = this.getView().byId("factor-table");
			var c = 1;
			while (c <= 3) {
				var id = "app-" + c + "-marks-noneditable";
				if (approverLevel == c) {
					id = "app-" + c + "-marks"
				}
				var col = this.getView().byId(id);
				if (approverLevel >= c) {
					console.log("app=" + approverLevel + " c=" + c + " True...");
					col.setVisible(true);
				} else {
					console.log("app=" + approverLevel + " c=" + c + " False...");
					col.setVisible(false);
				}

				/*if(appraiserLevel!=c){
					col.setEditable(false);
				}*/
				c++;
			}
		},
		onGuideLineForGradePressed: function() {
			var _self = this;
			var _model = _self.getView().getModel();
			var gradeSetURI = "/GradeSet";

			_self.dataSet = _self.getView().getModel("dataSet").getProperty("/");

			if (!_self.dataSet.gradeSet) {
				sap.ui.core.BusyIndicator.show();
				_model.read(gradeSetURI, {
					success: function(response) {
						sap.ui.core.BusyIndicator.hide();
						_self.dataSet.gradeSet = response.results;
						for (let item in _self.dataSet.gradeSet) {
							var min = _self.dataSet.gradeSet[item].Minmarks;
							var max = _self.dataSet.gradeSet[item].Maxmarks;
							_self.dataSet.gradeSet[item].TotalMarks = min + " - " + max;
						}
						_self.getView().getModel("dataSet").setProperty("/gradeSet", _self.dataSet.gradeSet);
						_self.showGradeTable();
					},
					error: function(error) {
						sap.ui.core.BusyIndicator.hide();
						console.log('Error on /gradeSet GET');
						console.log(error);
					}
				});
			} else {
				_self.showGradeTable();
			}
		},
		onOverAllAssessmentPressed: function() {
			var _self = this;
			var _model = _self.getView().getModel();
			var marksSetURI = "/MarksSet";

			_self.dataSet = _self.getView().getModel("dataSet").getProperty("/");

			if (!_self.dataSet.marksSet) {
				sap.ui.core.BusyIndicator.show();
				_model.read(marksSetURI, {
					success: function(response) {
						sap.ui.core.BusyIndicator.hide();
						_self.dataSet.marksSet = response.results;
						_self.getView().getModel("dataSet").setProperty("/marksSet", _self.dataSet.marksSet);
						_self.showAssessmentTable();
					},
					error: function(error) {
						sap.ui.core.BusyIndicator.hide();
						console.log('Error on /marksSet GET');
						console.log(error);
					}
				});
			} else {
				_self.showAssessmentTable();
			}
		},
		showAssessmentTable: function() {
			var that = this;
			if (!that.assessmentDialog) {
				var oTable = new sap.m.Table("tab-1", {
					inset: true,
					mode: sap.m.ListMode.None,
					includeItemInSelection: false,
				});
				var col1 = new sap.m.Column("col1", {
					header: new sap.m.Label({
						text: "Description"
					})
				});
				var col2 = new sap.m.Column("col2", {
					header: new sap.m.Label({
						text: "Grade"
					})
				});

				oTable.bindItems("dataSet>/marksSet", new sap.m.ColumnListItem({
					cells: [new sap.m.Text({
						text: "{dataSet>MarksGuidDesc}"
					}), new sap.m.Text({
						text: "{dataSet>MarksGuid}"
					})]
				}));

				oTable.addColumn(col1);
				oTable.addColumn(col2);

				that.assessmentDialog = new sap.m.Dialog({
					title: '{i18n>guidelinesForGrade}',
					contentWidth: "350px",
					contentHeight: "335px",
					resizable: true,
					content: oTable,
					beginButton: new sap.m.Button({
						text: 'Close',
						press: function() {
							that.assessmentDialog.close();
						}
					})
				});

				//to get access to the global model
				this.getView().addDependent(that.assessmentDialog);
			}

			that.assessmentDialog.open();
		},
		showGradeTable: function() {
			var that = this;
			if (!that.resizableDialog) {
				var oTable = new sap.m.Table("tab-grade", {
					inset: true,
					mode: sap.m.ListMode.None,
					includeItemInSelection: false,
				});
				var col0 = new sap.m.Column("col0-grade", {
					header: new sap.m.Label({
						text: "Total Marks"
					})
				});
				var col1 = new sap.m.Column("col1-grade", {
					header: new sap.m.Label({
						text: "Description"
					})
				});
				var col2 = new sap.m.Column("col2-grade", {
					header: new sap.m.Label({
						text: "Grade"
					})
				});

				oTable.bindItems("dataSet>/gradeSet", new sap.m.ColumnListItem({
					cells: [new sap.m.Text({
						text: "{dataSet>TotalMarks}"
					}), new sap.m.Text({
						text: "{dataSet>Description}"
					}), new sap.m.Text({
						text: "{dataSet>Geade}"
					})]
				}));

				oTable.addColumn(col0);
				oTable.addColumn(col1);
				oTable.addColumn(col2);

				that.resizableDialog = new sap.m.Dialog({
					title: '{i18n>overallAssessment}',
					contentWidth: "425px",
					contentHeight: "335px",
					resizable: true,
					content: oTable,
					beginButton: new sap.m.Button({
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
		handleMarksInput: function(oEvent) {
			var _oInput = oEvent.getSource();
			var val = _oInput.getValue();
			val = val.replace(/[^\d]/g, '');
			_oInput.setValue(val);
			var isNotValid=val < 0 || val > 5;
			if (isNotValid) {
				_oInput.setValueState(sap.ui.core.ValueState.Error);
			}else{
				_oInput.setValueState(sap.ui.core.ValueState.Success);
			}
			console.log(_oInput);
		},
		onExit: function() {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("MarksView", "showFactors", this.onShowFactors, this);
			eventBus.subscribe("DetailsView", "updateApproverLevel", this.updateAppraiserLevel, this);
		}
	});
});