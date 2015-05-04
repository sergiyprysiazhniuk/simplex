"use strict";

angular.module("module.m", ["module.fraction"])
	.factory("mFactory", ["fractionFactory", function(fractionFactory) {
		var mFactory = {},
			Fraction = fractionFactory.Fraction;

		function M(coefficient, summand){
			if(arguments.length === 1){
				var numbers = coefficient.toString().replace(/\s/g, '').split(/m/i),
					_coefficient = numbers[0], _summand = numbers[1];

				if(_coefficient == '-'){
					_coefficient = -1;
				}

				if(numbers.length == 1){
					this.coefficient = new Fraction(0);
					this.summand = new Fraction(_coefficient);
				}
				else if(numbers.length == 2 && _coefficient == '' && _summand == ''){
					this.coefficient = new Fraction(1);
					this.summand = new Fraction(0);
				}
				else if(numbers.length == 2 && _coefficient == ''){
					this.coefficient = new Fraction(1);
					this.summand = new Fraction(_summand);
				}
				else if(_summand == ''){
					this.coefficient = new Fraction(_coefficient);
					this.summand = new Fraction(0);
				}
				else{
					this.coefficient = new Fraction(_coefficient);
					this.summand = new Fraction(_summand);
				}
			}else{
				this.coefficient = coefficient;
				this.summand = summand;
			}			
		}

		M.prototype.add = function(m){
			m = mFactory.toM(m);

			if(!(m instanceof M)){		
				throw new Error(m + " is not a M");
			}

			return new  M(this.coefficient.add(m.coefficient), this.summand.add(m.summand));
		};

		M.prototype.subtract = function(m){
			m = mFactory.toM(m);

			if(!(m instanceof M)){		
				throw new Error(m + " is not a M");
			}

			return new  M(this.coefficient.subtract(m.coefficient), this.summand.subtract(m.summand));
		};

		M.prototype.multiplyBy = function(m){
			var product1, product2;

			m = mFactory.toM(m);

			product1 = new  M(this.coefficient.multiplyBy(m.summand), this.coefficient.multiplyBy(m.coefficient));
			product2 = new  M(this.summand.multiplyBy(m.coefficient), this.summand.multiplyBy(m.summand));
			
			return product1.add(product2);
		};

		M.prototype.divideBy = function(m){
			m = mFactory.toM(m);

			return new  M(this.coefficient.divideBy(m.coefficient), this.summand.divideBy(m.summand));
		};

		M.prototype.equalTo = function(m){
			m = mFactory.toM(m);
			return this.coefficient.equalTo(m.coefficient) && this.summand.equalTo(m.summand);
		};

		M.prototype.moreThan = function(m){
			m = mFactory.toM(m);

			return this.coefficient.moreThan(m.coefficient)
					|| (this.coefficient.equalTo(m.coefficient) && this.summand.moreThan(m.summand));
		};

		M.prototype.lessThan = function(m){
			m = mFactory.toM(m);

			return this.coefficient.lessThan(m.coefficient)
					|| (this.coefficient.equalTo(m.coefficient) && this.summand.lessThan(m.summand));
		};

		M.prototype.moreEqualThan = function(m){
			m = mFactory.toM(m);
			return this.equalTo(m) || this.moreThan(m);
		};

		M.prototype.lessEqualThan = function(m){
			m = mFactory.toM(m);
			return this.equalTo(m) || this.lessThan(m);
		};

		M.prototype.toString = function(){
			var result = "",
			 	sign;

			if(!this.coefficient.equalTo(0) && !this.coefficient.equalTo(1) && !this.coefficient.equalTo(-1)){
				result += this.coefficient.toString() + 'M';
			}
			else if(this.coefficient.equalTo(1)){
				result += 'M';
			}
			else if(this.coefficient.equalTo(-1)){
				result += '-M';
			}

			sign = this.summand.moreThan(0) ? '+' : '';
			
			if(!this.summand.equalTo(0)){
				result += sign + this.summand.toString();
			}

			if(this.coefficient.equalTo(0)){
				result = this.summand.toString();
			}

			return result;
		};

		mFactory.toM = function (number){
			if(number instanceof M){
				return number;
			}else if(arguments.length === 1 && typeof number === "string"){
				return new M(number);
			}

			return new M(fractionFactory.toFraction(0), fractionFactory.toFraction(number));
		};

		mFactory.min = function (elements){
			var min = elements[0];

			elements.forEach(function(element){
				if(element.lessThan(min)){
					min = element;
				}
			});

			return min;
		};

		mFactory.max = function (elements){
			var max = elements[0];

			elements.forEach(function(element){
				if(element.moreThan(max)){
					max = element;
				}
			});

			return max;
		};

		mFactory.M = M;

	  	return mFactory;
	}]);