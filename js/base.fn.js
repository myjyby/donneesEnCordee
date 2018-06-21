const qFB = true
const jsonQueryHeader = { 'Accept': 'application/json', 'Content-Type': 'application/json' }

//const apiURL = 'http://52.202.214.77/mogalyzer/'
const apiURL = 'https://qatalog-api.unglobalpulse.net/'
const childProcess = true

const detectBrowser = () => {
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
	const node = _sel.selectAll(_class ? `${_element}.${_class.replace(/\s/g, '.')}` : `${_element}`)
		.data(_data ? (typeof _data === 'function' ? d => _data(d) : _data) : d => [d])
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
	const node = _sel.selectAll(_class ? `${_element}.${_class.replace(/\s/g, '.')}` : `${_element}`)
		.data(	_data ? (typeof _data === 'function' ? d => _data(d) : _data) : d => [d], 
				function (d, i) { return _key ? d[_key] : i })
	node.exit().remove()
	return node.enter()
		[typeof _method === 'object' ? _method[0] : _method](_element, typeof _method === 'object' ? _method[1] : null)
		.attr('class', _class ? _class : '')
	.merge(node)
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

if (!Actions) { var Actions = {} }
Actions.fetch = (_uri, _q, _loader) => {
	return new Promise(resolve => 
		fetch(_uri, { method: 'POST', headers: jsonQueryHeader, body: JSON.stringify(_q) })
			.then(response => response.json())
			.then(results => resolve(results))
			.then(() => _loader.clear())
			.catch(err => { if (err) throw (err) })
	)
}

Actions.clearSelection = () => {
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
	const h = this.getHours() < 10 ? `0${this.getHours()}` : this.getHours()
	const m = this.getMinutes() < 10 ? `0${this.getMinutes()}` : this.getMinutes()
	return `${this.getDate()} ${Ms[this.getMonth()]}, ${this.getFullYear()}`
}
Date.prototype.displayMY = function () {
	const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	const Ms = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	const d = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
	const h = this.getHours() < 10 ? `0${this.getHours()}` : this.getHours()
	const m = this.getMinutes() < 10 ? `0${this.getMinutes()}` : this.getMinutes()
	return `${Ms[this.getMonth()]}, ${this.getFullYear()}`
}
Date.prototype.display_for_query = function () {
	const m = this.getMonth() + 1 < 10 ? `0${this.getMonth() + 1}` : this.getMonth() + 1
	const d = this.getDate() < 10 ? `0${this.getDate()}` : this.getDate()
	return `${this.getFullYear()}-${m}-${d}`
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
	return `${this.getDate() < 10 ? `0${this.getDate()}` : this.getDate()}-${(this.getMonth() + 1 < 10 ? `0${this.getMonth() + 1}` : this.getMonth() + 1)}-${this.getFullYear()}`
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
	this.sort((a, b) => a - b)

	var half = Math.floor(this.length / 2)

	// if(this.length % 2)
	// 	return this[half]
	// else
	// 	return (this[half - 1] + this[half]) / 2
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

if (!Heuristics) { var Heuristics = {} }
Heuristics.isDate = _val => {
	const parser = d3.timeParse('%Y')
	const epoch = new Date(0)
	if (parser(_val) && parser(_val) > epoch) return true
	return false
}
Heuristics.hasYear = _arr => {
	return _arr.map(d => Heuristics.isDate(d)).indexOf(true)
}