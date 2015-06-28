angular.module("module.simplexMethod", [
		"module.util",
		"module.variable",
		"module.m"
	])

	.factory("simplexMethodFactory", ["variableFactory", "mFactory", "utilFactory", function(Variable, mFactory, util){
		var M = mFactory.M;

		function SimplexMethod(lpp){
			if(lpp){
				this.lpp = util.clone(lpp);
				this.basis = this.getBasis();
				this.anglePoint = this._getAnglePoint();
				this.lpp.matrixC = this._getMatrixC();
				this.solvingElement = this.getSolvingElement();
			}			
		}

		SimplexMethod.prototype.next = function(){
			this.buildTable();

			if(this.isImprovable()){
				this.updateSolvingElement();
			}
			this.updateBasis();
		};

		SimplexMethod.prototype.clone = function(){
			var copy = new SimplexMethod();

			Object.keys(this).forEach(function(key){
				copy[key] = util.clone(this[key]);
			}, this);

			return copy;
		};

		SimplexMethod.prototype.getBasis = function(){	

			console.log(this);

			return this.lpp.matrixA.map(function(limitation, limitationIndex){
				var variable = limitation.filter(function(limitationElement, elementIndex){
						return limitationElement.value.equalTo(1) && !this._getMatrixAColumn(elementIndex).filter(function(item, index){
							return index !== limitationIndex && !item.value.equalTo(0);
						}).length;
					}, this)[0];


				return {
					limitation: limitationIndex,
					basisVariable: {
						_index: limitation.indexOf(variable),
						index: variable.index,
						name: variable.name,
						value: this.lpp.matrixB[limitationIndex]
					}
				}
			}, this);
		};

		SimplexMethod.prototype.updateBasis = function(){
			this.basis = this.getBasis();
			/*var row = this.solvingElement.rowIndex,
				col = this.solvingElement.colIndex;

			this.lpp.matrixB.forEach(function(item, index){
				this.basis[index].basisVariable.value = item;
			}, this);

			this.basis.splice(row, 1, {
				limitation: row,
				basisVariable: {
					_index: col,
					index: this.lpp.matrixA[row][col].index,
					name: this.lpp.matrixA[row][col].name,
					value: this.lpp.matrixB[row]
				}
			});*/
		};

		SimplexMethod.prototype.updateSolvingElement = function(){
			this.solvingElement = this.getSolvingElement();
		};

		SimplexMethod.prototype.getSolvingElement = function(){
			var colIndex = this._getSolvingColumn(),
				rowIndex,
				value;

			if(colIndex !== -1){
				rowIndex = this._getSolvingRow(colIndex);
				value = this.lpp.matrixA[rowIndex][colIndex].value.clone();
			}else{
				rowIndex = -1;
				value = null;
			}

			return {
				colIndex: colIndex,
				rowIndex: rowIndex,
				value: value
				// value: this.lpp.matrixA[rowIndex][colIndex].value
			}
		};

		SimplexMethod.prototype.buildTable = function(){
			this._divideTableRow(this.solvingElement.rowIndex);
			this._excludeVariableFromColumn(this.solvingElement.colIndex);		
		};

		/*SimplexMethod.prototype.clone = function(){
			return util.clone(this);
		};*/

		SimplexMethod.prototype._excludeVariableFromColumn = function(colIndex){
			this.lpp.matrixA.forEach(function(row, rowIndex, matrix){
				var multiplier = row[colIndex].value.multiplyBy(-1);

				if(rowIndex !== this.solvingElement.rowIndex){
					row.forEach(function(item, itemIndex){					
						item.value = item.value.add(matrix[this.solvingElement.rowIndex][itemIndex].value.multiplyBy(multiplier));
					}, this);

					this.lpp.matrixB[rowIndex] = this.lpp.matrixB[rowIndex].add(this.lpp.matrixB[this.solvingElement.rowIndex].multiplyBy(multiplier));
				}

			}, this);

			this.lpp.matrixC = this.lpp.matrixC.map(function(item, itemIndex, array){
				return item.add(
							this.lpp.matrixA[this.solvingElement.rowIndex][itemIndex].value.multiplyBy(
								array[colIndex].multiplyBy(-1)
							)
						)
			}, this);

			this.anglePoint = this._getAnglePoint();
		};

		SimplexMethod.prototype._divideTableRow = function(rowIndex){
			// var solvingValue = this.lpp.matrixA[this.solvingElement.rowIndex][this.solvingElement.colIndex];
			var solvingValue = this.solvingElement.value;

			this.lpp.matrixA[rowIndex] = this.lpp.matrixA[rowIndex]
				.map(function(item, index, array){
					item.value = item.value.divideBy(solvingValue);

					return item;
				}, this);

			this.lpp.matrixB[rowIndex] = this.lpp.matrixB[rowIndex].divideBy(solvingValue);
		};

		SimplexMethod.prototype._containsPositiveMark = function(){
			return !!this.lpp.matrixC.filter(function(item){
				return item.moreThan(0);
			}).length;
		};

		SimplexMethod.prototype.isImprovable = function(){
			return this._containsPositiveMark() && this._getPositiveMarks().every(function(item){
				return this._getMatrixAColumn(this.lpp.matrixC.indexOf(item)).some(function(item){
					return item.value.moreThan(0);
				});
			}, this);
		};

		SimplexMethod.prototype._getPositiveMarks = function(){
			return this.lpp.matrixC.filter(function(item){
				return item.moreThan(0);
			});
		};

		SimplexMethod.prototype._getSolvingColumn = function(){
			return this.lpp.matrixC.indexOf(mFactory.max(this.lpp.matrixC.filter(function(element){
						return element.moreThan(0);
					})
				)
			);
		};

		SimplexMethod.prototype._getSolvingRow = function(colIndex){
			return mFactory.min(this._getMatrixAColumn(colIndex)

				.map(function(element, index){
					return {
						value: element.value,
						index: index
					}
				})

				.filter(function(element){
					return element.value.moreThan(0);
				})

				.map(function(element){
					var relation = this.matrixB[element.index].divideBy(element.value);

					relation._limitationIndex = element.index;
					return relation;
				}, this.lpp))._limitationIndex;
		};

		SimplexMethod.prototype._getMatrixAColumn = function(columnIndex) {
			return this.lpp.matrixA.map(function(row){
				return row[columnIndex];
			});
		};

		SimplexMethod.prototype._getMatrixC = function() {
			var basis = this.basis;

			return this.lpp.fx.map(function(variable, variableIndex, fx){
				return this._getMatrixAColumn(variableIndex).reduce(function(previous, current, index){
					return current.value
						.multiplyBy(fx[basis[index].basisVariable._index].value)
				 		.add(previous); 
				}, 0).subtract(fx[variableIndex].value);
			}, this);
		};

		SimplexMethod.prototype._getAnglePoint = function() {

			// console.log("_getAnglePoint");

			var basisIndexes = this.getBasis().map(function(element){
					return element.basisVariable._index;
				}),

				vector = this.lpp.fx.map(function(variable, index){
					var basisIndex = basisIndexes.indexOf(index);

					return basisIndex > -1 ? this.matrixB[basisIndex] : new M(0);
				}, this.lpp),

				value = this.lpp.fx.reduce(function(sum, variable, index){
					return sum.add(variable.value.multiplyBy(vector[index]));
				}, new M(0));

				/*value = this.matrixB.reduce(function(previous, current, index){
					return current
						.multiplyBy(fx[basis[index].basisVariable._index].value)
				 		.add(previous); 
				}, 0).subtract(this.anglePoint.value)*/

			return {
				value: value,
				vector: vector
			}
		};

		return SimplexMethod;
	}]);