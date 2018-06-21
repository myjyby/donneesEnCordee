if (!Menu) { var Menu = {} }
Menu.init = _data => {
	const hierarchie = Menu.data(_data)
	const list = d3.select('body')
		.addElem('ul', 'menu-list')
	.addElems('li', 'list-item', hierarchie)
		.html(d => d.key)
	.on(`${pointerType}up`, function (d) {
		d3.event.stopPropagation()
	})
	.each(Menu.list)
	.each(function () { d3.select(this).call(Menu.expand) })
}
Menu.data = _data => {
	indicateurs_nombres = _data.filter(d => d['Type'].toLowerCase() === 'nombre')
	const indicateurs_uniques = indicateurs_nombres.map(d => d['Structure'])
	// const rgx = /([A-Za-z]+)_/g
	const rgx = /_/g
	const indicateurs_decomposes = indicateurs_uniques.map(d => d.split(rgx).filter(c => c.length))

	const hierarchie = []
	indicateurs_decomposes.forEach(d => {
		if (hierarchie.map(c => c.key).indexOf(d[0]) === -1) hierarchie.push({ key: d[0], path: d[0] })
		let obj = hierarchie.filter(c => c.key === d[0])[0]
		d.forEach((c, j) => {
			if (j > 0) {
				if (!obj.values) obj.values = []
				if (obj.values.map(b => b.key).indexOf(c) === -1) obj.values.push({ key: c, path: `${obj.path}_${c}` })
				obj = obj.values.filter(b => b.key === c)[0]
			}
		})
	})
	return hierarchie
}
Menu.list = function (_d) {
	const sel = d3.select(this)
	const list = sel.addElems('ul', 'sub-list', d => d.values ? d.values : [])
		.addElems('li', 'sub-item node')
	.on(`${pointerType}up`, function (d) {
		d3.event.stopPropagation()
		d3.select(this).call(Menu.expand)
	})
		.html(d => d.key)
	if (_d.values && _d.values.length) list.each(Menu.list)
	else sel.classed('node', false).classed('leaf', true)
		.on(`${pointerType}up`, function (d) {
			d3.event.stopPropagation()
			d3.select(this).classed('selected', !d3.select(this).classed('selected'))

			Montagnes.chaine.push(Object.assign({}, d))

			Montagnes.init()
			Reasoning.init()
		})
}
Menu.expand = _sel => {
	const sublist = _sel.node().children
	const isExpanded = _sel.classed('expanded')
	const lineHeight = 1.5
	
	if (sublist) {
		if (!isExpanded) {
			_sel.classed('expanded', true)

			for (let node of sublist) {
				const ul = d3.select(node)
				const li = ul.select('li.sub-item').node()
				li.style.maxHeight = `${lineHeight}rem`
			}
			
			const parentItem = _sel.findAncestor('list-item')

			parentItem.selectAll('li.expanded')
			.style('max-height', function () {
				return `${(d3.select(this).selectAll('.sub-item').filter(function () { return this.style.maxHeight }).size() + 1) * lineHeight}rem`
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