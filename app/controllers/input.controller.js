angular.module("app")

	.filter("c", function(){
		return function(value){
			return value ? "≥ 0" : "∈(-∞, +∞)";
		}
	})

	.controller("inputCtrl", ["$scope", "appStateService", "variableFactory", function($scope, app, Variable){
		var m = app.inputData.m,
			n = app.inputData.n;		

		$scope.A = generateArray(m, function(array){
			return generateArray(n, function(array, index){
				return new Variable({
					name: "x",
					value: '1',
					index: index + 1
				})
			});
		});

		$scope.B = generateArray(m, function(){
			return {value: '2'};
		});

		$scope.signs = generateArray(m, function(){
			return {value: '='};
		});

		$scope.fx = generateArray(m, function(array, index){
			return new Variable({
					name: "x",
					value: '3',
					index: index + 1
				})
		});

		$scope.notNegativeConditions = generateArray(m, function(array, index){
			return {
					value: 1,
					label: "≥ 0"
				}
		});

		$scope.availableSigns = ['=', '<', '>'];
		$scope.availableConditions = [
			{
				value: 0,
				label: "∈(-∞, +∞)"
			},
			{
				value: 1,
				label: "≥ 0"
			}
		];
		$scope.extreme = "min";

		$scope.next = function(){
			app.inputData.matrixA = $scope.A;
			app.inputData.fx = $scope.fx;
			app.inputData.notNegativeConditions = $scope.notNegativeConditions.map(function(item){
				return !!parseInt(item.value);
			});

			app.inputData.matrixB = $scope.B.map(function(item){
				return item.value;
			});

			app.inputData.signs = $scope.signs.map(function(item){
				return item.value;
			});
			app.inputData.extreme = $scope.extreme;

			console.log(app.inputData);
		};

		function generateArray(length, callback){
			var array = [], i;

			for (i = 0; i < length; i++) {
				array.push(callback && callback(array, i));
			};

			return array;
		}
	}]);