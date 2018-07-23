// TAXONOMY FOR MOUNTAINS
// FOR INSPIRATION, SEE https://www.google.com/search?q=Mountain+range&stick=H4sIAAAAAAAAAONgecToyC3w8sc9YSmLSWtOXmM04uIKzsgvd80rySypFFLhYoOypLh4pDj0c_UNTMorijQYpLi44DweACtZhdhGAAAA&sa=X&ved=0ahUKEwj34NqQoKHcAhVqk-AKHSXOCC0Q6RMI0wEwEA&biw=1680&bih=949
// 0: MOUNTAINS
// 1: RANGE
// 2: RIDGE (for continuous connections) / PASS (for ordinal connections)
// 3: PEAK

if (!Mountains) { var Mountains = {} }
Mountains.data = []

Mountains.parseData = _data => {
	return _data.map(d => { // THIS KEEPS ONLY THE NUMERICAL INDICATORS
		const obj = {}
		for (let key in d) {
			if (Number.isInteger(d[key])) obj[key] = d[key]
		}
		obj['Commune'] = d['Commune']
		obj['Commune_court'] = d['Commune_court']
		return obj
	})
}

Mountains.scale = d3.scaleLinear()

Mountains.position = d3.scaleBand()
	.rangeRound([width() * .25, width() - width() * .25])
	.padding(.1)

Mountains.rangeValues = []
Mountains.normalizedValues = []

Mountains.colors = d3.scaleLinear()
	.domain([0, Mountains.data.length])
	.range(['#344758', '#CED5E4'])

Mountains.drag = d3.drag()
	.on('start', _ => {
		const svg = d3.select('svg').classed('dragging', true)
		svg.selectAll('line.axis--link').remove()
		svg.selectAll('.label').remove()
	})
	.on('drag', function (d) {
		const evt = d3.event
		d3.select(this).attr('transform', `translate(${[d.x += evt.dx, d.y]})`)
	})
	.on('end', _ => d3.select('svg').classed('dragging', false))

Mountains.init = _data => {
	Mountains.data = _data ? Mountains.parseData(_data) : d3.selectAll('g.range').data()
	// console.log(this)
	
	Mountains.data.sort((a, b) => {
		// if (!Mountains.rangeValues.length) return Mountains.height(b, defaultIndicator) - Mountains.height(a, defaultIndicator)
		// else 
		return d3.sum(Mountains.rangeValues.map(c => Mountains.height(b, c.path))) - d3.sum(Mountains.rangeValues.map(c => Mountains.height(a, c.path)))
	}) // MIGHT NEED TO CHANGE THIS TO ACCOUNT FOR SUMS

	Mountains.scale.range([0, -(horizon - horizon * .33)]) // CHANGE THIS FOR MOUNT HEIGHT

	if (!Mountains.position.domain().length) {
		Mountains.position.domain(Mountains.data.map(d => d['Commune']).shuffle())
	}

	const svg = d3.select('svg')
	const mountain = svg.select('g.mountain')

	let ranges = mountain.selectAll('g.range')
		.data(Mountains.data) // , d => d['Commune'])
	ranges.exit().remove()
	ranges = ranges.enter()
		.append('g')
		.attrs({ 'class': 'range',
				 'transform': (d, i) => `translate(${[Mountains.position(d['Commune']), horizon + i * ((height() - horizon) * .75) / Mountains.data.length]})` })
	.merge(ranges)
	// addElems('g', 'range', Mountains.data)
		// .attr('transform', (d, i) => `translate(${[d.x = Mountains.position(d['Commune']), d.y = horizon + i * maxHeight / 5]})`)
		.on('mouseover', function (d) {
			if (svg.classed('dragging')) return null

			const node = this
			const sel = d3.select(this)

			if (Math.round(d.y) === Math.round(horizon)) {
				svg.selectAll('g.range')
					.filter(function () { return this !== node })
				.transition()
					.duration(150)
					.style('opacity', .25)
					
				sel.style('fill', '#344758')
			}
		})
		.on('mouseout', function (d, i) {
			// if (svg.classed('dragging')) return null

			const sel = d3.select(this)

			svg.selectAll('g.range')
				.transition()
				.duration(150)
				.style('opacity', 1)
				
			sel.style('fill', Mountains.colors(i))
		})
		.call(Mountains.drag)
		.each(Mountains.draw)
	ranges.transition()
		.attr('transform', (d, i) => {
			d.x ? d.x = d.x : d.x = Mountains.position(d['Commune'])
			// d.y ? d.y = d.y : d.y = horizon + i * maxHeight / 5
			d.y = horizon + i * ((height() - horizon) * .75) / Mountains.data.length
			//horizon + i * maxHeight / 5 // NEED TO KEEP THIS FLEXIBLE IN CASE THE OVERALL SIZE OF THE MOUNTAIN RANGE CHANGES
			return `translate(${[d.x, d.y]})`
		})
		.each(function () { d3.select(this).call(Mountains.placeLabels) })
		.style('fill', (d, i) => Mountains.colors(i))

	// console.log(Mountains.rangeRelations())
}

