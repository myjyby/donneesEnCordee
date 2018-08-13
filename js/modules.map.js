if (!Map) { var Map = {} }

Map.init = _geojson => {
	const path = d3.geoPath()
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
		// let missing = []
		// Mountains.data.map(c => c['Commune']).forEach(c => {
		// 	if (_geojson.features.map(b => b.properties['NOM']).indexOf(c) === -1) missing.push(c)
		// })
		// console.log(missing)

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
	})

}

