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
		"$http",
		"trainingStateService",
		"utilFactory",
		"appStateService",
		"mFactory",
		"validateMessageService",
		"lppImproverFactory",

	    function($scope, $http, training, util, app, mFactory, validation, lppImprover){
	    	var m = app.inputData.m,
				n = app.inputData.n,
				previousStep = app.inputData,
				currentHint;

			console.log("training", training);

			$http.get('../data/training/hints.json').success(function(data){
				$scope.hints = data;
				console.log($scope.hints);
			});


	    	$scope.userSimplexTables = training.userSimplexTables;
	    	$scope.simplexTables = training.simplexTables;

	    	$scope.userImprovementSteps = training.userImprovementSteps;
	    	$scope.improvementSteps = training.improvementSteps;

	    	$scope.actions = [
	    		{
	    			type: "make-convenient",
	    			text: "Привести задачу до зручного вигляду.",
	    			category: "start"
	    		},
	    		{
	    			type: "build-first-table",
	    			text: "Задача має зручний вигляд. Побудувати першу симплекс-таблицю.",
	    			category: "start make-convenient"
	    		},
	    		{
	    			type: "continue-convenient",
	    			text: "Продовжити приведення до зручного вигляду.",
	    			category: "make-convenient"
	    		},
	    		{
	    			type: "solved",
	    			text: "Отримано розв'язок.",
	    			category: "simplex-table"
	    		},
	    		{
	    			type: "improvable",
	    			text: "План можна покращити.",
	    			category: "simplex-table"
	    		},
	    		{
	    			type: "not-limited-top",
	    			text: "Задача немає розв'язку. Функція цілі необмежена ЗВЕРХУ.",
	    			category: "simplex-table"
	    		},
	    		{
	    			type: "not-limited-bottom",
	    			text: "Задача немає розв'язку. Функція цілі необмежена ЗНИЗУ.",
	    			category: "simplex-table"
	    		},
	    		{
	    			type: "empty-plural",
	    			text: "Задача не має розв'язку. Множина припустимих роз'язків несумісна.",
	    			category: "simplex-table"
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
	    		var isCorrect = true;

	    		actualLpp.basis = actualLpp.basis.map(function(item, index){
	    			var isBasisVariable;

	    			if(!expectedLpp.lpp.matrixA[item.limitation][item.index].value.equalTo(1)){
	    				item.incorrect = true;
	    				isCorrect = false;
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
						isCorrect = false;
					}

	    			return item;
	    		});

	    		return isCorrect;
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
	    		var alowNextStep;

	    		expectedLpp.lpp.matrixB.forEach(function(item, index){
	    			actualLpp.lpp.matrixB[index].incorrect = !item.equalTo(actualLpp.lpp.matrixB[index]);
	    		});

	    		alowNextStep = actualLpp.lpp.matrixB.every(function(item){
	    			return !item.incorrect;
	    		})

	    		expectedLpp.lpp.matrixC.forEach(function(item, index){
	    			actualLpp.lpp.matrixC[index].incorrect = !item.equalTo(actualLpp.lpp.matrixC[index]);
	    		});

	    		alowNextStep = alowNextStep && actualLpp.lpp.matrixC.every(function(item){
	    			return !item.incorrect;
	    		})

	    		expectedLpp.lpp.matrixA.forEach(function(row, rowIndex){
					row.forEach(function(item, index){
	    				actualLpp.lpp.matrixA[rowIndex][index].value.incorrect = !item.value.equalTo(actualLpp.lpp.matrixA[rowIndex][index].value);
	    			});

	    			alowNextStep = alowNextStep && row.every(function(item){
		    			return !item.value.incorrect;
		    		})
	    		});

	    		console.log("expectedLpp.anglePoint", expectedLpp.anglePoint, actualLpp.anglePoint);

	    		actualLpp.anglePoint.value.incorrect = !actualLpp.anglePoint.value.equalTo(expectedLpp.anglePoint.value);
	    	
	    		alowNextStep = alowNextStep && !actualLpp.anglePoint.value.incorrect;

	    		console.log("alowNextStep", alowNextStep);

	    		return alowNextStep;
	    	}

	    	$scope.autoComplete = function(currentStep){
	    		console.log("previousStep", previousStep.matrixC);

	    		// currentStep.matrixA.splice(0);
	    		currentStep.lpp.matrixA = util.clone(previousStep.matrixA);
	    		currentStep.lpp.matrixB = util.clone(previousStep.matrixB);
	    		currentStep.lpp.fx = util.clone(previousStep.fx);
	    		if(previousStep.matrixC){
	    			currentStep.lpp.matrixC = util.clone(previousStep.matrixC);	
	    		}	    		
	    	};



	    	$scope.confirm = function(){
	    		console.log("step", this);
				
				if(isSimplexTableHasEmptyCells(this.step.data.lpp)){
					validation.alert("Заповніть всі клітинки симплекс-таблиці.");
					return;
				}
				// validation.alert("Заповніть всі клітинки симплекс-таблиці.");


	    		var solving,
	    			rowIndex = this.step.data.solvingElement.rowIndex,
	    			colIndex = this.step.data.solvingElement.colIndex,
	    			isCorrectBasis, isCorrectTable, isCorrectSolving;

	    		this.step.expectedData = training.simplexTables[training.simplexTables.length - 1];

	    		isCorrectBasis = checkBasis(this.step.data, this.step.expectedData);
	    		solving = isCorrectSolvingElement(this.step.data, this.step.expectedData);
	    		
	    		isCorrectSolving = solving === "correct";

	    		if(solving === "not-rational"){
	    			this.step.expectedData.solvingElement.rowIndex = rowIndex;
	    			this.step.expectedData.solvingElement.colIndex = colIndex;
	    			this.step.expectedData.solvingElement.value = this.step.expectedData.lpp.matrixA[rowIndex][colIndex].value;
	    		}

	    		isCorrectTable = compareTables(this.step.data, this.step.expectedData);
	    		
	    		console.log("isCorrectTable && isCorrectBasis && isCorrectSolving", isCorrectTable, isCorrectBasis, isCorrectSolving);
	    		
	    		if(isCorrectTable && isCorrectBasis && isCorrectSolving){
	    			training.next();
	    		}
	    		/*if(this.step.nextAction === "solved" && isCorrectTable){

	    		}*/
	    	};



	    	$scope.confirmResult = function(){
	    		this.step.expectedData = training.simplexTables[training.simplexTables.length - 1];
	    		console.log("!!!confirmResult!!!", this);
	    		this.step.userAnglePointValue.incorrect = !this.step.expectedData.anglePoint.value.equalTo(this.step.userAnglePointValue);
	    		this.step.data.anglePoint.vector.forEach(function (item, index){
	    			item.incorrect = !this.step.expectedData.anglePoint.vector[index].equalTo(item);
	    		}, this);

	    		$scope.trainingEnd = this.step.data.anglePoint.vector.every(function(item){
	    			return !item.incorrect;
	    		});
	    	};


	    	$scope.nextImprovement = function(){
	    		var step;

	    		previousStep = util.clone(this.step.data.lpp);

	    		if(lppImprover.isConvenientLpp(previousStep)){
	    			this.step.selectedIncorrectAction = this.step.nextAction !== "build-first-table";
	    		}else{
	    			this.step.selectedIncorrectAction = this.step.nextAction !== "continue-convenient";
	    		}

	    		if(!this.step.selectedIncorrectAction){
	    			step = {
	    				data: {}
	    			};

	    			step.data.lpp = training.generateEmptyLpp(previousStep.m, previousStep.n);
	    			step.data.lpp.signs = util.clone(previousStep.signs);
	    			step.data.lpp.extreme = previousStep.extreme;

	    			console.log("this.step.nextAction", this.step.nextAction);

	    			if(this.step.nextAction === "build-first-table"){
	    				step.type = "first-simplex-table";
	    				// training.userSimplexTables.push(new SimplexMethod(step.data.lpp));
	    				training.buildFirstSimplexTable(previousStep);
	    			}else if(this.step.nextAction === "continue-convenient"){
	    				step.type = "improvement";
						training.userImprovementSteps.push(step);
	    			}
	    		}
	    	};


	    	$scope.verifyStartAction = function(){
	    		var step;
	    		console.log("verifyStartAction", this.step.nextAction);
	    		if(lppImprover.isConvenientLpp(app.inputData)){
	    			this.step.selectedIncorrectAction = this.step.nextAction !== "build-first-table";
	    		}else{
	    			this.step.selectedIncorrectAction = this.step.nextAction !== "make-convenient";
	    		}

	    		if(!this.step.selectedIncorrectAction){
	    			step = {
	    				type: "improvement",
	    				data: {}
	    			};

	    			step.data.lpp = training.generateEmptyLpp(app.inputData.m, app.inputData.n);
	    			step.data.lpp.signs = util.clone(app.inputData.signs);
	    			step.data.lpp.extreme = app.inputData.extreme;

	    			if(this.step.nextAction === "build-first-table"){
	    				step.type = "first-simplex-table";
	    				training.buildFirstSimplexTable(previousStep);
	    			}else if(this.step.nextAction === "make-convenient"){
	    				step.type = "improvement";
						training.userImprovementSteps.push(step);
	    			}
	    		}
	    		console.log("verifyStartAction", this);
	    	};

	    	$scope.setLimitationIndex = function(context, index){
	    		context.limitation = index;
	    	};

	    	function checkGoalFunctionExtereme(lpp){
	    		var improved = true, notImproved;

	    		if(app.inputData.extreme === "max"){	    			
		    		improved = app.inputData.fx.every(function(variable, index){
		    			return variable.value.equalTo(lpp.fx[index].value.multiplyBy(-1));
		    		});

		    		notImproved = app.inputData.fx.every(function(variable, index){
		    			return variable.value.equalTo(lpp.fx[index].value);
		    		});
	    		}


	    		if(improved){
	    			lpp.extreme = "min";
	    		}else if(notImproved){
	    			lpp.extreme = "max";
	    			currentHint = $scope.hints["goal-function-maximized"];
	    		}

	    		return improved;
	    	}

	    	function containsAdditionalVariable(row){
	    		return row.some(function(variable){
	    			return variable.isAdditional;
	    		});
	    	}

	    	function containsFakeVariable(row){
	    		return row.some(function(variable){
	    			return variable.isFake;
	    		});
	    	}

	    	function checkNegativeFreeMembers(lpp){
	    		var isSourceHasNegativeFreeMembers,
	    		 	negativeFreeMembersIndexes,
	    		  	improved, 
	    		  	notImproved,
	    		  	signsReplaced;

	    		negativeFreeMembersIndexes = app.inputData.matrixB.map(function(item, index){
	    			return item.lessThan(0) ? index : -1;
	    		}).filter(function(item){
	    			return item > -1;
	    		});

	    		improved = negativeFreeMembersIndexes.every(function(item){
			    			return app.inputData.matrixA[item].every(function(variable, index){
			    				return variable.value.equalTo(lpp.matrixA[item][index].value.multiplyBy(-1));
			    			});
			    		});

	    		improved = improved && negativeFreeMembersIndexes.every(function(item){
	    			return app.inputData.matrixB[item].equalTo(lpp.matrixB[item].multiplyBy(-1));
	    		});

	    		if(!improved){
	    			currentHint = $scope.hints["negative-free-members"] + $scope.hints["negative-free-members-multiply"];
	    		}

	    		signsReplaced = negativeFreeMembersIndexes.every(function(item){
	    			if(app.inputData.signs[item] === ">"){
	    				return lpp.signs[item] === "<";
	    			}else if(app.inputData.signs[item] === "<"){
	    				return lpp.signs[item] === ">";
	    			}else if(app.inputData.signs[item] === "="){
	    				return lpp.signs[item] === "=";
	    			}
	    		});

	    		if(improved && !signsReplaced){
	    			currentHint = $scope.hints["negative-free-members"] + $scope.hints["negative-free-members-sign"];
	    		}

	    		return improved && signsReplaced;
	    	}

	    	function isSimplexTableHasEmptyCells(lpp){

	    		console.log("isSimplexTableHasEmptyCells", lpp);
	    		var matrixCEmptyCells,
	    			anglePointEmpty = lpp.anglePoint && (lpp.anglePoint.value === "" || isNaN(lpp.anglePoint.value));

	    		matrixCEmptyCells = lpp.matrixC.some(function(cell){
	    			return cell === "" || isNaN(cell.summand.numerator);
	    		});

	    		return matrixCEmptyCells || anglePointEmpty || isLimitationsHasEmptyCells(lpp);
	    	}

	    	function isLimitationsHasEmptyCells(lpp){
	    		var leftSideEmptyCells, rightSideEmptyCells;

	    		leftSideEmptyCells = lpp.matrixA.some(function(row){
	    			return row.some(function(cell){
	    				return cell.value === "" || isNaN(cell.value.summand.numerator);
	    			});
	    		});

	    		rightSideEmptyCells = lpp.matrixB.some(function(cell){
	    			return cell === "" || isNaN(cell.summand.numerator);
	    		});

	    		return leftSideEmptyCells || rightSideEmptyCells;
	    	}

	    	function isGoalFunctionHasEmptyCells(lpp){
	    		return lpp.fx.some(function(cell){
	    			return cell.value === "" || isNaN(cell.value.summand.numerator);
	    		});
	    	}

	    	function checkLimitationsLessEqual(lpp){
				var isSourceHasNegativeFreeMembers,
	    		 	lessEqualSignsIndexes,
	    		  	improved, 
	    		  	notImproved,
	    		  	signsReplaced;

	    		lessEqualSignsIndexes = app.inputData.signs.map(function(item, index){
	    			return item === "<" ? index : -1;
	    		}).filter(function(item){
	    			return item > -1;
	    		});

	    		/*if(!lessEqualSignsIndexes.length){
	    			return false;
	    		}*/

	    		improved = lessEqualSignsIndexes.every(function(item){
			    			return app.inputData.matrixA[item].every(function(variable, index){
			    				return variable.value.equalTo(lpp.matrixA[item][index]);
			    			}) && containsAdditionalVariable(lpp.matrixA[item]);
			    		});

	    		if(!improved){
	    			currentHint = $scope.hints["limitations-less"] + $scope.hints["limitations-less-variable"];
	    		}

	    		signsReplaced = lessEqualSignsIndexes.every(function(item){
	    			if(app.inputData.signs[item] === "<"){
	    				return lpp.signs[item] === "=";
	    			}
	    		});

	    		if(improved && !signsReplaced){
	    			currentHint = $scope.hints["limitations-less"] + $scope.hints["limitations-less-sign"];
	    		}

	    		return improved;
	    	}

	    	function checkEquations(lpp){
	    		var equationsIndexes,
	    		  	improved, 
	    		  	notImproved,
	    		  	signsReplaced;

	    		equationsIndexes = app.inputData.signs.map(function(item, index){
	    			return item === "=" ? index : -1;
	    		}).filter(function(item){
	    			return item > -1;
	    		});

	    		console.log("checkEquations", equationsIndexes);

	    		if(!equationsIndexes.length){
	    			return false;
	    		}

	    		improved = equationsIndexes.every(function(item){
			    			return app.inputData.matrixA[item].every(function(variable, index){
			    				return variable.value.equalTo(lpp.matrixA[item][index]);
			    			}) && containsFakeVariable(lpp.matrixA[item]);
			    		});

	    		console.log("checkEquations", improved);

	    		if(!improved){
	    			currentHint = $scope.hints["equations"];
	    		}

	    		return improved;
	    	}

	    	$scope.showHintForSimplexTable = function(){
	    		if(isSimplexTableHasEmptyCells(this.step.data.lpp)){
					validation.alert("Заповніть всі клітинки симплекс-таблиці.");
					return;
				}
	    	};

	    	$scope.showHint = function(){
	    		var lpp = this.step.data.lpp;

	    		if(isLimitationsHasEmptyCells(lpp)){
	    			validation.alert("Система обмежень має порожні клітинки. Заповніть їх щоб продовжити.");
	    			return;
	    		}
	    		if(isGoalFunctionHasEmptyCells(lpp)){
	    			validation.alert("Функція цілі має порожні клітинки. Заповніть їх щоб продовжити.");
	    			return;
	    		}

				if(!checkGoalFunctionExtereme(lpp)){
					validation.alert(currentHint);
					return;
				}

				if(!checkNegativeFreeMembers(lpp)){
					validation.alert(currentHint);
					return;
				}

				if(!checkLimitationsLessEqual(lpp)){
					validation.alert(currentHint);
					return;
				}

				if(!checkEquations(lpp)){
					validation.alert(currentHint);
					return;
				}

				if(lppImprover.isConvenientLpp(lpp)){
					currentHint = $scope.hints["convenient"];
					validation.alert(currentHint);
					return;
				}

	    	};

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

			$scope.newVariable = {
				type: $scope.variableTypes[0],
				coeficient: 1,
				name: "x"
			};

			$scope.showAddVariablePopup = function(){
				console.log(this);
				$scope.newVariable.index = parseInt(this.step.data.lpp.n) + 1;
				this.step.addVariablePopupActive = true;				
			};

			$scope.hideAddVariablePopup = function(){
				// $scope.newVariable.index = parseInt(this.step.data.lpp.n) + 1;
				this.step.addVariablePopupActive = false;				
			};

			$scope.addVariable = function(){
				var options = {
					value: $scope.newVariable.coeficient,
					name: $scope.newVariable.name,
					index: $scope.newVariable.index - 1,
					_index: this.step.data.lpp.n,
					isAdditional: $scope.newVariable.type.type === "additional",
					isFake: $scope.newVariable.type.type === "fake"
				};

				this.step.data.lpp.n++;
				lppImprover.addVariable(this.step.data.lpp, $scope.newVariable.limitationIndex, options);

				$scope.newVariable = {
					type: $scope.variableTypes[0],
					coeficient: 1,
					name: "x"
				}
				this.step.addVariablePopupActive = false;	
			};

			

	    	$scope.start = function(){
				training.start();
			};	    	
		}]);