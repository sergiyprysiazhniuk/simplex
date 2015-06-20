angular.module("app")
	
	.controller("trainingCtrl",	[
		"$scope",
		"trainingStateService",
		"utilFactory",
		"appStateService",

	    function($scope, training, util, app){
	    	var m = app.inputData.m,
				n = app.inputData.n;

	    	$scope.trainingSteps = training.trainingSteps;

	    	$scope.actions = [
	    		{
	    			type: "solved",
	    			text: "Отримано розв'язок."
	    		},
	    		{
	    			type: "improvable",
	    			text: "План можна покращити."
	    		},
	    		{
	    			type: "not-limited-top",
	    			text: "Задача немає розв'язку. Функція цілі необмежена ЗВЕРХУ."
	    		},
	    		{
	    			type: "not-limited-bottom",
	    			text: "Задача немає розв'язку. Функція цілі необмежена ЗНИЗУ."
	    		},
	    		{
	    			type: "empty-plural",
	    			text: "Задача не має розв'язку. Множина припустимих роз'язків несумісна."
	    		}
	    	];

	    	$scope.rowIndexes = util.generateArray(m, function(_, index){
				return {index: index};
			});

	    	$scope.colIndexes = util.generateArray(n, function(_, index){
				return {index: index};
			});

	    	// $scope.nextAction;

	    	$scope.confirm = function(){
	    		console.log("step", this);

	    		console.log(training.getActualAction());

	    		// compareBasis();
	    	};

	    	/*$scope.compareBasis = function(actual, expected){

	    	};*/

	    	$scope.setLimitationIndex = function(context, index){
	    		context.limitation = index;
	    	};

	    	$scope.next = function(){
				training.next();
			};	    	
		}]);