"use strict";

angular.module("module.lppImprover", ["module.util", "module.variable", "module.m", "module.simplexMethod"])
	.factory("lppImproverFactory", ["utilFactory", "variableFactory", "mFactory", function(util, Variable, mFactory) {
		var M = mFactory.M;

		function next(lpp){
			
		}

		function getConvenienceLpp(rawLpp){
			var lpp = util.clone(rawLpp);

			lpp.improvementData = {};
			
			!isMinimized(lpp) && normalizeFunction(lpp);
			!isPositiveAllFreeMembers(lpp) && normalizeFreeMembers(lpp);
			(!isAllEquations(lpp) || !isSingleBasisMatrix(lpp)) && normalizeLimitations(lpp);
			!containsNegativeVariables(lpp) && normalizeNegativeVariables(lpp);

			return lpp;
			console.log(lpp);
		};

		function normalizeNegativeVariables(lpp){
			var k = 0;

			lpp.notNegativeConditions.forEach(function(isPositive, index){
				if(!isPositive){
					lpp.n++;
					lpp.matrixA = lpp.matrixA.map(function(row, rowIndex){
						row[index + k].name += "´";
						row[index + k].replacedIndex = index;
						row.splice(index + k + 1, 0, new Variable({
							value: row[index + k].value.multiplyBy(-1),
							name: row[index + k].name,
							index: row[index + k].index,
							replacedIndex: index
						}));

						return row;
					});

					lpp.fx[index + k].name += "´";
					lpp.fx[index + k].replacedIndex = index;
					lpp.fx.splice(index + k + 1, 0, new Variable({
						value: lpp.fx[index + k].value.multiplyBy(-1),
						name: lpp.fx[index + k].name,
						index: lpp.fx[index + k].index,
						replacedIndex: index
					}));
					k++;
				}
			});
		}

		function containsNegativeVariables(lpp){
			return lpp.notNegativeConditions.every(Boolean);
		}		

		function moreEqualZero(value){
			return value >= 0;
		}

		function indexOfValue(value){
			return function(item, index){
				return item === value ? index : -1;
			}
		}

		function normalizeLimitations(lpp){
			var equalIndexes = lpp.signs.map(indexOfValue("=")).filter(moreEqualZero),
				lessIndexes = lpp.signs.map(indexOfValue("<")).filter(moreEqualZero),
				moreIndexes = lpp.signs.map(indexOfValue(">")).filter(moreEqualZero);

				lpp.improvementData.originalSigns = util.clone(lpp.signs);

				if(lessIndexes.length){
					addAdditionalVariables(lpp, lessIndexes, 1);
				}
				if(equalIndexes.length && !moreIndexes.length){
					addFakeVariables(lpp, equalIndexes, 1);
				}
				if(moreIndexes.length && !equalIndexes.length){
					normalizeLimitationsMoreEqual(lpp, moreIndexes);
				}
				if(moreIndexes.length && equalIndexes.length){
					console.log("---normalizeLimitations---");
					normalizeEquationsAndMoreEqual(lpp, equalIndexes, moreIndexes);
				}
		}		

		function normalizeEquationsAndMoreEqual(lpp, equations, limitations){
			var isAllEquationsEqualZero = lpp.matrixB.filter(function(item, index){
					return equations.indexOf(index) > -1;	
				}).every(function(item){
					return item.equalTo(0);
				}),
				markedLimitation;

			if(isAllEquationsEqualZero){
				addFakeVariables(lpp, equations, 1);
				normalizeLimitationsMoreEqual(lpp, limitations);
			}else{
				
				markedLimitation = getLimitationWithMaxFreeMember(lpp, equations);
				divideLimitations(lpp, limitations, markedLimitation);
				addAdditionalVariables(lpp, limitations, -1);
				subtractLimitations(lpp, markedLimitation, limitations);
				addFakeVariables(lpp, [markedLimitation], 1);
			}
		}

		function divideLimitations(lpp, limitations, markedLimitation){
			var coefficient;

			lpp.matrixA = lpp.matrixA.map(function(row, rowIndex){
				if(limitations.indexOf(rowIndex) > -1){
					if(lpp.matrixB[rowIndex].moreThan(lpp.matrixB[markedLimitation])){
						coefficient = lpp.matrixB[rowIndex].divideBy(lpp.matrixB[markedLimitation]);

						lpp.matrixB[rowIndex] = lpp.matrixB[rowIndex].divideBy(coefficient);

						row = row.map(function(item, index){
							item.value = item.value.divideBy(coefficient);
							return item;
						});
					}
				}
				return row;
			});
		}

		function normalizeLimitationsMoreEqual(lpp, limitations){
			var markedLimitation = getLimitationWithMaxFreeMember(lpp, limitations);

			addAdditionalVariables(lpp, limitations, -1);

			limitations.splice(limitations.indexOf(markedLimitation), 1);
			subtractLimitations(lpp, markedLimitation, limitations);

			addFakeVariables(lpp, [markedLimitation], 1);
		}

		function getLimitationWithMaxFreeMember(lpp, limitations){
			return lpp.matrixB.indexOf(
					mFactory.max(lpp.matrixB.filter(function(item, index){
						return limitations.indexOf(index) > -1;
					}))
				);
		}

		function subtractLimitations(lpp, limitationIndex, subtrahends){
			var limitation = lpp.matrixA[limitationIndex],
				freeMember = lpp.matrixB[limitationIndex];

			lpp.matrixA = lpp.matrixA.map(function(row, rowIndex){
				if(subtrahends.indexOf(rowIndex) > -1){
					row = row.map(function(item, index){
						item.value = limitation[index].value.subtract(item.value);
						return item;
					});
				}
				return row;
			});

			lpp.matrixB = lpp.matrixB.map(function(item, index){
				if(subtrahends.indexOf(index) > -1){
					return freeMember.subtract(item);
				}
				return item;
			});
		}

		function addVariable(lpp, limitationIndex, options){
			var value = options.value;

			lpp.matrixA = lpp.matrixA.map(function(row, rowIndex){
				if(rowIndex !== limitationIndex){
					options.value = new M(0);
				}else{
					options.value = new M(value);
				}

				row.push(new Variable(options));
				return row;
			});

			lpp.fx.push(new Variable({
							name: options.name,
							value: options.isFake ? new M(1, 0) : new M(0, 0),
							index: options.index,
							isFake: options.isFake,
							isAdditional: options.isAdditional
						}));
		}		

		function addFakeVariables(lpp, limitationsIndexes, coefficient){
			limitationsIndexes.forEach(function(limitation){
				lpp.n++;
				lpp.signs[limitation] = "=";
				addVariable(lpp, limitation, {
							name: "x",
							value: new M(coefficient),
							index: lpp.n - 1,
							isFake: true
						});
			});
		}

		function addAdditionalVariables(lpp, limitationsIndexes, coefficient){
			limitationsIndexes.forEach(function(limitation){
				lpp.n++;
				lpp.signs[limitation] = "=";
				addVariable(lpp, limitation, {
							name: "x",
							value: new M(coefficient),
							index: lpp.n - 1,
							isAdditional: true
						});
			});
		}

		function normalizeFunction(lpp){			
			lpp.improvementData.originalExtreme = lpp.extreme;
			lpp.extreme = "min";
			lpp.fx = lpp.fx.map(function(variable){
				variable.value = variable.value.multiplyBy(-1)
				return variable;
			});			
		}

		function normalizeFreeMembers(lpp){
			var negativeIndexes = lpp.matrixB.map(function(item, index){
				return item.lessThan(0) ? index : -1;
			}).filter(function(item){
				return item > -1;
			});

			lpp.matrixA = lpp.matrixA.map(function(row, index){
				return 	negativeIndexes.indexOf(index) > -1
					? 	row.map(function(variable){
							variable.value = variable.value.multiplyBy(-1)
							return variable;
						})
					: 	row
			});

			lpp.matrixB = lpp.matrixB.map(function(item, index){
				return negativeIndexes.indexOf(index) > -1 ? item.multiplyBy(-1) : item;
			});

			lpp.signs = lpp.signs.map(function(sign, index){
				return negativeIndexes.indexOf(index) > -1 ? invertSign(sign, index) : sign;
			});

			function invertSign(sign, index){
				return sign !== "="	? (sign === ">" ? "<" : ">") : "="; 
			}
		}

		function isConvenientLpp(lpp){
			return isMinimized(lpp)
					&& isPositiveAllFreeMembers(lpp)
					&& isAllEquations(lpp)
					&& isSingleBasisMatrix(lpp)
					&& isPositiveAllVariables(lpp);
		}

		function isMinimized(lpp){
			return lpp.extreme === "min";
		}

		function isPositiveAllFreeMembers(lpp){
			return lpp.matrixB.every(function(item){
				return item.moreEqualThan(0);
			});
		}

		function isAllEquations(lpp){
			return lpp.signs.every(function(item){
				return item === "=";
			});
		}

		function getColumn(matrix, index) {
			return matrix.map(function(row){
				return row[index];
			});
		}

		function isSingleBasisMatrix(lpp){
			return lpp.matrixA.map(function(limitation, limitationIndex){
				return limitation.filter(function(limitationElement, elementIndex){
						return limitationElement.value.equalTo(1) 
							&& !getColumn(lpp.matrixA, elementIndex).filter(function(item, index){
								return index !== limitationIndex && !item.value.equalTo(0);
							}).length;
					});
			}).every(function(element){
				return element.length > 0;
			});
		}

		function isPositiveAllVariables(lpp){
			return lpp.notNegativeConditions.every(function(item){
				return item;
			});
		}

	  	return {
	  		next: next,
	  		getConvenienceLpp: getConvenienceLpp,
	  		isConvenientLpp: isConvenientLpp
	  	};
	}]);


/*function getLimitationsWithBasis(lpp){
	return lpp.matrixA.map(function(limitation, limitationIndex){
		return limitation.filter(function(limitationElement, elementIndex){
				return limitationElement.value.equalTo(1) 
					&& !getColumn(lpp.matrixA, elementIndex).filter(function(item, index){
						return index !== limitationIndex && !item.value.equalTo(0);
					}).length;
			}).length ? limitationIndex : -1;
	}).filter(function(element){
		return element.length > 0;
	});
}*/