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
		onInit:function(){
			var eventBus=sap.ui.getCore().getEventBus();
			eventBus.subscribe("DetailView","ShowDetailView",this.onShowDetailView,this);
		},
		onDesignationPress:function(){
			console.log('Designation press called...');
		},
		onShowDetailView:function(source,event,data){
			MessageBox.show("Showing data for:"+data.empName)
		},
		onExit:function(){
			var eventBus=sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("DetailView","ShowDetailView",this.onShowDetailView,this);
		}
	});
});