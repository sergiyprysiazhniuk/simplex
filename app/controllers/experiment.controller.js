angular.module("app")

	.controller("experimentCtrl", 
		["$scope",
		 "appStateService",
		 "trainingStateService",
		 "variableFactory",
		 "mFactory",
		 "simplexMethodFactory",
		 "lppImproverFactory",
		 "utilFactory",
	 function($scope, app, training, Variable, mFactory, SimplexMethod, lppImprover, util){
	 	var M = mFactory.M;

	 	function random(from, to){
		    return Math.round(Math.random() * (to - from) + from);
		}

	 	function generateLpp(n, m){
	 		var lpp = {},
	 			signs = ["<", "=", ">"];

	 		lpp.n = n;
	 		lpp.m = m;

			lpp.matrixA = util.generateArray(m, function(array){
				return util.generateArray(n, function(array, index){
					return new Variable({
						name: "x",
						value: new M(random(1, 100)),
						index: index
					})
				});
			});

			lpp.matrixB = util.generateArray(m, function(){
				return new M(random(1, 50));
			});
			lpp.fx = util.generateArray(n, function(array, index){
				return new Variable({
						name: "x",
						value: new M(random(1, 100)),
						index: index
					})
			});
			lpp.signs = util.generateArray(m, function(){
				// var sign = signs[random(0, 2)];

				// console.log(sign);

				return "=";
			});
			lpp.notNegativeConditions = util.generateArray(n, function(){
				return true;
			});

			lpp.extreme = "min";

	 		return lpp;
	 	};

		function solve(inputData){
			var timeStart = Date.now(), timeEnd, i = 0;

			console.log("Start: ", inputData.m, inputData.n);

			var sm = new SimplexMethod(lppImprover.getConvenienceLpp(inputData)),
			 prev, isCycle, timeDiff, status;

			while(sm.isImprovable()){
				prev = sm.anglePoint.value;
				sm.next();
				// console.log("Value: ", sm.anglePoint.value.toString());
				// console.log("LessThanPrev: ", sm.anglePoint.value.lessEqualThan(prev));
				if(!sm.anglePoint.value.lessEqualThan(prev)){
					isCycle = true;
					break;
				}

				i++;
			}

			timeEnd = Date.now();

			timeDiff = (timeEnd - timeStart) / 1000;


			status = !isCycle ? "solved" : "cycle"

			console.log("Solved after: ", timeDiff, "s; Iterations: " + i + "; Status: " + status);
			// console.log(sm);

			return status;
		}


		$scope.startExperiment = function(m, n){
			var lpp, status, solvedCount, cycles = 0;

			for (var i = 1; i <= 50; i++) {
				lpp = generateLpp(m, n);
				status = solve(lpp);

				if(status === "cycle"){
					cycles++;
				}
			};

			console.log("Cycles: ", cycles, "%");
		};

		$scope.start = function(){	
			var lpp;

			for (var i = 2; i <= 200; i++) {
				lpp = generateLpp(i, i);
				solve(lpp);
			};
		};

		$scope.cyclesPercent = function(m, n){
			var lpp, status, solvedCount, cycles = 0;

			for (var i = 1; i <= 100; i++) {
				lpp = generateLpp(m, n);
				status = solve(lpp);

				if(status === "cycle"){
					cycles++;
				}
			};

			console.log("Cycles: ", cycles, "%");
		};
	}]);