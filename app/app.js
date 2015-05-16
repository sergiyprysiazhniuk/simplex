"use strict";

var app = angular.module("app", [
		"ngRoute",
		"ui.router",
		"module.start",
		"module.appState",
		"module.variable",
		"module.simplexMethod"
	]);

app
	.config(["$stateProvider", "$urlRouterProvider",
	  function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise("/size");

		$stateProvider
			.state('size', {
				url: "/size",
				templateUrl: "views/size.html",
	        	controller: "sizeCtrl"
			})
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
						templateUrl: "views/result.html"
					}
			    }
			});
	  }]);