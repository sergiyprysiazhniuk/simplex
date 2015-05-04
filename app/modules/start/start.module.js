var start = angular.module("module.start", ["module.fraction", "module.m"]);

start

	.controller("startCtrl", [
		"fractionFactory",
		"mFactory",
		"appDataService",
		function (fractionFactory, mFactory, app) {
			console.log();

		}]);