// TAXONOMY FOR MOUNTAINS
// FOR INSPIRATION, SEE https://www.google.com/search?q=Mountain+range&stick=H4sIAAAAAAAAAONgecToyC3w8sc9YSmLSWtOXmM04uIKzsgvd80rySypFFLhYoOypLh4pDj0c_UNTMorijQYpLi44DweACtZhdhGAAAA&sa=X&ved=0ahUKEwj34NqQoKHcAhVqk-AKHSXOCC0Q6RMI0wEwEA&biw=1680&bih=949
// 0: MOUNTAINS
// 1: RANGE
// 2: RIDGE (for continuous connections) / PASS (for ordinal connections)
// 3: PEAK

let normalize = false
const normalizingCol = 'Général_Population_Total'

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
Mountains.calculateAnnualRate = (_vi, _vf, _years) => Math.pow((_vf / _vi), (1 / _years)) - 1 //((_vf - _vi) / _vi) * 100

Mountains.scale = d3.scaleLinear()
// Mountains.horizon = 0
Mountains.horizon = UI.height - UI.height * .6

Mountains.position = d3.scaleBand()
	.rangeRound([UI.width * .25, UI.width - UI.width * .25])
	.padding(.1)

Mountains.rangeValues = []
// Mountains.normalizedValues = []

Mountains.colors = d3.scaleLinear()
	.domain([0, Mountains.data.length])
	.range(['#344758', '#CED5E4'])

Mountains.drag = d3.drag()
	.on('start', _ => {
		const svg = d3.select('svg').classed('dragging', true)
		svg.selectAll('line.axis--link').remove()
		// svg.selectAll('.label').remove()
	})
	.on('drag', function (d) {
		const evt = d3.event
		d3.select(this).attr('transform', `translate(${[d.x += evt.dx, d.y]})`)
	})
	.on('end', _ => d3.select('svg').classed('dragging', false))

