var utils = {
	debounce (func, wait) {
	    var timeout, args, context, timestamp, result;
	    var later = function () {
	        var last = Date.now() - timestamp;
	        if (last < wait && last >= 0) {
	            timeout = setTimeout(later, wait - last);
	        } else {
	            timeout = null;
	            result = func.apply(context, args);
	            if (!timeout) context = args = null
	        }
	    }
	    return () => {
	        context = this;
	        args = arguments;
	        timestamp = Date.now();
	        if (!timeout) {
	            timeout = setTimeout(later, wait);
	        }
	        return result
	    }
	},
	extend: function(){
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
	ajax: function(opts) {
		var type = (opts.type || 'get').toUpperCase() , xhr, datas = null, url = opts.url;
		xhr = new XMLHttpRequest()
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4) {
				if(xhr.status == 200 || xhr.status==304) {
					opts.success && opts.success(JSON.parse(xhr.responseText))
				}else {
					opts.fail && opts.fail(xhr)
				}
			}
		}
		
		if(opts.data && typeof opts.data === 'object') {
			datas = [];
			for(var key in opts.data) {
				datas.push(key+'='+opts.data[key]);
			}
			datas = datas.join('&');
		}
		if(type==='POST') {
			xhr.setRequestHeader('Content-Type',"application/x-www-form-urlencoded")
		}else {
			url += (url.indexOf('?')===-1 ? '?' : '&') + datas
			datas = ''
		}
		xhr.open(type,url);
		xhr.send(datas);
	}

};