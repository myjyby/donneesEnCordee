if (!Reasoning) { var Reasoning = {} }
Reasoning.scale = d3.scaleLinear()
	.rangeRound(Montagnes.position.range())
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

		// console.log(positions)
		const hitTest = positions.map((c, j) => (c - 25 <= d.x && c + 25 >= d.x) ? j : null)
			.filter(d => d !== null)
		
		if (hitTest.length) {
			const target = otherNodes.filter((c, j) => j === hitTest[0])
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
	.on('end', function () {
		const order = d3.select(this.parentNode).selectAll('g.node').data()
			.sort((a, b) => a.x - b.x)
			.map((d, i) => {
				const obj = {}
				obj[d.path] = i
				return obj
			})
		Montagnes.chaine.sort((a, b) => a.x - b.x)
		// console.log(Montagnes.chaine, order)

		Montagnes.init()
		Reasoning.init()
	})
Reasoning.init = _data => {
	const data = _data ? Montagnes.data(_data) : d3.selectAll('g.chaine').data()

	Reasoning.scale
		.domain([0, Montagnes.chaine.length + 1])//Montagnes.chaine.map(d => d.path))

	const svg = d3.select('svg')
	const chain = svg.addElems('g', 'raisonnement', [Montagnes.chaine])
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

	const g = sel.selectAll('g.node')
		.data(_d, d => d.path)
	g.exit()
		.remove()
	const gEnter = g.enter()
		.append('g')
		.attrs({
			'class': 'node',
			'transform': (d, i) => `translate(${[d.x = Reasoning.scale(i + 1), 0]})`
		})
	.call(Reasoning.drag)
	.merge(g)
	gEnter.transition()
		.attr('transform', (d, i) => `translate(${[d.x = Reasoning.scale(i + 1), 0]})`)

	const circle = gEnter.selectAll('circle')
		.data(d => [d], d => d.path)
	const circleEnter = circle.enter()
		.append('circle')
		.each(function (d, i) { d3.select(this).classed(`c-${i}`, true) })
		.attr('r', 0)
	.merge(circle)
	circleEnter.transition()
		.attr('r', 10)

	const label = gEnter.addElems('text', 'label--value')
		.attrs({
			'x': -20,
			'y': 5,
			'transform': 'rotate(-45)'
		})
		.style('text-anchor', 'end')
		.text(d => d.path)

}