angular.module("module.appState", ["module.fraction", "module.m"])

	.service("appStateService", [
		"utilFactory",
		"variableFactory", 
		"mFactory", 
		"simplexMethodFactory", 
		"lppImproverFactory", 
		"resultAnalyzerFactory",
	function(util, Variable, mFactory, SimplexMethod, lppImprover, resultAnalyzer){
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
		this.resultSteps = [];

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
				})),
				resultSteps;

			this.solvingSteps.push({
				type: "first-simplex-table",
				data: sm.clone()
			});

			this.generateTables(sm);

			console.log("SOLVE");

			this.updateResultSteps();
		};

		this.updateResultSteps = function(){
			var resultSteps = resultAnalyzer.getResultSteps(this.solvingSteps[this.solvingSteps.length - 1].data);

			console.log("updateResultSteps");

			this.resultSteps.splice(0);

			resultSteps.forEach(function(step){
				this.resultSteps.push(step);
			}, this);
		};

		this.start = function(){
			this.solve(this.inputData);

			console.log("improvementSteps", this.improvementSteps);
			console.log("solvingSteps", this.solvingSteps);
			console.log("this.resultSteps", this.resultSteps);
		}
	}]);