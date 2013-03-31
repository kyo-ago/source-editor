var editor;
if (isSourceView()) {
	Deferred.parallel({
		'loadCode' : sendMessage({
			'command' : 'loadCode',
			'url' : location.href
		}),
		'settings' : sendMessage({
			'command' : 'getSettings'
		})
	}).next(function (params) {
		var loadCode = params.loadCode;
		var settings = params.settings;

		var code_type = (location.href.match(/\.(\w+)$/) || []).pop();
		var div = replaceBodyElement(loadCode.code);
		editor = initEditor(div, code_type.toLowerCase());
		editor.setParams(settings);
	});
}
function sendMessage (param) {
	return Deferred.connect(chrome.extension.sendMessage.bind(chrome.extension, param))();
}
function isSourceView () {
	if (document.querySelectorAll('title, meta').length) {
		return;
	}
	if (document.body.querySelectorAll('*').length !== 1) {
		return;
	}
	return true;
}
function replaceBodyElement (code) {
	var div = document.createElement('div');
	div.textContent = code || document.querySelector('pre').textContent;
	div.style.position = 'absolute';
	div.style.top = div.style.bottom = div.style.right = div.style.left = '0';

	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild);
	}
	document.body.appendChild(div);
	return div;
}
function initEditor (div, type) {
	var editor = new Editor();
	editor.init(ace.edit(div), type);
	editor.onChange(function (code) {
		chrome.extension.sendMessage({
			'command' : 'saveCode',
			'url' : location.href,
			'code' : code
		});
	});
	return editor;
}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.command !== 'changeSetting') {
		return;
	}
	delete request.command;
	editor.setParams(request);
});
 
