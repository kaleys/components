'use strict';

(function () {
	/**
  * @param opts {
  *	ele: 初始化元素
  *	datas: [{},{},etc.] 初始化数据,如果有这个配置，那么ajax配置将无效
  *	thead: {
  *		fieldName1: {
  *			label: '显示的表头',
  *			show: true, 是否显示
  *			sort: true, 该字段是否可以排序
  *			isCustom: false, 该字段是否自定义字段。
  *							 如果是自定义字段，表明该字段是需要其他自段组合而成,
  *							 这个时候format方法里传入的data是一整行的数据。
  *							 如果不是自定义字段，只传入该行中对应的字段数据
  *			//显示化显示的内容，返回一段文字
  *			format: function(data){return string}
  *		}
  *		......
  *	},
  *	
  *	sort: {
  *		field:'filedName1',
  *		dir:'DESC'
  *	},
  *	
  *	query: {
  *		field1:'a',
  *		field1:'b'
  *	},
  *	
  *	page: {
  *		currentPage:1,
  *		totalCount: 1000,
  *		pageSize:10
  *	},
  *
  * 	checkabled: true, 是否可以全选
  *
  * 	ajax: {
  * 		url:'',
  * 		formatDatas: function(){}
  * 	}
  * 	
  * }
  */

	function DataGrid(opts) {
		utils.extend(this, opts);

		if (!this.ele || !this.thead) {
			return false;
		}
		this.ele = document.querySelector(this.ele);
		this.init();
	}
	DataGrid.prototype = {
		constructor: DataGrid,
		init: function init() {
			var thead = this.getThead(),
			    tbody = this.getTbody(true);
			this.ele.className = DataGrid.config.clsName;
			this.ele.innerHTML = '<table class="table table-bordered">' + thead + tbody + '</table>';
		},
		getThead: function getThead() {
			var theadObj = this.thead,
			    key,
			    th,
			    item,
			    thead = '',
			    cls,
			    theadEle,
			    tds = 0;
			if (this.checkabled) {
				thead += '<th class="check-all"><input type="checkbox"/></th>';
				tds += 1;
			}
			for (key in theadObj) {
				cls = "";
				item = theadObj[key];
				if (!item.show) {
					continue;
				}
				tds += 1;
				item.sort && (cls = "sort");
				if (this.sort && this.sort.key === key) {
					this.sort.dir === 'DESC' ? cls += ' sort-desc' : cls += ' sort-asc';
				}
				thead += '<th class="' + cls + '">' + item.label + '<i class="fa"></i></th>';
			}
			thead = "<thead><tr>" + thead + "<tr><thead>";
			this.columns = tds;
			return thead;
		},
		showLoading: function showLoading() {
			var div = document.createElement('div');
			div.className = 'loading';
			this.loadingEle = div;
			this.wrap.appendChild(div);
		},
		hideLoading: function hideLoading() {
			this.wrap.removeChild(this.loadingEle);
		},
		setTbody: function setTbody(tpl) {
			var div = document.createElement('div');
			div.innerHTML = '<table>' + tpl + '</table>';
			var tbody = this.wrap.querySelector('tbody');
			this.ele.replaceChild(div.firstChild, tbody);
		},
		getTBody: function getTBody(init) {
			if (init) {
				return '<tbody><tr><td class="data-loading" colspan="' + this.columns + '">正在加载数据...</td></tr></tbody>';
			}

			if (this.ajax) {
				this.ajaxForData();
			} else if (this.datas) {
				var tbody = this.getDataTpl(this.datas);
			}
		},
		ajaxForData: function ajaxForData() {
			if (!this.ajax) {
				return false;
			}
			var that = this,
			    ajax = this.ajax,
			    data;

			that.showLoading();
			utils.ajax({
				url: ajax.url,
				success: function success(data) {
					data = ajax.formatDatas ? ajax.formatDatas(data) : data;
					var tbody = that.getDataTpl(data);
					that.setTbody();
					that.hideLoading();
				},
				fail: function fail() {
					that.hideLoading();
				}
			});
			return true;
		},
		getDataTpl: function getDataTpl(datas) {
			var thead = this.thead,
			    arr = [],
			    key = null,
			    item = null,
			    value = null,
			    tbody = '';
			for (var i = 0, row; row = datas[i]; i++) {
				tbody += '<tr>';
				for (key in thead) {
					item = thead[key];
					value = '';
					if (item.isCustom) {
						value = item.format ? item.format(row, i) : '';
					} else if (item.format) {
						value = item.format(row[key], i);
					}
					tbody += '<td>' + value + '</td>';
				}
				tbody += '</tr>';
			}
			tbody = "<tbody>" + tbody + "</tbody>";
			return tbody;
		}

	};
	DataGrid.config = {
		clsName: 'datagrid'
	};

	window.DataGrid = DataGrid;

	var aa = new DataGrid({
		ele: "#test1",
		checkabled: true,
		ajax: {
			url: './data/datagrid.json'
		},
		thead: {
			SellerSKU: {
				label: 'SKU',
				show: true
			},
			ProductName: {
				label: '产品名称',
				format: function format(v) {
					return v.subStr(0, 20) + "...";
				},
				show: true
			},
			PerUnitVolume: {
				label: '啥啥',
				show: true,
				sort: true
			},
			Quantity: {
				label: '总数量',
				isCustom: true,
				format: function format(row) {
					return row.TotalSupplyQuantity + row.InStockSupplyQuantity;
				}
			},
			EarliestAvailabilityDateTime: {
				label: '生产日期',
				show: true,
				sort: true,
				format: function format(v) {
					var date = new Date(v);
					return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
				}
			}
		},
		sort: {
			key: 'EarliestAvailabilityDateTime',
			dir: 'DESC'
		},
		query: {
			ProductName: '你好'
		},
		page: {
			currentPage: 1,
			pageSize: 10,
			totalCount: 1000
		}
	});
})();