angular.module("app")

	.filter("notBasisVariables", function() {
		return function(input, context) {	
				return input.filter(function(item){
					return context.data.basis.indexOf(item) === -1;
				});
			};
		}
	)
	.filter("notSelectedVariables", function() {
		return function(input, context, index) {	
				return input.filter(function(item){
					return context.data.basis.indexOf(item) === -1 || item.limitation === index;
				});
			};
		}
	)
	
	.controller("trainingCtrl",	[
		"$scope",
		"trainingStateService",
		"utilFactory",
		"appStateService",
		"mFactory",
		"validateMessageService",

	    function($scope, training, util, app, mFactory, validation){
	    	var m = app.inputData.m,
				n = app.inputData.n,
				previousStep = app.inputData;


	    	$scope.trainingSteps = training.trainingSteps;
	    	$scope.simplexTables = training.simplexTables;

	    	$scope.actions = [
	    		{
	    			type: "solved",
	    			text: "Отримано розв'язок."
	    		},
	    		{
	    			type: "improvable",
	    			text: "План можна покращити."
	    		},
	    		{
	    			type: "not-limited-top",
	    			text: "Задача немає розв'язку. Функція цілі необмежена ЗВЕРХУ."
	    		},
	    		{
	    			type: "not-limited-bottom",
	    			text: "Задача немає розв'язку. Функція цілі необмежена ЗНИЗУ."
	    		},
	    		{
	    			type: "empty-plural",
	    			text: "Задача не має розв'язку. Множина припустимих роз'язків несумісна."
	    		}
	    	];

	    	$scope.rowIndexes = util.generateArray(m, function(_, index){
				return {index: index};
			});

	    	$scope.colIndexes = util.generateArray(n, function(_, index){
				return {index: index};
			});

			$scope.compareAction = function(){
    			this.step.selectedIncorrectAction = (training.getActualAction() !== this.step.nextAction);
			};

			$scope.getActualAction = function(){
    			training.getActualAction();
			};


	    	function checkBasis(actualLpp, expectedLpp){
	    		actualLpp.basis = actualLpp.basis.map(function(item, index){
	    			var isBasisVariable;

	    			if(!expectedLpp.lpp.matrixA[item.limitation][item.index].value.equalTo(1)){
	    				item.incorrect = true;
	    				return item;
	    			}

	    			isBasisVariable = expectedLpp.lpp.matrixA.map(function(row){
						return row[item.index].value;
					}).every(function(value, valueIndex){
						if(valueIndex !== item.limitation){
							return value.equalTo(0);
						}

						return true;
					});

					if(!isBasisVariable){
						item.incorrect = true;
					}

	    			return item;
	    		});
	    	}

	    	function isCorrectSolvingElement(actualLpp, expectedLpp){
	    		var actualRowIndex = actualLpp.solvingElement.rowIndex,
	    			actualColIndex = actualLpp.solvingElement.colIndex,
	    			expectedRowIndex = expectedLpp.solvingElement.rowIndex,
	    			expectedColIndex = expectedLpp.solvingElement.colIndex,
	    			isCorrectRow, isCorrectCol, solvingRow;

	    		if(actualRowIndex === expectedRowIndex && actualColIndex === expectedColIndex){
	    			return "correct";
	    		}
	    		if(actualColIndex === expectedColIndex && actualRowIndex !== expectedRowIndex){
	    			return "incorrect";
	    		}
	    		if(actualColIndex !== expectedColIndex){
	    			isCorrectCol = expectedLpp.lpp.matrixC[actualColIndex].moreThan(0);
	    			solvingRow = expectedLpp._getSolvingRow(actualColIndex);

	    			return isCorrectCol && actualRowIndex === solvingRow  ? "not-rational" : "incorrect";
	    		}
	    	}

	    	function compareTables(actualLpp, expectedLpp){
	    		expectedLpp.lpp.matrixB.forEach(function(item, index){
	    			actualLpp.lpp.matrixB[index].incorrect = !item.equalTo(actualLpp.lpp.matrixB[index]);
	    		});

	    		expectedLpp.lpp.matrixC.forEach(function(item, index){
	    			actualLpp.lpp.matrixC[index].incorrect = !item.equalTo(actualLpp.lpp.matrixC[index]);
	    		});

	    		expectedLpp.lpp.matrixA.forEach(function(row, rowIndex){
					row.forEach(function(item, index){
	    				actualLpp.lpp.matrixA[rowIndex][index].value.incorrect = !item.value.equalTo(actualLpp.lpp.matrixA[rowIndex][index].value);
	    			});
	    		});

	    		console.log("expectedLpp.anglePoint", expectedLpp.anglePoint, actualLpp.anglePoint);

	    		actualLpp.anglePoint.value.incorrect = !actualLpp.anglePoint.value.equalTo(expectedLpp.anglePoint.value);
	    	}

	    	$scope.autoComplete = function(currentStep){
	    		console.log("previousStep", previousStep.matrixC);

	    		// currentStep.matrixA.splice(0);
	    		currentStep.lpp.matrixA = util.clone(previousStep.matrixA);
	    		currentStep.lpp.matrixB = util.clone(previousStep.matrixB);
	    		if(previousStep.matrixC){
	    			currentStep.lpp.matrixC = util.clone(previousStep.matrixC);	
	    		}	    		
	    	};

	    	$scope.confirm = function(){
	    		console.log("step", this);
				
				validation.alert("Заповніть всі клітинки симплекс-таблиці.");


	    		var isCorrectSolving,
	    			rowIndex = this.step.data.solvingElement.rowIndex,
	    			colIndex = this.step.data.solvingElement.colIndex;

	    		this.step.expectedData = training.simplexTables[training.simplexTables.length - 1];

	    		checkBasis(this.step.data, this.step.expectedData);
	    		isCorrectSolving = isCorrectSolvingElement(this.step.data, this.step.expectedData);
	    		
	    		if(isCorrectSolving === "not-rational"){
	    			this.step.expectedData.solvingElement.rowIndex = rowIndex;
	    			this.step.expectedData.solvingElement.colIndex = colIndex;
	    			this.step.expectedData.solvingElement.value = this.step.expectedData.lpp.matrixA[rowIndex][colIndex].value;
	    		}

	    		compareTables(this.step.data, this.step.expectedData);
	    	};

	    	$scope.changeHandler = function(){
	    		// console.log("XXXXXXXXXXXXXXXXXXCCCCCCCCCCCCCCCCCVVVVVVVVVVVVVVVVVV");
	    	};

	    	/*function validate

	    	$scope.$watchCollection('trainingSteps', function(){
	    		console.log("XXXXXXXXXXXXXXXXXXCCCCCCCCCCCCCCCCCVVVVVVVVVVVVVVVVVV");
	    	});*/

	    	$scope.setLimitationIndex = function(context, index){
	    		context.limitation = index;
	    	};

	    	$scope.next = function(){
				training.next();
			};	    	
		}]);