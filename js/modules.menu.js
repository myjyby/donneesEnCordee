if (!Menu) { var Menu = {} }
Menu.colors = d3.scaleOrdinal()
	.range(['#34453D', '#344758', '#3F332D'])
Menu.init = _data => {
	const body = d3.select('div.slide.vis')

	const title = body.addElem('div', 'title')
		
	title.addElem('h1').html('Données en cordée')
	title.addElem('h3').html('Un paysage social du département Isère')

	const hierarchie = Menu.data(_data)
	Menu.colors.domain(hierarchie.map(d => d.key))
	Menu.colors.domain().forEach(d => UI.setGradient(d))
	
	const menu = body.addElem('div', 'menu--indicators')
	menu.addElems('ul', 'menu-list', hierarchie)
		.style('border-color', (d, i) => Menu.colors(d.key))
	.addElems('li', 'list-item')
		.classed('node', d => d.values.length)
		.classed('leaf', d => !d.values.length)
		.html(d => d.key)
	.each(Menu.list)
	// .each(function () { d3.select(this).call(Menu.expand) })

	d3.selectAll('.node')
		.on(`${pointerType}up`, function (d) {
			d3.event.stopPropagation()
			const node = this
			const sel = d3.select(this)
			
			if (sel.classed('list-item'))
				d3.selectAll('.list-item.expanded').filter(function () { return this !== node }).call(Menu.expand)

			sel.call(Menu.expand)
		})
	d3.selectAll('.leaf')
		.on(`${pointerType}up`, function (d) {
			d3.event.stopPropagation()
			d3.select(this).classed('selected', !d3.select(this).classed('selected'))

			Mountains.rangeValues.push(Object.assign({ type: 'value' }, d))

			Mountains.init()
			Reasoning.init()

			console.log(Mountains.rangeValues)
			console.log(Mountains.rangeRelations())
		})
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
				if (obj.values.map(b => b.key).indexOf(c) === -1) {
					if (_data.filter(a => a['Structure'] === `${obj.path}_${c}`)[0]) {
						const indicateur_detail = _data.filter(a => a['Structure'] === `${obj.path}_${c}`)[0]['Indicateur']
						obj.values.push({ key: c, path: `${obj.path}_${c}`, value: indicateur_detail })
					}
					else obj.values.push({ key: c, path: `${obj.path}_${c}` })
				}
				obj = obj.values.filter(b => b.key === c)[0]
			}
		})
	})
	return hierarchie
}
Menu.list = function (_d) {
	const sel = d3.select(this)
		.classed('node', d => d.values && d.values.length)
		.classed('leaf', d => !(d.values && d.values.length))
		
	// CHECK THE CHILD NODES: IF THEY ARE ALL AT THE SAME LEVEL (NO GRAND CHILDREN)
	// ADD THEM IN PARENTHESES, OTHERWISE RE-ITERATE
	if (_d.values) {
		const grandChildren = _d.values.map(d => d.values ? d.values.length : 0)
		if (!d3.sum(grandChildren) && _d.values.length > 1) {
			sel.classed('node leaf', false)
				.classed('multi-leaf', true)
				.on(`${pointerType}up`, () => d3.event.stopPropagation())
			.addElems('span', 'leaf', d => d.values)
				.html((d, i) => {
					if (i === 0 && _d.values.length === 1) return ` (<u>${d.key}</u>)`
					else if (i === 0 && _d.values.length > 1) return ` (<u>${d.key}</u> | `
					else if (i === _d.values.length - 1) return `<u>${d.key}</u>)`
					else return `<u>${d.key}</u> | `
				})
				// .html(d => ` (${d.values.map(c => c.key).join(', ')})`)
		}
		else {
			const list = sel.addElems('ul', 'sub-list', d => d.values)
				.addElems('li', 'sub-item')
				.html(d => d.key)
			.each(Menu.list)
		}
	}


	// else sel.classed('node', false).classed('leaf', true)
}
Menu.expand = _sel => {
	if (!_sel.node()) return null
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
				return `${(
					d3.select(this).selectAll('.sub-item')
					.filter(function () { 
						return this.style.maxHeight 
					}).size() + 1) * lineHeight
				}rem`
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