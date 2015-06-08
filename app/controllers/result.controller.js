angular.module("app")

.controller("resultCtrl", 
		["$scope",
		 "appStateService",
		 "variableFactory",
		 "mFactory",
		 "simplexMethodFactory",
		 "lppImproverFactory",
	 function($scope, app, Variable, mFactory, SimplexMethod, lppImprover){
	 	var m = app.inputData.m,
			n = app.inputData.n,
			M = mFactory.M;

			$scope.steps = app.solvingSteps;

	 		console.log("result", $scope.steps);
	 }]);