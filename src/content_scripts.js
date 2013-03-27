function isSourceView () {
	if (document.querySelectorAll('title, meta').length) {
		return;
	}
	if (document.body.querySelectorAll('*').length !== 1) {
		return;
	}
	return true;
}
function replaceBodyElement () {
	var div = document.createElement('div');
	div.textContent = document.querySelector('pre').textContent;
	div.style.position = 'absolute';
	div.style.top = div.style.bottom = div.style.right = div.style.left = '0';

	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild);
	}
	document.body.appendChild(div);
	return div;
}
function loadScript (url, callback) {
	var scp = document.createElement('script');
	scp.src = url;
	scp.addEventListener('load', callback);
	document.head.appendChild(scp);
}
function initAce (code) {
	var div = replaceBodyElement();
	if (code) {
		div.textContent = code;
	}

	var editor = ace.edit(div);
//	editor.setTheme('ace/theme/monokai');
	var session = editor.getSession();
//	session.setMode('ace/mode/javascript');
	session.setUseWrapMode(true);
	var throttle;
	session.on('change', function (evn) {
		if (throttle) {
			return;
		}
		throttle = setTimeout(function () {
			chrome.extension.sendMessage({
				'command' : 'saveCode',
				'url' : location.href,
				'code' : session.getValue()
			});
			throttle = 0;
		}, 1000)
	});
}
(function () {
	if (!isSourceView()) {
		return;
	}
	chrome.extension.sendMessage({
		'command' : 'loadCode',
		'url' : location.href
	}, function (msg) {
		initAce(msg.code);
	});
})();