Mountains.init = _data => {
	// Mountains.horizon = height() - height() * .6

	Mountains.data = _data ? Mountains.parseData(_data) : Mountains.data //d3.select('g.mountain').datum()
	if (_data) Mountains.data.forEach(d => d.display = true)
	
	// Mountains.data = Mountains.data.filter(d => d.display)

	console.log(Mountains.rangeValues)

	Mountains.data.sort((a, b) => {
		// if (!Mountains.rangeValues.length) return Mountains.height(b, defaultIndicator) - Mountains.height(a, defaultIndicator)
		// else 
		if (!normalize) {
			const values = Mountains.rangeValues.filter(d => d.type === 'value')
			const sums = Mountains.rangeValues.filter(d => d.type === 'sum')
			const divisions = Mountains.rangeValues.filter(d => d.type === 'division')

			const totalize = _d => {
				const bValues = d3.sum(values.map(d => Mountains.height(_d, d.path)))
				const bSums = d3.sum(sums.map(d => d3.sum(d.sources, c => Mountains.height(_d, c.path))))
				const bDivisions = d3.sum(divisions.map(d => {
					// const percentage = d.sources.filter(c => c.division === 'dividend').map(c => _commune[c.path] / normalizingValue)[0] / d.sources.filter(c => c.division === 'divisor').map(c => _commune[c.path] / normalizingValue)[0]
					const percentage = d.sources.filter(c => c.division === 'dividend').map(c => Mountains.height(_d, c.path))[0] / d.sources.filter(c => c.division === 'divisor').map(c => Mountains.height(_d, c.path))[0]
					return !isNaN(percentage) ? percentage : 0
				}))
				return bValues + bSums + bDivisions
			}
			// return d3.sum(Mountains.rangeValues.map(c => Mountains.height(b, c.path))) - d3.sum(Mountains.rangeValues.map(c => Mountains.height(a, c.path)))
			return totalize(b) - totalize(a)
		}
		else return a['Commune_court'] - b['Commune_court']
	}) // MIGHT NEED TO CHANGE THIS TO ACCOUNT FOR SUMS

	if (!Mountains.position.domain().length) {
		Mountains.position.domain(Mountains.data.map(d => d['Commune']).shuffle())
	}

	const svg = d3.select('svg')

	const mountain = svg.select('g.mountain')
		.datum(Mountains.data)

	let ranges = mountain.selectAll('g.range')
		.data(d => d.filter(c => c.display)) // , d => d['Commune'])
	ranges.exit().remove()
	ranges = ranges.enter()
		.append('g')
		.attrs({ 'class': 'range',
				 'transform': (d, i) => {
				 	const y = !normalize ? Mountains.horizon + i * ((UI.height - Mountains.horizon) * .75) / Mountains.data.length : (i + 2) * (UI.height - Mountains.horizon * .25) / (Mountains.data.length + 3)
				 	return `translate(${[Mountains.position(d['Commune']), y]})` }
				 })
	.merge(ranges)
	// addElems('g', 'range', Mountains.data)
		// .attr('transform', (d, i) => `translate(${[d.x = Mountains.position(d['Commune']), d.y = Mountains.horizon + i * maxHeight / 5]})`)
		.on('mouseover', function (d) {
			if (svg.classed('dragging')) return null

			const node = this
			const sel = d3.select(this)

			// if (Math.round(d.y) === Math.round(Mountains.horizon)) {
				svg.selectAll('g.range')
					.filter(function () { return this !== node })
				.transition()
					.duration(150)
					.style('opacity', .25)

				d3.selectAll('g.namelabel')
					.filter(c => c['Commune'] !== d['Commune'])
				.transition()
					.duration(150)
					.style('opacity', .25)

				d3.select('g.map').selectAll('path.community')
					.filter(c => c.properties['NOM'] === d['Commune'])
					.style('fill', '#333')
					
				// sel.style('fill', '#344758')
			// }
		})
		.on('mouseout', function (d, i) {
			// if (svg.classed('dragging')) return null

			const sel = d3.select(this)

			svg.selectAll('g.range')
				.transition()
				.duration(150)
				.style('opacity', 1)

			d3.selectAll('g.namelabel')
				.transition()
				.duration(150)
				.style('opacity', 1)

			d3.select('g.map').selectAll('path.community')
				.style('fill', null)
				
			// sel.style('fill', Mountains.colors(i))
		})
		.call(Mountains.drag)
		.each(Mountains.draw)
	ranges.transition()
		.attr('transform', (d, i) => {
			const menu = d3.select('div.menu--indicators').node().getBoundingClientRect()
			d.x ? d.x = d.x : d.x = Mountains.position(d['Commune'])
			// d.y ? d.y = d.y : d.y = Mountains.horizon + i * maxHeight / 5
			d.y = !normalize ? Mountains.horizon + i * ((UI.height - Mountains.horizon) * .75) / Mountains.data.length : (i + 2) * (UI.height - Mountains.horizon * .25) / (Mountains.data.length + 3)
			//Mountains.horizon + i * maxHeight / 5 // NEED TO KEEP THIS FLEXIBLE IN CASE THE OVERALL SIZE OF THE MOUNTAIN RANGE CHANGES
			return `translate(${[!normalize ? d.x : menu.right, d.y]})`
		})
		.each(function (d) { d3.select(this).call(Mountains.placeLabels) })
		.style('fill', (d, i) => Mountains.colors(i))

	// console.log(Mountains.rangeRelations())
}

