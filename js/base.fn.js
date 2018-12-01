const qFB = true
const jsonQueryHeader = { 'Accept': 'application/json', 'Content-Type': 'application/json' }

//const apiURL = 'http://52.202.214.77/mogalyzer/'
const apiURL = 'https://qatalog-api.unglobalpulse.net/'
const childProcess = true

const detectBrowser = function () {
	// Opera 8.0+
	const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0
	if (isOpera) return 'Opera'
	// Firefox 1.0+
	const isFirefox = typeof InstallTrigger !== 'undefined'
	if (isFirefox) return 'Firefox'
	// Safari 3.0+ "[object HTMLElementConstructor]" 
	const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))
	if (isSafari) return 'Safari'
	// Internet Explorer 6-11
	const isIE = /*@cc_on!@*/false || !!document.documentMode
	if (isIE) return 'IE'
	// Edge 20+
	const isEdge = !isIE && !!window.StyleMedia
	if (isEdge) return 'Edge'
	// Chrome 1+
	const isChrome = !!window.chrome && !!window.chrome.webstore
	if (isChrome) return 'Chrome'
	// Blink engine detection
	const isBlink = (isChrome || isOpera) && !!window.CSS
	if (isBlink) return 'Blink'
}
const detectVersion = function(){
	var ua = navigator.userAgent, tem, 
	M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []
	if(/trident/i.test(M[1])){
		tem = /\brv[ :]+(\d+)/g.exec(ua) || []
		return 'IE '+(tem[1] || '')
	}
	if (M[1] === 'Chrome'){
		tem = ua.match(/\b(OPR|Edge)\/(\d+)/)
		if (tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera')
	}
	M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?']
	if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1])
	return M.join(' ')
}

const pointerType = detectBrowser() === 'Safari' ? 'mouse' : 'pointer'

const resolution = function () {
	return 1
	//return window.devicePixelRatio
}
const width = function () {
	if (self.innerHeight) {
		return self.innerWidth / resolution()
	}
	if (document.documentElement && document.documentElement.clientWidth) {
		return document.documentElement.clientWidth / resolution()
	}
	if (document.body) {
		return document.body.clientWidth / resolution()
	}
}
const height = function () {
	if (self.innerHeight) {
		return self.innerHeight / resolution()
	}
	if (document.documentElement && document.documentElement.clientHeight) {
		return document.documentElement.clientHeight / resolution()
	}
	if (document.body) {
		return document.body.clientHeight / resolution()
	}
}
const DOMnode = function (_sel, _method, _element, _class, _data) {
	const node = _sel.selectAll(_class ? _element + '.' + _class.replace(/\s/g, '.') : _element)
		.data(_data ? (typeof _data === 'function' ? function (d) { return _data(d) } : _data) : function (d) { return [d] })
	node.exit().remove()
	return node.enter()
		[typeof _method === 'object' ? _method[0] : _method](_element, typeof _method === 'object' ? _method[1] : null)
		.attr('class', _class ? _class : null)
	.merge(node)
}

if (!UI) { var UI = {} }
UI.staticElement = function (_sel, _method, _element, _class) {
	return _sel[typeof _method === 'object' ? _method[0] : _method](_element, typeof _method === 'object' ? _method[1] : null)
		.attr('class', _class)
}
UI.dynamicElement = function (_sel, _method, _element, _class, _data, _key) { // THIS REPLACES DOMnode
	const node = _sel.selectAll(_class ? _element + '.' + _class.replace(/\s/g, '.') : _element)
		.data(	_data ? (typeof _data === 'function' ? function (d) { return _data(d) } : _data) : function (d) { return [d] },
				function (c, j) { return _key ? (typeof _key === 'function' ? _key(c) : c[_key]) : j })
	node.exit().remove()
	return node.enter()
		[typeof _method === 'object' ? _method[0] : _method](_element, typeof _method === 'object' ? _method[1] : null)
		.attr('class', _class ? _class : '')
		// .each(function () { if (_key) console.log(`(re)created div.${_class} with key ${_key}`) })
	.merge(node)
		// .each(function () { if (_key) console.log(`updated div.${_class} with key ${_key}`) })
}


