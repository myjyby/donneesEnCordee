if (!Reasoning) { var Reasoning = {} }

Reasoning.scale = d3.scaleLinear()

Reasoning.hitpadding = 25
Reasoning.yLimit = 50
Reasoning.nodeSize = 25

Reasoning.drag = d3.drag()
	.on('start', function () { d3.select(this).moveToFront().classed('no-events', true) })
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
				.call(UI.tooltip, [{ label: 'Supprimer', y: Reasoning.nodeSize }])
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
		const target = d3.select(d3.event.sourceEvent.target)
		
		if (hitTest.length || (target.findAncestor('tooltip') && target.findAncestor('node') && target.findAncestor('raisonnement'))) {
			const targetNode = hitTest.length ? otherNodes.filter((c, j) => j === hitTest[0]) : target.findAncestor('node')
			// ANIMATE THE SIZE OF THE TARGET NODE
			if (!targetNode.classed('transitionning')) {
				targetNode.classed('transitionning', true)
					.call(UI.tooltip, [{ label: '+', y: Reasoning.nodeSize }, { label: '÷', y: Reasoning.nodeSize }])
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
		const indicators = d3.select('div.menu--indicators').datum()
		const positions = otherNodes.data().map(c => c.x)

		// CHECK IF NODE SHOULD BE REMOVED
		if (Math.abs(d.y) >= Reasoning.yLimit) Mountains.rangeValues.splice(i, 1)

		const hitTest = positions.map((c, j) => ((c - Reasoning.hitpadding <= d.x && c + Reasoning.hitpadding >= d.x) && (-Reasoning.yLimit <= d.y && Reasoning.yLimit >= d.y)) ? j : null)
			.filter(c => c !== null)
		const target = d3.select(d3.event.sourceEvent.target)
		// console.log(target.node(), hitTest, target.datum())

		// console.log(target.node(), target.node().parentNode, target.node().parentNode.parentNode)

		// if (hitTest.length || target.findAncestor('tooltip') && target.findAncestor('node') && target.findAncestor('raisonnement')) {
		if (target.findAncestor('tooltip') && target.findAncestor('node') && target.findAncestor('raisonnement')) {

			const d1 = target.findAncestor('node').datum()
			let scale 
			if (d.type === 'value') scale = indicators.filter(c => c['Structure'] === d.path)[0]['Index_Echelle']
			else scale = d3.set(indicators.filter(c => d.sources.map(b => b.path).indexOf(c['Structure']) !== -1).map(c => c['Index_Echelle'])).values()[0]

			let targetScale 
			if (d1.type === 'value') targetScale = indicators.filter(c => c['Structure'] === d1.path)[0]['Index_Echelle']
			else targetScale = d3.set(indicators.filter(c => d1.sources.map(b => b.path).indexOf(c['Structure']) !== -1).map(c => c['Index_Echelle'])).values()[0]

			// ADDITIVE OPERATIONS ARE ONLY POSSIBLE ON INDICATORS THAT SHARE THE SAME SCALE (e.g. menages, personnes, etc.)
			if (scale === targetScale) {
				// 01 - REMOVE THE DRAGGED INDICATOR
				Mountains.rangeValues.splice(Mountains.rangeValues.map(c => c.path).indexOf(d.path), 1)
				// 02 - GET THE INDEX (POSITION) OF THE TARGET INDICATOR IN THE REASONING CHAIN
				const idx = Mountains.rangeValues.map(c => c.path).indexOf(d1.path)
				// 02.a - REMOVE THE TARGET INDICATOR
				Mountains.rangeValues.splice(idx, 1)
				// 03 - ADD A COMPISITE INDICATOR FOR THE SUM
				// Mountains.rangeValues.splice(idx, 0, { 
				// 	type: target.datum().label === '+' ? 'sum' : 'div', 
				// 	// key: `${d1.key}+${d.key}`, 
				// 	path: `${d1.path}+${d.path}`, 
				// 	// value: `${d1.value} + ${d.value}`, 
				// 	// x: d1.x + d.x,
				// 	// PUT THE TARGET FIRST, SINCE THE USER TECHNICALLY PLACES THE NODE ON TOP OF THE TARGET
				// 	sources: d.type === 'value' && d1.type === 'value' ? [Object.assign({}, d1), Object.assign({}, d)]
				// 			 : d.type === 'value' && d1.type !== 'value' ? d1.sources.concat([Object.assign({}, d)])
				// 			 : d.type !== 'value' && d1.type === 'value' ? ([Object.assign({}, d1)]).concat(d.sources)
				// 			 : d1.sources.concat(d)
				// })
				const obj = {}
				if (target.datum().label === '+') {
					obj.type = 'sum'
					if (d.type === 'value' && d1.type === 'value') obj.sources = [Object.assign({}, d1), Object.assign({}, d)]
					if (d.type === 'value' && d1.type !== 'value') obj.sources = d1.sources.concat([Object.assign({}, d)])
					if (d.type !== 'value' && d1.type === 'value') obj.sources = ([Object.assign({}, d1)]).concat(d.sources)
				}
				else if (target.datum().label === '÷') {
					obj.type = 'division'
					if (d.type === 'value' && d1.type === 'value') obj.sources = [Object.assign({ division: 'divisor' }, d1), Object.assign({ division: 'dividend' }, d)]
				}
				obj.path = `${d1.path}+${d.path}`

				Mountains.rangeValues.splice(idx, 0, obj)
				// console.log(Mountains.rangeValues)
			}
			// console.log(Mountains.rangeValues)


		}
		// console.log(d3.event.sourceEvent.target.classList)
		//console.log(hitTest)
		//console.log(Mountains.rangeValues)
		//console.log(Mountains.rangeRelations())
		
		/* THIS IS TEMP SO THAT NO OPERATIONS COME AND BREAK THE CODE
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
		*/

		Mountains.rangeValues.sort((a, b) => a.x - b.x)

		d3.select(this).classed('no-events', false) 
		d3.selectAll('.tooltip').remove()

		UI.redraw()
	})

