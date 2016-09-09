(function(){
	function extend() {
        var options, name, src, copy,
            target = arguments[ 0 ] || {},
            i=1,
            length = arguments.length;
        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && Object.prototype.toString.call(target)==='[object Functon]' ) {
            target = {};
        }
        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( ( options = arguments[ i ] ) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];
                    if ( target === copy ) {
                        continue;
                    }
                    target[ name ] = copy;
                }
            }
        }
        return target;
    }

    var loop = function(){},
    	defaults = {
    	totalCount:100,
    	currentPage: 1,
    	pageSize:5,
    	prevText:'上一页',
    	nextText:'下一页',
    	firstText:'首页',
    	nextText:'尾页',
    	onPageClick: loop
    };
	function Pagination(options){
		extend(this,defaults,options||{})
		this.init()
	}

	Pagination.prototype = {
		constructor: Pagination,

		init() {
			return this;
		},

		initEvent(){
			console.log(initEvent);
		},

		setCurrentPage(page){

		},

		nextPage(){},

		prevPage(){},

		goPage(){},

		getPageTpl(page){
			var pageCount = Math.ceil(this.totalCount/this.pageSize),
				page = Math.max(Math.min(pageCount,page),0)

		}
	}
	Pagination.configs = {
		clsName:'pagination'
	}

	window.pagination = pagination
})


