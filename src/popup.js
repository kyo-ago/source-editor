var background;
var currentTab;
var settings;

function onChange (evn) {
	var elem = evn.srcElement;
	var key = elem.id;
	var val = (elem.type === 'checkbox'
		? !!elem.checked
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
function createNewTab () {
	var link = document.createElement('a');
	link.href = 'view-source:' + location.href;
	link.target = '_blank';
	var evn = document.createEvent('MouseEvents');
	evn.initEvent('click', false, true);
	link.dispatchEvent(evn);
}
function onClick (evn) {
	var elem = evn.srcElement;
	var clear_cache = function (sussess) {
		if (!sussess) {
			return;
		}
		chrome.tabs.executeScript(currentTab.id, {
			'code' : 'location.reload();'
		});
	};
	if (elem.tagName.toLowerCase() !== 'button') {
		return;
	}
	if (elem.id === 'ViewSource') {
		chrome.tabs.executeScript(currentTab.id, {
			'code' : '(' + createNewTab + ')()'
		});
		return;
	}
	if (elem.id === 'ClearCache') {
		background.clearCache(currentTab.url, clear_cache);
		return;
	}
	if (elem.id === 'ClearAllCache') {
		background.clearAllCache(clear_cache);
		return;
	}
}
Deferred.parallel({
	'background' : Deferred.connect(chrome.runtime, 'getBackgroundPage')(),
	'settings' : function () {
		var defer = Deferred();
		var checkboxes = document.querySelectorAll('.checkboxes [type="checkbox"]');
		var selectboxes = document.querySelectorAll('.selectboxes select');
		settings = new EditorSettings({
			'checkboxes' : Array.apply([], checkboxes),
			'selectboxes' : Array.apply([], selectboxes)
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
	document.body.addEventListener('click', onClick);
});
