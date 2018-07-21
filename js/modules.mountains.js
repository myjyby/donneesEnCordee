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

Mountains.init = function (_data) {
	Mountains.data = _data ? Mountains.parseData(_data) : d3.selectAll('g.range').data()
	// console.log(this)

	Mountains.data.sort((a, b) => 
		d3.sum(Mountains.rangeValues.map(c => Mountains.height(b, c.path))) - d3.sum(Mountains.rangeValues.map(c => Mountains.height(a, c.path)))
	) // MIGHT NEED TO CHANGE THIS TO ACCOUNT FOR SUMS

	Mountains.scale.range([0, -(horizon - horizon * .33)]) // CHANGE THIS FOR MOUNT HEIGHT

	if (!Mountains.position.domain().length) {
		Mountains.position.domain(Mountains.data.map(d => d['Commune']).shuffle())
	}

	const svg = d3.select('svg')
	const mountain = svg.select('g.mountain')

	const ranges = mountain.addElems('g', 'range', Mountains.data)
		.attr('transform', (d, i) => `translate(${[d.x = Mountains.position(d['Commune']), d.y = horizon + i * maxHeight / 5]})`)
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
	.transition()
		.attr('transform', (d, i) => `translate(${[d.x = Mountains.position(d['Commune']), d.y = horizon + i * maxHeight / 5]})`)
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

Mountains.paths = _commune => { // WE STILL HAVE A SORTING PROBLEM HERE
	const relations = Mountains.rangeRelations()
	const indicators = d3.select('div.menu--indicators').datum()

	const obj = {}
	obj.paths = []
	obj.x = 0

	let path = {}
	path.enter = []
	path.transition = []

	Mountains.rangeValues.forEach((d, i) => {


		// const p1 = Mountains.scale(_commune[d.path])

		// console.log(d)


		// d.path = c['Structure']

		if (relations[i] === 'discrete') { // THIS IS WHERE WE SHOULD CHECK FOR NEW SCALES
			if (i === 0) {
				Mountains.setScale(i)
			}
			else if (i > 0) {
				// CHECK WHETHER THE NEW PEAK SHOULD BE PROJECTED ON THE SAME SCALE
				const prevPath = Mountains.rangeValues[i - 1].path
				const prevScale = indicators.filter(c => c['Structure'] === prevPath)[0]['Index_Echelle']
				const scale = indicators.filter(c => c['Structure'] === d.path)[0]['Index_Echelle']
				// IF THE TYPE OF SCALE IS NOT THE SAME, THE CHANGE THE Mountains.scale.domain()
				// AND PUSH THE NEXT PEAK HORIZONTALLY AWAY

				console.log(Mountains.scale.domain())
				const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path])
				obj.x -= p0 * .5
				
				path.enter.push(`L${[obj.x, 0]}`)
				path.transition.push(`L${[obj.x, 0]}`)
				obj.paths.push(path)
				
				path = {}
				path.enter = []
				path.transition = []

				if (prevScale !== scale) {
					Mountains.setScale(i)
					obj.x += 50
				}
			}

			const p1 = Mountains.scale(_commune[d.path])

			// console.log(Mountains.scale.domain())

			path.color = d.path.split('_')[0]

			path.enter.push(`M${[obj.x, 0]}`)
			path.transition.push(`M${[obj.x, 0]}`)

			obj.x -= p1 * .5
			path.enter.push(`L${[obj.x, 0]}`)
			path.transition.push(`L${[obj.x, p1]}`)
		}
		else if (relations[i] === 'ordinal') {
			const p1 = Mountains.scale(_commune[d.path])
			const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path])
			
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
			const p1 = Mountains.scale(_commune[d.path])

			obj.x -= p1 * .5
			path.enter.push(`L${[obj.x, 0]}`)
			path.transition.push(`L${[obj.x, p1]}`)
		}

		if (i === Mountains.rangeValues.length - 1) {
			const p1 = Mountains.scale(_commune[d.path])

			obj.x -= p1 * .5
			path.enter.push(`L${[obj.x, 0]}`)
			path.transition.push(`L${[obj.x, 0]}`)

			obj.paths.push(path)
		}
	})
	return obj
}

Mountains.draw = function (_d, _i) {
	const svg = d3.select('svg')
	const sel = d3.select(this)
	
	// WORKING HERE
	const paths = Mountains.paths(_d)

	// if (_d.Commune_court === 'Massif du Vercors') console.log(paths)
	// console.log(paths)

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
		.attrs({
			'class': 'peak',
			'd': d => d.enter.join(' ')
		})
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
		.attrs({
			'x1': d => -d.x / 5,
			'x2': d => d.x * 6 / 5,
			'y1': 0,
			'y2': 0
		})

	if (_i === 0) {
		ridges.addElems('g', 'axis axis--y')
			.attr('transform', `translate(${[0, -1]})`)
		.transition()
			.call(d3.axisLeft(Mountains.scale))
	}
	else {
		ridges.selectAll('g.axis--y').remove()
	}
	
	// const nameLabel = ridges.addElems('g', 'namelabel')
	// nameLabel.addElems('text', 'label--value')
	// 	.attrs({
	// 		'text-anchor': 'start',
	// 		'x': 10
	// 	})
	// 	.text(_d['Commune_court'])
	// nameLabel.attr('transform', d => {
	// 	const bbox = d3.select(this).select('text.label--value').node().getBBox()
	// 	return `translate(${[-d.x / 5, bbox.height]})`
	// })
	// nameLabel.insertElems('text.label--value', 'rect', 'label--box')
	// 	.attrs({
	// 		'x': 0,
	// 		'y': function () {
	// 			const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
	// 			return -(bbox.height)
	// 		},
	// 		'width': function () {
	// 			const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
	// 			return bbox.width + 20
	// 		},
	// 		'height': function () {
	// 			const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
	// 			return bbox.height + 8
	// 		}
	// 	})

}
Mountains.height = (_d, _path) => { // THIS CAN PROBABLY BE REMOVED SINCE WE ARE NOT SUMMING UP THINGS IN HIGHER HIERARCHIES
	let value = 0
	for (let key in _d) {
		if (key.indexOf(_path) !== -1) value += +_d[key]
	}
	return value
}
Mountains.setScale = _i => {
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

	const sums = Mountains.data.map(d => {
		return d3.max(Mountains.rangeValues.filter((c, j) => thisType.map(c => c.index).indexOf(j) !== -1)
			.map(c => {
				// if (c.type === 'sum') return d3.sum(c.sources, c => Mountains.height(d, c.path))
				// console.log(d, c.path)
				return Mountains.height(d, c.path)
			}))
	})
	Mountains.scale.domain([0, d3.max(sums)])
}