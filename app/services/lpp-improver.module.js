"use strict";

angular.module("module.lppImprover", ["module.util", "module.variable", "module.m", "module.simplexMethod"])
	.factory("lppImproverFactory", ["utilFactory", "variableFactory", "mFactory", function(util, Variable, mFactory) {
		
		function getConvenienceLpp(rawData){
			var lpp = util.clone(rawData);

			console.log("getConvenienceLpp", lpp);
		};


	  	return {
	  		getConvenienceLpp: getConvenienceLpp
	  	};
	}]);