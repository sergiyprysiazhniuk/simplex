angular.module("module.appState", ["module.fraction", "module.m"])

	.service("appStateService", ["variableFactory", "mFactory", "simplexMethodFactory", "lppImproverFactory", 
	function(Variable, mFactory, SimplexMethod, lppImprover){
		var M = mFactory.M;

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

		this.solvingSteps = [];

		this.start = function(){
			var sm = new SimplexMethod(lppImprover.getConvenienceLpp(this.inputData));

			this.solvingSteps.push({
				type: "first-simplex-table",
				data: sm.clone()
			});

			while(sm.isImprovable()){
				sm.next();
				this.solvingSteps.push({
					type: "simplex-table",
					data: sm.clone()
				});
			}

			console.log("CLONE", this.solvingSteps);

		}
	}]);