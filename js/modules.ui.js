if (!UI) { var UI = {} }
UI.drag = d3.drag()
	.on('start', () => d3.select('svg').classed('dragging', true))
	.on('drag', function () {
		const evt = d3.event

		// const n = d3.selectAll('g.chaine').size()
		
		d3.selectAll('g.chaine')
			.attr('transform', (d, i) => {
				d.x -= evt.dx * (i + 1) / 25
				d.y - evt.dy * i / 25 > horizon ? d.y -= evt.dy * i / 25 : d.y = horizon
				return `translate(${[d.x, d.y]})`
			})
	})
	.on('end', () => d3.select('svg').classed('dragging', false))
UI.svg = () => {
	const svg = d3.select('body').addElem('svg', 'canvas')
		.attrs({
			'width': width(),
			'height': height()
		})
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
	svg.addElem('g', 'montagnes')
	svg.addElem('g', 'axis axis--y')
}
UI.init = () => {
	UI.svg()
}
