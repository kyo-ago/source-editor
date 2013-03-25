(function () {
	if (document.querySelectorAll('title, meta').length) {
		return;
	}
	if (document.body.querySelectorAll('*').length !== 1) {
		return;
	}
	var div = document.createElement('div');
	div.textContent = document.querySelector('pre').textContent;
	div.style.position = 'absolute';
	div.style.top = div.style.bottom = div.style.right = div.style.left = '0';

	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild);
	}
	document.body.appendChild(div);

	var editor = ace.edit(div);
//	editor.setTheme('ace/theme/monokai');
	var session = editor.getSession();
//	session.setMode('ace/mode/javascript');
	session.setUseWrapMode(true);

	setInterval(function () {
		chrome.extension.sendMessage({
			'command' : 'saveCode',
			'url' : location.href,
			'code' : session.getValue()
		});
	}, 10000);
})()
