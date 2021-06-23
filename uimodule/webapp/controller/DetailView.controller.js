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
	return Controller.extend("com.infocus.PMSApproval.controller.DetailView", {
		onInit: function() {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.subscribe("DetailView", "ShowDetailView", this.onShowDetailView, this);
			
			//Show the floating footer...
			var oObjectPage = this.getView().byId("ObjectPageLayout");
			oObjectPage.setShowFooter(true);
		},
		onDesignationPress: function() {
			console.log('Designation press called...');
		},
		onShowDetailView: function(source, event, data) {
			MessageBox.show("Showing data for:" + data.empName)
		},
		onDesignationPress: function() {
			console.log(this.getView().getModel('posititons'))

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
		onEditToggleButtonPress: function() {
			var oObjectPage = this.getView().byId("ObjectPageLayout"),
				bCurrentShowFooterState = oObjectPage.getShowFooter();

			oObjectPage.setShowFooter(!bCurrentShowFooterState);
		},
		handleSaveAppraisalPress: function() {
			//Calling the save data function.
			this._oPopover.close();
			
		},
		handleCancelAppraisalPress: function() {
			this._oPopover.close();
		},
		handleSaveAsDraft: function() {

			
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