angular.module("module.trainingState", ["module.fraction", "module.m"])

	.service("trainingStateService", [
		"utilFactory",
		"variableFactory", 
		"mFactory", 
		"simplexMethodFactory", 
		"lppImproverFactory", 
		"resultAnalyzerFactory",
		"appStateService",
	function(util, Variable, mFactory, SimplexMethod, lppImprover, resultAnalyzer, app){
		var M = mFactory.M;

		this.trainingSteps = [];
		this.simplexTables = [];
		// this.currentSimplexTable;

		this.next = function(){
			var step = {
				type: "simplex-table",
				data: {}
			},
			sm = this.simplexTables[this.simplexTables.length - 1];

			step.data.lpp = generateEmptyLpp(app.inputData.m, app.inputData.n);
			step.data.solvingElement = {};
			step.data.anglePoint = {};
			step.data.anglePoint.vector = util.generateArray(app.inputData.n, function(){
				return null;
			});
			step.variables = step.data.lpp.fx.map(function(variable, index){
				return {
					name: variable.name,
					displayName: variable.name + (variable.index + 1),
					index: variable.index
				};
			});

			step.data.basis = step.variables.filter(function(item, index){
				return index < app.inputData.m;
			}).map(function(item, index){
				item.limitation = index;
				return item;
			});


			this.trainingSteps.push(step);
			sm.next()
			this.simplexTables.push(sm.clone());
			// console.log("UUUUU", this.simplexTables[this.simplexTables.length - 1]);


			console.log("app--trainingState", this);		

			console.log(this);	
		};

		this.compareAction = function(actual, expected){
			
    	};

    	this.getActualAction = function(){
    		var currentSimplexTable = this.simplexTables[this.simplexTables.length - 1],
    		action;

    		if(hasResult(currentSimplexTable.lpp)){
    			return "solved";
    		}
    		if(currentSimplexTable.isImprovable()){
				return "improvable";
    		}

    		return "not-limited-bottom";
    	};

    	function hasResult(lpp){
			return lpp.matrixC.every(function(item){
				return item.lessEqualThan(0);
			});
		}

		this.compareTables = function(actual, expected){

    	};

    	this.compareBasis = function(actual, expected){

    	};

    	this.compareSolvingElement = function(actual, expected){

    	};

		function generateEmptyLpp(m, n){
			var lpp = {};

			lpp.matrixA = util.generateArray(m, function(array){
				return util.generateArray(n, function(array, index){
					return new Variable({
						name: "x",
						value: 0,
						index: index
					})
				});
			});

			lpp.matrixB = util.generateArray(m, function(){
				return "";
			});

			lpp.matrixC = util.generateArray(n, function(){
				return "";
			});

			lpp.fx = util.generateArray(n, function(array, index){
				return new Variable({
						name: "x",
						value: 0,
						index: index
					})
			});

			return lpp;
		}

		this.start = function(){
			var step = {
				type: "first-simplex-table",
				data: {}
			};

			step.data.lpp = generateEmptyLpp(app.inputData.m, app.inputData.n);
			step.data.solvingElement = {};
			step.data.anglePoint = {};
			step.data.anglePoint.vector = util.generateArray(app.inputData.n, function(){
				return null;
			});
			
			step.variables = step.data.lpp.fx.map(function(variable, index){
				return {
					name: variable.name,
					displayName: variable.name + (variable.index + 1),
					index: variable.index
				};
			});

			step.data.basis = step.variables.filter(function(item, index){
				return index < app.inputData.m;
			}).map(function(item, index){
				item.limitation = index;
				return item;
			});


			this.trainingSteps.push(step);
			this.simplexTables.push(new SimplexMethod(app.inputData));



			console.log("app--trainingState", this);		

			console.log(this);		
		};
	}]);