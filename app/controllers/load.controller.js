angular.module("app")
	
.controller("loadCtrl",	[
	"$http",
	"$scope",
	"mFactory",
	"variableFactory",
	"appStateService",

    function($http, $scope, mFactory, Variable, app){
		// $scope.m = app.inputData.m;
		// $scope.n = app.inputData.n;
		$scope.mode = app.mode;
		$scope.problems = [];
		M = mFactory.M;

		$scope.next = function(){
			app.inputData.m = parseInt($scope.m);
			app.inputData.n = parseInt($scope.n);
		};

		$scope.load = function(){
			console.log(this);
			app.inputData = this.step;
		};

		$http.get('/problems-list').success(function(data){

			data.forEach(function(problem, index){
				var input = {};

				input.name = problem.name;

				input.m = problem.m;
				input.n = problem.n;

				input.matrixA = problem.matrixA.map(function(item){
					return item.map(function(item, index){
						return new Variable({
							name: "x",
							value: new M(item),
							index: index
						})
					});
				});

				input.matrixB = problem.matrixB.map(function(item){
					return new M(item);
				});;

				input.fx = problem.fx.map(function(item, index){
					return new Variable({
						name: "x",
						value: new M(item),
						index: index
					})
				});

				input.notNegativeConditions = problem.notNegativeConditions;		

				input.signs = problem.signs;
				
				input.extreme = problem.extreme;

				$scope.problems.push(input);
			});
		});

		$scope.positive = function(value){
			return value;
		};

		$scope.notZero = function(item){
			return !item.value.equalTo(0);
		};
	}]);