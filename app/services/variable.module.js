"use strict";

angular.module("module.variable", [])
	.factory("variableFactory", [function(variableFactory) {
		function Varible(options){
			options = options || {};
			this.value = options.value || '';
			this.name = options.name || '';
			this.index = options.index || -1;
		}

	  	return Varible;
	}]);