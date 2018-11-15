const bgColor = '#FFF'
// const bgColor = '#E5E2D9'
const usePattern = true
const useHighlights = false

if (!UI) { var UI = {} }
UI.drag = d3.drag()
	.on('start', () => {
		// d3.selectAll('div.commune').classed('transition--none', true)
		// d3.selectAll('div.chaine').classed('transition--none', true)
		d3.selectAll('div.sommet, div.label--name').classed('transition--none', true)
		d3.select('div.paysage--vis').classed('dragging', true)
	})
	.on('drag', function () {
		const evt = d3.event
		
		if (!normalize) {
			// d3.selectAll('g.range')
			// 	.attr('transform', (d, i) => {
			// 		d.x -= evt.dx * (i + 1) / 25
			// 		d.y - evt.dy * i / 25 > Mountains.horizon ? d.y -= evt.dy * i / 25 : d.y = Mountains.horizon
			// 		return `translate(${[d.x, d.y]})`
			// 	})
			// 	.each(function () { d3.select(this).call(Mountains.placeLabels) })
			d3.selectAll('div.commune')
				.each(function (d) {
					const sel = d3.select(this)
					const i = +d3.select(this).style('z-index')
					if (d.top - evt.dy * i / 25 > Mountains.horizon) {
						d.top -= evt.dy * i / 25
						if (d.top >= d.origin) d.top = d.origin
					}
					else d.top = Mountains.horizon
					d.left -= (evt.dx * (i + 1) / 25)
					
					sel.selectAll('div.sommet')
						.style('transform', function (c) {
							return `translate(${d.left + c.left}px, ${d.top + c.top}px)`
						})
					sel.selectAll('div.label--name')
						.style('transform', `translateY(${d.top}px)`)
				})
				
				// .style('top', (d, i) => {
				// 	if (d.y - evt.dy * i / 25 > Mountains.horizon) {
				// 		d.y -= evt.dy * i / 25
				// 		if (d.y >= d.origin) d.y = d.origin
				// 	}
				// 	else d.y = Mountains.horizon
				// 	return `${d.y}px`
				// 	// return `${d.y - evt.dy * i / 25 > Mountains.horizon ? d.y -= evt.dy * i / 25 : d.y = Mountains.horizon}px`
				// })
			

			// d3.selectAll('div.chaine')
			// 	.style('transform', function (d) {
			// 		const i = +d3.select(this.parentNode).style('z-index')
			// 		return `translateX(${d.x -= evt.dx * (i + 1) / 25}px)`
			// 	})



				// .style('left', (d, i) => `${d.x -= evt.dx * (i + 1) / 25}px`)
			// .each(function () { d3.select(this).call(Mountains.placeLabels) })
		}
	})
	.on('end', () => {
		// d3.selectAll('div.commune').classed('transition--none', false)
		// d3.selectAll('div.chaine').classed('transition--none', false)
		d3.selectAll('div.sommet, div.label--name').classed('transition--none', false)
		d3.select('div.paysage--vis').classed('dragging', false)
	})


UI.width = width()
UI.height = height()
UI.svg = () => {
	const header = d3.select('div.slide.vis').select('div.header')
	UI.height -= parseInt(header.style('height'))

	const svg = d3.select('div.slide.vis').addElem('svg', 'canvas')
		.attrs({
			'width': UI.width,
			'height': UI.height
		})

	svg.addElem('defs')
	if (usePattern) UI.setPattern()

	svg.addElem('rect', 'bg')
		.attrs({
			'width': UI.width,
			'height': UI.height
		})
	.call(UI.drag)

	svg.addElem('g', 'mountain')

	svg.addElem('g', 'map')
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
	// UI.svg()
	setTimeout(_ => {// THIS IS A HACK TO MAKE SURE THE MENU IS PROPERLY DISPLAYED BEFORE CREATING THE CANVAS
		const menu = d3.select('div.menu--vis').node()
		d3.select('div.paysage--vis')
			// .style('width', `calc(100% - ${Math.ceil(menu.clientWidth || menu.offsetWidth)}px)`)
	}, 100)

	const btns = d3.select('div.header').selectAll('div.btn')
	btns.on('click', function () {
		btns.classed('active', false)
		const sel = d3.select(this)
		sel.classed('active', true)
		if (sel.classed('abs-scale')) {
			normalize = false
			d3.select('div.montagnes').classed('table', false)
		}
		if (sel.classed('norm-scale')) {
			normalize = true
			d3.select('div.montagnes').classed('table', true)
		}
		UI.redraw()
	})
}
UI.redraw = _ => {
	// const menu = d3.select('div.menu--vis').node()
	// d3.select('div.paysage--vis')
	// 	.style('width', `calc(100% - ${Math.ceil(menu.clientWidth || menu.offsetWidth)}px)`)

	// normalize = !normalize
	Mountains.init()
	Reasoning.init()
}
