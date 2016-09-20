'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var utils = {
	debounce: function debounce(func, wait) {
		var _this = this,
		    _arguments = arguments;

		var timeout, args, context, timestamp, result;
		var later = function later() {
			var last = Date.now() - timestamp;
			if (last < wait && last >= 0) {
				timeout = setTimeout(later, wait - last);
			} else {
				timeout = null;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			}
		};
		return function () {
			context = _this;
			args = _arguments;
			timestamp = Date.now();
			if (!timeout) {
				timeout = setTimeout(later, wait);
			}
			return result;
		};
	},

	extend: function extend() {
		var options,
		    name,
		    src,
		    copy,
		    target = arguments[0] || {},
		    i = 1,
		    length = arguments.length;
		// Handle case when target is a string or something (possible in deep copy)
		if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== "object" && Object.prototype.toString.call(target) === '[object Functon]') {
			target = {};
		}
		for (; i < length; i++) {
			// Only deal with non-null/undefined values
			if ((options = arguments[i]) != null) {
				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];
					if (target === copy) {
						continue;
					}
					target[name] = copy;
				}
			}
		}
		return target;
	},
	ajax: function ajax(opts) {
		var type = (opts.type || 'get').toUpperCase(),
		    xhr,
		    datas = null,
		    url = opts.url;
		xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status == 200 || xhr.status == 304) {
					opts.success && opts.success(JSON.parse(xhr.responseText));
				} else {
					opts.fail && opts.fail(xhr);
				}
			}
		};

		if (opts.data && _typeof2(opts.data) === 'object') {
			datas = [];
			for (var key in opts.data) {
				datas.push(key + '=' + opts.data[key]);
			}
			datas = datas.join('&');
		}
		if (type === 'GET') {

			url += (url.indexOf('?') === -1 ? '?' : '&') + datas;
			datas = '';
		}
		xhr.open(type, url);
		if (type === 'POST') {
			xhr.setRequestHeader('Content-Type', "application/x-www-form-urlencoded");
			xhr.setRequestHeader('token', '1e4557777b6d42a0af5ea405993c34f6');
		}
		xhr.send(datas);
	}

};