Mountains.rangeRelations = _ => {
	return Mountains.rangeValues.map((d1, i) => {
		
		if (i === 0) return 'discrete'
		else {
			// THIS IS THE PREVIOUS INDICATOR IN THE RANGE
			const d0 = Mountains.rangeValues[i - 1]
			// HERE h STANDS FOR *hierarchy*
			const h0 = d0.path.split('_')
			const h1 = d1.path.split('_')
			// HERE h*p STANDS FOR *hierarchy OF THE PARENT*
			const h0p = h0.slice(0)
			h0p.pop()
			const h1p = h1.slice(0)
			h1p.pop()
			
			// 01 — IF THE INDICATOR HAS A YEAR IN ITS HIERARCHY
			// AND THE PREVIOUS INDICATOR HAS A YEAR AT THE SAME LEVEL OF HIERARCHY
			// AND THE YEAR IS THE SAME
			// IT IS A *SERIES* RELATIONSHIP
			if (Heuristics.hasYear(h1) !== -1 
				&& Heuristics.hasYear(h0) === Heuristics.hasYear(h1) 
				&& h0[Heuristics.hasYear(h0)] === h1[Heuristics.hasYear(h1)]
			) {
				// IF THERE IS ONLY ONE LEVEL IN THE HIERARCHY THAT DIFFERS
				// AND THAT LEVEL IS NOT THE TOP LEVEL
				const arr =[]
				h0r = h0.slice(0, Heuristics.hasYear(h0))
				h1r = h1.slice(0, Heuristics.hasYear(h1))
				h0r.forEach((c, j) => arr.push(c === h1r[j]))
				if (arr.filter(c => c === false).length <= 1 && arr[0] === true) return 'ordinal'
			}
			// 02 - IF THE INDICATOR *IS NOT* A SIBLING OF THE PREVIOUS ONE
			// IT IS A *DISCRETE* RELATIONSHIP (NO RELATIONSHIP) BY DEFAULT
			else if (h0p.join('_') !== h1p.join('_')) return 'discrete'
			// 03 - IF THE INDICATOR *IS* A SIBLING OF THE PREVIOUS ONE
			// IT IS EITHER A *SERIES* OR AN *ORDINAL* RELATIONSHIP
			else {
				// 03.a - IF THERE IS A YEAR IN THE HIERARCHY AND THE SIBLING INDICATORS HAVE A *TEMPORAL* (YEAR) CONNECTION
				if (Heuristics.hasYear(h1) !== -1 && Heuristics.hasYear(h0) === Heuristics.hasYear(h1)) {
					// 03.a.i - IF THE YEAR IS THE LAST LEAF OF THE HIERARCHY TREE (e.g., APA_domicile_Annee_2016),
					// OR IF THERE IS A YEAR IN THE HIERARCHY TREE, 
						// BUT IT IS NOT THE LAST LEAF, 
						// AND THE LAST LEAF OF THE SIBLING INDICATORS IS THE SAME 
						// (e.g. Demographie_2013_Age_60-79 AND Demographie_2008_Age_60-79)
					// IT IS A *SERIES* RELATIONSHIP
					if (Heuristics.hasYear(h1) === h1.length - 1 || h0.last() === h1.last()) return 'series'
					// 03.a.ii - IF THE SIBLING INDICATORS HAVE THE SAME YEAR IN THEIR HIERARCHY
					// IT IS AN *ORDINAL* RELATIONSHIP
					else if (h0[Heuristics.hasYear(h0)] === h1[Heuristics.hasYear(h1)]) return 'ordinal'
				}
				// 03.b - IF THERE IS NO YEAR IN THE HIERARCHY
				// IT IS AN *ORDINAL* RELATIONSHIP
				else return 'ordinal'				
			}
		}
	})
}

