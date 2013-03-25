var response = {};
chrome.extension.onMessage.addListener(function (msg) {
	if (msg.command !== 'saveCode') {
		return;
	}
	chrome.tabs.query({
		'active' : true,
		'currentWindow' : true
	}, function (tabs) {
		response[msg.url] = {
			'code' : msg.code,
			'tabId' : tabs[0].id
		};
	});
});
chrome.webRequest.onBeforeRequest.addListener(function(details) {
	var res = response[details.url];
	if (!res) {
		return;
	}
	if (res.tabId === details.tabId) {
		return;
	}
	return {
		'redirectUrl' : 'data:text/javascript,' + res.code
	};
}, {
	'urls' : [
		'http://*/*.js', 'https://*/*.js',
		'http://*/*.css', 'https://*/*.css'
	]
}, [
	'blocking'
]);
