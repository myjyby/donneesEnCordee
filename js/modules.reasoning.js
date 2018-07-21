if (!Reasoning) { var Reasoning = {} }
Reasoning.scale = d3.scaleLinear()
	.rangeRound(Mountains.position.range())
Reasoning.hitpadding = 25
Reasoning.yLimit = 50
Reasoning.nodeSize = 10

Reasoning.drag = d3.drag()
	.on('start', function () { d3.select(this).moveToFront() })
	.on('drag', function (d) {
		const node = this
		const sel = d3.select(this)
		const circle = sel.select('circle')
		const otherNodes = d3.selectAll('g.node').filter(function () { return this != node })
		const positions = otherNodes.data().map(d => d.x)

		const evt = d3.event

		d.x += evt.dx
		d.x <= d3.min(Reasoning.scale.range()) ? d.x = d3.min(Reasoning.scale.range()) : null
		d.x >= d3.max(Reasoning.scale.range()) ? d.x = d3.max(Reasoning.scale.range()) : null
		
		d.y += evt.dy
		if (Math.abs(d.y) >= Reasoning.yLimit) {
			sel.attr('transform', `translate(${[d.x, d.y]})`)
				.call(Reasoning.tooltip, ['Supprimer'])
			.select('circle')
				.style('opacity', .5)
			// NEED TO ADD LABEL HERE: REMOVE NODE?
		}
		else {
			sel.attr('transform', `translate(${[d.x, 0]})`)
				.select('circle')
				.style('opacity', 1)
			sel.selectAll('.tooltip').remove()
		}

		const hitTest = positions.map((c, j) => ((c - Reasoning.hitpadding <= d.x && c + Reasoning.hitpadding >= d.x) && (-Reasoning.yLimit <= d.y && Reasoning.yLimit >= d.y)) ? j : null)
			.filter(d => d !== null)
		
		if (hitTest.length) {
			const target = otherNodes.filter((c, j) => j === hitTest[0])
			// ANIMATE THE SIZE OF THE TARGET NODE
			if (!target.classed('transitionning')) {
				target.classed('transitionning', true)
					.call(Reasoning.tooltip, ['+', '÷'])
					.select('circle')
				.transition()
					.duration(150)
					.attr('r', Reasoning.hitpadding)
			}
		}
		else {
			otherNodes.filter(function () { return d3.select(this).classed('transitionning') })
				.classed('transitionning', false)
				.select('circle')
			.transition()
				.duration(150)
				.attr('r', Reasoning.nodeSize)
			otherNodes.selectAll('.tooltip').remove()
		}
	})
	.on('end', function (d, i) {
		const node = this
		const sel = d3.select(this)
		const otherNodes = d3.selectAll('g.node').filter(function () { return this != node })
		const positions = otherNodes.data().map(c => c.x)

		sel.selectAll('.tooltip').remove()

		// CHECK IF NODE SHOULD BE REMOVED
		if (Math.abs(d.y) >= Reasoning.yLimit) Mountains.rangeValues.splice(i, 1)

		const hitTest = positions.map((c, j) => ((c - Reasoning.hitpadding <= d.x && c + Reasoning.hitpadding >= d.x) && (-Reasoning.yLimit <= d.y && Reasoning.yLimit >= d.y)) ? j : null)
			.filter(c => c !== null)
		
		if (hitTest.length) {
			const target = otherNodes.filter((c, j) => j === hitTest[0])
			
			// ESTABLISH THE RELATIONSHIP WITH TARGET NODE
			const d1 = target.datum()
			// HERE h STANDS FOR *hierarchy*
			const h0 = d.path.split('_')
			const h1 = d1.path.split('_')
			// HERE h*p STANDS FOR *hierarchy OF THE PARENT*
			const h0p = h0.slice(0)
			h0p.pop()
			const h1p = h1.slice(0)
			h1p.pop()

			// 01 - IF THE INDICATOR *IS* A SIBLING OF THE PREVIOUS ONE
			if (h0p.join('_') === h1p.join('_')) {
				// THE VALUES CAN BE ADDED

				// 01.a - IF EITHER NODE *IS NOT* ALREADY A SUM
				if (d.type !== 'sum' && d1.type !== 'sum') {
					// THEN CREATE THE SUM IN Mountains.rangeValues
					
					Mountains.rangeValues.push({ 
						type: 'sum', 
						key: `${d.key}+${d1.key}`, 
						path: `${h0.join('_')}+${d1.key}`, 
						value: `${h0.join('_')}+${d1.key}`, 
						x: d.x + d1.x,
						sources: [Object.assign({}, d), Object.assign({}, d1)]
					})
					Mountains.rangeValues.splice(Mountains.rangeValues.map(c => c.path).indexOf(d.path), 1)
					Mountains.rangeValues.splice(Mountains.rangeValues.map(c => c.path).indexOf(d1.path), 1)
				}
				// 01.b - IF EITHER NODE *IS* ALREADY A SUM
				else {
					// THEN ADD EITHER THE CURRENT OR TARGET NODE TO THE SUM

					if (d.sources) {
						d.key += `+${d1.key}`
						d.path += `+${d1.key}`
						d.value += `+${d1.key}`
						d.sources.push(Object.assign({}, d1))
						Mountains.rangeValues.splice(Mountains.rangeValues.map(c => c.path).indexOf(d1.path), 1)
					}
					else if (d1.sources) {
						d1.key += `+${d.key}`
						d1.path += `+${d.key}`
						d1.value += `+${d.key}`
						d1.sources.push(Object.assign({}, d))
						Mountains.rangeValues.splice(Mountains.rangeValues.map(c => c.path).indexOf(d.path), 1)
					}
				}
				console.log(Mountains.rangeValues)
			}
			// 02 - IF THE INDICATOR *IS NOT* A SIBLING OF THE PREVIOUS ONE
			else {
				// THE VALUES COULD BE MADE INTO A RATIO, IF THE TARGET NODE IS A PARENT OF THE CURRENT NODE


			}
		}

		Mountains.rangeValues.sort((a, b) => a.x - b.x)

		Mountains.init()
		Reasoning.init()
	})

