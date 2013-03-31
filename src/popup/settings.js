(function (exports) {
	'use strict';

	var Klass = function EditorSettings (param) {
		this.checkboxes = param.checkboxes;
	};
	var prop = Klass.prototype;

	prop.set = function (key, val) {
		var store = this.storage[Klass.name] || {};
		store[key] = store[key] || {};
		store[key]['value'] = !!val;
		chrome.storage.local.set(this.storage);
	};
	prop.gets = function () {
		var result = {};
		this.checkboxes.forEach(function (chkbox) {
			result[chkbox.id] = {
				'value' : !!chkbox.checked
			};
			Object.keys(chkbox.dataset).forEach(function (key) {
				result[chkbox.id][key] = chkbox.dataset[key];
			});
		}.bind(this));
		return result;
	};
	prop.sets = function () {
		var store = this.storage[Klass.name] || {};
		this.checkboxes.forEach(function (chkbox) {
			if (!store[chkbox.id]) {
				return;
			}
			chkbox.checked = !!store[chkbox.id]['value'];
		}.bind(this));
	};
	prop.init = function (callback) {
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
