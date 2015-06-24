angular.module("app")
	
.controller("setModeCtrl",	[
	"$scope",
	"appStateService",

    function($scope, app){
		$scope.setMode = function(mode){
			app.mode = mode;
		};
	}]);