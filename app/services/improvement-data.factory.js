angular.module("module.lppImprover", ["module.util", "module.variable", "module.m", "module.simplexMethod"])

	.factory("improvementStateFactory", function(){
		return {
			improveScheme: [
				{
					step: "minimize-goal-function",
					improved: false,
					message: "Перевіряємо чи мінімізується функція цілі. У нашому виладку вона максимізується, тому домножимо її на -1"
				},
				{
					step: "all-free-members-not-negative",
					improved: false,
					message: "Перевіряємо чи всі вільні члени є невід'ємними"
				},
				{
					step: "limitations-less-equal",
					type: "general",
					improved: false,
					message: "limitationsLessEqual"
				},
				{
					step: "add-additional-variables-less-equal-limitations",
					improved: false,
					message: "addAdditionalVariables"
				},
				{
					step: "equations",
					type: "general",
					improved: false,
					message: "equations"
				},
				{
					step: "add-fake-variables-equations",					
					improved: false,
					message: "addFakeVariables"
				},
				{
					step: "limitations-more-equal",
					type: "general",
					improved: false,
					message: "limitationsMoreEqual"
				},
				{
					step: "subtract-additional-variables-limitations-more-equal",
					improved: false,
					message: "subtractAdditionalVariables"
				},
				{
					step: "subtract-equations-limitations-more-equal",
					improved: false,
					message: "subtractEquations"
				},
				{
					step: "add-fake-variable-limitations-more-equal",
					improved: false,
					message: "addFakeVariable"
				},
				{
					step: "limitations-more-equal-and-equal",
					type: "general",
					improved: false,
					message: "limitations-more-equal-and-equal"
				},

				{
					step: "divide-limitations-more-and-equal",
					improved: false,
					message: "divideLimitations"
				},
				{
					step: "subtract-equations-more-and-equal",
					improved: false,
					message: "subtractEquations"
				},
				{
					step: "subtract-additional-variables-more-and-equal",
					improved: false,
					message: "subtractAdditionalVariables"
				},
				{
					step: "add-fake-variables-more-and-equal",
					improved: false,
					message: "addFakeVariables"
				},
				{
					step: "replace-variables",
					improved: false,
					message: "replaceVariables"
				}
			],
			getStepData: function(step){
				/*console.log("getStepData", this);*/
				return this.improveScheme.filter(function(item){
					return item.step === step;
				})[0];
			}
		}
	});