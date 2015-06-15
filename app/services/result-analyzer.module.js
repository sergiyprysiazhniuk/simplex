angular.module("module.resultAnalyzer", ["module.util", "module.variable", "module.m", "module.simplexMethod", "module.lppImprover"])

	.factory("resultAnalyzerFactory",["utilFactory", function(util){
		var stopCriteriaMessages = {
				result: "result",
				noResult: "noResult",
				additionalProblemResult: "resultOfAdditionalProblem",
				additionalProblemHasNotResult: "additionalProblemHasNotResult",
				originalProblemResult: "originalProblemResult",
				originalProblemHasNotResult: "originalProblemHasNotResult",
				fakeVariablesNotZero: "fakeVariablesNotZero"
			};

		function hasResult(lpp){
			return lpp.matrixC.every(function(item){
				return item.lessEqualThan(0);
			});
		}

		function allFakeVariablesAreZero(lpp){
			return lpp.fx.filter(function(item){
				return item.isFake;
			}).every(function(item){
				console.log("QQQQQQQ", item);
				return item.value.equalTo(0);
			});
		}

		function getOriginalAnglePoint(finalTable){
			var anglePoint = {},
				isMaximized = finalTable.lpp.improvementData.originalExtreme === "max",
				hasNegativeVariables = !finalTable.lpp.notNegativeConditions.every(Boolean);

			anglePoint.value = isMaximized 
								? finalTable.anglePoint.value.multiplyBy(-1) 
								: finalTable.anglePoint.value;

			anglePoint.vector =  finalTable.anglePoint.vector.map(function(item, index){
				return {
					value: item,
					replacedIndex: finalTable.lpp.fx[index].replacedIndex
				}
			})
			.filter(function(item, index){
				return !finalTable.lpp.fx[index].isFake && !finalTable.lpp.fx[index].isAdditional; 
			});

			if(hasNegativeVariables){
				anglePoint.vector.forEach(function(item, index, array){

					if(item.replacedIndex === -1){
						array[index] = item.value;
					}else {
						array[index] = item.value.subtract(array[index + 1].value);
						array.splice(index + 1, 1);
					}
				});
			}

			return util.clone(anglePoint);
		}

		return {
			getResultSteps: function(finalTable){
				var resultSteps = [],
					lpp = finalTable.lpp,
					wasImproved = !!lpp.improvementData;

				if(hasResult(lpp)){
					if(!wasImproved){
						resultSteps.push({
							message: stopCriteriaMessages.result,
							point: util.clone(finalTable.anglePoint)
						});

						return resultSteps;
					}else{
						resultSteps.push({
							message: stopCriteriaMessages.additionalProblemResult,
							point: util.clone(finalTable.anglePoint)
						});

						if(!allFakeVariablesAreZero(lpp)){		
							resultSteps.push({
								message: stopCriteriaMessages.originalProblemResult,
								point: getOriginalAnglePoint(finalTable)
							});

							return resultSteps;
						}else{
							resultSteps.push({
								message: stopCriteriaMessages.fakeVariablesNotZero,
								point: util.clone(finalTable.anglePoint)
							});

							return resultSteps;
						}						
					}
				}else{
					if(!wasImproved){
						resultSteps.push({
							message: stopCriteriaMessages.noResult,
							point: util.clone(finalTable.anglePoint)
						});

						return resultSteps;
					}else{
						resultSteps.push({
							message: stopCriteriaMessages.additionalProblemHasNotResult,
							point: util.clone(finalTable.anglePoint)
						});

						resultSteps.push({
							message: stopCriteriaMessages.originalProblemHasNotResult,
							point: util.clone(finalTable.anglePoint)
						});

						return resultSteps;
					}
				}					
			}
		}
	}]);