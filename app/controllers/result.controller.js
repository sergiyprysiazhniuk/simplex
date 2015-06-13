angular.module("app")

.filter('variable', function() {
	return function(input, index) {    
			var output = "",
			value = input.lessThan(0) ? input.multiplyBy(-1).toString() : input.toString();	

			if(index === 0){
				if(input.lessThan(0)){
					output = "-";
				}
			}else {
				output += input.lessThan(0) ? " - " : " + ";				
			}

			if(!input.equalTo(1) && !input.equalTo(-1)){
				output += value;
			}
			
			return output;
		};
	}
)

.filter('sign', function() {
	return function(input) {    
			var output = input;

			if(output !== "="){
				output = input === ">" ? "≥"	: "≤";
			}					
			
			return output;
		};
	}
)

/*.directive('mFormat', ['$filter', "mFactory", function ($filter, mFactory) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;

            ctrl.$parsers.unshift(function (viewValue) {
                return new mFactory.M(viewValue);
            });
        }
    };
}])*/

.controller("resultCtrl", 
		["$scope",
		"utilFactory",
		 "appStateService",
		 "variableFactory",
		 "mFactory",
		 "simplexMethodFactory",
		 "lppImproverFactory",
	 function($scope, util, app, Variable, mFactory, SimplexMethod, lppImprover){
	 	var m = app.inputData.m,
			n = app.inputData.n,
			M = mFactory.M;

			$scope.improvementSteps = app.improvementSteps;
			$scope.solvingSteps = app.solvingSteps;

			$scope.recalculateTable = function(){
				var index = this.solvingSteps.indexOf(this.step);

				console.log("this.step", this);
				console.log("app", app);


				app.solvingSteps.splice(index + 1);

				app.generateTables(util.clone(this.step.data));
			};

			$scope.notZero = function(item){
				return !item.value.equalTo(0);
			};

	 		console.log("result", $scope.steps);
	 }]);