d3.selection.prototype.insertElem = function (_before, _element, _class) {
	return new UI.staticElement(this, ['insert', _before], _element, _class ? _class : '')
}
d3.selection.prototype.insertElems = function (_before, _element, _class, _data, _key) {
	return new UI.dynamicElement(this, ['insert', _before], _element, _class ? _class : '', _data, _key)
}
d3.selection.prototype.addElem = function (_element, _class) {
	return new UI.staticElement(this, 'append', _element, _class ? _class : '')
}
d3.selection.prototype.addElems = function (_element, _class, _data, _key) {
	return new UI.dynamicElement(this, 'append', _element, _class ? _class : '', _data, _key)
}
d3.selection.prototype.findAncestor = function (_class) {
	if (!this.node().classList) return false
	if (this.classed(_class)) return this
	return d3.select(this.node().parentNode) && d3.select(this.node().parentNode).findAncestor(_class);
}
d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this)
	})
}
d3.selection.prototype.fitText = function (factor) {
	if (!factor) factor = 9.5
	this.classed('resized', true)
		.style('font-size', null)
	
	const sel = this
	const node = sel.node()
	const parent = node.parentNode

	const resizer = function () {
		let child 
		if (sel.select('span.resized-text').node()) child = sel.select('span.resized-text').node()
		else {
			const text = sel.html()
			sel.html('')
			const span = sel.append('span')
				.attr('class', 'resized-text')
				.html(text)
			child = span.node()
		}
		sel.style('font-size', ((node.getBoundingClientRect().width / child.getBoundingClientRect().width) * factor) + 'px')
	}
	resizer()
	d3.select(window).on('resize.fittext orientationchange.fittext', function () {
		d3.selectAll('.resized').fitText()
	})

	// http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
	// this version here is adjusted to be more dynamic

	/*  ANOTHER NICE EXAMPLE FROM https://codepen.io/Merri/pen/dquki
	const textMetrics = _sel => {
		
		const tm = document.createElement('span')
		const sel = d3.select(tm)
		sel.style('border', 0)
			.style('padding', 0)
			.style('position', 'absolute')
			.style('visibility', 'hidden')
		
		tm.appendChild(document.createTextNode(_sel.textContent || _sel.innerText))
		
		_sel.appendChild(tm)
		var rect = tm.getClientRects()[0]
		sel.remove()
		
		return {
			height: rect.bottom - rect.top,
			width: rect.right - rect.left
		}
	}

	// custom implementation
	$(function(){
	  $('h1.text').each(function(){
		var widths = [], maxwidth = 0, width = 0;
		$(this).children('span').each(function(){
		  width = $.textMetrics(this)['width'];
		  widths.push({el: this, width: width});
		  if(maxwidth < width) maxwidth = width;
		});
		widths.forEach(function(w,i){
		  $(w.el).css({
			'font-size': (w.width > 0 ? maxwidth / w.width : 0).toFixed(5) + 'em'
		  });
		});
	  });
	});
	*/
}

if (!Actions) { var Actions = {} }
Actions.fetch = function (_uri, _q, _loader) {
	return new Promise(function (resolve) { 
		return fetch(_uri, { method: 'POST', headers: jsonQueryHeader, body: JSON.stringify(_q) })
			.then(function (response) { return response.json() })
			.then(function (results) { return resolve(results) })
			.then(function () { _loader.clear() })
			.catch(function (err) { if (err) throw (err) })
	})
}

