(function (exports) {
	'use strict';

	var Klass = function EditorSettings (param) {
		this.checkboxes = param.checkboxes;
		this.selectboxes = param.selectboxes;
	};
	var prop = Klass.prototype;

	prop.set = function (key, val) {
		var store = this.storage[Klass.name] || {};
		store[key] = store[key] || {};
		store[key]['value'] = val;
		chrome.storage.local.set(this.storage);
	};
	prop.gets = function () {
		var result = {};
		var get = function (elem) {
			result[elem.id] = {
				'value' : elem.type === 'checkbox' ? !!elem.checked : elem.value
			};
			Object.keys(elem.dataset).forEach(function (key) {
				result[elem.id][key] = elem.dataset[key];
			});
		};
		this.checkboxes.forEach(get);
		this.selectboxes.forEach(get);
		return result;
	};
	prop.sets = function () {
		var store = this.storage[Klass.name] || {};
		var set = function (elem) {
			if (!(elem.id in store)) {
				return;
			}
			var val = (store[elem.id] || {})['value'];
			if (val === undefined) {
				return;
			}
			(elem.type === 'checkbox')
				? elem.checked = !!val
				: elem.value = val
			;
		};
		this.checkboxes.forEach(set);
		this.selectboxes.forEach(set);
	};
	prop.init = function (callback) {
		debugger;
		chrome.storage.local.get(Klass.name, function (storage) {
			this.storage = storage;
			callback();
			if (Object.keys(storage) === 0) {
				storage[Klass.name] = this.gets();
				chrome.storage.local.set(storage);
				return;
			}
			this.sets();
		}.bind(this));
	};

	exports[Klass.name] = Klass;
})(this);
