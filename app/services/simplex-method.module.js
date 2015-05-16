angular.module("module.simplexMethod", [
		"module.appState",
		"module.variable",
		"module.m"
	])

	.factory("simplexMethodFactory", ["variableFactory", function(Variable){

		function SimplexMethod(lpp){
			this.lpp = lpp;
			this.lpp.matrixC = this._getMatrixC();
		}

		SimplexMethod.prototype.next = function() {
			
		};

		SimplexMethod.prototype.getBasis = function() {	
			return this.lpp.matrixA.map(function(limitation, limitationIndex){
				return {
					limitation: limitationIndex,
					basisVarible: limitation.filter(function(limitationElement, elementIndex){
						return limitationElement.value.equalTo(1) && !this._getMatrixAColumn(elementIndex).filter(function(item, index){
							return index !== limitationIndex && !item.value.equalTo(0);
						}).length;
					}, this)[0]
				}
			}, this);
		};

		SimplexMethod.prototype.clone = function() {
			return clone(this);
		};

		SimplexMethod.prototype._getMatrixAColumn = function(columnIndex) {
			return this.lpp.matrixA.map(function(row){
				return row[columnIndex];
			});
		};

		SimplexMethod.prototype._getMatrixC = function(columnIndex) {
			var basis = this.getBasis();

			return this.lpp.fx.map(function(){
				
			});
		};

		function clone(obj) {
		    var copy;

		    if (null == obj || "object" != typeof obj) return obj;

		    if (obj instanceof Variable) return obj.clone();

		    if (obj instanceof Date) {
		        copy = new Date();
		        copy.setTime(obj.getTime());
		        return copy;
		    }

		    if (obj instanceof Array) {
		        copy = [];
		        for (var i = 0, len = obj.length; i < len; i++) {
		            copy[i] = clone(obj[i]);
		        }
		        return copy;
		    }

		    if (obj instanceof Object) {
		        copy = {};
		        for (var attr in obj) {
		            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		        }
		        return copy;
		    }

		    throw new Error("Unable to copy obj! Its type isn't supported.");
		}


		return SimplexMethod;
	}]);