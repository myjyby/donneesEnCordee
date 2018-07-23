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

}

