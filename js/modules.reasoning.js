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
		const positions = otherNodes.data().map(function (d) { return d.left })
		const indicators = d3.select('div.menu--indicators').datum()
		const evt = d3.event
		const target = d3.select(evt.sourceEvent.target)

		// console.log(this, d)

		d.left += evt.dx
		d.left <= d3.min(Reasoning.scale.range()) ? d.left = d3.min(Reasoning.scale.range()) : null
		d.left >= d3.max(Reasoning.scale.range()) ? d.left = d3.max(Reasoning.scale.range()) : null
		
		d.top += evt.dy


		if ((target.findAncestor('operations') && target.findAncestor('node') && target.findAncestor('raisonnement')) === false && (Math.abs(d.top) >= Reasoning.yLimit)) {
			sel.style('transform', 'translate(' + d.left + 'px, ' + d.top + 'px)')

			sel.attr('data--label', 'Supprimer l’indicateur “' + d.value + '” du paysage')
			// NEED TO ADD LABEL HERE: REMOVE NODE?
		}
		else {
			sel.style('transform', 'translate(' + d.left + 'px, ' + d.origintop + 'px)')
			sel.attr('data--label', d.value)
		}


		// THIS IS NOT SHOWING ANYTHING > NEED TO SCALE NODES
		const hitTest = positions.map(function (c, j) {
			return ((c - Reasoning.hitpadding <= d.left && c + Reasoning.hitpadding >= d.left) && (-Reasoning.yLimit <= d.top && Reasoning.yLimit >= d.top)) ? j : null
		}).filter(function (c) { return c !== null })
		
		if (hitTest.length > 0 || (target.findAncestor('operations') && target.findAncestor('node') && target.findAncestor('raisonnement')) !== false) {
			const targetNode = hitTest.length ? otherNodes.filter(function (c, j) { return j === hitTest[0] }) : target.findAncestor('node')

			const d1 = targetNode.datum() || target.findAncestor('node').datum()

			let scale 
			if (d.type === 'value') scale = indicators.filter(function (c) { return c['Structure'] === d.path })[0]['Index_Echelle']
			else scale = d3.set(indicators.filter(function (c) { return d.sources.map(function (b) { return b.path }).indexOf(c['Structure']) !== -1 }).map(function (c) { return c['Index_Echelle'] })).values()[0]

			let targetScale 
			if (d1.type === 'value') targetScale = indicators.filter(function (c) { return c['Structure'] === d1.path })[0]['Index_Echelle']
			else targetScale = d3.set(indicators.filter(function (c) { return d1.sources.map(function (b) { return b.path }).indexOf(c['Structure']) !== -1 }).map(function (c) { return c['Index_Echelle'] })).values()[0]

				// USE scale === targetscale TO DETERMINE WHETHER AN ADDITION IS POSSIBLE

			// ANIMATE THE SIZE OF THE TARGET NODE
			const operations = []
			if (scale === targetScale && d.type !== 'division' && targetNode.datum().type !== 'division') operations.push({ operation: 'addition', label: 'Ajouter à'})
			if (['addition', 'division'].indexOf(d.type) === -1 && ['addition', 'division'].indexOf(targetNode.datum().type) === -1) operations.push({ operation: 'division', label: 'Diviser par' })

			targetNode.select('div.circle').style('transform', 'scale(2)')
			
			if (operations.length) {
				targetNode.addElems('div', 'operations')
					.style('height', ((operations.length * 1.75) + 1.5) + 'rem')
					.style('top', -((operations.length * 1.75) + 1.5) + 'rem')
				.addElems('div', 'operation-option', operations)
					.html(function (c) { return c.label })
			}
			else {
				console.log('here')
				targetNode.addElems('div', 'operations')
					.style('height', (1.75 * 2 + 1.5) + 'rem')
					.style('top', - (1.75 * 2 + 1.5) + 'rem')
				.addElems('div', 'null-operation')
					.html(function () {
						if (d.type === 'division') return 'Vous ne pouvez ni ajouter ni diviser le résultat d’une division.' 
						else if (d.type === 'addition' && targetNode.datum().type === 'division') return 'Vous ne pouvez pas diviser le résultat d’une addition.'
						else return 'Vous ne pouvez ni ajouter ni diviser le résultat d’une division.'
					})
			}
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
		const positions = otherNodes.data().map(function (d) { return d.left })
		const indicators = d3.select('div.menu--indicators').datum()
		const target = d3.select(d3.event.sourceEvent.target)

		// CHECK IF NODE SHOULD BE REMOVED
		if ((target.findAncestor('operations') && target.findAncestor('node') && target.findAncestor('raisonnement')) === false && (Math.abs(d.top) >= Reasoning.yLimit)) Mountains.rangeValues.splice(i, 1)

		const hitTest = positions.map(function (c, j) {
			return ((c - Reasoning.hitpadding <= d.left && c + Reasoning.hitpadding >= d.left) && (-Reasoning.yLimit <= d.top && Reasoning.yLimit >= d.top)) ? j : null
		}).filter(function (c) { return c !== null })


		if ((target.findAncestor('operations') && !target.classed('operations') && target.findAncestor('node') && target.findAncestor('raisonnement')) !== false) {

			const d1 = target.findAncestor('node').datum()

			let scale 
			if (d.type === 'value') scale = indicators.filter(function (c) { return c['Structure'] === d.path })[0]['Index_Echelle']
			else scale = d3.set(indicators.filter(function (c) { return d.sources.map(function (b) { return b.path }).indexOf(c['Structure']) !== -1 }).map(function (c) { return c['Index_Echelle'] })).values()[0]

			let targetScale 
			if (d1.type === 'value') targetScale = indicators.filter(function (c) { return c['Structure'] === d1.path })[0]['Index_Echelle']
			else targetScale = d3.set(indicators.filter(function (c) { return d1.sources.map(function (b) { return b.path }).indexOf(c['Structure']) !== -1 }).map(function (c) { return c['Index_Echelle'] })).values()[0]


			// ADDITIVE OPERATIONS ARE ONLY POSSIBLE ON INDICATORS THAT SHARE THE SAME SCALE (e.g. menages, personnes, etc.)
			// 01 - REMOVE THE DRAGGED INDICATOR
			Mountains.rangeValues.splice(Mountains.rangeValues.map(function (c) { return c.path }).indexOf(d.path), 1)
			// 02 - GET THE INDEX (POSITION) OF THE TARGET INDICATOR IN THE REASONING CHAIN
			const idx = Mountains.rangeValues.map(function (c) { return c.path }).indexOf(d1.path)
			// 02.a - REMOVE THE TARGET INDICATOR
			Mountains.rangeValues.splice(idx, 1)
			
			
			const obj = {}
			// obj.index = scale
			if (target.datum().operation === 'addition') {
				obj.type = 'addition'
				if (d.type === 'value' && d1.type === 'value') {
					obj.sources = [JSON.parse(JSON.stringify(d1)), JSON.parse(JSON.stringify(d))] 
					// obj.sources = [Object.assign({}, d1), Object.assign({}, d)] // OBJECT ASSIGN DOES NOT WORK IN IE
				}
				if (d.type === 'value' && d1.type !== 'value') {
					obj.sources = d1.sources.concat([JSON.parse(JSON.stringify(d))])
					// obj.sources = d1.sources.concat([Object.assign({}, d)])
				}
				if (d.type !== 'value' && d1.type === 'value') {
					obj.sources = ([JSON.parse(JSON.stringify(d1))]).concat(d.sources)
					// obj.sources = ([Object.assign({}, d1)]).concat(d.sources)
				}

				obj.path = d1.path + '+' + d.path
				obj.value = d1.value + ' + ' + d.value
			}
			else if (target.datum().operation === 'division') {
				obj.type = 'division'
				if (d.type === 'value' && d1.type === 'value') {
					const divisor = JSON.parse(JSON.stringify(d1))
					divisor.division = 'divisor'
					const dividend = JSON.parse(JSON.stringify(d))
					dividend.division = 'dividend'
					obj.sources = [divisor, dividend]
					// obj.sources = [Object.assign({ division: 'divisor' }, d1), Object.assign({ division: 'dividend' }, d)]
				}
				obj.path = d.path + '/' + d1.path
				obj.value = d.value + ' / ' + d1.value
			}
			Mountains.rangeValues.splice(idx, 0, obj)
		}
		
		d3.selectAll('div.operations').remove()

		Mountains.rangeValues.sort(function (a, b) { return a.left - b.left })

		d3.selectAll('.tooltip').remove()
		d3.select(this)//.moveToFront()
			.classed('no-events transition--none dragging', false) 
		d3.selectAll('div.paysage--vis, div.cordee--vis').classed('dragging', false)

		// REDRAW THE MOUNTAINS
		UI.redraw()
	})

