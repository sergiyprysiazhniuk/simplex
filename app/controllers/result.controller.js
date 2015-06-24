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

/*.filter('currentColIndexes', ["utilFactory", function(util){
	return function(input, context) {		
			return util.generateArray(context.data.lpp.n, function(_, index){
				return {index: index};
			});
		};
	}]
)*/

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

			$scope.addVariablePopupActive = false;

			$scope.variableTypes = [
				{
					type: "additional",
					description: "Додаткова"
				},
				{
					type: "fake",
					description: "Штучна"
				},
				{
					type: "ordinary",
					description: "Звичайна"
				}
			];

			$scope.setSolvingElementValue = function(){
				console.log("setSolvingElementValue", this);
				var solvingRow = this.step.data.solvingElement.rowIndex,
					solvingCol = this.step.data.solvingElement.colIndex;

				this.step.data.solvingElement.value = this.step.data.lpp.matrixA[solvingRow][solvingCol].value;
			};

			$scope.newVariable = {
				type: $scope.variableTypes[0],
				coeficient: 1,
				name: "x"
			}

			$scope.showAddVariablePopup = function(step, limitation){
				$scope.currentStep = step;
				$scope.currentStep.editedLimitation = this.$index;
				$scope.newVariable.index = parseInt($scope.currentStep.data.n) + 1;
				$scope.addVariablePopupActive = true;				
			};

			$scope.hideAddVariablePopup = function(){
				$scope.addVariablePopupActive = false;				
			};

			$scope.addVariable = function(){
				var options = {
					value: $scope.newVariable.coeficient,
					name: $scope.newVariable.name,
					index: $scope.newVariable.index - 1,
					isAdditional: $scope.newVariable.type.type === "additional",
					isFake: $scope.newVariable.type.type === "fake"
				};

				lppImprover.addVariable($scope.currentStep.data, $scope.currentStep.editedLimitation, options);

				$scope.newVariable = {
					type: $scope.variableTypes[0],
					coeficient: 1,
					name: "x"
				}
				$scope.addVariablePopupActive = false;				
			};

			$scope.improvementSteps = app.improvementSteps;
			$scope.solvingSteps = app.solvingSteps;
			$scope.resultSteps = app.resultSteps;

			$scope.$watchCollection("solvingSteps", function(steps){
				steps.forEach(function(step){
					step.rowIndexes = util.generateArray(step.data.lpp.m, function(_, index){
						return {index: index};
					});

			    	step.colIndexes = util.generateArray(step.data.lpp.n, function(_, index){
						return {index: index};
					});
				});
			});

			$scope.cancelEdit = function(){
				this.editMode = false;
			};

			$scope.activateEditMode = function(){
				var that = this;

				$scope.$broadcast("deactivateedit", this);

				if(!this.hasListener){
					this.hasListener = true;
					this.$on("deactivateedit", function(args, scope){
						if(scope !== that){
							that.editMode = false;
						}
					});
				}
				
				this.editMode = true;	
			};



			$scope.recalculate = function(){
				var index = this.improvementSteps.indexOf(this.step),
				lpp = util.clone(this.step.data);

				this.cancelEdit();

				app.improvementSteps.splice(index + 1);
				app.solvingSteps.splice(0);
				app.solve(lpp);

				app.updateResultSteps();
			};

			$scope.recalculateTable = function(){
				var index = this.solvingSteps.indexOf(this.step),
					lpp = util.clone(this.step.data);

				app.solvingSteps.splice(index + 1);
				app.generateTables(lpp);

				app.resultSteps.splice(0);
				app.updateResultSteps();
			};

			/*$scope.matrixElementUpdate = function(value){
				if(value.toString() !== this.originalValue){
					this.edited = true;
				}else{
					this.edited = false;
				}
			};
			$scope.anglePointUpdate = function(){
				if(this.step.data.anglePoint.value.toString() !== this.step.data.anglePoint.originalValue){
					this.step.data.anglePoint.edited = true;
				}else{
					this.step.data.anglePoint.edited = false;
				}
			};

			$scope.variableEdit = function(){
				if(this.variable.value.toString() !== this.variable.originalValue){
					this.variable.edited = true;
				}else{
					this.variable.edited = false;
				}
			};*/

			$scope.matrixAElementUpdate = function(){
				var solvingElement = this.$parent.$parent.step.data.solvingElement;

				if(solvingElement.colIndex === this.$index && solvingElement.rowIndex === this.$parent.$index){
					this.$parent.$parent.step.data.solvingElement.value = this.variable.value.clone();
				}		

				// $scope.variableEdit.call(this);				
			};

			$scope.notZero = function(item){
				return !item.value.equalTo(0);
			};

	 		console.log("result", $scope.steps);
	 }]);