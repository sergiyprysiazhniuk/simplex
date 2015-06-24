angular.module("module.resultAnalyzer", ["module.util", "module.variable", "module.m", "module.simplexMethod", "module.lppImprover"])

	.factory("resultAnalyzerFactory",["utilFactory", function(util){
		var stopCriteriaMessages = {
				result: "Серед отриманих оцінок відсутні додатні. Отже, розв'язком задачі є точка:",
				resultPoint: "x*({coords}), f(x*) = {value}",
				noResult: "Задача немає розв'язку, тому що функція цілі не обмежена знизу на множині припустимих розв'язків.",
				additionalProblemResult: "Серед отриманих оцінок відсутні додатні. Отже, розв'язком допоміжної задачі є точка:",
				additionalProblemResultPoint: "x*({coords}), f(x*) = {value}",
				additionalProblemHasNotResult: "Допоміжна задача немає розв'язку, тому що функція цілі не обмежена знизу на множині припустимих розв'язків.",
				originalProblemResult: "Розв'язок вихідної задачі: ",
				originalProblemHasNotResult: "Вихідна задача немає розвя'зку з тієї ж причини.",
				fakeVariablesNotZero: "Вихідна задача немає розвя'зку, бо значення штучної змінної не дорівнює нулю."
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
				return item.value.equalTo(0);
			});
		}

		function getOriginalAnglePoint(finalTable){
			var anglePoint = {},
				isMaximized = finalTable.lpp.improvementData.originalExtreme === "max",
				hasNegativeVariables = finalTable.lpp.improvementData.notNegativeConditions 
										&& !finalTable.lpp.improvementData.notNegativeConditions.every(Boolean);

			console.log("finalTable.lpp.improvementData.notNegativeConditions", finalTable.lpp.improvementData.notNegativeConditions);

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

			anglePoint.vector = anglePoint.vector.map(function(item){
				return item.value;
			});

			console.log("WWWWWWWWWWWWWW", util.clone(anglePoint));

			return util.clone(anglePoint);
		}

		return {
			getResultSteps: function(finalTable){
				var resultSteps = [],
					lpp = finalTable.lpp,
					wasImproved = !!lpp.improvementData,
					point;

				if(hasResult(lpp)){
					if(!wasImproved){
						point = util.clone(finalTable.anglePoint);

						resultSteps.push({
							message: stopCriteriaMessages.result,
							resultString: util.template(stopCriteriaMessages.resultPoint, {coords: point.vector.join(", "), value: point.value}),
							point: point
						});

						return resultSteps;
					}else{
						point = util.clone(finalTable.anglePoint);

						resultSteps.push({
							message: stopCriteriaMessages.additionalProblemResult,							
							point: point,
							resultString: util.template(stopCriteriaMessages.additionalProblemResultPoint, {coords: point.vector.join(", "), value: point.value})
						});

						if(!allFakeVariablesAreZero(lpp)){	
							point = getOriginalAnglePoint(finalTable);

							resultSteps.push({
								message: stopCriteriaMessages.originalProblemResult,
								resultString: util.template(stopCriteriaMessages.resultPoint, {coords: point.vector.join(", "), value: point.value}),
								point: point
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