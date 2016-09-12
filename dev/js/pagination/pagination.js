'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function () {
	function extend() {
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
	}

	var loop = function loop() {},
	    defaults = {
		ele: document.body,
		totalCount: 1000,
		currentPage: 1,
		pageSize: 10,
		showItems: 5,
		prevText: '上一页',
		nextText: '下一页',
		onPageClick: loop,
		perPageFormat: '每页显示%pageSize%条数据',
		ajax: true,
		edges: 1
	};
	function Pagination(options) {
		extend(this, defaults, options || {});
		this.showItems = this.showItems % 2 === 0 ? this.showItems + 1 : this.showItems;
		this.init();
	}

	Pagination.prototype = {
		constructor: Pagination,

		init: function init() {
			var wrap = document.createElement('div');
			wrap.className = Pagination.configs.clsName;
			var perPageWrap = document.createElement('div');
			perPageWrap.className = 'bi-perpage';
			var pagesWrap = document.createElement('div');
			pagesWrap.className = 'bi-pages';
			wrap.appendChild(perPageWrap);
			wrap.appendChild(pagesWrap);
			this.ele.appendChild(wrap);
			this.wrap = wrap;
			this.initPerPageTpl();
			this.setPageTpl();
			this.initEvent();
		},
		initEvent: function initEvent() {
			var that = this;
			this.wrap.addEventListener('click', function (e) {
				var target = e.target,
				    pageNum = target.getAttribute('data-page');
				if (that.loading) return false;
				if (target.className.indexOf('disabled') !== -1 || !pageNum || pageNum === 'etc') return false;
				switch (pageNum) {
					case 'prev':
						that.prev(e);
						break;
					case 'next':
						that.next(e);
						break;
					default:
						that.jumpPage(parseInt(pageNum, 10), e);
						break;
				}
				e.preventDefault();
				e.stopPropagation();
			});
			this.perPageSelect.onchange = function (e) {
				if (that.loading) {
					that.perPageSelect.value = that.pageSize;
					return false;
				}
				var value = this.value;
				if (value == that.pageSize) return false;
				that.pageSize = value;
				that.setPageTpl();
			};
		},
		initPerPageTpl: function initPerPageTpl() {
			var format = this.perPageFormat,
			    parent = this.wrap.querySelector('.bi-perpage'),
			    pageSize = this.pageSize,
			    item = null,
			    options = [10, 20, 50, 100],
			    i = 0,
			    selector = document.createElement('select'),
			    selected = '';

			for (; i < options.length; i++) {
				var option = document.createElement('option');
				item = options[i];
				selected = item === pageSize ? ' selected' : '';
				option.value = item;
				option.innerHTML = item;
				if (item === pageSize) option.selected = true;
				selector.add(option);
			}

			parent.innerHTML = format.replace(/%([a-z]+)%/gi, "<!--$1-->");
			var childNode = parent.childNodes;
			parent.insertBefore(selector, childNode[1]);
			parent.removeChild(childNode[2]);
			this.perPageSelect = selector;
		},
		next: function next(event) {
			if (this.currentPage === this.pageCount) return false;
			this.jumpPage(this.currentPage + 1, event);
		},
		prev: function prev(event) {
			if (this.currentPage === 1) return false;
			this.jumpPage(this.currentPage - 1, event);
		},
		jumpPage: function jumpPage(page, event) {
			this.setPageTpl(page);
			if (this.ajax) {
				this.loading = true;
				this.wrap.className += ' bi-p-loading';
				this.onPageClick.call(null, this.currentPage, event, this.ajaxComplete());
			} else {
				this.onPageClick.call(null, this.currentPage, event);
			}
		},

		ajaxComplete: function ajaxComplete() {
			var that = this;
			return function () {
				that.wrap.className = that.wrap.className.replace(' bi-p-loading', '');
				delete that.loading;
			};
		},

		setPageTpl: function setPageTpl(page) {
			var pages = this.getShowPage(page),
			    wrap = this.wrap.querySelector('.bi-pages'),
			    tpl = '',
			    i = 0,
			    len = pages.length,
			    firstDis = this.currentPage == 1 ? 'class="disabled"' : '',
			    lastDis = this.currentPage == this.pageCount ? 'class="disabled"' : '';

			tpl += '<a data-page="prev" ' + firstDis + '>' + this.prevText + '</a>';
			for (; i < len; i++) {
				var item = pages[i] === 'etc' ? '...' : pages[i],
				    cls = pages[i] == this.currentPage ? 'class="active"' : '';
				tpl += '<a ' + cls + ' data-page="' + pages[i] + '">' + item + '</a>';
			}
			tpl += '<a data-page="next" ' + lastDis + '>' + this.nextText + '</a>';
			wrap.innerHTML = tpl;
		},
		getShowPage: function getShowPage(page) {
			var pageCount = this.pageCount = Math.ceil(this.totalCount / this.pageSize),
			    showPageCount = this.edges * 2 + this.showItems,
			    page = page || this.currentPage,
			    startPage,
			    endPage,
			    pages = [];
			page = this.currentPage = Math.max(Math.min(pageCount, page), 1);
			if (showPageCount >= pageCount) {
				startPage = 1;
				endPage = pageCount;
			} else {
				var paddingPage = Math.floor(this.showItems / 2);
				startPage = Math.max(page - paddingPage, this.edges + 1);
				endPage = startPage + this.showItems - 1;
				if (endPage >= pageCount - this.edges) {
					endPage = pageCount - this.edges;
					startPage = endPage - this.showItems + 1;
				}
			}
			if (startPage > this.edges + 1) {
				pages.push('etc');
			}

			while (startPage <= endPage) {
				pages.push(startPage);
				startPage++;
			}

			if (endPage < pageCount - this.edges) {
				pages.push('etc');
			}

			for (var i = this.edges; i > 0; i--) {
				pages.unshift(i);
				pages.push(pageCount - i + 1);
			}
			return pages;
		}
	};

	Pagination.configs = {
		clsName: 'bi-pagination'
	};

	window.Pagination = Pagination;

	var aa = new Pagination({
		onPageClick: function onPageClick(currentPage, event, callback) {
			console.log('正在请求数据', arguments);
			setTimeout(function () {
				console.log(11111);
				callback();
			}, 2000);
		}
	});
})();