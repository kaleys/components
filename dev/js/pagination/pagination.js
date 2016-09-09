'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
  var _defaults;

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
      defaults = (_defaults = {
    totalCount: 100,
    currentPage: 1,
    pageSize: 5,
    prevText: '上一页',
    nextText: '下一页',
    firstText: '首页'
  }, _defineProperty(_defaults, 'nextText', '尾页'), _defineProperty(_defaults, 'onPageClick', loop), _defaults);
  function Pagination(options) {
    extend(this, defaults, options || {});
    this.init();
  }

  Pagination.prototype = {
    constructor: Pagination,

    init: function init() {
      return this;
    },
    initEvent: function (_initEvent) {
      function initEvent() {
        return _initEvent.apply(this, arguments);
      }

      initEvent.toString = function () {
        return _initEvent.toString();
      };

      return initEvent;
    }(function () {
      console.log(initEvent);
    }),
    setCurrentPage: function setCurrentPage(page) {},
    nextPage: function nextPage() {},
    prevPage: function prevPage() {},
    goPage: function goPage() {},
    getPageTpl: function getPageTpl(page) {
      var pageCount = Math.ceil(this.totalCount / this.pageSize),
          page = Math.max(Math.min(pageCount, page), 0);
    }
  };
  Pagination.configs = {
    clsName: 'pagination'
  };

  window.pagination = pagination;
});