Mountains.renderings = _commune => { // WE STILL HAVE A SORTING PROBLEM HERE
	const relations = Mountains.rangeRelations()
	const indicators = d3.select('div.menu--indicators').datum()

	const obj = {}
	obj.paths = []
	obj.x = 0

	let path = {}
	path.enter = []
	path.transition = []

	const axes = []

	Mountains.rangeValues.forEach((d, i) => {

		const scale = indicators.filter(c => c['Structure'] === d.path)[0]['Index_Echelle']

		// CHECK WHETHER THE SCALE SHOULD BE NORMALIZED PER CAPITA
		let isNormalized = false
		let normalizingValue = 1

		// IF THE RELATION IS discrete, START A NEW PEAK
		if (relations[i] === 'discrete') { // THIS IS WHERE WE SHOULD CHECK FOR NEW SCALES
			// IF IT IS THE FIRST PEAK, THEN SET THE SCALE FOR THE RANGE
			if (i === 0) {
				
				isNormalized = Mountains.normalizedValues.indexOf(scale) !== -1
				normalizingValue = isNormalized ? _commune['Enfance_Population'] !== 0 ? _commune['Enfance_Population'] : 1 : 1 // THIS COMPLICATED fn IS JUST TO MAKE SURE WE DO NOT END UP WITH A NORMALIZING VALUE OF 0 (WHICH WOULD RESULT IN NORMALIZED VALUES OF +Infintiy)

				Mountains.setScale(_commune, i, isNormalized)
				// console.log(_commune['Commune_court'], _commune['Enfance_Population'], Mountains.scale.domain())
				axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
			}
			// IF IT IS NOT THE FIRST PEAK, FINISH THE PREVIOUS PEAK WITH p0, THEN RESET THE SCALE FOR THE NEW RANGE (IF THE TYPE OF SCALE IS DIFFERENT)
			else if (i > 0) {
				// CHECK WHETHER THE NEW PEAK SHOULD BE PROJECTED ON THE SAME SCALE
				const prevPath = Mountains.rangeValues[i - 1].path
				const prevScale = indicators.filter(c => c['Structure'] === prevPath)[0]['Index_Echelle']
				// MAKE SURE THE SCALE IS STILL THAT OF THE PREVIOUS PEAK
				const isPrevNormalized = Mountains.normalizedValues.indexOf(prevScale) !== -1
				const prevNormalizingValue = isPrevNormalized ? _commune['Enfance_Population'] !== 0 ? _commune['Enfance_Population'] : 1 : 1

				Mountains.setScale(_commune, i - 1, isPrevNormalized)

				const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / prevNormalizingValue) 
				obj.x -= p0 * .5
				
				path.enter.push(`L${[obj.x, 0]}`)
				path.transition.push(`L${[obj.x, 0]}`)
				obj.paths.push(path)
				
				path = {}
				path.enter = []
				path.transition = []

				// IF THE TYPE OF SCALE IS NOT THE SAME, THE CHANGE THE Mountains.scale.domain()
				// AND PUSH THE NEXT PEAK HORIZONTALLY AWAY
				if (prevScale !== scale) {
					isNormalized = Mountains.normalizedValues.indexOf(scale) !== -1
					normalizingValue = isNormalized ? _commune['Enfance_Population'] !== 0 ? _commune['Enfance_Population'] : 1 : 1

					Mountains.setScale(_commune, i, isNormalized)
					obj.x += 50
					axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
				}
			}
			// SET THE HEIGHT (AND WIDTH) OF THE NEW PEAK
			const p1 = Mountains.scale(_commune[d.path] / normalizingValue)
			// DETERMINE THE COLOR OF THE NEW PEAK
			path.color = d.path.split('_')[0]
			// START THE NEW PEAK
			path.enter.push(`M${[obj.x, 0]}`)
			path.transition.push(`M${[obj.x, 0]}`)
			// CREATE THE PEAK
			obj.x -= p1 * .5
			path.enter.push(`L${[obj.x, 0]}`)
			path.transition.push(`L${[obj.x, p1]}`)
		}
		else if (relations[i] === 'ordinal') {
			const p1 = Mountains.scale(_commune[d.path] / normalizingValue)
			const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / normalizingValue)
			
			if (Math.abs(p0) < Math.abs(p1)) {
				obj.x -= p0 * .25
				path.enter.push(`L${[obj.x, 0]}`)
				path.transition.push(`L${[obj.x, p0 * .5]}`)

				obj.x -= (p1 * .5 - p0 * .25)
				path.enter.push(`L${[obj.x, 0]}`)
				path.transition.push(`L${[obj.x, p1]}`)
			}
			else {
				obj.x -= (p0 * .5 - p1 * .25)
				path.enter.push(`L${[obj.x, 0]}`)
				path.transition.push(`L${[obj.x, p1 * .5]}`)

				obj.x -= p1 * .25
				path.enter.push(`L${[obj.x, 0]}`)
				path.transition.push(`L${[obj.x, p1]}`)	
			}
		}
		else if (relations[i] === 'series') {
			const p1 = Mountains.scale(_commune[d.path] / normalizingValue)

			obj.x -= p1 * .5
			path.enter.push(`L${[obj.x, 0]}`)
			path.transition.push(`L${[obj.x, p1]}`)
		}

		if (i === Mountains.rangeValues.length - 1) {
			const p1 = Mountains.scale(_commune[d.path] / normalizingValue)

			obj.x -= p1 * .5
			path.enter.push(`L${[obj.x, 0]}`)
			path.transition.push(`L${[obj.x, 0]}`)

			obj.paths.push(path)
		}
	})
	return { paths: obj, axes: axes }
}

