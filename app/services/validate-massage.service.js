angular.module("app")

.service("validateMessageService",	["$rootScope", function($rootScope){
	this.alert = function(message){
		$rootScope.$broadcast("alert", message);
	};
}]);