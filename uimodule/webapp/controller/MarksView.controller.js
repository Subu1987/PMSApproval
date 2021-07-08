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
			eventBus.subscribe("MarksView", "fetchMarksFromServerByEmpID", this.fetchMarksFromServerByEmpID, this);
			eventBus.subscribe("DetailsView", "updateApproverLevel", this.updateAppraiserLevel, this);

		},
		onShowFactors: function() {
			var _self = this;
			var _model = _self.getView().getModel();
			var dataModel = _self.getView().getModel('dataSet');

			sap.ui.core.BusyIndicator.show();
			var factorSetURI = "/FactorSet";
			_model.read(factorSetURI, {
				success: function(response) {
					sap.ui.core.BusyIndicator.hide();
					var factors = response.results;

					var slNo = 1;
					var factCounts = {
						c1: 0,
						c2: 0,
						c3: 0
					};
					for (let item in factors) {
						factors[item].SlNo = slNo;
						slNo += 1;

						//Dummy random marks by the appraisers
						//var maxMarks = 5;
						//factors[item].M1 = Math.floor(Math.random() * maxMarks) + 1;
						//factors[item].M2 = Math.floor(Math.random() * maxMarks) + 1;
						//factors[item].M3 = Math.floor(Math.random() * maxMarks) + 1;*

						factors[item].M1 = '0';
						factors[item].M2 = '0';
						factors[item].M3 = '0';

						/*if(slNo%2==0){
							factors[item].FactorType='B';
						}else if(slNo%5==0){
							factors[item].FactorType='C'
						}*/

						if (factors[item].FactorType === 'A') {
							factCounts.c1 += 1;
						}
						if (factors[item].FactorType === 'B') {
							factCounts.c2 += 1;
						}
						if (factors[item].FactorType === 'C') {
							factCounts.c3 += 1;
						}
					}
					factCounts.showTypeA = factCounts.c1 > 0;
					factCounts.showTypeB = factCounts.c2 > 0;
					factCounts.showTypeC = factCounts.c3 > 0;

					dataModel.setProperty("/factors", factors);
					dataModel.setProperty("/factCounts", factCounts);
					dataModel.setProperty("/empty", []);

					//Fetching marks from server...
					_self.fetchMarksFromServerByEmpID();

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log('Error on /factors set GET');
					console.log(error);
				}
			});
		},
		fetchMarksFromServerByEmpID: function() {
			var _self = this;
			var _model = _self.getView().getModel();
			var dataModel = _self.getView().getModel('dataSet');
			var AppraiserLevel = dataModel.getProperty("/AppraiserLevel");
			var factorMarksAPI = "/empSet('" + dataModel.getProperty('/EmpID') + "')";
			var factors = dataModel.getProperty("/factors");
			console.log(factorMarksAPI);
			console.log(factors);

			if (!factors) {
				_self.onShowFactors();
			} else {
				console.log('Fetching marks...');
				sap.ui.core.BusyIndicator.show();
				_model.read(factorMarksAPI, {
					urlParameters: {
						"$expand": "Toempmarks"
					},
					success: function(response) {
						sap.ui.core.BusyIndicator.hide();
						dataModel = _self.getView().getModel('dataSet');
						var marksList = response.Toempmarks.results;

						console.log('Marks list received: ');
						console.log(marksList);
						if (marksList.length > 0) {
							
							/*for (let i in marksList) {
								if (AppraiserLevel == "1") {
									factors[i].M1 = marksList[i].Marks;
								} else if (AppraiserLevel == "2") {
									factors[i].M2 = marksList[i].Marks;
								} else if (AppraiserLevel == "3") {
									factors[i].M3 = marksList[i].Marks;
								}
							}*/
							
							for(let f of factors){
								const marks=marksList.filter(m=>m.FactorId==f.FactorId);
								if(marks[0]){
									f.M1=marks[0].Marks;
								}
								if(marks[1]){
									f.M2=marks[1].Marks;
								}
								if(marks[2]){
									f.M3=marks[2].Marks;
								}
							}
						}
						dataModel.setProperty("/factors", factors);

						_self.calcTotalFactorsByType();
					},
					error: function() {
						sap.ui.core.BusyIndicator.hide();
						console.log('Error on /empSet set GET');
						console.log(error);
					}
				});
			}

		},
		calcTotalFactorsByType: function() {
			var _self = this;

			var dataModel = this.getView().getModel('dataSet');
			var level = dataModel.getProperty("/AppraiserLevel");
			var factors = dataModel.getProperty('/factors');
			var totalSet = {
				TypeA: dataModel.getProperty('/factCounts/c1') * 5,
				TypeA_M1: 0,
				TypeA_M2: 0,
				TypeA_M3: 0,
				TypeB: dataModel.getProperty('/factCounts/c2') * 5,
				TypeB_M1: 0,
				TypeB_M2: 0,
				TypeB_M3: 0,
				TypeC: dataModel.getProperty('/factCounts/c3') * 5,
				TypeC_M1: 0,
				TypeC_M2: 0,
				TypeC_M3: 0,
			};

			/*var allMarks=[];
			for(let item of factors){
				allMarks.append(
					{
						M1:isNaN(item.M1)?0:item.M1,
						M2:isNaN(item.M1)?0:item.M1,
						M3:0
					}
				);
			}*/

			for (let item of factors) {
				if (item.FactorType === 'A') {
					totalSet.TypeA_M1 += parseInt(item.M1 == '' ? '0' : item.M1);
					totalSet.TypeA_M2 += parseInt(item.M2 == '' ? '0' : item.M2);
					totalSet.TypeA_M3 += parseInt(item.M3 == '' ? '0' : item.M3);
				} else if (item.FactorType === 'B') {
					totalSet.TypeB_M1 += parseInt(item.M1 == '' ? '0' : item.M1);
					totalSet.TypeB_M2 += parseInt(item.M2 == '' ? '0' : item.M2);
					totalSet.TypeB_M3 += parseInt(item.M3 == '' ? '0' : item.M3);
				} else if (item.FactorType === 'C') {
					totalSet.TypeC_M1 += parseInt(item.M1 == '' ? '0' : item.M1);
					totalSet.TypeC_M2 += parseInt(item.M2 == '' ? '0' : item.M2);
					totalSet.TypeC_M3 += parseInt(item.M3 == '' ? '0' : item.M3);
				}
			}
			console.log(totalSet);

			/*_self.addTotal('factorsTable', total1, 'Total Marks (out of 40)');
			_self.addTotal('factorsTable2', total2, 'Total Marks (out of 40)');
			_self.addTotal('factorsTable3', total3, 'Total Marks (out of 20)');*/

			var a1Total = totalSet.TypeA_M1 + totalSet.TypeB_M1 + totalSet.TypeC_M1;
			var a2Total = totalSet.TypeA_M2 + totalSet.TypeB_M2 + totalSet.TypeC_M2;
			var a3Total = totalSet.TypeA_M3 + totalSet.TypeB_M3 + totalSet.TypeC_M3;

			var gt = (totalSet.TypeA + totalSet.TypeB + totalSet.TypeC);
			var marksObt = level == 1 ? a1Total : a2Total;
			dataModel.setProperty('/GrandTotalFullMarks', gt);
			dataModel.setProperty('/TotalSet', totalSet);

			dataModel.setProperty('/GrandTotalMarks', marksObt);
			// 75 ----------- 40/75
			var p = (marksObt / gt) * 100;
			p = isNaN(p) ? 0 : p;
			var grade = ''
			if(p >= 68){
				grade = 'A';
			}else if(p >= 53){
				grade = 'B';
			}else if(p >= 38){
				grade = 'C';
			}else if( p >= 27){
				grade = 'D';
			}else{
				grade = 'E';
			}
			dataModel.setProperty('/Grade', grade);

		},
		addTotal: function(tableID, value, msg) {
			var _self = this;
			var flbID = tableID + '-FLB';
			var fBox = new sap.m.FlexBox( /*flbID, */ {
				height: "30px",
				alignItems: "Center",
				justifyContent: "End"																																									
			});
			fBox.addItem(new sap.m.Label({
				text: msg,
				width: "15rem"
			}));
			fBox.addItem(new sap.m.Label({
				text: value,
				width: "3rem"
			}));

			var table1 = _self.byId(tableID);
			table1.setFooter(fBox);
		},
		updateAppraiserLevel: function(source, event, data) {
			var approverLevel = parseInt(data.approverLevel);
			var factTable = this.byId("factor-table");
			var dataModel = this.getView().getModel("dataSet");
			var totalVisibleSet = {
				TypeA_M1: true,
				TypeA_M2: true,
				TypeA_M3: true,
				TypeB_M1: true,
				TypeB_M2: true,
				TypeB_M3: true,
				TypeC_M1: true,
				TypeC_M2: true,
				TypeC_M3: true,
			};
			if (approverLevel == 1) {
				totalVisibleSet.TypeA_M2 = false;
				totalVisibleSet.TypeB_M2 = false;
				totalVisibleSet.TypeC_M2 = false;
				totalVisibleSet.TypeA_M3 = false;
				totalVisibleSet.TypeB_M3 = false;
				totalVisibleSet.TypeC_M3 = false;
			} else if (approverLevel == 2) {
				totalVisibleSet.TypeA_M3 = false;
				totalVisibleSet.TypeB_M3 = false;
				totalVisibleSet.TypeC_M3 = false;
			}
			dataModel.setProperty("/TotalVisibleSet", totalVisibleSet);

			var c = 1;
			while (c <= 3) {
				var id = "app-" + c + "-marks-noneditable";
				if (approverLevel == c) {
					id = "app-" + c + "-marks"
				}
				var col1 = this.byId(id);
				var col2 = this.byId(id + "-B");
				var col3 = this.byId(id + "-C");
				if (approverLevel >= c) {
					//console.log("app=" + approverLevel + " c=" + c + " True...");
					col1.setVisible(true);
					col2.setVisible(true);
					col3.setVisible(true);
				} else {
					//console.log("app=" + approverLevel + " c=" + c + " False...");
					col1.setVisible(false);
					col2.setVisible(false);
					col3.setVisible(false);
				}

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
			var isNotValid = val < 0 || val > 5;
			if (isNotValid) {
				_oInput.setValueState(sap.ui.core.ValueState.Error);
			} else {
				_oInput.setValueState(sap.ui.core.ValueState.Success);
				this.calcTotalFactorsByType();
			}
		},
		onExit: function() {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("MarksView", "showFactors", this.onShowFactors, this);
			eventBus.unsubscribe("MarksView", "fetchMarksFromServerByEmpID", this.fetchMarksFromServerByEmpID, this);
			eventBus.subscribe("DetailsView", "updateApproverLevel", this.updateAppraiserLevel, this);
		}
	});
});