Reasoning.init = function () {
	let idx = groupidx = 0
	const nodeGroups = Mountains.rangeRelations().map(function (d, i) {
		return d.values.map(function (c, j) {
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
				const obj = c.values.map(function (b, k) {
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
				const obj = {}
				obj.type = c.key
				obj.groupIndex = groupidx
				obj.index = idx
				obj.offsetFactor = 0 // k - ((c.values.length / 2) - .5)
				idx ++
				groupidx ++
				return [obj]
			}
			else if (c.key === 'division') {
				const obj = {}
				obj.type = c.key
				obj.groupIndex = groupidx
				obj.index = idx
				obj.offsetFactor = 0
				idx ++
				groupidx ++
				return [obj]
			}
		})
	}).flatten()

	Reasoning.scale.domain([0, nodeGroups.length + 1])
		
	const cordee = d3.select('div.cordee--vis')	
	cordee.addElems('div', 'raisonnement', [{ values: Mountains.rangeValues, ref: nodeGroups.flatten() }])
		.each(Reasoning.draw)

	d3.select(window).on('resize.cordee', function () { Reasoning.init() })
}

Reasoning.draw = function (_d, _i) {
	const sel = d3.select(this)
	const nodeoffset = Reasoning.nodeSize * .75
	
	Reasoning.scale.rangeRound([0, this.clientWidth || this.offsetWidth])

	let node = sel.selectAll('div.node')
		.data(_d.values, function (d) { return d.path })
	node.exit().remove()
	node = node.enter()
		.append('div')
		.attr('class', function (d, i) { return 'node ' + _d.ref[i].type })
		.style('width', Reasoning.nodeSize + 'px')
		.style('height', Reasoning.nodeSize + 'px')
		.style('transform', function (d, i) {
		 	const ref = _d.ref[i]
		 	return 'translate(' + (d.left = Math.round(Reasoning.scale(ref.groupIndex + 1) + ref.offsetFactor * nodeoffset)) + 'px, ' + (d.top = d.origintop = -Reasoning.nodeSize / 2) + 'px)'
		})
	.merge(node)
		.attrs({ 'class': function (d, i) { return 'node ' + _d.ref[i].type },
				 'data--label': function (d) { return d.value } })
		.style('transform', function (d, i) {
		 	const ref = _d.ref[i]
		 	return 'translate(' + (d.left = Math.round(Reasoning.scale(ref.groupIndex + 1) + ref.offsetFactor * nodeoffset)) + 'px, ' + (d.top = d.origintop = -Reasoning.nodeSize / 2) + 'px)'
		})
	.on('mouseover', function (d) {
		if (!d3.select('div.paysage--vis').classed('dragging')) {
			d3.selectAll('div.shape').filter(function (c) {
				if (d.type === 'value') return c.values.map(function (b) { return b.path }).indexOf(d.path) !== -1
				else if (d.type === 'addition') return c.values.map(function (b) { return b.path }).join('+') === d.path
			}).each(Mountains.labels)
			
			d3.selectAll('div.sommet').filter(function (c) {
				if (d.type === 'value') return c.values.map(function (b) { return b.path }).indexOf(d.path) === -1
				else if (d.type === 'addition') return c.values.map(function (b) { return b.path }).join('+') !== d.path
			}).classed('semi-transparent', true)
		}
	})
	.on('mouseout', function () {
		d3.selectAll('div.label--value').remove()
		d3.selectAll('.trend-ref').remove()
		d3.selectAll('div.sommet').classed('semi-transparent', false)
	})
	.call(Reasoning.drag)


	node.addElems('div', 'circle')
		.style('transform', null)
}

