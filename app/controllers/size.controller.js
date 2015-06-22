angular.module("app")
	
.controller("sizeCtrl",	[
	"$http",
	"$scope",
	"mFactory",
	"variableFactory",
	"appStateService",

    function($http, $scope, mFactory, Variable, app){
		$scope.m = app.inputData.m;
		$scope.n = app.inputData.n;
		M = mFactory.M;

		$scope.next = function(){
			app.inputData.m = parseInt($scope.m);
			app.inputData.n = parseInt($scope.n);
		};

		$scope.load = function(){
			$http.get('../data/input.json').success(function(data){
				app.inputData.m = data.m;
				app.inputData.n = data.n;

				app.inputData.matrixA = data.matrixA.map(function(item){
					return item.map(function(item, index){
						return new Variable({
							name: "x",
							value: new M(item),
							index: index
						})
					});
				});

				app.inputData.matrixB = data.matrixB.map(function(item){
					return new M(item);
				});;

				app.inputData.fx = data.fx.map(function(item, index){
					return new Variable({
						name: "x",
						value: new M(item),
						index: index
					})
				});

				app.inputData.notNegativeConditions = data.notNegativeConditions;		

				app.inputData.signs = data.signs;
				
				app.inputData.extreme = data.extreme;
			});	
		};
	}]);