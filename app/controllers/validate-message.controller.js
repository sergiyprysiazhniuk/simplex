angular.module("app")
	
.controller("validateMessageCtrl",	[
	"$scope",
	"validateMessageService",

    function($scope, validateMessageService){
    	$scope.message = "";

    	$scope.$on("alert", function(event, message){
    		$scope.message = message;
    		$scope.showAlert = true;
    	});

    	$scope.hideAlert = function(){
    		$scope.showAlert = false;
    	};
	}]);