var response = {};
var enableTab = {};
chrome.extension.onMessage.addListener(function (msg) {
	if (msg.command !== 'saveCode') {
		return;
	}
	response[msg.url] = {
		'code' : 'data:text/javascript,' + msg.code
	};
});
chrome.tabs.onRemoved.addListener(function (tabId) {
	delete enableTab[tabId];
});
chrome.tabs.onActivated.addListener(function(info) {
	setBadgeText(enableTab[info.tabId]);
});
function callPopup () {
	chrome.tabs.query({
		'active' : true,
		'currentWindow' : true
	}, function (tabs) {
		var id = tabs[0].id;
		enableTab[id] = !enableTab[id];
		setBadgeText(enableTab[id]);
	});
}
function setBadgeText (enable) {
	chrome.browserAction.setBadgeText({
		'text' : enable ? '        ' : ''
	});
}

chrome.webRequest.onBeforeRequest.addListener(function(details) {
	var res = response[details.url];
	if (!res) {
		return;
	}
	if (!enableTab[details.tabId]) {
		return;
	}
	return {
		'redirectUrl' : res.code
	};
}, {
	'urls' : [
		'http://*/*.js', 'https://*/*.js',
		'http://*/*.css', 'https://*/*.css'
	]
}, [
	'blocking'
]);
