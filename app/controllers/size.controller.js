angular.module("app")
	
	.controller("sizeCtrl",	[
		"$scope",
		"$location",
		"appStateService",
		"mFactory", 
		"variableFactory",

	    function($scope, $location, app, mFactory, Variable){
	    	var M = mFactory.M;

			$scope.m = app.inputData.m;
			$scope.n = app.inputData.n;

			$scope.next = function(){
				app.inputData.m = parseInt($scope.m);
				app.inputData.n = parseInt($scope.n);

				$location.url("/input");
			};
		}]);