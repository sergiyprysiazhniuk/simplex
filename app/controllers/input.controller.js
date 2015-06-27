angular.module("app")

	.directive('mFormat', ['$filter', "mFactory", function ($filter, mFactory) {
	    return {
	        require: '?ngModel',
	        link: function (scope, elem, attrs, ctrl) {
	            if (!ctrl) return;

	            ctrl.$parsers.unshift(function (viewValue) {
	                return new mFactory.M(viewValue);
	            });
	        }
	    };
	}])

	.controller("inputCtrl", 
		["$scope",
		 "$http",
		 "$location",
		 "appStateService",
		 "trainingStateService",
		 "variableFactory",
		 "mFactory",
		 "simplexMethodFactory",
		 "lppImproverFactory",
		 "utilFactory",
	 function($scope, $http, $location, app, training, Variable, mFactory, SimplexMethod, lppImprover, util){
		var m = app.inputData.m,
			n = app.inputData.n,
			M = mFactory.M;

		if(!app.inputData.matrixA){
			app.inputData.matrixA = util.generateArray(m, function(array){
				return util.generateArray(n, function(array, index){
					return new Variable({
						name: "x",
						value: 0,
						index: index
					})
				});
			});
		}
		if(!app.inputData.matrixB){
			app.inputData.matrixB = util.generateArray(m, function(){
				return new M(0);
			});
		}
		if(!app.inputData.fx){
			app.inputData.fx = util.generateArray(n, function(array, index){
				return new Variable({
						name: "x",
						value: 0,
						index: index
					})
			});
		}
		if(!app.inputData.signs){
			app.inputData.signs = util.generateArray(m, function(){
				return "=";
			});
		}
		if(!app.inputData.notNegativeConditions){
			app.inputData.notNegativeConditions = util.generateArray(n, function(){
				return true;
			});
		}

		$scope.A = app.inputData.matrixA;
		$scope.B = app.inputData.matrixB;
		$scope.fx = app.inputData.fx;

		$scope.signs = app.inputData.signs.map(function(sign){
			return {value: sign};
		});
		$scope.notNegativeConditions = app.inputData.notNegativeConditions.map(function(item){
			return { value: item };
		});

		$scope.extreme = app.inputData.extreme || "min";

		$scope.availableSigns = ['=', '<', '>'];
		$scope.availableConditions = [
			{
				value: false,
				label: "∈(-∞, +∞)"
			},
			{
				value: true,
				label: "≥ 0"
			}
		];

		$scope.next = function(){	
			switch($location.path()){
				case "/editable":
					app.start();
					break;
				case "/training":
					training.start();
					break;	
			}
		};

		/*function util.generateArray(length, callback){
			var array = [], i;

			for (i = 0; i < length; i++) {
				array.push(callback && callback(array[i], i, array));
			};

			return array;
		}*/
	}]);