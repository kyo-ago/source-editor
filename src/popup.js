var background;
var currentTab;
var settings;

function onChange (evn) {
	var elem = evn.srcElement;
	var key = elem.id;
	var val = (elem.type === 'checkbox'
		? elem.checked
		: elem.value
	);
	var dataset = elem.dataset;
	var message = {
		'command' : 'changeSetting'
	};
	message[key] = {
		'value' : val
	};
	Object.keys(dataset).forEach(function (data_key) {
		message[key][data_key] = dataset[data_key];
	});
	settings.set(key, val);
	chrome.tabs.sendMessage(currentTab.id, message);
}
Deferred.parallel({
	'background' : Deferred.connect(chrome.runtime, 'getBackgroundPage')(),
	'settings' : function () {
		var defer = Deferred();
		var checkboxes = document.querySelectorAll('.checkboxes [type="checkbox"]');
		settings = new EditorSettings({
			'checkboxes' : Array.apply([], checkboxes)
		});
		settings.init(defer.call.bind(defer, settings));
		return defer;
	},
	'currentTabs' : Deferred.connect(chrome.tabs.query.bind(chrome.tabs, {
		'active' : true,
		'currentWindow' : true
	}))()
}).next(function (params) {
	background = params.background;
	settings = params.settings;
	currentTab = params.currentTabs[0];

	document.body.addEventListener('change', onChange);
});