Reasoning.init = _data => {
	const data = _data ? Mountains.parseData(_data) : d3.selectAll('g.range').data()
	
	let idx = 0
	const nodeGroups = Mountains.rangeRelations().map((d, i) => {
		return d.values.map((c, j) => {
			if (c.key === 'discrete') {
				const obj = {}
				obj.type = c.key
				obj.groupIndex = i
				obj.index = idx
				obj.offsetFactor = 0
				idx ++
				return [obj]
			}
			else if (['ordinal', 'series'].indexOf(c.key !== -1)) {
				return c.values.map((b, k) => {
					const obj = {}
					obj.type = c.key
					obj.groupIndex = i
					obj.index = idx
					obj.offsetFactor = k - ((c.values.length / 2) - .5)
					idx ++
					return obj
				})
			}
		})
	}).flatten()


	Reasoning.scale
		.domain([0, nodeGroups.length + 1])
		
	// const svg = d3.select('svg')
	// const chain = svg.addElems('g', 'raisonnement', [{ values: Mountains.rangeValues, ref: nodeGroups.flatten() }])
	// 	.attr('transform', `translate(${[0, Mountains.horizon + (UI.height - Mountains.horizon) * .75]})`)
	// 	.each(Reasoning.draw)
	// chain.addElems('line')
	// 	.attrs({
	// 		'x1': Reasoning.scale.range()[0],
	// 		'x2': Reasoning.scale.range()[1],
	// 		'y1': 0,
	// 		'y2': 0
	// 	})

	const cordee = d3.select('div.cordee--vis')


	cordee.addElems('div', 'raisonnement', [{ values: Mountains.rangeValues, ref: nodeGroups.flatten() }])
		.each(Reasoning.draw)
}

