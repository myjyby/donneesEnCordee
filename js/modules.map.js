if (!Map) { var Map = {} }

Map.init = function (_data) {
	let body = d3.select('div.menu--vis')
		.insertElems('div.title', 'div', 'carte')
	let w = body.node().clientWidth || body.node().offsetWidth
	let h = w * .5
	const svg = body.addElems('svg')
		.attrs({ 'width': w,
				 'height': h,
				 'viewBox': '0 0 850 850',
				 'preserveAspectRatio': 'xMinYMid meet' })

	svg.addElems('g', 'carte--communes', [_data])
		.attr('transform', 'translate(' + [((w * (850 / h) - 850) / 2) - 150, 0] + ')') // THE y = -44 IS DEPENDENT ON THE BASE DRAWING
	.addElems('path', 'active outline', function (d) { return d })
		.each(function (d) { 
			if (d['commune'] === 'Total') d3.select(this).classed('total', true) 
			else if (d['commune'] === 'Toutes les communes') d3.select(this).classed('toutes-communes', true)
			else d3.select(this).classed('commune', true) 
		})
		.attr('d', function (d) { return d.path })
		.attr('transform', function (d) {
			if (d['commune'] === 'Total') return 'translate(150, 0)'
			else return null
		})
		.style('stroke-width', function (d) {
			if (d['commune'] === 'Total') return 850 / h
			else if (d['commune'] === 'Toutes les communes') return 850 / h
			else return 850 / h
		})
	.on('mouseover', function (d) { 
		const sel = d3.select(this)
		if (d['commune'] !== 'Toutes les communes' && d['commune'] !== 'Total') d3.select(this).moveToFront()
			// d3.select(this).style('stroke-width', 850 / h * 2)
		d3.select(this).style('stroke-width', 850 / h)

		d3.selectAll('div.sommet, div.label--name')
			.classed('semi-transparent', false)
		d3.selectAll('div.commune').filter(function (c) { return c['Commune_court'] !== d['commune'] })
			.selectAll('div.sommet, div.label--name')
			.classed('semi-transparent', true)

		const bbox = this.getBBox()
		const label = svg.addElems('g', 'label--name', [d])
			.attr('transform', 'translate(' + [0, 850 - 10 * (850 / h)] + ')')
			.moveToFront()
		const text = label.addElems('text')
			.style('font-size', ((850 / h) * .75) + 'rem')
			.attrs({ 'dy': '.4rem',
					 'x': 24 * (850 / h) / 2 })
			.text(function (c) { return (sel.classed('active') ? 'Masquer' : 'Afficher') + ': ' + c['commune'] })

		label.insertElems('text', 'rect', 'bg')
			.attrs({ 'width': text.node().getBBox().width + 24 * (850 / h),
					 'height': text.node().getBBox().height + 15 * (850 / h),
					 'x': 0,
					 'y': -(text.node().getBBox().height + 15 * (850 / h)) / 2 })
	})
	.on('mouseout', function (d) { 
		if (d['commune'] !== 'Toutes les communes') d3.select(this).style('stroke-width', 850 / h)
		d3.selectAll('div.sommet, div.label--name').classed('semi-transparent', false)
		d3.selectAll('g.label--name').remove()
	})
	.on('click', function (d) {
		const sel = d3.select(this)

		// IF THE PLACE IS ACTIVE, THEN DEACTIVATE IT
		if (sel.classed('active')) {
			if (d['commune'] !== 'Toutes les communes') {
				Mountains.data.forEach(function (c) { if (c['Commune_court'] === d['commune']) c.display = false })
				d3.selectAll('div.sommet, div.label--name').classed('semi-transparent', false)
			}
			else {
				Mountains.data.forEach(function (c) { c.display = false })
				d3.selectAll('div.sommet, div.label--name').classed('semi-transparent', false)
				sel.findAncestor('carte--communes').selectAll('path.outline')
					.filter(function () { return this !== sel.node() })
					.classed('active', false)
			}
		}
		else {
			if (d['commune'] !== 'Toutes les communes') {
				Mountains.data.forEach(function (c) { if (c['Commune_court'] === d.commune) c.display = true })
			}
			else {
				Mountains.data.forEach(function (c) { c.display = true })
				sel.findAncestor('carte--communes').selectAll('path.outline')
					.filter(function () { return this !== sel.node() })
					.classed('active', true)
			}
		}
		sel.classed('active', !sel.classed('active'))
		d3.select('g.label--name text').text(function (c) { return (sel.classed('active') ? 'Masquer' : 'Afficher') + ': ' + c['commune'] })

		UI.redraw()
	})

	d3.select(window).on('resize.map', function () { Map.init(_data) })
}