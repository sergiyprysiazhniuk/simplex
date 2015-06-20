angular.module("module.util", [])

	.factory("utilFactory", function(){
		function clone(obj) {
		    var copy;

		    if (null == obj || "object" != typeof obj) return obj;

		    if(obj.clone){
		    	return obj.clone();	
		    }

		    if (obj instanceof Date) {
		        copy = new Date();
		        copy.setTime(obj.getTime());
		        return copy;
		    }

		    if (obj instanceof Array) {
		        copy = [];
		        for (var i = 0, len = obj.length; i < len; i++) {
		            copy[i] = clone(obj[i]);
		        }
		        return copy;
		    }

		    if (obj instanceof Object) {
		        copy = {};
		        for (var attr in obj) {
		            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		        }
		        return copy;
		    }

		    throw new Error("Unable to copy obj! Its type isn't supported.");
		}

		function template(string, values){
			Object.keys(values).forEach(function(key){
				string = string.replace(new RegExp("{" + key + "}"), values[key].toString());
			});

			return string;
		}

		function generateArray(length, callback){
			var array = [], i;

			for (i = 0; i < length; i++) {
				array.push(callback && callback(array[i], i, array));
			};

			return array;
		}

		return {
			clone: clone,
			template: template,
			generateArray: generateArray
		}
	});