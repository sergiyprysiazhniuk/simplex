angular.module("app")
	
	.controller("sizeCtrl",	[
		"$scope",
		"appStateService",

	    function($scope, app){
			$scope.m = app.inputData.m;
			$scope.n = app.inputData.n;

			$scope.next = function(){
				app.inputData.m = parseInt($scope.m);
				app.inputData.n = parseInt($scope.n);
			};
		}]);