Reasoning.draw = function (_d, _i) {
	const sel = d3.select(this)
	const nodeoffset = Reasoning.nodeSize * .75
	
	Reasoning.scale.rangeRound([0, this.clientWidth || this.offsetWidth])

	let node = sel.selectAll('div.node')
		.data(_d.values, d => d.path)
	node.exit().remove()
	node = node.enter()
		.append('div')
		.attr('class', (d, i) => `node ${_d.ref[i].type}`)
		.style('width', `${Reasoning.nodeSize}px`)
		.style('height', `${Reasoning.nodeSize}px`)
		.style('transform', function (d, i) {
		 	const ref = _d.ref[i]
		 	return `translate(${d.x = Reasoning.scale(ref.groupIndex + 1) + ref.offsetFactor * nodeoffset}px, ${d.y = -Reasoning.nodeSize / 2}px)` 
		})
	.merge(node)
		.attrs({ 'class': (d, i) => `node ${_d.ref[i].type}`,
				 'data--label': d => d.value })
		.style('transform', function (d, i) {
		 	const ref = _d.ref[i]
		 	return `translate(${d.x = Reasoning.scale(ref.groupIndex + 1) + ref.offsetFactor * nodeoffset}px, ${d.y = -Reasoning.nodeSize / 2}px)` 
		})
		.call(Reasoning.drag)

	// return
	// let g = sel.selectAll('g.node')
	// 	.data(_d.values, d => d.path)
	// g.exit()
	// 	.remove()
	// g = g.enter()
	// 	.append('g')
	// 	.attrs({
	// 		'class': 'node', //d => `node ${d.type}`,
	// 		'transform': (d, i) => {
	// 			const ref = _d.ref[i]
	// 			return `translate(${[d.x = Reasoning.scale(ref.groupIndex + 1) + ref.offsetFactor * nodeoffset, d.y = 0]})`
	// 		}
	// 	})
	// .merge(g)
	// 	.call(Reasoning.drag)
	// g.transition()
	// 	.attr('transform', (d, i) => {
	// 		const ref = _d.ref[i]
	// 		return `translate(${[d.x = Reasoning.scale(ref.groupIndex + 1) + ref.offsetFactor * nodeoffset, d.y = 0]})`
	// 	})
	
	// let circle = g.selectAll('circle')
	// 	.data(d => d.type === 'value' ? [d] : d.sources, d => d.path)
	// circle.exit().remove()
	// circle = circle.enter()
	// 	.append('circle')
	// 	.each(function (d, i) { d3.select(this).classed(`c-${i}`, true) })
	// 	.attr('r', 0)
	// 	.style('stroke', function (d, i) {
	// 		const datum = this.parentNode['__data__']
	// 		if (datum.type === 'value') return null
	// 		else if (datum.type === 'sum' && i > 0) return 'rgba(255,255,255,.5)'
	// 		else if (datum.type === 'division' && i === 0) return 'rgba(51,51,51,.33)'
	// 		else return null
	// 	})
	// 	// .style('stroke-width', function (d, i) {
	// 	// 	const datum = this.parentNode['__data__']
	// 	// 	if (datum.type === 'value') return null
	// 	// 	else if (datum.type === 'sum' && i > 0) return null
	// 	// 	else if (datum.type === 'division' && i === 0) return 1.25
	// 	// 	else return null
	// 	// })
	// 	.style('fill', function (d, i) {
	// 		const datum = this.parentNode['__data__']
	// 		if (datum.type === 'value') return null
	// 		else if (datum.type === 'sum' && i > 0) return null
	// 		else if (datum.type === 'division' && i === 0) return 'transparent'
	// 		else return null
	// 	})
	// 	.merge(circle)
	// circle.transition()
	// 	.attr('r', function (d, i) {
	// 		const datum = this.parentNode['__data__']
	// 		// console.log(datum)
	// 		if (datum.type === 'value') return Reasoning.nodeSize
	// 		else if (datum.type === 'sum') return ((datum.sources.length - i) / datum.sources.length) * Reasoning.hitpadding / 2 //* datum.sources.length / 2
	// 		else if (datum.type === 'division') return ((datum.sources.length - i) / datum.sources.length) * Reasoning.nodeSize
	// 		else return Reasoning.nodeSize
	// 	})

	// const label = g.addElems('text', 'label--value')
	// 	.attrs({
	// 		'x': -20,
	// 		'y': 5,
	// 		'transform': 'rotate(-45)'
	// 	})
	// 	.style('text-anchor', 'end')
	// 	// .text(d => Mountains.rangeValues[d.index].value)
	// 	.text(d => d.value)

}

