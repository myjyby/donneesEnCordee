if (!Menu) { var Menu = {} }
Menu.init = function (_data) {
	const body = d3.select('div.menu--vis')

	const title = body.addElem('div', 'title')
		
	title.addElem('h1', 'title-block').html('Données&mdash;en&mdash;cordée').fitText()
	title.addElem('h3', 'title-block').html('Un paysage social du département de l’Isère').fitText()

	const hierarchie = Menu.data(_data)
	
	const menu = body.addElems('div', 'menu--indicators', [_data])
	menu.addElems('ul', 'menu-list', hierarchie)
		.addElems('li', 'list-item')
		.classed('node', function (d) { return d.values.length })
		.classed('leaf', function (d) { return !d.values.length })
		.html(function (d) { return d.key })
	.each(Menu.list)

	d3.selectAll('.node')
		.on('click', function (d) {
			d3.event.stopPropagation()
			const node = this
			const sel = d3.select(this)
			
			if (sel.classed('list-item')) d3.selectAll('.list-item.expanded').filter(function () { return this !== node }).call(Menu.expand)
			sel.call(Menu.expand)
		})
	d3.selectAll('.leaf')
		.on('click', function (d) {
			d3.event.stopPropagation()
			d3.select(this).classed('selected', !d3.select(this).classed('selected'))

			Mountains.rangeValues.push(Object.assign({ type: 'value' }, d)) // CHANGE TYPE HERE ++++++ OBJECT ASSIGN DOES NOT WORK IN IE

			// REDRAW THE MOUNTAINS
			UI.redraw()
		})
}
Menu.data = function (_data) { 
	indicateurs_nombres = _data.filter(function (d) { return d['Type_JB'].toLowerCase() === 'nombre' })
	const indicateurs_uniques = indicateurs_nombres.map(function (d) { return d['Structure'] })
	const rgx = /_/g
	const indicateurs_decomposes = indicateurs_uniques.map(function (d) { return d.split(rgx).filter(function (c) { return c.length }) })

	const hierarchie = []
	indicateurs_decomposes.forEach(function (d) {
		if (hierarchie.map(function (c) { return c.key }).indexOf(d[0]) === -1) hierarchie.push({ key: d[0], path: d[0] })
		let obj = hierarchie.filter(function (c) { return c.key === d[0] })[0]
		d.forEach(function (c, j) {
			if (j > 0) {
				if (!obj.values) obj.values = []
				if (obj.values.map(function (b) { return b.key }).indexOf(c) === -1) {
					if (_data.filter(function (a) { return a['Structure'] === obj.path + '_' + c })[0]) {
						const indicateur_detail = _data.filter(function (a) { return a['Structure'] === obj.path + '_' + c })[0]['Indicateur']
						obj.values.push({ key: c, path: obj.path + '_' + c, value: indicateur_detail })
					}
					else obj.values.push({ key: c, path: obj.path + '_' + c })
				}
				obj = obj.values.filter(function (b) { return b.key === c })[0]
			}
		})
	})
	return hierarchie
}
Menu.list = function (_d) {
	const sel = d3.select(this)
		.classed('node', function (d) { return d.values && d.values.length })
		.classed('leaf', function (d) { return !(d.values && d.values.length) })
		
	// CHECK THE CHILD NODES: IF THEY ARE ALL AT THE SAME LEVEL (NO GRAND CHILDREN)
	// ADD THEM IN PARENTHESES, OTHERWISE RE-ITERATE
	if (_d.values) {
		const grandChildren = _d.values.map(function (d) { return d.values ? d.values.length : 0 })
		if (!d3.sum(grandChildren) && _d.values.length > 1) {
			sel.classed('node leaf', false)
				.classed('multi-leaf', true)
				.on('click', function () { d3.event.stopPropagation() })
			.addElems('span', 'leaf', function (d) { return d.values })
				.html(function (d, i) {
					if (i === 0 && _d.values.length === 1) return ' (<u>' + d.key + '</u>)'
					else if (i === 0 && _d.values.length > 1) return ' (<u>' + d.key + '</u> | '
					else if (i === _d.values.length - 1) return '<u>' + d.key + '</u>)'
					else return '<u>' + d.key + '</u> | '
				})
		}
		else {
			const list = sel.addElems('ul', 'sub-list', function (d) { return d.values })
				.addElems('li', 'sub-item')
				.html(function (d) { return d.key })
			.each(Menu.list)
		}
	}
}
Menu.expand = function (_sel) {
	if (!_sel.node()) return null
	const sublist = _sel.node().children
	const isExpanded = _sel.classed('expanded')
	const lineHeight = 9
	
	if (sublist) {
		if (!isExpanded) {
			_sel.classed('expanded', true)

			for (let node of sublist) {
				const ul = d3.select(node)
				const li = ul.select('li.sub-item').node()
				li.style.maxHeight = lineHeight + 'rem'
			}
			
			const parentItem = _sel.findAncestor('list-item')

			parentItem.selectAll('li.expanded')
			.style('max-height', function () {
				return ((
					d3.select(this).selectAll('.sub-item')
					.filter(function () { 
						return this.style.maxHeight 
					}).size() + 1) * lineHeight
				) + 'rem'
			})
		}
		else {
			_sel.classed('expanded', false)
				.selectAll('li.sub-item')
				.classed('expanded', false)
				.style('max-height', null)
		}
	}
}