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
				d.y - evt.dy * i / 25 > Mountains.horizon ? d.y -= evt.dy * i / 25 : d.y = Mountains.horizon
				return `translate(${[d.x, d.y]})`
			})
			.each(function () { d3.select(this).call(Mountains.placeLabels) })
	})
	.on('end', () => d3.select('svg').classed('dragging', false))

UI.height = height()
UI.svg = () => {
	const header = d3.select('div.slide.vis').select('div.header')
	UI.height -= parseInt(header.style('height'))

	const svg = d3.select('div.slide.vis').addElem('svg', 'canvas')
		.attrs({
			'width': width(),
			'height': UI.height
		})

	svg.addElem('defs')

	svg.addElem('rect', 'bg')
		.attrs({
			'width': width(),
			'height': UI.height
		})
	.call(UI.drag)
	// svg.addElem('line', 'Mountains.horizon')
	// 	.attrs({
	// 		'x1': 0,
	// 		'x2': width(),
	// 		'y1': Mountains.horizon,
	// 		'y2': Mountains.horizon
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
UI.tooltip = (_sel, _data) => {
	let tooltip = _sel.selectAll('g.tooltip')
		.data(_data)
	tooltip.exit().remove()
	tooltip = tooltip.enter()
		.append('g')
		.attr('class', 'tooltip')
		.style('opacity', 0)
		// ('g', 'tooltip', _data)
		// .style('opacity', 0)

	tooltip.addElems('text', 'label')
		.text(d => d.label)

	tooltip.insertElems('text.label', 'path', 'bg')
		.attrs({ 'd': function () { 
					const bbox = d3.select(this.parentNode).select('text.label').node().getBBox()
					const x1 = -15, x2 = x1 + (bbox.width + 30)
					const y1 = -(bbox.height + 4), y2 = y1 + (bbox.height + 15)
					return `M${[x1, y1]} L${[x2, y1]} L${[x2, y2]} L${[(x2 + x1) / 2 + 7.5, y2]} L${[(x2 + x1) / 2, y2 + 10]} L${[(x2 + x1) / 2 - 7.5, y2]} L${[x1, y2]} Z`
				 } })
	
	tooltip.attr('transform', function () {
			const bbox = d3.select(this).select('text.label').node().getBBox()
			return `translate(${[-bbox.width / 2, -(bbox.height + 7.5)]})`
		})
	.merge(tooltip)
	
	const sizes = []
	// let overlaps = []

	tooltip.selectAll('path.bg').each(function () { 
		sizes.push(this.getBBox().width + 10) 
		// const bbox = this.getBoundingClientRect()
		// overlaps.push({ x: bbox.left, width: bbox.width, overlap: false })
	})
	// overlaps.forEach((d, i) => {
	// 	if (i > 0 && (overlaps[i - 1].x + overlaps[i - 1].width) >= d.x) d.overlap = true
	// })
	// overlaps = overlaps.map(d => +d.overlap)

	d3.selectAll(tooltip.nodes())
		.transition()
		.attr('transform', function (d, i) {
			const sel = d3.select(this)
			const bbox = d3.select(this).select('text.label').node().getBBox()
			const offset = i - (sizes.length / 2 - .5)
			// const x = !d3.sum(overlaps) ? -(bbox.width / 2) : -(bbox.width / 2) + offset * d3.max(sizes)
			const x = sel.findAncestor('ridge') ? -(bbox.width / 2) : -(bbox.width / 2) + offset * d3.max(sizes)

			return `translate(${[x, -(bbox.height + 7.5) - d.y]})`
		})
		.style('opacity', 1)
}

UI.init = () => {
	UI.svg()
	const btns = d3.select('div.header').selectAll('div.btn')
	btns.on('click', function () {
		btns.classed('active', false)
		const sel = d3.select(this)
		sel.classed('active', true)
		sel.classed('abs-scale') ? normalize = false : null
		sel.classed('norm-scale') ? normalize = true : null
		UI.redraw()
	})
}
UI.redraw = _ => {
	// normalize = !normalize
	Mountains.init()
	Reasoning.init()
}