Actions.clearSelection = function () {
	if (window.getSelection) {
		if (window.getSelection().empty) {
			window.getSelection().empty()
		}
		else if (window.getSelection().removeAllRanges) {
			window.getSelection().removeAllRanges()
		}
	}
	else if (document.selection) {
		document.selection.empty()
	}
}
Date.prototype.createUTCDate = function () {
	return new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()))
}
Date.prototype.displayDMY = function () {
	const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	const Ms = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	const d = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
	const h = this.getHours() < 10 ? '0' + this.getHours() : this.getHours()
	const m = this.getMinutes() < 10 ? '0' + this.getMinutes() : this.getMinutes()
	return this.getDate() + ' ' + Ms[this.getMonth()] +', ' + this.getFullYear()
}
Date.prototype.displayMY = function () {
	const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	const Ms = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	const d = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
	const h = this.getHours() < 10 ? '0' + this.getHours() : this.getHours()
	const m = this.getMinutes() < 10 ? '0' + this.getMinutes() : this.getMinutes()
	return Ms[this.getMonth()] + ', ' + this.getFullYear()
}
Date.prototype.display_for_query = function () {
	const m = this.getMonth() + 1 < 10 ? '0' + this.getMonth() + 1 : this.getMonth() + 1
	const d = this.getDate() < 10 ? '0' + this.getDate() : this.getDate()
	return this.getFullYear() + '-' + m + '-' + d
}
Date.prototype.getDaysInMonth = function () {
	const date = new Date(this.getFullYear(), this.getMonth(), 1)
	const month = this.getMonth()
	const days = []
	while (date.getMonth() === month) {
		days.push(new Date(date))
		date.setDate(date.getDate() + 1)
	}
	return days
}
Date.prototype.render = function () {
	return (this.getDate() < 10 ? '0' + this.getDate() : this.getDate()) + '-' + ((this.getMonth() + 1 < 10 ? '0' + (this.getMonth() + 1) : this.getMonth() + 1)) + '-' + this.getFullYear()
}
Array.prototype.flatten = function () {
	return [].concat.apply([], this)
}
Array.prototype.last = function () {
	return this[this.length - 1]
}
Array.prototype.chunk = function(_size) {
	const groups = []
	for (let i = 0; i < this.length; i += _size) {
		groups.push(this.slice(i, i + _size))
	}
	return groups
}
Array.prototype.median = function () {
	this.sort(function (a, b) { return a - b })
	var half = Math.floor(this.length / 2)
	return this[half]
}
Array.prototype.shuffle = function () {
	let currentIndex = this.length, temporaryValue, randomIndex

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex -= 1;
		// And swap it with the current element.
		temporaryValue = this[currentIndex]
		this[currentIndex] = this[randomIndex]
		this[randomIndex] = temporaryValue
	}
	return this
}

String.prototype.last = function () {
	return this.valueOf()[this.valueOf().length - 1]
}
String.prototype.simplify = function () {
	return this.valueOf().replace(/[^\w\s]/gi, '').replace(/\s/g, '').toLowerCase()
}
String.prototype.replaceURLWithHTMLLinks = function () {
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig
	return this.valueOf().replace(exp, '<a href="$1" target="_blank">$1</a>')
}
String.prototype.capitalize = function () {
	return this.valueOf().replace(/^\w/, function (c) { return c.toUpperCase() })
}

const printNumber = function (x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
const axisStep = function (number) {
	if (number <= 0.1) return 0.1
	else if (number <= 0.2) return 0.2
	else if (number <= 0.25) return 0.25
	else if (number <= 0.3) return 0.3
	else if (number <= 0.4) return 0.4
	else if (number <= 0.5) return 0.5
	else if (number <= 0.6) return 0.6
	else if (number <= 0.7) return 0.7
	else if (number <= 0.75) return 0.75
	else if (number <= 0.8) return 0.8
	else if (number <= 0.9) return 0.9
	else if (number <= 1) return 1
}

if (!Heuristics) { var Heuristics = {} }
Heuristics.isDate = function (_val) {
	const parser = d3.timeParse('%Y')
	const epoch = new Date(0)
	if (parser(_val) && parser(_val) > epoch) return true
	return false
}
Heuristics.hasYear = function (_arr) {
	return _arr.map(function (d) { return Heuristics.isDate(d) }).indexOf(true)
}

// CODE FROM: https://stackoverflow.com/questions/27558996/how-can-i-test-for-clip-path-support
const areClipPathShapesSupported = function () {
    var base = 'clipPath',
        prefixes = [ 'webkit', 'moz', 'ms', 'o' ],
        properties = [ base ],
        testElement = document.createElement( 'testelement' ),
        attribute = 'polygon(50% 0%, 0% 100%, 100% 100%)'

    // Push the prefixed properties into the array of properties.
    for ( var i = 0, l = prefixes.length; i < l; i++ ) {
        var prefixedProperty = prefixes[i] + base.charAt( 0 ).toUpperCase() + base.slice( 1 ); // remember to capitalize!
        properties.push( prefixedProperty )
    }

    // Interate over the properties and see if they pass two tests.
    for ( var i = 0, l = properties.length; i < l; i++ ) {
        var property = properties[i]

        // First, they need to even support clip-path (IE <= 11 does not)...
        if ( testElement.style[property] === '' ) {

            // Second, we need to see what happens when we try to create a CSS shape...
            testElement.style[property] = attribute;
            if ( testElement.style[property] !== '' ) {
                return true
            }
        }
    }

    return false
};