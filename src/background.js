var response = {};
chrome.storage.local.get('response', function (res) {
	response = (res || {})['response'] || {};
	if (Object.keys(response).length !== 0) {
		addListener();
	}
});
function saveResponse (callback) {
	chrome.storage.local.set({
		'response' : response
	}, callback);
}
function clearCache (url, callback) {
	var sussess = url in response;
	delete response[url];
	saveResponse(callback.bind(this, sussess));
}
function clearAllCache (callback) {
	var sussess = Object.keys(response).length !== 0;
	response = {};
	saveResponse(callback.bind(this, sussess));
}

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
		saveResponse(function () {});
	},
	'loadCode' : function (msg, sender, callback) {
		var res = response[msg.url];
		callback({
			'code' : res ? res.code : ''
		});
	},
	'getSettings' : function (msg, sender, callback) {
		chrome.storage.local.get('EditorSettings', function (store) {
			callback(store['EditorSettings']);
		});
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
