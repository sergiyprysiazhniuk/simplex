var start = angular.module("module.start", ["module.fraction", "module.m"]);

start
	.controller("startCtrl", ["fractionFactory", "mFactory", function (Fraction, M) {
		var f1 = new Fraction("-1/2"),
			f2 = new Fraction("2/3"),

			m1 = new M("m - 2/3"),

			m2 = new M("1/3");

			// console.log(m1.moreThan("2m + 1/2"));
			console.log(m1.lessEqualThan("2m + 1/2"));
			console.log(m1.moreEqualThan("2m + 1/2"));
			console.log(m1.toString());

			// console.log(new M("- 4/5 "));
	}]);