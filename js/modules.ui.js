const bgColor = '#E5E2D9'

if (!UI) { var UI = {} }
UI.drag = d3.drag()
	.on('start', () => d3.select('svg').classed('dragging', true))
	.on('drag', function () {
		const evt = d3.event

		// const n = d3.selectAll('g.range').size()
		
		d3.selectAll('g.range')
			.attr('transform', (d, i) => {
				d.x -= evt.dx * (i + 1) / 25
				d.y - evt.dy * i / 25 > horizon ? d.y -= evt.dy * i / 25 : d.y = horizon
				return `translate(${[d.x, d.y]})`
			})
			.each(function () { d3.select(this).call(Mountains.placeLabels) })
	})
	.on('end', () => d3.select('svg').classed('dragging', false))
UI.svg = () => {
	const svg = d3.select('div.slide.vis').addElem('svg', 'canvas')
		.attrs({
			'width': width(),
			'height': height()
		})

	svg.addElem('defs')

	svg.addElem('rect', 'bg')
		.attrs({
			'width': width(),
			'height': height()
		})
	.call(UI.drag)
	// svg.addElem('line', 'horizon')
	// 	.attrs({
	// 		'x1': 0,
	// 		'x2': width(),
	// 		'y1': horizon,
	// 		'y2': horizon
	// 	})
	svg.addElem('g', 'mountain')
	// svg.addElem('g', 'axis axis--y')

	svg.addElem('g', 'map')
}

UI.setGradient = _color => {
	const defs = d3.select('defs')
	// const gradient = defs.addElems('radialGradient', `gradient-${_color}`, [_color])
	// 	.attrs({
	// 		'id': `gradient-${_color}`,
	// 		'cx': '50%',
	// 		'cy': '100%',
	// 		'r': '150%',
	// 		'fx': '50%',
	// 		'fy': '100%'
	// 	})
	const gradient = defs.addElems('linearGradient', `gradient-${_color}`, [_color])
		.attrs({
			'id': `gradient-${_color}`,
			'x1': '0%',
			'y1': '100%',
			'x2': '0%',
			'y2': '0%'
		})
	gradient.addElems('stop', 'in')
		.attrs({
			'offset': '0%',
			'style': d => `stop-color:${d3.rgb(bgColor)};stop-opacity:1`
		})
	gradient.addElems('stop', 'mid')
		.attrs({
			'offset': '33%',
			'style': d => {
				const rgb = d3.rgb(Menu.colors(d))
				// console.log(`rgb(${[255 - rgb.r, 255 - rgb.g, 255 - rgb.b]})`)
				return `stop-color:rgb(${[255 - rgb.r, 255 - rgb.g, 255 - rgb.b]});stop-opacity:1`
			}
		})
	gradient.addElems('stop', 'out')
		.attrs({
			'offset': '100%',
			'style': d => `stop-color:${d3.rgb(Menu.colors(d))};stop-opacity:1`
		})
}

UI.init = () => {
	UI.svg()
}
