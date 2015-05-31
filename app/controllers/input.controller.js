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
		 "appStateService",
		 "variableFactory",
		 "mFactory",
		 "simplexMethodFactory",
		 "lppImproverFactory",
	 function($scope, $http, app, Variable, mFactory, SimplexMethod, lppImprover){
		var m = app.inputData.m,
			n = app.inputData.n,
			M = mFactory.M,
			sm;

			console.log(app);		

		$scope.A = generateArray(m, function(array){
			return generateArray(n, function(array, index){
				return new Variable({
					name: "x",
					value: '1',
					index: index
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
					index: index
				})
		});

		$scope.notNegativeConditions = generateArray(m, function(array, index){
			return {
					value: true
				}
		});

		$scope.extreme = "min";

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

		$scope.load = function(){
			$http.get('../data/data1.json').success(function(data) {
				var m = data.m,
					n = data.n;	

				$scope.data = data;

				$scope.A = data.matrixA.map(function(item){
					return item.map(function(item, index){
						return new Variable({
							name: "x",
							value: new M(item),
							index: index
						})
					});
				});
				
				$scope.B = data.matrixB.map(function(item){
					return {value: new M(item)};
				});

				$scope.signs = data.signs.map(function(item){
					return {value: item};
				});

				$scope.fx = data.fx.map(function(item, index){
						return new Variable({
							name: "x",
							value: new M(item),
							index: index
						})
					});

				$scope.notNegativeConditions = data.notNegativeConditions.map(function(item){
					return {
							value: item
						}
				});

				$scope.extreme = data.extreme;
			});	
		};

		$scope.load();

		$scope.next = function(){

			if(!sm){	

				app.inputData.matrixA = $scope.A;

				app.inputData.matrixB = $scope.B.map(function(item){
					return item.value;
				});

				app.inputData.fx = $scope.fx;

				app.inputData.notNegativeConditions = $scope.notNegativeConditions.map(function(item){
					return item.value;
				});			

				app.inputData.signs = $scope.signs.map(function(item){
					return item.value;
				});
				
				app.inputData.extreme = $scope.extreme;

				lppImprover.getConvenienceLpp(app.inputData);

				sm = new SimplexMethod(app.inputData);
			}

			

			sm.next();
		};

		function generateArray(length, callback){
			var array = [], i;

			for (i = 0; i < length; i++) {
				array.push(callback && callback(array[i], i, array));
			};

			return array;
		}
	}]);