angular.module("module.appState", ["module.fraction", "module.m"])

	.service("appStateService", [function(){
		this.inputData = {
			m: 2,
			n: 2,
			matrixA: null,
			matrixB: null,
			signs: null,
			fx: null,
			notNegativeConditions: null,
			extreme: 'min'
		};
	}]);