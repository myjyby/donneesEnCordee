if (!Reasoning) { var Reasoning = {} }

Reasoning.scale = d3.scaleLinear()

Reasoning.hitpadding = 25
Reasoning.yLimit = 50
Reasoning.nodeSize = 20

Reasoning.drag = d3.drag()
	.on('start', function () { 
		d3.select(this).moveToFront()
			.classed('no-events transition--none dragging', true) 
		d3.selectAll('div.sommet, div.label--name').classed('semi-transparent', false)
		d3.selectAll('div.label--value').remove()
		d3.selectAll('.trend-ref').remove()
		d3.selectAll('div.paysage--vis, div.cordee--vis').classed('dragging', true)
	})
	.on('drag', function (d) {
		const node = this
		const sel = d3.select(this)
		const otherNodes = d3.selectAll('div.node').filter(function () { return this != node })
		const positions = otherNodes.data().map(d => d.left)
		const indicators = d3.select('div.menu--indicators').datum()
		const evt = d3.event
		const target = d3.select(evt.sourceEvent.target)

		d.left += evt.dx
		d.left <= d3.min(Reasoning.scale.range()) ? d.left = d3.min(Reasoning.scale.range()) : null
		d.left >= d3.max(Reasoning.scale.range()) ? d.left = d3.max(Reasoning.scale.range()) : null
		
		d.top += evt.dy


		if ((target.findAncestor('operations') && target.findAncestor('node') && target.findAncestor('raisonnement')) === false && (Math.abs(d.top) >= Reasoning.yLimit)) {
			sel.style('transform', `translate(${d.left}px, ${d.top}px)`)

			sel.attr('data--label', `Supprimer l’indicateur “${d.value}” du paysage`)
			// NEED TO ADD LABEL HERE: REMOVE NODE?
		}
		else {
			sel.style('transform', `translate(${d.left}px, ${d.origintop}px)`)
			sel.attr('data--label', d.value)
		}


		// THIS IS NOT SHOWING ANYTHING > NEED TO SCALE NODES
		const hitTest = positions.map((c, j) => {
			return ((c - Reasoning.hitpadding <= d.left && c + Reasoning.hitpadding >= d.left) && (-Reasoning.yLimit <= d.top && Reasoning.yLimit >= d.top)) ? j : null
		}).filter(c => c !== null)
		
		if (hitTest.length > 0 || (target.findAncestor('operations') && target.findAncestor('node') && target.findAncestor('raisonnement')) !== false) {
			const targetNode = hitTest.length ? otherNodes.filter((c, j) => j === hitTest[0]) : target.findAncestor('node')

			const d1 = targetNode.datum() || target.findAncestor('node').datum()

			let scale 
			if (d.type === 'value') scale = indicators.filter(c => c['Structure'] === d.path)[0]['Index_Echelle']
			else scale = d3.set(indicators.filter(c => d.sources.map(b => b.path).indexOf(c['Structure']) !== -1).map(c => c['Index_Echelle'])).values()[0]

			let targetScale 
			if (d1.type === 'value') targetScale = indicators.filter(c => c['Structure'] === d1.path)[0]['Index_Echelle']
			else targetScale = d3.set(indicators.filter(c => d1.sources.map(b => b.path).indexOf(c['Structure']) !== -1).map(c => c['Index_Echelle'])).values()[0]

				// USE scale === targetscale TO DETERMINE WHETHER AN ADDITION IS POSSIBLE

			// ANIMATE THE SIZE OF THE TARGET NODE
			const operations = []
			if (scale === targetScale) operations.push({ operation: 'addition', label: 'Ajouter à'})
			operations.push({ operation: 'division', label: 'Diviser par' })

			targetNode.select('div.circle').style('transform', 'scale(2)')
			
			targetNode.addElems('div', 'operations')
				.style('height', `${(operations.length * 1.75) + 1.5}rem`)
				.style('top', `-${(operations.length * 1.75) + 1.5}rem`)
				.addElems('div', 'operation-option', operations)
				.html(c => c.label)
		}
		else {
			otherNodes.select('div.circle').style('transform', null)
			d3.selectAll('div.operations').remove()
		}
	})
	.on('end', function (d, i) {
		const node = this
		const sel = d3.select(this)
		const otherNodes = d3.selectAll('div.node').filter(function () { return this != node })
		const positions = otherNodes.data().map(d => d.left)
		const indicators = d3.select('div.menu--indicators').datum()
		const target = d3.select(d3.event.sourceEvent.target)

		// CHECK IF NODE SHOULD BE REMOVED
		if ((target.findAncestor('operations') && target.findAncestor('node') && target.findAncestor('raisonnement')) === false && (Math.abs(d.top) >= Reasoning.yLimit)) Mountains.rangeValues.splice(i, 1)

		const hitTest = positions.map((c, j) => {
			return ((c - Reasoning.hitpadding <= d.left && c + Reasoning.hitpadding >= d.left) && (-Reasoning.yLimit <= d.top && Reasoning.yLimit >= d.top)) ? j : null
		}).filter(c => c !== null)


		if ((target.findAncestor('operations') && !target.classed('operations') && target.findAncestor('node') && target.findAncestor('raisonnement')) !== false) {

			const d1 = target.findAncestor('node').datum()

				let scale 
				if (d.type === 'value') scale = indicators.filter(c => c['Structure'] === d.path)[0]['Index_Echelle']
				else scale = d3.set(indicators.filter(c => d.sources.map(b => b.path).indexOf(c['Structure']) !== -1).map(c => c['Index_Echelle'])).values()[0]

				let targetScale 
				if (d1.type === 'value') targetScale = indicators.filter(c => c['Structure'] === d1.path)[0]['Index_Echelle']
				else targetScale = d3.set(indicators.filter(c => d1.sources.map(b => b.path).indexOf(c['Structure']) !== -1).map(c => c['Index_Echelle'])).values()[0]


				// ADDITIVE OPERATIONS ARE ONLY POSSIBLE ON INDICATORS THAT SHARE THE SAME SCALE (e.g. menages, personnes, etc.)
				// if (scale === targetScale) {
					// 01 - REMOVE THE DRAGGED INDICATOR
					// return console.log(Mountains.rangeValues)
					Mountains.rangeValues.splice(Mountains.rangeValues.map(c => c.path).indexOf(d.path), 1)
					// 02 - GET THE INDEX (POSITION) OF THE TARGET INDICATOR IN THE REASONING CHAIN
					const idx = Mountains.rangeValues.map(c => c.path).indexOf(d1.path)
					// 02.a - REMOVE THE TARGET INDICATOR
					Mountains.rangeValues.splice(idx, 1)
					
					
					const obj = {}
					// obj.index = scale
					if (target.datum().operation === 'addition') {
						obj.type = 'addition'
						if (d.type === 'value' && d1.type === 'value') obj.sources = [Object.assign({}, d1), Object.assign({}, d)] // OBJECT ASSIGN DOES NOT WORK IN IE
						if (d.type === 'value' && d1.type !== 'value') obj.sources = d1.sources.concat([Object.assign({}, d)])
						if (d.type !== 'value' && d1.type === 'value') obj.sources = ([Object.assign({}, d1)]).concat(d.sources)

						obj.path = `${d1.path}+${d.path}`
						obj.value = `${d1.value} + ${d.value}`
					}
					else if (target.datum().operation === 'division') {
						obj.type = 'division'
						if (d.type === 'value' && d1.type === 'value') obj.sources = [Object.assign({ division: 'divisor' }, d1), Object.assign({ division: 'dividend' }, d)]

						obj.path = `${d.path}/${d1.path}`
						obj.value = `${d.value} / ${d1.value}`
					}

					Mountains.rangeValues.splice(idx, 0, obj)
				// }
		}
		
		d3.selectAll('div.operations').remove()

		Mountains.rangeValues.sort((a, b) => a.left - b.left)

		// d3.select(this).classed('no-events', false) 
		d3.selectAll('.tooltip').remove()

		d3.select(this)//.moveToFront()
			.classed('no-events transition--none dragging', false) 
		d3.selectAll('div.paysage--vis, div.cordee--vis').classed('dragging', false)

		UI.redraw()
	})

