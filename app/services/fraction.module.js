"use strict";

angular.module("module.fraction", [])
	.factory("fractionFactory", function() {
		var fractionFactory = {};

		fractionFactory.toFraction = function(number){
			if(number instanceof Fraction){
				return number;
			}
			/*if(typeof number !== "number"){		
				throw new Error(number + " is not a Number");
			}*/
			return new Fraction(parseInt(number), 1);
		};

		function Fraction(numerator, denominator){
			var numbers;

			if(arguments.length === 1 && typeof numerator === "string"){
				if(numerator.search('/') > -1){
					numbers = numerator.split('/');
					numerator = parseInt(numbers[0]);
					denominator = parseInt(numbers[1]);
				}
			}else if(numerator instanceof Fraction){
				denominator = numerator.denominator;
				numerator = numerator.numerator;
			}

			this.numerator = parseInt(numerator);
			this.denominator = parseInt(denominator || 1);			
		}

		Fraction.prototype.toString = function(){
			if(this.numerator == 0){ return "0"; }
			if(this.numerator == this.denominator){ return "1"; }
			if(this.denominator == 1){ return this.numerator.toString(); }
			return this.numerator + "/" + this.denominator;
		};

		function gcd(a,b){
	    	return b ? gcd(b, a%b) : a;
	  	}

	  	function lcm(a, b) { 
			return ( a / gcd(a,b) ) * b; 
		}

		Fraction.prototype.reduce = function(){
			var numerator = this.numerator,
			 	denominator = this.denominator,
			 	g = Math.abs(gcd(numerator, denominator));

			return new Fraction(numerator/g, denominator/g);
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

			// scm = getSCM(this.denominator, fraction.denominator);
			scm = lcm(this.denominator, fraction.denominator);

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
			
			// scm = getSCM(this.denominator, fraction.denominator);
			scm = lcm(this.denominator, fraction.denominator);
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
			fraction = fractionFactory.toFraction(fraction);
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

		Fraction.prototype.clone = function(){
			return new Fraction(this.numerator, this.denominator);
		};

		/*function getSCM(n1, n2){
			var max = Math.max(n1, n2),
			 	min = Math.min(n1, n2),
			  	i;

			for(i = 1; i <=  min; i++){
				if((max * i) % min === 0){
					return max * i;
				}
			}
			return 0;
		}*/

		

		fractionFactory.Fraction = Fraction;

	  	return fractionFactory;
	});