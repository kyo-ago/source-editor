var response = {};
var enableTab = {};
var messages = {
	'saveCode' : function (msg, sender, callback) {
		var scheme = msg.url.match(/\.js$/i)
			? 'data:text/javascript,'
			: 'data:text/css,'
		;
		response[msg.url] = {
			'scheme' : scheme,
			'code' : msg.code
		};
	},
	'loadCode' : function (msg, sender, callback) {
		var res = response[msg.url];
		callback({
			'code' : res ? res.code : ''
		});
	}
}
chrome.extension.onMessage.addListener(function (msg, sender, callback) {
	return messages[msg.command] && messages[msg.command](msg, sender, callback);
});
chrome.tabs.onRemoved.addListener(function (tabId) {
	delete enableTab[tabId];
});
chrome.tabs.onActivated.addListener(function(info) {
	toggleBadgeText(enableTab[info.tabId]);
});
function callPopup () {
	chrome.tabs.query({
		'active' : true,
		'currentWindow' : true
	}, function (tabs) {
		var id = tabs[0].id;
		enableTab[id] = !enableTab[id];
		toggleBadgeText(enableTab[id]);
	});
}
function toggleBadgeText (enable) {
	chrome.browserAction.setBadgeText({
		'text' : enable ? '        ' : ''
	});
}
chrome.webRequest.onBeforeRequest.addListener(function (details) {
	var res = response[details.url];
	if (!res) {
		return;
	}
	if (!enableTab[details.tabId]) {
		return;
	}
	return {
		'redirectUrl' : res.scheme + res.code
	};
}, {
	'urls' : [
		'http://*/*.js', 'https://*/*.js',
		'http://*/*.css', 'https://*/*.css'
	],
	'types' : ['script', 'stylesheet']
}, [
	'blocking'
]);