Reasoning.init = _ => {
	// const data = _data ? Mountains.parseData(_data) : d3.selectAll('g.range').data()
	
	// const data = Mountains.rangeRelations().map(d => {
	// 	return d.map(c => {

	// 	})
	// })

	// console.log(Mountains.rangeRelations())

	let idx = groupidx = 0
	const nodeGroups = Mountains.rangeRelations().map((d, i) => {
		return d.values.map((c, j) => {
			// console.log('\n')
			// console.log(c.key)
			// console.log(c)
			if (c.key === 'discrete') {
				const obj = {}
				obj.type = c.key
				obj.groupIndex = groupidx
				obj.index = idx
				obj.offsetFactor = 0
				idx ++
				groupidx ++
				return [obj]
			}
			else if (['ordinal', 'series'].indexOf(c.key) !== -1) {
				const obj = c.values.map((b, k) => {
					const obj = {}
					obj.type = c.key
					obj.groupIndex = groupidx
					obj.index = idx
					obj.offsetFactor = k - ((c.values.length / 2) - .5)
					idx ++
					return obj
				})
				groupidx ++
				return obj
			}
			else if (c.key === 'addition') { // HERE WE ONLY KEEP A REFERENCE FOR THE FIRST ELEMENT
				// console.log(c)
				// const obj = c.values.map((b, k) => {
					const obj = {}
					obj.type = c.key
					// obj.type = c.values[0].key
					obj.groupIndex = groupidx
					obj.index = idx
					obj.offsetFactor = 0//k - ((c.values.length / 2) - .5)
					idx ++
					// return obj
				// })
				groupidx ++
				return [obj]
			}
			else if (c.key === 'division') {
				// FILL IN HERE
				// console.log(c)
				// const obj = c.values.map((b, k) => {
					const obj = {}
					obj.type = c.key
					// obj.type = c.values[0].key
					obj.groupIndex = groupidx
					obj.index = idx
					obj.offsetFactor = 0
					idx ++
					// return obj
				// })
				groupidx ++
				return [obj]
			}
		})
	}).flatten()

	Reasoning.scale.domain([0, nodeGroups.length + 1])

	// console.log(Mountains.rangeValues, nodeGroups)
		
	const cordee = d3.select('div.cordee--vis')	
	cordee.addElems('div', 'raisonnement', [{ values: Mountains.rangeValues, ref: nodeGroups.flatten() }])
		.each(Reasoning.draw)

	d3.select(window).on('resize.cordee', _ => Reasoning.init())
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
		 	return `translate(${d.left = Math.round(Reasoning.scale(ref.groupIndex + 1) + ref.offsetFactor * nodeoffset)}px, ${d.top = d.origintop = -Reasoning.nodeSize / 2}px)` 
		})
	.merge(node)
		.attrs({ 'class': (d, i) => `node ${_d.ref[i].type}`,
				 'data--label': d => d.value })
		.style('transform', function (d, i) {
		 	const ref = _d.ref[i]
		 	return `translate(${d.left = Math.round(Reasoning.scale(ref.groupIndex + 1) + ref.offsetFactor * nodeoffset)}px, ${d.top = d.origintop = -Reasoning.nodeSize / 2}px)` 
		})
	.on('mouseover', function (d) {
		if (!d3.select('div.paysage--vis').classed('dragging')) {
			d3.selectAll('div.shape').filter(c => {
				if (d.type === 'value') return c.values.map(b => b.path).indexOf(d.path) !== -1
				else if (d.type === 'addition') return c.values.map(b => b.path).join('+') === d.path
			}).each(Mountains.labels)
			
			d3.selectAll('div.sommet').filter(c => {
				if (d.type === 'value') return c.values.map(b => b.path).indexOf(d.path) === -1
				else if (d.type === 'addition') return c.values.map(b => b.path).join('+') !== d.path
			}).classed('semi-transparent', true)
		}
	})
	.on('mouseout', _ => {
		d3.selectAll('div.label--value').remove()
		d3.selectAll('.trend-ref').remove()
		d3.selectAll('div.sommet').classed('semi-transparent', false)
	})
		.call(Reasoning.drag)


	node.addElems('div', 'circle')
		.style('transform', null)

}