Reasoning.init = _data => {
	const data = _data ? Mountains.parseData(_data) : d3.selectAll('g.range').data()
	
	const relations = Mountains.rangeRelations().map((d, i) => { return { type: d, index: i } })
	const nodeGroups = []
	while (relations.length) {
		let cut = relations.filter((d, i) => i > 0).map(d => d.type).indexOf('discrete')
		if (cut !== -1) cut ++ // WE NEED TO ADD 1 BECAUSE WE FILTERED THE FIRST RELATION OUT BEFORE
		else cut = relations.length
		nodeGroups.push(relations.splice(0, cut))
	}
	nodeGroups.forEach((d, i) => d.forEach((c, j) => {
		c.groupIndex = i
		c.offsetFactor = j - ((d.length / 2) - .5)
	}))

	// Reasoning.scale.domain([0, Mountains.rangeValues.length + 1])
	// Reasoning.scale.domain([0, Mountains.rangeRelations().filter(d => d === 'discrete').length + 1])
	Reasoning.scale.domain([0, nodeGroups.length + 1])

	const svg = d3.select('svg')
	const chain = svg.addElems('g', 'raisonnement', [{ values: Mountains.rangeValues, ref: nodeGroups.flatten() }])
		.attr('transform', `translate(${[0, horizon + (height() - horizon) * .5]})`)
		.each(Reasoning.draw)
	chain.addElems('line')
		.attrs({
			'x1': Reasoning.scale.range()[0],
			'x2': Reasoning.scale.range()[1],
			'y1': 0,
			'y2': 0
		})
}

Reasoning.draw = function (_d, _i) {

	const sel = d3.select(this)
	const relations = Mountains.rangeRelations()
	let iterator = 0
	const nodeoffset = Reasoning.nodeSize * 1.5
	
	let g = sel.selectAll('g.node')
		.data(_d.values, d => d.path)
	g.exit()
		.remove()
	g = g.enter()
		.append('g')
		.attrs({
			'class': 'node',
			'transform': (d, i) => {
				const ref = _d.ref[i]
				return `translate(${[d.x = Reasoning.scale(ref.groupIndex + 1) + ref.offsetFactor * nodeoffset, d.y = 0]})`
			}
		})
	.merge(g)
		.call(Reasoning.drag)
	g.transition()
		.attr('transform', (d, i) => {
			const ref = _d.ref[i]
			return `translate(${[d.x = Reasoning.scale(ref.groupIndex + 1) + ref.offsetFactor * nodeoffset, d.y = 0]})`
		})
	
	let circle = g.selectAll('circle')
		.data(d => [d], d => d.path)
	circle = circle.enter()
		.append('circle')
		.each(function (d, i) { d3.select(this).classed(`c-${i}`, true) })
		.attr('r', 0)
		.merge(circle)
	circle.transition()
		.attr('r', Reasoning.nodeSize)

	const label = g.addElems('text', 'label--value')
		.attrs({
			'x': -20,
			'y': 5,
			'transform': 'rotate(-45)'
		})
		.style('text-anchor', 'end')
		// .text(d => Mountains.rangeValues[d.index].value)
		.text(d => d.value)

}

Reasoning.tooltip = (_sel, _labels) => {
	let tooltip = _sel.selectAll('g.tooltip')
		.data(_labels)
	tooltip.exit().remove()
	tooltip = tooltip.enter()
		.append('g')
		.attr('class', 'tooltip')
		.style('opacity', 0)
		// ('g', 'tooltip', _labels)
		// .style('opacity', 0)

	tooltip.addElems('text', 'label')
		.text(d => d)

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
	tooltip.selectAll('path.bg').each(function () { sizes.push(this.getBBox().width + 10) })

	tooltip.transition()
		.attr('transform', function (d, i) {
			const bbox = d3.select(this).select('text.label').node().getBBox()
			const offset = i - (sizes.length / 2 - .5)
			return `translate(${[-(bbox.width / 2) + offset * d3.max(sizes), -(bbox.height + 7.5) - Reasoning.nodeSize]})`
		})
		.style('opacity', 1)
}