"use strict";

var app = angular.module("app", [
		"ngRoute",
		"ui.router",
		"contenteditable",
		"module.start",
		"module.util",
		"module.appState",
		"module.trainingState",
		"module.variable",
		"module.simplexMethod",
		"module.lppImprover",
		"module.resultAnalyzer"
	]);

app
	.config(["$stateProvider", "$urlRouterProvider",
	  function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise("/");

		$stateProvider
			.state('main', {
				url: "/",
				templateUrl: "views/main.html",
				controller: "setModeCtrl"
			})
			.state('input-probelm-condition', {
				url: "/input-probelm-condition",
				templateUrl: "views/input-probelm-condition.html"
			})
			.state('load', {
				url: "/load",
				templateUrl: "views/load.html",
	        	controller: "loadCtrl"
			})
			.state('size', {
				url: "/size",
				templateUrl: "views/size.html",
	        	controller: "sizeCtrl"
			})
			.state('training-size', {
				url: "/training-size",
				templateUrl: "views/training-size.html",
	        	controller: "sizeCtrl"
			})
			.state('experiment', {
				url: "/experiment",
				templateUrl: "views/experiment.html",
	        	controller: "experimentCtrl"
			})
			.state('training', {
				url: "/training",
				views: {
					"": {
						templateUrl: "views/training.html"
					},
					"input@training": { 
						templateUrl: "views/input.html",
				        controller: "inputCtrl"
				    },
					"training-result@training": {
						templateUrl: "views/training-result.html",
				        controller: "trainingCtrl"
					}
			    }
			})/*
			.state('testing', {
				url: "/testing",
				templateUrl: "views/testing.html",
	        	controller: "testingCtrl"
			})*/
			.state('editable', {
				url: "/editable",
				views: {
					"": {
						templateUrl: "views/editable.html"
					},
					"input@editable": { 
						templateUrl: "views/input.html",
				        controller: "inputCtrl"
				    },
					"result@editable": {
						templateUrl: "views/result.html",
				        controller: "resultCtrl"
					}
			    }
			});
	  }]);