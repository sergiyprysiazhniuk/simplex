angular.module("module.appState", ["module.fraction", "module.m"])

	.service("appStateService", ["utilFactory", "variableFactory", "mFactory", "simplexMethodFactory", "lppImproverFactory", 
	function(util, Variable, mFactory, SimplexMethod, lppImprover){
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
			var that = this;

			lppImprover.next();

			var sm = new SimplexMethod(lppImprover.getConvenienceLpp(this.inputData, function(lpp, type){
				that.solvingSteps.push({
					type: type,
					data: util.clone(lpp)
				});
			}));

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