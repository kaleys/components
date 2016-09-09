"use strict";

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
	}
};