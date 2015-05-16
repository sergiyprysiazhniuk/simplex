"use strict";

angular.module("module.variable", [])
	.factory("variableFactory", [function(variableFactory) {
		function Variable(options){
			options = options || {};
			this.value = options.value || '';
			this.name = options.name || '';
			this.index = options.index || -1;
		}

		Variable.prototype.clone = function() {
			var value = this.value.clone ? this.value.clone() : this.value;

			return new Variable({
				value: this.value,
				name: this.name,
				index: this.index
			});
		};

	  	return Variable;
	}]);