Mountains.rangeRelations = _ => {
	return Mountains.rangeValues.map((d1, i) => {
		if (d1.type === 'value') {
			if (i === 0) return 'discrete'
			else {
				// THIS IS THE PREVIOUS INDICATOR IN THE RANGE
				const d0 = Mountains.rangeValues[i - 1]
				if (d0.type !== 'value') return 'discrete'
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
		}
		else {
			return 'discrete'
		}
	})
}

Mountains.renderings = _commune => { // WE STILL HAVE A SORTING PROBLEM HERE
	const relations = Mountains.rangeRelations()
	const indicators = d3.select('div.menu--indicators').datum()

	const obj = {}
	obj.paths = []
	obj.labelPos = []
	obj.rate = []
	obj.x = 0

	let path = {}
	path.enter = []
	path.transition = []

	const axes = []

	const normalizingValue = normalize ? _commune[normalizingCol] !== 0 ? _commune[normalizingCol] : 1 : 1 // THIS COMPLICATED fn IS JUST TO MAKE SURE WE DO NOT END UP WITH A NORMALIZING VALUE OF 0 (WHICH WOULD RESULT IN NORMALIZED VALUES OF +Infintiy)

	Mountains.rangeValues.forEach((d, i) => {
		if (d.type === 'value') {
			const scale = indicators.filter(c => c['Structure'] === d.path)[0]['Index_Echelle']
			// console.log(scale)

			// CHECK WHETHER THE SCALE SHOULD BE NORMALIZED PER CAPITA
			// let isNormalized = false
			// let normalizingValue = 1

			// const p1 = Mountains.scale(_commune[d.path])

			// IF THE RELATION IS discrete, START A NEW PEAK
			if (relations[i] === 'discrete') { // THIS IS WHERE WE SHOULD CHECK FOR NEW SCALES
				// IF IT IS THE FIRST PEAK, THEN SET THE SCALE FOR THE RANGE
				if (i === 0) {
					
					// isNormalized = Mountains.normalizedValues.indexOf(scale) !== -1
					// normalizingValue = isNormalized ? _commune['Enfance_Population'] !== 0 ? _commune['Enfance_Population'] : 1 : 1 // THIS COMPLICATED fn IS JUST TO MAKE SURE WE DO NOT END UP WITH A NORMALIZING VALUE OF 0 (WHICH WOULD RESULT IN NORMALIZED VALUES OF +Infintiy)

					Mountains.setScale(i)
					axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
				}
				// IF IT IS NOT THE FIRST PEAK, FINISH THE PREVIOUS PEAK WITH p0, THEN RESET THE SCALE FOR THE NEW RANGE (IF THE TYPE OF SCALE IS DIFFERENT)
				else if (i > 0) {
					// IF THE PREVIOUS PEAK IS NOT THE RESULT OF AN OPERAION
					if (Mountains.rangeValues[i - 1].type === 'value') {
						// CHECK WHETHER THE NEW PEAK SHOULD BE PROJECTED ON THE SAME SCALE
						const prevPath = Mountains.rangeValues[i - 1].path
						const prevScale = indicators.filter(c => c['Structure'] === prevPath)[0]['Index_Echelle']
						// MAKE SURE THE SCALE IS STILL THAT OF THE PREVIOUS PEAK
						// const isPrevNormalized = Mountains.normalizedValues.indexOf(prevScale) !== -1
						// const prevNormalizingValue = normalize ? _commune[normalizingCol] !== 0 ? _commune[normalizingCol] : 1 : 1

						// let p0
						// if (Mountains.rangeValues[i - 1].type === 'value') p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / normalizingValue)
						// else p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].sources[0].path] / normalizingValue) 
						const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / normalizingValue)
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
							// isNormalized = Mountains.normalizedValues.indexOf(scale) !== -1
							// normalizingValue = isNormalized ? _commune['Enfance_Population'] !== 0 ? _commune['Enfance_Population'] : 1 : 1

							Mountains.setScale(i)
							obj.x += 50
							axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
						}
					}
					else {
						Mountains.setScale(i)
						obj.x += 50
						axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
					}
				}
				// SET THE HEIGHT (AND WIDTH) OF THE NEW PEAK
				const p1 = Mountains.scale(_commune[d.path] / normalizingValue)
				// console.log(Mountains.scale.domain(), Mountains.scale.range())
				// const p1 = Mountains.scale(_commune[d.path])
				// DETERMINE THE COLOR OF THE NEW PEAK
				path.color = d.path.split('_')[0]
				// START THE NEW PEAK
				path.enter.push(`M${[obj.x, 0]}`)
				path.transition.push(`M${[obj.x, 0]}`)
				// CREATE THE PEAK
				obj.x -= p1 * .5
				path.enter.push(`L${[obj.x, 0]}`)
				path.transition.push(`L${[obj.x, p1]}`)

				obj.labelPos.push({ x: obj.x, y: p1, value: _commune[d.path] / normalizingValue, label: printNumber(Math.round((_commune[d.path] / normalizingValue) * 100) / 100), curves: Math.max(3, Math.round(Math.random() * 5)) })
			}
			else if (relations[i] === 'ordinal') {
				const p1 = Mountains.scale(_commune[d.path] / normalizingValue)
				// const p1 = Mountains.scale(_commune[d.path])
				const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / normalizingValue)
				// const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path])
				
				if (Math.abs(p0) < Math.abs(p1)) {
					obj.x -= p0 * .25
					path.enter.push(`L${[obj.x, 0]}`)
					path.transition.push(`L${[obj.x, p0 * .5]}`)

					obj.x -= (p1 * .5 - p0 * .25)
					path.enter.push(`L${[obj.x, 0]}`)
					path.transition.push(`L${[obj.x, p1]}`)

					obj.labelPos.push({ x: obj.x, y: p1, value: _commune[d.path] / normalizingValue, label: printNumber(Math.round((_commune[d.path] / normalizingValue) * 100) / 100), curves: Math.max(3, Math.round(Math.random() * 5)) })
				}
				else {
					obj.x -= (p0 * .5 - p1 * .25)
					path.enter.push(`L${[obj.x, 0]}`)
					path.transition.push(`L${[obj.x, p1 * .5]}`)

					obj.x -= p1 * .25
					path.enter.push(`L${[obj.x, 0]}`)
					path.transition.push(`L${[obj.x, p1]}`)

					obj.labelPos.push({ x: obj.x, y: p1, value: _commune[d.path] / normalizingValue, label: printNumber(Math.round((_commune[d.path] / normalizingValue) * 100) / 100), curves: Math.max(3, Math.round(Math.random() * 5)) })
				}
			}
			else if (relations[i] === 'series') {
				const p1 = Mountains.scale(_commune[d.path] / normalizingValue)
				// const p1 = Mountains.scale(_commune[d.path])
				const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / normalizingValue)

				obj.x -= p1 * .5
				path.enter.push(`L${[obj.x, 0]}`)
				path.transition.push(`L${[obj.x, p1]}`)

				obj.labelPos.push({ x: obj.x, y: p1, value: _commune[d.path] / normalizingValue, label: printNumber(Math.round((_commune[d.path] / normalizingValue) * 100) / 100), curves: Math.max(3, Math.round(Math.random() * 5)) })
				obj.rate.push({ x1: obj.x + p1 * .5, x2: obj.x, y1: p0 * .5, y2: p1 * .5, value: Mountains.calculateAnnualRate(_commune[Mountains.rangeValues[i - 1].path], _commune[d.path], Math.abs(+d.key - +Mountains.rangeValues[i - 1].key)), years: Math.abs(+d.key - +Mountains.rangeValues[i - 1].key) })
			}

			if (i === Mountains.rangeValues.length - 1) {
				const p1 = Mountains.scale(_commune[d.path] / normalizingValue)
				// const p1 = Mountains.scale(_commune[d.path])

				obj.x -= p1 * .5
				path.enter.push(`L${[obj.x, 0]}`)
				path.transition.push(`L${[obj.x, 0]}`)

				obj.paths.push(path)
				// obj.labelPos.push(obj.x)
			}
		}
		else {
			const scale = d3.set(indicators.filter(c => d.sources.map(b => b.path).indexOf(c['Structure']) !== -1).map(c => c['Index_Echelle'])).values()[0]
			// THERE ARE ONLY DISCRETE RELATIONSHIPS AFTER AN OPERATION
			// IF IT IS THE FIRST PEAK, THEN SET THE SCALE FOR THE RANGE
			if (i === 0) {
				Mountains.setScale(i)
				axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
			}
			// IF IT IS NOT THE FIRST PEAK, FINISH THE PREVIOUS PEAK WITH p0, THEN RESET THE SCALE FOR THE NEW RANGE (IF THE TYPE OF SCALE IS DIFFERENT)
			else if (i > 0) {
				// IF THE PREVIOUS PEAK IS NOT THE RESULT OF AN OPERAION
				if (Mountains.rangeValues[i - 1].type === 'value') {
					// CHECK WHETHER THE NEW PEAK SHOULD BE PROJECTED ON THE SAME SCALE
					const prevPath = Mountains.rangeValues[i - 1].path
					const prevScale = indicators.filter(c => c['Structure'] === prevPath)[0]['Index_Echelle']
					// MAKE SURE THE SCALE IS STILL THAT OF THE PREVIOUS PEAK
					const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / normalizingValue) 
					// let p0
					// if (Mountains.rangeValues[i - 1].type === 'value') p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / normalizingValue)
					// else p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].sources[0].path] / normalizingValue) 

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
						Mountains.setScale(i)
						obj.x += 50
						axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
					}
				}
				else {
					Mountains.setScale(i)
					obj.x += 50
					axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
				}
			}
			// ITERATE OVER THE SOURCES OF THE OPERATION
			// let base = 0
			let base = 0
			let yOffset = 0
			
			if (d.type === 'sum') base = d3.sum(d.sources, c => Mountains.scale(_commune[c.path] / normalizingValue))
			else if (d.type === 'division') {
				// base = d3.min(d.sources, c => Mountains.scale(_commune[c.path] / normalizingValue)) // THIS IS d3.min SINCE IT IS A NEGATIVE VALUE
				base = Mountains.scale(100)
				// d.sources.sort((a, b) => Mountains.scale(_commune[a.path] / normalizingValue) - Mountains.scale(_commune[b.path] / normalizingValue))
				d.sources.sort((a, b) => Mountains.scale((_commune[a.path] / d3.max(d.sources, c => _commune[c.path])) * 100) - Mountains.scale((_commune[b.path] / d3.max(d.sources, c => _commune[c.path])) * 100))
			}
			
			d.sources.forEach((c, j) => {
				let x = obj.x
				if (d.type !== 'sum') yOffset = 0
				// SET THE HEIGHT (AND WIDTH) OF THE NEW PEAK
				let value = _commune[c.path] / normalizingValue
				if (d.type === 'division') {
					value = (_commune[c.path] / d3.max(d.sources, b => _commune[b.path])) * 100
					console.log(value, Mountains.scale(value))
					if (isNaN(value)) value = 0
				}
				const p1 = Mountains.scale(value)

				// if (j === 0) base = p1
				// DETERMINE THE COLOR OF THE NEW PEAK
				path.color = c.path.split('_')[0]
				// START THE NEW PEAK
				path.enter.push(`M${[x, 0]}`)
				path.transition.push(`M${[x, 0]}`)
				// CREATE THE PEAK
				x -= base * .5
				
				path.enter.push(`L${[x, yOffset]}`)
				path.transition.push(`L${[x, yOffset + p1]}`)

				// ADD A LABEL FOR EACH PART OF THE SUM
				// obj.labelPos.push({ x: x, y: yOffset + p1, value: _commune[c.path] / normalizingValue, curves: Math.max(3, Math.round(Math.random() * 5)) })
				
				// CLOSE OFF THE PEAK
				x -= base * .5

				path.enter.push(`L${[x, 0]}`)
				path.transition.push(`L${[x, 0]}`)

				if (d.type === 'sum') {
					path.enter.push(`L${[x + base * .5, yOffset]}`)
					path.transition.push(`L${[x + base * .5, yOffset]}`)
				}
				else if (d.type === 'division') {
					if (c.division === 'divisor') path.style = 'outline'
				}

				obj.paths.push(path)
				
				path = {}
				path.enter = []
				path.transition = []

				yOffset += p1
			})
			// ADD ONLY ONE LABEL FOR THE SUM
			if (d.type === 'sum') obj.labelPos.push({ x: obj.x - base * .5, y: yOffset, value: d3.sum(d.sources, c => _commune[c.path] / normalizingValue), label: printNumber(Math.round(d3.sum(d.sources, c => _commune[c.path] / normalizingValue) * 100) / 100), curves: Math.max(3, Math.round(Math.random() * 5)) })
			else if (d.type === 'division') {
				const percentage = (d.sources.filter(c => c.division === 'dividend').map(c => _commune[c.path])[0] / d.sources.filter(c => c.division === 'divisor').map(c => _commune[c.path])[0]) * 100
				// console.log(d.sources.filter(c => c.division === 'dividend').map(c => _commune[c.path] / normalizingValue)[0])
				// console.log(d.sources.filter(c => c.division === 'divisor').map(c => _commune[c.path] / normalizingValue)[0])
				// console.log(!isNaN(percentage) ? percentage : 0)
				obj.labelPos.push({ x: obj.x - base * .5, y: yOffset, value: !isNaN(percentage) ? percentage : 0, label: !isNaN(percentage) ? `${printNumber(Math.round(percentage * 100) / 100)}%` : `${0}%`, curves: Math.max(3, Math.round(Math.random() * 5)) })
			}
			
			obj.x -= base
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
		.on('mouseover', function () { 
			d3.select(this)
				.call(Mountains.labels)
				.call(Mountains.rates)
		})
		.on('mouseout', function () {
			const svg = d3.select('svg')
			svg.selectAll('.peak--label').remove()
			svg.selectAll('.ridge--rate').remove()
		})

	ridges.transition()
		.attr('transform', (d, i) => !normalize ? `translate(${[-d.x / 2, 0]})` : `translate(${[75, 0]})`)
		
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
			if (d.style !== 'outline') return `url(#gradient-${d.color})`
			else return 'transparent'
			// return d3.rgb(Menu.colors(d.color)).brighter(((d3.selectAll('g.range').size() - _i) / d3.selectAll('g.range').size()) * 2)
		})
		.style('stroke', d => {
			// if (d.style === 'outline') return Menu.colors(d.color) 
			// if (d.style === 'outline') return `url(#gradient-${d.color})`
			if (d.style === 'outline') return '#fff'
			else return null
		})
		// .style('stroke-dasharray', d => {
		// 	if (d.style === 'outline') return '1, 5'
		// 	else return null
		// })
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
			// return `url(#gradient-${d.color})`
			if (d.style !== 'outline') return `url(#gradient-${d.color})`
			else return 'transparent'
			// return d3.rgb(Menu.colors(d.color)).brighter(((d3.selectAll('g.range').size() - _i) / d3.selectAll('g.range').size()) * 2)
			// return d3.rgb(Menu.colors(Mountains.rangeValues[i].path.split('_')[0]))
				// .brighter(((d3.selectAll('g.range').size() - _i) / d3.selectAll('g.range').size()) * 2)
		})
		.style('stroke', d => {
			// if (d.style === 'outline') return Menu.colors(d.color)
			// if (d.style === 'outline') return `url(#gradient-${d.color})`
			if (d.style === 'outline') return '#fff'
			else return null
		})
		// .style('stroke-dasharray', d => {
		// 	if (d.style === 'outline') return '1, 5'
		// 	else return null
		// })

	ridges.addElems('line', 'basis')
		.attrs({ 'x1': d => !normalize ? -50 : -75, // -d.x / 5,
				 'x2': d => width(), // d.x + 50, // d.x * 6 / 5,
				 'y1': 0,
				 'y2': 0 })

	
	if (_i === 0) { // CHANGE THIS TO RIDGE IN FOCUS (THE ONE ON THE BASELINE)
		// console.log(axes)

		const axis = ridges.addElems('g', 'axis axis--y', axes)
			.attr('transform', d => `translate(${[!normalize ? d.x : d.x - 20, -1]})`)
		.each(function(d) { 
			const axisLeft = d3.axisLeft(d.axis)
			if (normalize) axisLeft.ticks(2)

			d3.select(this)
				.transition()
				.call(axisLeft) 
		})
		
		axis.addElems('text', 'axis--label')
			.attrs({ 'transform': 'rotate(-90)',
					 'x': d3.max(Mountains.scale.range().map(d => Math.abs(d))),
					 'y': 6,
					 'dy': '0.71em' })
			.text(d => d.type.capitalize())

		// const btn = axis.addElems('g', 'btn')		

		// btn.addElems('text', 'btn--label')
		// 	.text('Normaliser par habitant')

		// btn.insertElems('text.btn--label', 'path', 'bg')
		// 	.attr('d', function () { 
		// 		const bbox = d3.select(this.parentNode).select('text.btn--label').node().getBBox()
		// 		const x1 = -(bbox.width / 2 + 15), x2 = x1 + (bbox.width + 30)
		// 		const y1 = -(bbox.height + 4), y2 = y1 + (bbox.height + 15)
		// 		return `M${[x1, y1]} L${[x2, y1]} L${[x2, y2]} L${[x1, y2]} Z`
		// 	})
		// 	.on('mouseover', function () {
		// 		d3.select(this).classed('hover', true)
		// 	})
		// 	.on('mouseout', function () {
		// 		d3.select(this).classed('hover', false)
		// 	})
		// 	.on('click', function (d) {
		// 		const sel = d3.select(this)
		// 		sel.classed('active', !sel.classed('active'))
		// 		isNormalized = Mountains.normalizedValues.indexOf(d.type)
		// 		if (sel.classed('active')) isNormalized === -1 ? Mountains.normalizedValues.push(d.type) : null
		// 		else Mountains.normalizedValues.splice(isNormalized, 1)

		// 		Mountains.init()
		// 	})

		// btn.attr('transform', function (d, i) {
		// 	const bbox = d3.select(this).select('text.btn--label').node().getBBox()
		// 	return `translate(${[0, -(bbox.height + 7.5) - d3.max(Mountains.scale.range().map(d => Math.abs(d)))]})`
		// })
	}
	else {
		ridges.selectAll('g.axis--y').remove()
	}

}
Mountains.labels = _sel => {
	// console.log(_sel.datum())

	const labels = _sel.addElems('g', 'peak--label', d => d.labelPos)
		.attr('transform', d => `translate(${[d.x, 0]})`)
	
	/*labels.addElems('path')
		.attr('d', d => {
			const x = d3.scaleLinear()
				.domain([0, d.curves - 1])
				.range([Mountains.scale(d.value) / 4, 0])
			const y = d3.scaleLinear()
				.domain([0, d.curves - 1])
				.range([0, Mountains.scale(d.value)])
			let path = 'M'
			let factor = Math.round(Math.random())
			if (factor === 0) factor = -1
			console.log(d.curves)
			d3.range(d.curves).forEach(c => {
				factor = -factor
				if (c % 2 !== 0 && c % 3 !== 0) path += ' Q'
				else if (c % 2 !== 0 && c % 3 === 0) path += ' T'
				else path += ' '
				path += [Math.round(Math.random() * x(c)) * factor, y(c)]
			})
			console.log(path)
			return path
		})
		.style('stroke', '#fff')
		.style('fill', 'none')*/

	labels.addElems('line')
		.attrs({ 'x1': 0,
				 'x2': 0,
				 'y1': 0,
				 'y2': 0 })
	.transition()
		// .delay((d, i) => i * 1000)
		.attrs({ 'x1': 0,
				 'x2': 0,
				 'y1': 0,
				 'y2': d => d.y })


	labels.call(UI.tooltip, d => [{ label: d.label, y: -d.y }])
}
Mountains.rates = _sel => {
	const labels = _sel.addElems('g', 'ridge--rate', d => d.rate)
	labels.addElems('line')
		.attrs({ 'x1': d => d.x1,
				 'x2': d => d.x1,
				 'y1': d => d.y1,
				 'y2': d => d.y1, })
	.transition()
		.attrs({ 'x1': d => d.x1,
				 'x2': d => d.x2,
				 'y1': d => d.y1,
				 'y2': d => d.y2, })
	labels.addElems('text')
		.attrs({ 'transform': d => `translate(${[d.x1 + (d.x2 - d.x1) / 2, d.y1 + (d.y2 - d.y1) / 2]})`,
				 'dy': '.3rem' })
		.text(d => {
			// return `${d.value >= 0 ? '+' : '-'}${Math.round((Math.abs(d.value) / d.years) * 100) / 100}% / an`
			return `${d.value >= 0 ? '+' : '-'}${Math.round(Math.abs(d.value) * 10000) / 100}% / an`
		})
	labels.insertElems('text', 'circle')
		.attrs({ 'transform': d => `translate(${[d.x1 + (d.x2 - d.x1) / 2, d.y1 + (d.y2 - d.y1) / 2]})`,
				 'r': 0 })
	.transition()
		.duration(1000)
		.ease(d3.easeElastic)
		.attr('r', function () {
			const text = d3.select(this.parentNode).select('text')
			const bbox = text.node().getBBox()
			return bbox.width
		})
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
		// console.log(d)
		const obj = {}
		obj.index = i
		if (d.type === 'value') obj.type = indicators.filter(c => c['Structure'] === d.path)[0]['Index_Echelle']
		else if (d.type === 'sum') obj.type = d3.set(indicators.filter(c => d.sources.map(b => b.path).indexOf(c['Structure']) !== -1).map(c => c['Index_Echelle'])).values()[0]
		else if (d.type === 'division') obj.type = 'percentage'
		return obj
	})
	scaleTypes = d3.nest()
		.key(d => d.type)
		.entries(scaleTypes)

	const thisType = scaleTypes.filter(d => d.values.map(c => c.index).indexOf(_i) !== -1)[0].values
	// const normalizingValue = normalize ? d3.max(Mountains.data, d => d['Enfance_Population']) : 1

	// 	const sums = d3.max(Mountains.rangeValues.filter((d, i) => thisType.map(c => c.index).indexOf(i) !== -1)
	// 			.map(d => { return Mountains.height(_commune, d.path) }))
	// 	Mountains.scale.domain([0, sums / normalizingValue])
	// }
	// else {
		// console.log(thisType)
		const sums = Mountains.data.filter(d => d.display)
			.map(d => {
				return d3.max(Mountains.rangeValues.filter((c, j) => thisType.map(c => c.index).indexOf(j) !== -1)
					.map(c => {
						if (c.type === 'value') {
							if (!normalize) return Mountains.height(d, c.path)
							else return Mountains.height(d, c.path) / d[normalizingCol]
						}
						else if (c.type === 'sum') {
							if (!normalize) return d3.sum(c.sources, b => Mountains.height(d, b.path))
							else return d3.sum(c.sources, b => Mountains.height(d, b.path) / d[normalizingCol])
						}
						else if (c.type === 'division') {
							// if (!normalize) return d3.max(c.sources, b => Mountains.height(d, b.path)) 
							// else return d3.max(c.sources, b => Mountains.height(d, b.path) / d[normalizingCol])
							
							if (!normalize) return 100
							else {
								// console.log(normalizingCol)
								// console.log(d[normalizingCol])
								return 100 /// d[normalizingCol]
							}
						}
					}))
			})

		// console.log(d3.max(sums))

		// !normalize ? Mountains.horizon + i * ((UI.height - Mountains.horizon) * .75) / Mountains.data.length : (i + 2) * (UI.height - Mountains.horizon * .25) / (Mountains.data.length + 3)

		const scaleRangeMax = !normalize ? -(Mountains.horizon - Mountains.horizon * .33) : -((UI.height - Mountains.horizon * .25) / (Mountains.data.length + 3))
		// console.log(scaleRangeMax)
		Mountains.scale.rangeRound([0, scaleRangeMax]) // CHANGE THIS FOR MOUNT HEIGHT
			.domain([0, d3.max(sums)])
		// console.log(Mountains.scale.domain())
	// }
}
Mountains.placeLabels = _sel => {
	if (!Mountains.rangeValues.length) return null

	const svg = d3.select('svg')
	const d = _sel.datum()
	// if (d['Commune_court'] === 'Total') console.log(d.y)

	const label = d3.select('svg')
		.addElems('g', `namelabel ${d['Commune_court'].simplify()}`, [{ y: d.y, Commune: d['Commune'] }])
		.sort((a, b) => a.y - b.y)
		.moveToFront()

	label.addElems('text', 'label--value')
		.attrs({ 'text-anchor': 'end',
				 'x': -20 })
		.text(d['Commune_court'].trim())

	const rmBtn = label.addElems('g', 'rm')
		.attr('transform', `translate(${[-10, -9]})`)
	rmBtn.addElems('rect', 'bg--transparent')
		.attrs({ 'width': 15,
				 'height': 15,
				 'x': -2.5,
				 'y': -2.5 })
	.on('click', function (c) {
		d.display = false
		// console.log(this.parentNode)
		// REMOVE THIS LABEL
		d3.select(this.parentNode.parentNode).remove()
		// CLEAR THE PLACE ON THE MAP
		d3.select('g.map').selectAll('path.community')
			.filter(b => b.properties['NOM'] === c['Commune'])
			.classed('inactive', true)

		svg.selectAll('g.range')
			.transition()
			.duration(50)
			.style('opacity', 1)

		svg.selectAll('g.namelabel')
			.transition()
			.duration(50)
			.style('opacity', 1)

		svg.select('g.map').selectAll('path.community')
			.style('fill', null)

		UI.redraw()
	})

	rmBtn.addElems('line', 'rm-btn', d3.range(2))
		.attrs({ 'x1': (d, i) => i === 0 ? 0 : 0,
				 'x2': (d, i) => i === 0 ? 10 : 10,
				 'y1': (d, i) => i === 0 ? 0 : 10,
				 'y2': (d, i) => i === 0 ? 10 : 0 })
		.style('stroke', '#333')
	
	label.insertElems('text.label--value', 'rect', 'label--box')
		.attrs({
			'x': function () {
				const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
				return bbox.x - 10
			},
			'y': function () {
				const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
				return -(bbox.height)
			},
			'width': function () {
				const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
				return bbox.width + 40
			},
			'height': function () {
				const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
				return bbox.height + 8
			}
		})

	// label.transition()
	label.attr('transform', function (c) {
		const bbox = d3.select(this).select('rect.label--box').node().getBBox()
		return `translate(${[width() - 10, c.y += bbox.height - 8]})`
	})
	.on('mouseover', function (c) {
		if (svg.classed('dragging')) return null

		const node = this
		const sel = d3.select(this)

		svg.selectAll('g.range')
			.filter(b => b['Commune'] !== c['Commune'])
		.transition()
			.duration(50)
			.style('opacity', .25)

		svg.selectAll('g.namelabel')
			.filter(function () { return this !== node })
		.transition()
			.duration(50)
			.style('opacity', .21)

		svg.select('g.map').selectAll('path.community')
			.filter(b => b.properties['NOM'] === c['Commune'])
			.style('fill', '#333')
	})
	.on('mouseout', function () {
		const sel = d3.select(this)

		svg.selectAll('g.range')
			.transition()
			.duration(50)
			.style('opacity', 1)

		svg.selectAll('g.namelabel')
			.transition()
			.duration(50)
			.style('opacity', 1)

		svg.select('g.map').selectAll('path.community')
			.style('fill', null)
	})
}