"use strict";

angular.module("module.fraction", [])
	.factory("fractionFactory", function() {
		var fractionFactory = {};

		function Fraction(numerator, denominator){
			var numbers;

			if(arguments.length === 1 && typeof numerator === "string"){
				if(numerator.search('/') > -1){
					numbers = numerator.split('/');
					numerator = parseFloat(numbers[0]);
					denominator = parseFloat(numbers[1]);
				}
			}

			this.numerator = parseFloat(numerator);
			this.denominator = parseFloat(denominator) || 1;
		}

		Fraction.prototype.toString = function(){
			if(this.numerator == 0){ return "0"; }
			if(this.numerator == this.denominator){ return "1"; }
			if(this.denominator == 1){ return this.numerator.toString(); }
			return this.numerator + "/" + this.denominator;
		};

		Fraction.prototype.reduce = function(){
			var numerator = this.numerator,
			 	denominator = this.denominator;

			if(this.numerator === 0){
				return new Fraction(0);
			}
			for(var i = 1; i <= denominator; i++){
				if(numerator % i === 0 && denominator % i === 0){
					numerator /= i;
					denominator /= i;
					i = 1;
				}
			}
			return new Fraction(numerator, denominator);
		};

		Fraction.prototype.add = function(fraction){
			var scm;

			fraction = fractionFactory.toFraction(fraction);

			if(!(fraction instanceof Fraction)){		
				throw new Error(fraction + " is not a fraction");
			}

			if(this.denominator === fraction.denominator){
				return new Fraction(this.numerator + fraction.numerator, this.denominator).reduce();
			}

			scm = getSCM(this.denominator, fraction.denominator);

			return new Fraction((this.numerator * (scm / this.denominator)) + (fraction.numerator * (scm / fraction.denominator)),
				scm).reduce();
		};

		Fraction.prototype.subtract = function(fraction){
			var scm;

			fraction = fractionFactory.toFraction(fraction);

			if(!(fraction instanceof Fraction)){		
				throw new Error(fraction + " is not a fraction");
			}

			if(this.denominator === fraction.denominator){
				return new Fraction(this.numerator - fraction.numerator, this.denominator).reduce();
			}
			
			scm = getSCM(this.denominator, fraction.denominator)
			return new Fraction((this.numerator * (scm / this.denominator)) - (fraction.numerator * (scm / fraction.denominator)),
				scm).reduce();
		};

		Fraction.prototype.multiplyBy = function(fraction){
			fraction = fractionFactory.toFraction(fraction);
			if(!(fraction instanceof Fraction)){		
				throw new Error(fraction + " is not a fraction");
			}

			return new Fraction(this.numerator * fraction.numerator, this.denominator * fraction.denominator).reduce();
		};

		Fraction.prototype.divideBy = function(fraction){
			fraction = toFraction(fraction);
			if(!(fraction instanceof Fraction)){		
				throw new Error(fraction + " is not a fraction");
			}

			return new Fraction(this.numerator, this.denominator)
				.multiplyBy(new Fraction(fraction.denominator, fraction.numerator))
				.reduce();
		};

		Fraction.prototype.equalTo = function(fraction){
			fraction = fractionFactory.toFraction(fraction);
			return !this.subtract(fraction).numerator;
		};

		Fraction.prototype.moreThan = function(fraction){
			fraction = fractionFactory.toFraction(fraction);
			return this.subtract(fraction).numerator > 0;
		};

		Fraction.prototype.lessThan = function(fraction){
			fraction = fractionFactory.toFraction(fraction);
			return this.subtract(fraction).numerator < 0;
		};

		Fraction.prototype.moreEqualThan = function(fraction){
			fraction = fractionFactory.toFraction(fraction);
			return this.subtract(fraction).numerator >= 0;
		};

		Fraction.prototype.lessEqualThan = function(fraction){
			fraction = fractionFactory.toFraction(fraction);
			return this.subtract(fraction).numerator <= 0;
		};

		function getSCM(n1, n2){
			var max = Math.max(n1, n2),
			 	min = Math.min(n1, n2),
			  	i;

			for(i = 1; i <=  min; i++){
				if((max * i) % min === 0){
					return max * i;
				}
			}
			return 0;
		}

		fractionFactory.toFraction = function(number){
			if(number instanceof Fraction){
				return number;
			}
			if(typeof number !== "number"){		
				throw new Error(number + " is not a Number");
			}
			return new Fraction(number, 1);
		};

		fractionFactory.Fraction = Fraction;

	  	return fractionFactory;
	});