Mountains.draw = function (_d, _i) {
	const svg = d3.select('svg')
	const sel = d3.select(this)
	
	// WORKING HERE
	const renderings = Mountains.renderings(_d)
	const paths = renderings.paths
	const axes = renderings.axes

	const ridges = sel.addElems('g', 'ridge', [paths])
	ridges.transition()
		.attr('transform', (d, i) => `translate(${[-d.x / 2, 0]})`)
		
	let peaks = ridges.selectAll('path.peak')
		.data(d => d.paths)
	
	peaks.exit()
		.transition()
		.attr('d', d => d.enter.join(' '))
	.on('end', function () { d3.select(this).remove() })
	
	peaks = peaks.enter()
		.append('path')
		.attrs({ 'class': 'peak',
				 'd': d => d.enter.join(' ') })
		.style('fill', (d, i) => {
			return `url(#gradient-${d.color})`
			// return d3.rgb(Menu.colors(d.color)).brighter(((d3.selectAll('g.range').size() - _i) / d3.selectAll('g.range').size()) * 2)
		})
		// .on('mouseover', function (d) {
		// 	if (svg.classed('dragging')) return null
		// 	const ridge = d3.select(this.parentNode)
		// 	const peakBBox = this.getBoundingClientRect()

		// 	ridge.addElems('line', 'axis--link', d.peaks)
		// 		.attrs({
		// 			'x1': c => c.point[0],
		// 			'x2': c => c.point[0],
		// 			'y1': 0,
		// 			'y2': c => c.point[1] - 16
		// 		})
		// 	const labels = ridge.addElems('g', 'label', d.peaks)
		// 		.attr('transform', c => `translate(${[c.point[0], c.point[1] - (16 + 8)]})`)
			
		// 	labels.addElems('text', 'label--value')
		// 		.attrs({
		// 			'text-anchor': 'start',
		// 			'x': 10,
		// 			'dy': '.07em'
		// 		})
		// 		.text(c => printNumber(c.value))
			
		// 	labels.insertElems('text.label--value', 'rect', 'label--box')
		// 		.attrs({
		// 			'x': 0,
		// 			'y': function () {
		// 				const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
		// 				return -bbox.height
		// 			},
		// 			'width': function () {
		// 				const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
		// 				return bbox.width + 20
		// 			},
		// 			'height': function () {
		// 				const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
		// 				return bbox.height + 8
		// 			}
		// 		})
		// })
		// .on('mouseout', _ => {
		// 	svg.selectAll('line.axis--link').remove()
		// 	svg.selectAll('.label').remove()
		// })
		.on('dblclick', console.log)
	.merge(peaks)
	
	peaks.transition()
		// .duration(500)
		.attr('d', d => d.transition.join(' '))
		.style('fill', (d, i) => {
			return `url(#gradient-${d.color})`
			// return d3.rgb(Menu.colors(d.color)).brighter(((d3.selectAll('g.range').size() - _i) / d3.selectAll('g.range').size()) * 2)
			// return d3.rgb(Menu.colors(Mountains.rangeValues[i].path.split('_')[0]))
				// .brighter(((d3.selectAll('g.range').size() - _i) / d3.selectAll('g.range').size()) * 2)
		})

	ridges.addElems('line', 'basis')
		.attrs({ 'x1': d => -50, // -d.x / 5,
				 'x2': d => width(), // d.x + 50, // d.x * 6 / 5,
				 'y1': 0,
				 'y2': 0 })

	if (_i === 0) { // CHANGE THIS TO RIDGE IN FOCUS (THE ONE ON THE BASELINE)
		const axis = ridges.addElems('g', 'axis axis--y', axes)
			.attr('transform', d => `translate(${[d.x, -1]})`)
		.each(function(d) { 
			d3.select(this)
				.transition()
				.call(d3.axisLeft(d.axis)) 
		})
		
		axis.addElems('text', 'axis--label')
			.attrs({ 'transform': 'rotate(-90)',
					 'x': d3.max(Mountains.scale.range().map(d => Math.abs(d))),
					 'y': 6,
					 'dy': '0.71em' })
			.text(d => d.type.capitalize())

		const btn = axis.addElems('g', 'btn')		

		btn.addElems('text', 'btn--label')
			.text('Normaliser par habitant')

		btn.insertElems('text.btn--label', 'path', 'bg')
			.attr('d', function () { 
				const bbox = d3.select(this.parentNode).select('text.btn--label').node().getBBox()
				const x1 = -(bbox.width / 2 + 15), x2 = x1 + (bbox.width + 30)
				const y1 = -(bbox.height + 4), y2 = y1 + (bbox.height + 15)
				return `M${[x1, y1]} L${[x2, y1]} L${[x2, y2]} L${[x1, y2]} Z`
			})
			.on('mouseover', function () {
				d3.select(this).classed('hover', true)
			})
			.on('mouseout', function () {
				d3.select(this).classed('hover', false)
			})
			.on('click', function (d) {
				const sel = d3.select(this)
				sel.classed('active', !sel.classed('active'))
				isNormalized = Mountains.normalizedValues.indexOf(d.type)
				if (sel.classed('active')) isNormalized === -1 ? Mountains.normalizedValues.push(d.type) : null
				else Mountains.normalizedValues.splice(isNormalized, 1)

				Mountains.init()
			})

		btn.attr('transform', function (d, i) {
			const bbox = d3.select(this).select('text.btn--label').node().getBBox()
			return `translate(${[0, -(bbox.height + 7.5) - d3.max(Mountains.scale.range().map(d => Math.abs(d)))]})`
		})
	}
	else {
		ridges.selectAll('g.axis--y').remove()
	}

}
Mountains.height = (_d, _path) => { // THIS CAN PROBABLY BE REMOVED SINCE WE ARE NOT SUMMING UP THINGS IN HIGHER HIERARCHIES
	let value = 0
	for (let key in _d) {
		if (key.indexOf(_path) !== -1) value += +_d[key]
	}
	return value
}
Mountains.setScale = (_commune, _i, _isNormalized) => {
	const indicators = d3.select('div.menu--indicators').datum()
	let scaleTypes = Mountains.rangeValues.map((d, i) => {
		const obj = {}
		obj.index = i
		obj.type = indicators.filter(c => c['Structure'] === d.path)[0]['Index_Echelle']
		return obj
	})
	scaleTypes = d3.nest()
		.key(d => d.type)
		.entries(scaleTypes)

	const thisType = scaleTypes.filter(d => d.values.map(c => c.index).indexOf(_i) !== -1)[0].values


	// CHECK WHETHER THE SCALE SHOULD BE NORMALIZED PER CAPITA
	// if (_isNormalized) { // THIS ACTUALLY NEEDS TO BE BASED ON THE POPULATION OF EACH commune, RATHER THAN ON THE OVERALL TOTAL POPULATION
	// 	const normalizingValue = _commune['Enfance_Population'] !== 0 ? _commune['Enfance_Population'] : 1 // THIS WILL NEED TO BE CHANGED TO RELEVANT INDICATOR
		
		const normalizingValue = _isNormalized ? d3.max(Mountains.data, d => d['Enfance_Population']) : 1

	// 	const sums = d3.max(Mountains.rangeValues.filter((d, i) => thisType.map(c => c.index).indexOf(i) !== -1)
	// 			.map(d => { return Mountains.height(_commune, d.path) }))
	// 	Mountains.scale.domain([0, sums / normalizingValue])
	// }
	// else {
		const sums = Mountains.data.map(d => {
			return d3.max(Mountains.rangeValues.filter((c, j) => thisType.map(c => c.index).indexOf(j) !== -1)
				.map(c => {
					return Mountains.height(d, c.path)
				}))
		})
		Mountains.scale.domain([0, d3.max(sums) / normalizingValue])
	// }
}
Mountains.placeLabels = _sel => {
	const d = _sel.datum()
	// if (d['Commune_court'] === 'Total') console.log(d.y)

	const nameLabel = d3.select('svg').addElems('g', `namelabel ${d['Commune_court'].simplify()}`, [{ y: d.y }])
		.sort((a, b) => a.y - b.y)
		.moveToFront()

	nameLabel.addElems('text', 'label--value')
		.attrs({ 'text-anchor': 'end' })
		.text(d['Commune_court'])
	
	nameLabel.insertElems('text.label--value', 'rect', 'label--box')
		.attrs({
			'x': function () {
				const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
				return -(bbox.width + 10)
			},
			'y': function () {
				const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
				return -(bbox.height)
			},
			'width': function () {
				const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
				return bbox.width + 20
			},
			'height': function () {
				const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
				return bbox.height + 8
			}
		})

	// nameLabel.transition()
	nameLabel
		.attr('transform', function (c) {
			const bbox = d3.select(this).select('rect.label--box').node().getBBox()

			return `translate(${[width() - 10, c.y += bbox.height - 8]})`
		})
}