"use strict";

angular.module("module.variable", ["module.util"])
	.factory("variableFactory", ["utilFactory", function(util) {
		function Variable(options){
			options = options || {};
			Object.keys(options).forEach(function(key){
				this[key] = options[key];
			}, this);

			this.value = options.value || '';
			this.name = options.name || '';
			this.index = options.index != null ? options.index : -1;
			this.replacedIndex = options.replacedIndex != null ? options.replacedIndex : -1;
		}

		Variable.prototype.clone = function() {
			var options = {};

			Object.keys(this).forEach(function(key){
				options[key] = this[key];
			},this);

			return new Variable(util.clone(options));
		};

	  	return Variable;
	}]);