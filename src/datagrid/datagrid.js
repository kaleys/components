(function(){
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
	 *			format: function(data){return string},
	 *			//对应列点击回调函数，比如编辑删除
	 *			onClick: function(row,target){},
	 *			//初始化时需要调用的函数，比如td里是一个组件，可以在这里进行初始化。
	 *			init: function(td,v){
	 *			}
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
		utils.extend(this,opts)

		if(!this.ele||!this.thead) {
			return false;
		}
		this.ele = document.querySelector(this.ele)
		this.inits = []
		this.init()
		
	}
	DataGrid.prototype = {
		constructor: DataGrid
		,init: function(){
			this.ele.className = DataGrid.config.clsName
			this.initTable()
			this.updateData()
			this.initPagination()
			this.initEvent()
		}
		,initEvent: function(){
			var that = this
			this.table.addEventListener('click',function(e){
				var target = e.target,td,tempNode,fn
				if(target.name==='ckb-all') {
					that.clickCheckAll(target,e)
					return false
				}else if(target.name==='ckb') {
					that.clickCheckbox(target,e)
					return false
				}
				if(target.className==='fa'||target.className.indexOf('sort')!==-1) {
					var th = target.field ? target : target.parentNode
					that.sortChange(th,e)
					return false
				}
				if(target.nodeName === 'TD') {
					td = target
				}else {
					tempNode = target.parentNode
					while(tempNode && tempNode.nodeName!=='TR') {
						if(tempNode.nodeName === 'TD'){
							td = tempNode
							break;
						}
						tempNode = tempNode.parentNode
					}
				}
				if(td&&td.field&&(fn=that.thead[td.field].onClick)) {
					fn.call(that,that.datas[td.index],target)
					return false;
				}
			})
		}
		,initTable: function(){
			var table = document.createElement('table'),
				thead = table.createTHead().insertRow(0),
				tbody = document.createElement('tbody'),
				item = null, cls, index = 0,th
			table.className = "table table-bordered"
			if(this.checkabled) {
				th = document.createElement('th')
				th.className = 'check-all'
				th.innerHTML = '<input name="ckb-all" type="checkbox"/>'
				index++
				thead.appendChild(th);
			}
			for(var key in this.thead) {
				cls = ''
				item = this.thead[key]
				if(item.show===false) {
					continue
				}
				th = document.createElement('th')
				th.field = key
				item.sort&&(cls = 'sort')
				if(this.sort&&this.sort.key === key) {
					this.sortTh = th
					this.sort.dir==='desc' ? cls +=' sort-desc' : cls +=' sort-asc'
				}
				th.className = cls
				th.innerHTML = item.label + '<i class="fa"></i>'
				thead.appendChild(th);
				index++
			}
			th = tbody.insertRow(-1).insertCell(0)
			th.setAttribute('colspan',index)
			th.className = 'data-loading'
			th.innerHTML = '正在加载数据...'
			table.appendChild(tbody)
			this.table ? this.ele.replaceChild(table,this.table)
					   : this.ele.appendChild(table)
			this.table = table
		}
		,initPagination: function(){
			var that = this
			var opts = utils.extend({
				ele: this.ele,
				onPageClick: function(currentPage,event,callback) {
					that.ajaxForData(function(){
						callback()
					})
				}
			},this.page)
			this.pagination = new Pagination(opts)
		}
		,showLoading: function(){
			var div = document.createElement('div')
			div.className = 'loading'
			this.loadingEle = div
			this.ele.appendChild(div)
		}
		,hideLoading: function(){
			this.ele.removeChild(this.loadingEle)
		}
		,setTbody: function(tbody){
			var table = document.createElement('table')
			table.appendChild(tbody)
			this.table.replaceChild(table.tBodies[0], this.table.tBodies[0])

			while(this.inits.length) {

				this.inits.shift()()
			}
		}
		,updateData: function(){
			if(this.ajax) {
				this.ajaxForData();
			}else if(this.datas) {
				var tbodyTpl = this.getDataGrid()
				this.setTbody(tbodyTpl);
			}
		}
		,ajaxForData: function(successFn){
			if(!this.ajax) {
				return false;
			}
			var that = this, ajax = this.ajax, data = {}
			that.showLoading();
			for(var q in this.query) {
				data.q = this.query[q]
			}
			if(this.sort) {
				data.sort = this.sort.key
				data.sortDir = this.sort.dir
			}
			if(this.pagination){
				data.page = this.pagination.currentPage
				data.pageSize = this.pagination.pageSize
			}
			this.ele.querySelector('input[name="ckb-all"]').checked = false
			utils.ajax({
				url: ajax.url,
				data : data,
				success: function(data){
					data = ajax.formatDatas 
						? ajax.formatDatas(data) 
						: data
					that.datas = data
					that.setTbody(that.getDataGrid())
					that.hideLoading()
					successFn&&successFn()
				},
				fail: function() {
					that.hideLoading()
				},

			})
			return true;
		}
		,getDataGrid: function(){
			var thead = this.thead, 
				datas = this.datas,
				item = null,
				value = null,
				tbody = document.createElement('tbody'),
				tr = null,
				td = null,
				tdIndex = 0,
				initFn=null
			for(var i=0, row; row = datas[i]; i++) {
				tdIndex = 0
				tr = tbody.insertRow(i)
				if(this.checkabled) {
					var id = this.id ? row[this.id] :''
					tr.insertCell(tdIndex).innerHTML = '<input name="ckb" type="checkbox" value="'+id+'" />'
					tdIndex++
				}			
				for(var key in thead ){
					item = thead[key]
					if(item.show === false) continue
					if(item.isCustom) {
						value = item.format ? item.format(row,i) :''
					}else if(item.format) {
						value = item.format(row[key],i)
					}else {
						value = row[key]
					}
					td = tr.insertCell(tdIndex)
					td.innerHTML = value
					td.field = key
					td.index = i
					if(item.init) {
						this.inits.push((function(fn,td,v){
							return function(){
								fn(td,v)
							}
						})(item.init,td,item.isCustom ? row : row[key]))
					}

					tdIndex++
				}
			}
			return tbody
		}
		,clickCheckAll: function(target,e){
			var	status = target.checked,
				inputs = this.ele.querySelectorAll('input[name="ckb"]')
			for(var i=0,input; input = inputs[i]; i++) {
				input.checked = status
			}
			e&&e.stopPropagation()
		}
		,clickCheckbox: function(target,e){
			var checkAll = this.ele.querySelector('input[name="ckb-all"]'),
				inputs = null,
				status = target.checked,
				isAllChecked = true
			if(status) {
				inputs = this.ele.querySelectorAll('input[name="ckb"]')
				for(var i=0,input; input = inputs[i]; i++){
					if(!input.checked) {
						isAllChecked = false;
						break;
					}
				}
				checkAll.checked = isAllChecked
			}else {
				checkAll.checked = false
			}
			e&&e.stopPropagation()
		}
		,getCheckedId: function(){
			var inputs = this.ele.querySelectorAll('input[name="ckb"]')
				ids = []
			for(var i=0,input; input = inputs[i]; i++) {
				if(input.checked) {
					ids.push(input.value)
				}
			}
			return ids
		}
		,sortChange: function(target,e){
			if(!target) return false;
			var sort = this.sort || {},
				field = target.field,
				dir = this.sort.key === field&& this.sort.dir==='desc' ? 'asc' : 'desc'
			sort.key = field
			sort.dir = dir
			this.sort = sort
			if(this.sortTh!==target) {
				this.sortTh.className = 'sort'
				this.sortTh = target;
			}
			target.className = 'sort sort-'+dir
			this.ajaxForData();
			e&&e.stopPropagation()
		}
	}
	DataGrid.config = {
		clsName:'datagrid'
	}
	window.DataGrid = DataGrid;
	
})()