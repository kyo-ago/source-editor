var response = {};
chrome.storage.local.get('response', function (res) {
	response = res;
	if (Object.keys(response).length !== 0) {
		addListener();
	}
});

var messages = {
	'saveCode' : function (msg, sender, callback) {
		if (Object.keys(response).length === 0) {
			removeListener();
			addListener();
		}
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
	},
	'getSettings' : function (msg, sender, callback) {
		chrome.storage.local.get('EditorSettings', callback);
		return true;
	}
};
chrome.extension.onMessage.addListener(function (msg, sender, callback) {
	return messages[msg.command] && messages[msg.command](msg, sender, callback);
});
function addListener () {
	chrome.webRequest.onBeforeRequest.addListener(beforeRequestListener, {
		'urls' : [
			'http://*/*.js', 'https://*/*.js',
			'http://*/*.css', 'https://*/*.css'
		],
		'types' : ['script', 'stylesheet']
	}, [
		'blocking'
	]);
}
function removeListener () {
	chrome.webRequest.onBeforeRequest.removeListener(beforeRequestListener);
}
function beforeRequestListener (details) {
	var res = response[details.url];
	if (!res) {
		return;
	}
	return {
		'redirectUrl' : res.scheme + res.code
	};
}
