if (!Reasoning) { var Reasoning = {} }
Reasoning.scale = d3.scaleLinear()
	.rangeRound(Mountains.position.range())

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
		sel.attr('transform', `translate(${[d.x, 0]})`)

		const hitTest = positions.map((c, j) => (c - 25 <= d.x && c + 25 >= d.x) ? j : null)
			.filter(d => d !== null)
		
		if (hitTest.length) {
			const target = otherNodes.filter((c, j) => j === hitTest[0])
			// ANIMATE THE SIZE OF THE TARGET NODE
			if (!target.classed('transitionning')) {
				target.classed('transitionning', true)
					.select('circle')
				.transition()
					.duration(150)
					.attr('r', 25)
			}
		}
		else {
			const target = otherNodes.filter(function () { return d3.select(this).classed('transitionning') })
			target
				.classed('transitionning', false)
				.select('circle')
			.transition()
				.duration(150)
				.attr('r', 10)
		}

		// const target = evt.sourceEvent.target
		// if (target !== sel.select('circle').node())
		// 	if (target.tagName.toLowerCase() === 'circle' && !d3.select(target).classed('transitionning'))
		// 		d3.select(target)
		// 			.classed('transitionning', true)
		// 		.transition()
		// 			.attr('r', 25)
		// else 
		// 	if (d3.set(d3.selectAll('g.node > circle').nodes().map(d => d.classList.contains('transitionning'))).values().indexOf('true') !== -1)
		// 		d3.selectAll('g.node > circle')
		// 			.classed('transitionning', false)
		// 			.transition()
		// 			.attr('r', 10)

	})
	.on('end', function (d) {
		const node = this
		const sel = d3.select(this)
		const otherNodes = d3.selectAll('g.node').filter(function () { return this != node })
		const positions = otherNodes.data().map(c => c.x)

		const hitTest = positions.map((c, j) => (c - 25 <= d.x && c + 25 >= d.x) ? j : null)
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

		const order = d3.select(this.parentNode).selectAll('g.node').data()
			.sort((a, b) => a.x - b.x)
			.map((d, i) => {
				const obj = {}
				obj[d.path] = i
				return obj
			})
		Mountains.rangeValues.sort((a, b) => a.x - b.x)
		// console.log(Mountains.rangeValues, order)

		Mountains.init()
		Reasoning.init()
	})

Reasoning.init = _data => {
	const data = _data ? Mountains.parseData(_data) : d3.selectAll('g.range').data()

	// Reasoning.scale.domain([0, Mountains.rangeValues.length + 1])
	Reasoning.scale.domain([0, Mountains.rangeRelations().filter(d => d === 'discrete').length + 1])

	const svg = d3.select('svg')
	const chain = svg.addElems('g', 'raisonnement', [Mountains.rangeValues])
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

	let g = sel.selectAll('g.node')
		.data(_d, d => d.path)
	g.exit()
		.remove()
	g = g.enter()
		.append('g')
		.attrs({
			'class': 'node',
			'transform': (d, i) => `translate(${[d.x = Reasoning.scale(i + 1), 0]})`
		})
	.call(Reasoning.drag)
		.merge(g)
	g.transition()
		.attr('transform', (d, i) => {
			if (relations[i] === 'discrete') return `translate(${[d.x = Reasoning.scale(i + 1), 0]})`
			else return `translate(${[d.x = Reasoning.scale(i) + 10, 0]})`
		})

	let circle = g.selectAll('circle')
		.data(d => [d], d => d.path)
	circle = circle.enter()
		.append('circle')
		.each(function (d, i) { d3.select(this).classed(`c-${i}`, true) })
		.attr('r', 0)
		.merge(circle)
	circle.transition()
		.attr('r', 10)

	const label = g.addElems('text', 'label--value')
		.attrs({
			'x': -20,
			'y': 5,
			'transform': 'rotate(-45)'
		})
		.style('text-anchor', 'end')
		.text(d => d.value)

}