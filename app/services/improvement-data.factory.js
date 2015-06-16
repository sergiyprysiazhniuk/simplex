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
					message: "Перевіряємо чи всі вільні члени є невід'ємними.  У нашому виладку - ні"
				},
				{
					step: "limitations-less-equal",
					type: "general",
					improved: false,
					message: "Перевіряємо чи є в системі  нерівності типу \"≤\"."
				},
				{
					step: "add-additional-variables-less-equal-limitations",
					improved: false,
					message: "Додаємо до лівої частини кожної з них додаткові змінні. Маємо систему обмежень:"
				},
				{
					step: "equations",
					type: "general",
					improved: false,
					message: "Перевіряємо чи є в системі рівняння для яких не встановлені базисні змінні."
				},
				{
					step: "add-fake-variables-equations",					
					improved: false,
					message: "Додаємо штучні змінні:"
				},
				{
					step: "limitations-more-equal",
					type: "general",
					improved: false,
					message: "Перевіряємо чи є в системі  нерівності типу \"≥\"."
				},
				{
					step: "subtract-additional-variables-limitations-more-equal",
					improved: false,
					message: "Віднімаємо додаткові змінні."
				},
				{
					step: "subtract-equations-limitations-more-equal",
					improved: false,
					message: "Від рівняння з максимальним вільним членом (поміченого) віднімаємо всі інші рівняння:"
				},
				{
					step: "add-fake-variable-limitations-more-equal",
					improved: false,
					message: "До лівої частини поміченого рівняння додаємо штучну змінну:"
				},
				{
					step: "limitations-more-equal-and-equal",
					type: "general",
					improved: false,
					message: "Перевіряємо чи є в системі  нерівності типу \"≥\" та \"=\"."
				},

				{
					step: "divide-limitations-more-and-equal",
					improved: false,
					message: "Порівнюємо вільні члени всіх нерівностей порівнюємо з вільним членом поміченого рівняння. Ділимо обидві частини нерівності:"
				},
				{
					step: "subtract-equations-more-and-equal",
					improved: false,
					message: "Від поміченого рівняння віднімаємо кожне з рівнянь, отриманих з нерівностей:"
				},
				{
					step: "subtract-additional-variables-more-and-equal",
					improved: false,
					message: "Від лівої частини кожної з нерівностей віднімаємо додаткові змінні:"
				},
				{
					step: "add-fake-variables-more-and-equal",
					improved: false,
					message: "Додаємо штучні змінні:"
				},
				{
					step: "replace-variables",
					improved: false,
					message: "Використовуємо перетворення для змінних, на які не накладена умова невід'ємності:"
				},
				{
					step: "final-goal-function",
					improved: false,
					message: "Функція цілі:"
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