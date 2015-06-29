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

	 	$scope.iterations = [];

	 	function random(from, to){
		    return Math.round(Math.random() * (to - from) + from);
		}

	 	function generateLpp(m, n){
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
				return "<";
			});
			lpp.notNegativeConditions = util.generateArray(n, function(){
				return true;
			});

			lpp.extreme = "min";

	 		return lpp;
	 	};

		function solve(inputData){
			var timeStart = Date.now(), timeEnd, i = 0;

			// console.log("Start: ", inputData.m, inputData.n);

			// console.log("IMPROVED", util.clone(lppImprover.getConvenienceLpp(inputData)));

			var sm = new SimplexMethod(lppImprover.getConvenienceLpp(inputData)),
			 prev, isCycle, timeDiff, status;

			 // console.log(sm.clone());

			while(sm.isImprovable()){
				// prev = util.clone(sm.anglePoint.value);
				sm.next();
				if(sm.anglePoint.value.moreThan(prev)){
					// console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
					// console.log(sm.clone());
					// console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
					isCycle = true;
					break;
				}

				i++;
			}

			timeEnd = Date.now();

			timeDiff = (timeEnd - timeStart);

			status = !isCycle ? "solved" : "cycle"

			console.log("Solved after: ", timeDiff / 1000, "s; Iterations: " + i + "; Status: " + status);
			console.log(sm);

			return {
				status: status,
				time: timeDiff
			};
		}


		/*$scope.startExperiment = function(m, n){
			var lpp, status, solvedCount, cycles = 0;

			for (var i = 1; i <= 50; i++) {
				lpp = generateLpp(m, n);
				status = solve(lpp);

				if(status === "cycle"){
					cycles++;
				}
			};

			console.log("Cycles: ", cycles, "%");
		};*/

		$scope.start = function(min, max, count){	

			console.log(min, max, count);


			var lpp, result, cycles = 0, time = 0;

			for (var i = min; i <= max; i+=2) {
				cycles = 0, time = 0;
				for (var j = 1; j <= count; j++) {
					lpp = generateLpp(20, i);
					result = solve(lpp);

					if(result.status === "cycle"){
						cycles++;						
					}else{
						time += result.time;
					}
				};		

				$scope.iterations.push({
						size: "20x" + i,
						time: parseFloat(((time / (count - cycles)) / 1000).toFixed(5)),
						cycles: (cycles / count) * 100
					});		
			};

			/*var lpp;

			for (var i = 2; i <= 200; i++) {
				lpp = generateLpp(i, i);
				solve(lpp);
			};*/
		};

		/*$scope.cyclesPercent = function(m, n){
			var lpp, status, solvedCount, cycles = 0;

			for (var i = 1; i <= 100; i++) {
				lpp = generateLpp(m, n);
				status = solve(lpp);

				if(status === "cycle"){
					cycles++;
				}
			};

			console.log("Cycles: ", cycles, "%");
		};*/
	}]);