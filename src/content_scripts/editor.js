(function (exports) {
	'use strict';

	var Klass = function Editor () {
		//ace editor object
		this.editor = undefined;
		//'js' or 'css'
		this.type = '';
	};
	var prop = Klass.prototype;

	prop.init = function (editor, type) {
		this.editor = editor;
		this.type = type;
		editor.focus();
		editor.commands.addCommands((new EditorCommands).getAll());
//		session.setMode(type === 'js' ? 'ace/mode/javascript' : 'ace/mode/css');
		var session = editor.getSession();
		session.setUseWrapMode(true);
	};
	prop.setKeyBinding = function (binding) {
		//binding
	};
	prop.setParams = function (params) {
		Object.keys(params).forEach(function (key) {
			var param = params[key];
			if (~['ElasticTabstops', 'TokenTooltip'].indexOf(key)) {
				return;
			}
			var target = this.editor;
			if (param['prop']) {
				target = this.editor[param['prop']];
			}
			if (!target['set' + key]) {
				return;
			}
			target['set' + key](param['value']);
		}.bind(this));
	};
	prop.onChange = function (callback) {
		var throttle;
		var session = this.editor.getSession();
		session.on('change', function (evn) {
			if (throttle) {
				return;
			}
			throttle = setTimeout(function () {
				callback(session.getValue());
				throttle = 0;
			}, 1000)
		});
	};

	exports[Klass.name] = Klass;
})(this);

(function (exports) {
	'use strict';

	var Klass = function EditorCommands () {
	};
	var prop = Klass.prototype;

	prop.get = function (name, key, exec) {
		return {
			'name' : name,
			'bindKey' : {
				'win': 'Ctrl-' + key,
				'mac': 'Command-' + key
			},
			'exec' : exec,
			'readOnly' : true
		}
	};
	prop.getAll = function () {
		var gotoline = this.get('gotoline', 'L', function (editor, line) {
			if (typeof line === 'object') {
				var arg = this.name + ' ' + editor.getCursorPosition().row;
				editor.cmdLine.setValue(arg, 1);
				editor.cmdLine.focus();
				return;
			}
			line = parseInt(line, 10);
			if (!isNaN(line)) {
				editor.gotoLine(line);
			}
		});
		var find = this.get('find', 'F', function (editor, needle) {
			if (typeof needle !== 'object') {
				editor.find(needle);
				return;
			}
			var arg = this.name + ' ' + editor.getCopyText();
			editor.cmdLine.setValue(arg, 1);
			editor.cmdLine.focus();
		});
		return [gotoline, find];
	};

	exports[Klass.name] = Klass;
})(this);
