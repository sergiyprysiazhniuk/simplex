"use strict";

var app = angular.module("app", ["ngRoute", "module.start", "module.appState", "module.variable"]);

app
	.config(["$routeProvider",
	  function($routeProvider) {
	    $routeProvider
	      .when("/", {
	        templateUrl: "index.html"
	      })
	      .when("/start", {
	        templateUrl: "modules/start/start.html"
	      })
	      .when("/size", {
	        templateUrl: "views/size.html",
	        controller: "sizeCtrl"
	      })
	      .when("/input", {
	        templateUrl: "views/input.html",
	        controller: "inputCtrl"
	      })
	      .otherwise({
	        redirectTo: "/"
	      });
	  }]);