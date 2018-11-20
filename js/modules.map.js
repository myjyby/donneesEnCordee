if (!Map) { var Map = {} }

Map.init = _dessin => {
	let body = d3.select('div.menu--vis')
		.insertElems('div.title', 'div', 'carte')
	let w = body.node().clientWidth || body.node().offsetWidth
	let h = w * .5
	const svg = body.addElems('svg')
		.attrs({ 'width': w,
				 'height': h,
				 'viewBox': '0 0 700 700',
				 'preserveAspectRatio': 'xMinYMid meet' })

	svg.addElems('g', 'carte--communes', [_dessin])
		.attr('transform', `translate(${[(w * (700 / h) - 700) / 2, 0]})`)
	.addElems('path', 'active outline', d => d)
		.each(function (d) { d3.select(this).classed(d['commune'] === 'Total' ? 'total' : 'commune', true) })
		.attr('d', d => d.path)
		.style('stroke-width', d => d['commune'] !== 'Total' ? 700 / h * .75 : 700 / h)
	.on('mouseover', function (d) { 
		const sel = d3.select(this)
		if (d['commune'] !== 'Total') {
			d3.select(this).moveToFront()
			d3.select(this).style('stroke-width', 700 / h * 2)
		}

		d3.selectAll('div.sommet, div.label--name')
			.classed('semi-transparent', false)
		d3.selectAll('div.commune').filter(c => c['Commune_court'] !== d['commune'])
			.selectAll('div.sommet, div.label--name')
			.classed('semi-transparent', true)

		const bbox = this.getBBox()
		const label = svg.addElems('g', 'label--name', [d])
			.attr('transform', c => {
				// if (c['commune'] === 'Total') return `translate(${[0, bbox.y + (700 / h) * 20]})`
				// else return `translate(${[bbox.x + bbox.width / 2, bbox.y + bbox.height / 2 <= w / 2 ? bbox.y + bbox.height + (700 / h) * 20 : bbox.y - (700 / h) * 10]})`
				return `translate(${[0, 700 - 10 * (700 / h)]})`
			})
			.moveToFront()
		const text = label.addElems('text')
			.style('font-size', `${(700 / h) * .75}rem`)
			.attrs({ 'dy': '.4rem',
					 'x': 24 * (700 / h) / 2 })
			.text(c => `${sel.classed('active') ? 'Masquer' : 'Afficher'}: ${c['commune']}`)

		label.insertElems('text', 'rect', 'bg')
			.attrs({ 'width': text.node().getBBox().width + 24 * (700 / h),
					 'height': text.node().getBBox().height + 15 * (700 / h),
					 'x': 0, //-(text.node().getBBox().width + 60) / 2,
					 'y': -(text.node().getBBox().height + 15 * (700 / h)) / 2 })
			// .style('stroke-width', 700 / h)

	})
	.on('mouseout', function (d) { 
		if (d['commune'] !== 'Total') d3.select(this).style('stroke-width', 700 / h * .75)
		d3.selectAll('div.sommet, div.label--name').classed('semi-transparent', false)
		// d3.selectAll('div.label--name').classed('semi-transparent', false)

		d3.selectAll('g.label--name').remove()
	})
	.on('click', function (d) {
		const sel = d3.select(this)

		// IF THE PLACE IS ACTIVE, THEN DEACTIVATE IT
		if (sel.classed('active')) {
			Mountains.data.forEach(c => { if (c['Commune_court'] === d['commune']) c.display = false })
			d3.selectAll('div.sommet, div.label--name').classed('semi-transparent', false)
		}
		else {
			Mountains.data.forEach(c => { if (c['Commune_court'] === d.commune) c.display = true })
		}
		sel.classed('active', !sel.classed('active'))
		d3.select('g.label--name text').text(c => `${sel.classed('active') ? 'Masquer' : 'Afficher'}: ${c['commune']}`)

		UI.redraw()
	})

	d3.select(window).on('resize.map', _ => Map.init(_dessin))



	return null

	/*const path = d3.geoPath()
		.projection(null)
	const mapSide = 250

	const svg = d3.select('svg')
	const map = svg.select('g.map')
		// .attr('transform', `translate(${[0, 100]})`)
		.attr('transform', `translate(${[width() - mapSide, 0]})`)

	map.addElems('path', 'community', _geojson.features)
		.attr('d', path)
	.on('mouseover', function (d) {
		if (d3.select(this).classed('inactive')) return null

		d3.selectAll('g.range')
			.filter(c => c['Commune'] !== d.properties['NOM'])
		.transition()
			.duration(150)
			.style('opacity', .25)

		d3.selectAll('g.namelabel')
			.filter(c => c['Commune'] !== d.properties['NOM'])
		.transition()
			.duration(150)
			.style('opacity', .25)
	})
	.on('mouseout', function (d) {
		if (d3.select(this).classed('inactive')) return null

		d3.selectAll('g.range')
			.transition()
			.duration(150)
			.style('opacity', 1)

		d3.selectAll('g.namelabel')
			.transition()
			.duration(150)
			.style('opacity', 1)
	})
	.on('click', function (d) {
		const sel = d3.select(this)
		console.log(d.properties['NOM'])

		// IF THE PLACE IS ACTIVE, THEN DEACTIVATE IT
		if (!sel.classed('inactive')) {
			Mountains.data.forEach(c => { if (c['Commune'] === d.properties['NOM']) c.display = false })
			d3.selectAll('g.namelabel')
				.filter(c => c['Commune'] === d.properties['NOM'])
				.each(c => console.log(c))
				.remove()
		}
		else {
			Mountains.data.forEach(c => { if (c['Commune'] === d.properties['NOM']) c.display = true })
		}
		sel.classed('inactive', !sel.classed('inactive'))
		UI.redraw()
	})*/

}

