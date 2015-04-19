"use strict";

var app = angular.module("app", ["ngRoute", "module.start"]);

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
	      .otherwise({
	        redirectTo: "/"
	      });
	  }]);