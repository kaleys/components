'use strict';

(function () {
	/**
  * @param opts {
  *	ele: 初始化元素
  *	datas: [{},{},etc.] 初始化数据,如果有这个配置，那么ajax配置将无效
  *	id:'id', datas里需要传到后台的id名称
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
			this.ele.className = DataGrid.config.clsName;
			this.initTable();
			this.updateData();
			this.initEvent();
		},
		initEvent: function initEvent() {
			var that = this;
			this.ele.addEventListener('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				var target = e.target;
				if (target.name === 'ckb-all') {
					that.clickCheckAll(target);
					return;
				} else if (target.name === 'ckb') {
					that.clickCheckbox(target);
					return;
				}
				if (target.className === 'fa' || target.className.indexOf('sort') !== -1) {
					var th = target.field ? target : target.parentNode;
					that.sortChange(th);
					return;
				}
			});
		},
		initTable: function initTable() {
			var table = document.createElement('table'),
			    thead = table.createTHead().insertRow(0),
			    tbody = document.createElement('tbody'),
			    item = null,
			    cls,
			    index = 0,
			    th;
			table.className = "table table-bordered";
			if (this.checkabled) {
				th = document.createElement('th');
				th.className = 'check-all';
				th.innerHTML = '<input name="ckb-all" type="checkbox"/>';
				index++;
				thead.appendChild(th);
			}
			for (var key in this.thead) {
				cls = '';
				item = this.thead[key];
				if (item.show === false) {
					continue;
				}
				th = document.createElement('th');
				th.field = key;
				item.sort && (cls = 'sort');
				if (this.sort && this.sort.key === key) {
					this.sortTh = th;
					this.sort.dir === 'desc' ? cls += ' sort-desc' : cls += ' sort-asc';
				}
				th.className = cls;
				th.innerHTML = item.label + '<i class="fa"></i>';
				thead.appendChild(th);
				index++;
			}
			th = tbody.insertRow(-1).insertCell(0);
			th.setAttribute('colspan', index);
			th.className = 'data-loading';
			th.innerHTML = '正在加载数据...';
			table.appendChild(tbody);
			this.table ? thie.ele.replaceChild(table, this.table) : this.ele.appendChild(table);
			this.table = table;
		},
		showLoading: function showLoading() {
			var div = document.createElement('div');
			div.className = 'loading';
			this.loadingEle = div;
			this.ele.appendChild(div);
		},
		hideLoading: function hideLoading() {
			this.ele.removeChild(this.loadingEle);
		},
		setTbody: function setTbody(tpl) {
			var div = document.createElement('div');
			div.innerHTML = '<table>' + tpl + '</table>';
			var tbody = this.ele.querySelector('tbody');
			this.table.replaceChild(div.firstChild.firstChild, this.table.tBodies[0]);
		},
		updateData: function updateData() {
			if (this.ajax) {
				this.ajaxForData();
			} else if (this.datas) {
				var tbodyTpl = this.getDataTpl(this.datas);
				this.setTbody(tbodyTpl);
			}
		},
		ajaxForData: function ajaxForData() {
			if (!this.ajax) {
				return false;
			}
			var that = this,
			    ajax = this.ajax,
			    data = {};
			that.showLoading();
			for (var q in this.query) {
				data.q = this.query[q];
			}
			if (this.sort) {
				data.sort = this.sort.key;
				data.sortDir = this.sort.dir;
			}
			utils.ajax({
				url: ajax.url,
				data: data,
				success: function success(data) {
					data = ajax.formatDatas ? ajax.formatDatas(data) : data;
					var tbody = that.getDataTpl(data);
					that.setTbody(tbody);
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
				if (this.checkabled) {
					var id = this.id ? row[this.id] : '';
					tbody += '<td><input name="ckb" type="checkbox" value="' + id + '" /></td>';
				}
				for (key in thead) {
					item = thead[key];
					if (item.show === false) continue;
					value = '';
					if (item.isCustom) {
						value = item.format ? item.format(row, i) : '';
					} else if (item.format) {
						value = item.format(row[key], i);
					} else {
						value = row[key];
					}
					tbody += '<td>' + value + '</td>';
				}
				tbody += '</tr>';
			}
			tbody = "<tbody>" + tbody + "</tbody>";
			return tbody;
		},
		clickCheckAll: function clickCheckAll(target) {
			var status = target.checked,
			    inputs = this.ele.querySelectorAll('input[name="ckb"]');
			for (var i = 0, input; input = inputs[i]; i++) {
				input.checked = status;
			}
		},
		clickCheckbox: function clickCheckbox(target) {
			var checkAll = this.ele.querySelector('input[name="ckb-all"]'),
			    inputs = null,
			    status = target.checked,
			    isAllChecked = true;
			if (status) {
				inputs = this.ele.querySelectorAll('input[name="ckb"]');
				for (var i = 0, input; input = inputs[i]; i++) {
					if (!input.checked) {
						isAllChecked = false;
						break;
					}
				}
				checkAll.checked = isAllChecked;
			} else {
				checkAll.checked = false;
			}
		},
		getCheckedId: function getCheckedId() {
			var inputs = this.ele.querySelectorAll('input[name="ckb"]');
			ids = [];
			for (var i = 0, input; input = inputs[i]; i++) {
				if (input.checked) {
					ids.push(input.value);
				}
			}
			return ids;
		},
		sortChange: function sortChange(target) {
			if (!target) return false;
			var sort = this.sort || {},
			    field = target.field,
			    dir = this.sort.key === field && this.sort.dir === 'desc' ? 'asc' : 'desc';
			sort.key = field;
			sort.dir = dir;
			this.sort = sort;
			if (this.sortTh !== target) {
				this.sortTh.className = 'sort';
				this.sortTh = target;
			}
			target.className = 'sort sort-' + dir;
			this.ajaxForData();
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
		id: 'SellerSKU',
		thead: {
			SellerSKU: {
				label: 'SKU',
				show: true
			},
			ProductName: {
				label: '产品名称',
				format: function format(v) {
					return v.substr(0, 50) + "...";
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
				sort: true,
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
			dir: 'desc'
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