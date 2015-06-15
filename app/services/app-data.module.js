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
		this.improvementSteps = [];

		this.recalculateTable = function(sm){

		};

		this.generateTables = function(sm){
			while(sm.isImprovable()){
				sm.next();
				this.solvingSteps.push({
					type: "simplex-table",
					data: sm.clone()
				});
			}
		};

		this.solve = function(inputData){
			var that = this,
				sm = new SimplexMethod(lppImprover.getConvenienceLpp(inputData, function(lpp, type){
					that.improvementSteps.push({
						type: type,
						data: util.clone(lpp)
					});
				}));

			this.solvingSteps.push({
				type: "first-simplex-table",
				data: sm.clone()
			});

			this.generateTables(sm);
		};

		this.start = function(){
			this.solve(this.inputData);

			console.log("improvementSteps", this.improvementSteps);
			console.log("solvingSteps", this.solvingSteps);
		}
	}]);