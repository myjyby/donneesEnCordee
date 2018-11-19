if (!Map) { var Map = {} }

Map.init = _dessin => {
	let body = d3.select('div.menu--vis')
		.insertElems('div.menu--indicators', 'div', 'carte')
	let w = body.node().clientWidth || body.node().offsetWidth
	let h = w * .5
	const svg = body.addElems('svg')
		.attrs({ 'width': w,
				 'height': h,
				 'viewBox': '0 0 700 700',
				 'preserveAspectRatio': 'xMidYMid meet' })

	svg.addElems('path', 'active outline', _dessin)
		.each(function (d) { d3.select(this).classed(d['commune'] === 'Total' ? 'total' : 'commune', true) })
		.attr('d', d => d.path)
		.style('stroke-width', d => d['commune'] !== 'Total' ? 700 / h * .5 : 700 / h)
	.on('mouseover', function (d) { 
		if (d['commune'] !== 'Total') {
			d3.select(this).moveToFront()
			d3.select(this).style('stroke-width', 700 / h * 2)
		}
	})
	.on('mouseout', function (d) { if (d['commune'] !== 'Total') d3.select(this).style('stroke-width', 700 / h * .5) })

	window.addEventListener('resize', _ => {
		body = d3.select('div.menu--vis')
		w = body.node().clientWidth || body.node().offsetWidth
		h = w * .5
		const svg = d3.select('svg').attrs({ 'width': w, 'height': h })
		svg.selectAll('path.outline')
			.style('stroke-width', d => d['commune'] !== 'Total' ? 700 / h * .5 : 700 / h)
			.on('mouseover', function (d) { 
				if (d['commune'] !== 'Total') {
					d3.select(this).moveToFront()
					d3.select(this).style('stroke-width', 700 / h * 2)
				}
			})
			.on('mouseout', function (d) { if (d['commune'] !== 'Total') d3.select(this).style('stroke-width', 700 / h * .5) })
	})

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

