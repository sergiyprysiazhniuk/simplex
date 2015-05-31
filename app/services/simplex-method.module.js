angular.module("module.simplexMethod", [
		"module.util",
		"module.variable",
		"module.m"
	])

	.factory("simplexMethodFactory", ["variableFactory", "mFactory", "utilFactory", function(Variable, mFactory, util){
		var M = mFactory.M;

		function SimplexMethod(lpp){
			this.lpp = lpp;
			this.basis = this.getBasis();
			this.anglePoint = this._getAnglePoint();
			this.lpp.matrixC = this._getMatrixC();
			this.solvingElement = this.getSolvingElement();
		}

		SimplexMethod.prototype.next = function(){
			if(this._isImprovable()){
				this.buildTable();

				if(this._containsPositiveMark()){
					this.updateBasis();
					this.updateSolvingElement();
				}
			}
		};

		SimplexMethod.prototype.getBasis = function(){	
			return this.lpp.matrixA.map(function(limitation, limitationIndex){
				var variable = limitation.filter(function(limitationElement, elementIndex){
						return limitationElement.value.equalTo(1) && !this._getMatrixAColumn(elementIndex).filter(function(item, index){
							return index !== limitationIndex && !item.value.equalTo(0);
						}).length;
					}, this)[0];

				return {
					limitation: limitationIndex,
					basisVariable: {
						index: variable.index,
						name: variable.name,
						value: this.lpp.matrixB[limitationIndex]
					}
				}
			}, this);
		};

		SimplexMethod.prototype.updateBasis = function(){
			var row = this.solvingElement.rowIndex,
				col = this.solvingElement.colIndex;

			this.lpp.matrixB.forEach(function(item, index){
				this.basis[index].basisVariable.value = item;
			}, this);

			this.basis.splice(row, 1, {
				limitation: row,
				basisVariable: {
					index: col,
					name: this.lpp.matrixA[row][col].name,
					value: this.lpp.matrixB[row]
				}
			});
		};

		SimplexMethod.prototype.updateSolvingElement = function(){
			this.solvingElement = this.getSolvingElement();
		};

		SimplexMethod.prototype.getSolvingElement = function(){
			var colIndex = this._getSolvingColumn(),
				rowIndex = this._getSolvingRow(colIndex);

			return {
				colIndex: colIndex,
				rowIndex: rowIndex,
				value: this.lpp.matrixA[rowIndex][colIndex].value.clone()
			}
		};

		SimplexMethod.prototype.buildTable = function(){
			this._divideTableRow(this.solvingElement.rowIndex);
			this._excludeVariableFromColumn(this.solvingElement.colIndex);		
		};

		SimplexMethod.prototype.clone = function(){
			return util.clone(this);
		};

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
			this.lpp.matrixA[rowIndex] = this.lpp.matrixA[rowIndex]
				.map(function(item, index, array){
					item.value = item.value.divideBy(this.solvingElement.value);

					return item;
				}, this);

			this.lpp.matrixB[rowIndex] = this.lpp.matrixB[rowIndex].divideBy(this.solvingElement.value);
		};

		SimplexMethod.prototype._containsPositiveMark = function(){
			return !!this.lpp.matrixC.filter(function(item){
				return item.moreThan(0);
			}).length;
		};

		SimplexMethod.prototype._isImprovable = function(){
			return this._containsPositiveMark() && !!this._getPositiveMarks().filter(function(item){
				return this._getMatrixAColumn(this.lpp.matrixC.indexOf(item)).filter(function(item){
					return item.value.moreThan(0);
				}).length;
			}, this).length;
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
						.multiplyBy(fx[basis[index].basisVariable.index].value)
						.add(previous); 
				}, 0).subtract(fx[variableIndex].value);
			}, this);
		};

		SimplexMethod.prototype._getAnglePoint = function() {
			var basisIndexes = this.getBasis().map(function(element){
					return element.basisVariable.index;
				}),

				vector = this.lpp.fx.map(function(variable, index){
					var basisIndex = basisIndexes.indexOf(index);

					return basisIndex > -1 ? this.matrixB[basisIndex] : new M(0);
				}, this.lpp),

				value = this.lpp.fx.reduce(function(sum, variable, index){
					return sum.add(variable.value.multiplyBy(vector[index]));
				}, new M(0));

			return {
				value: value,
				vector: vector
			}
		};

		return SimplexMethod;
	}]);