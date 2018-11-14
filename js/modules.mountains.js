// TAXONOMY FOR MOUNTAINS
// FOR INSPIRATION, SEE https://www.google.com/search?q=Mountain+range&stick=H4sIAAAAAAAAAONgecToyC3w8sc9YSmLSWtOXmM04uIKzsgvd80rySypFFLhYoOypLh4pDj0c_UNTMorijQYpLi44DweACtZhdhGAAAA&sa=X&ved=0ahUKEwj34NqQoKHcAhVqk-AKHSXOCC0Q6RMI0wEwEA&biw=1680&bih=949
// 0: MOUNTAINS
// CHAINE
// 1: RANGE = MASSIF
// 2: RIDGE (for continuous connections) = CRETE / PASS (for ordinal connections) = COL
// 3: PEAK = SOMMET
const test = true
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
Mountains.horizon = 0
Mountains.coverage = 0
Mountains.horizonP = 40 // PERCENTAGE OF THE SCREEN
Mountains.coverageP = 50 // PERCENTAGE OF THE SCREEN
Mountains.normHorizonP = 10
Mountains.normCoverageP = 80
// Mountains.horizon = UI.height - UI.height * .6

Mountains.position = d3.scaleBand()
	.rangeRound([UI.width * .25, UI.width - UI.width * .25])
	.padding(.1)

Mountains.rangeValues = []

Mountains.colors = d3.scaleLinear()
	.domain([0, Mountains.data.length])
	.range(['#344758', '#CED5E4'])

Mountains.drag = d3.drag()
	.on('start', d => {
		// svg.selectAll('line.axis--link').remove()
		// console.log(d.x)
		d3.selectAll('div.chaine').classed('transition--none', true)
		const paysage = d3.select('.paysage--vis').classed('dragging', true)
	})
	.on('drag', function (d) {
		const evt = d3.event
		d.x += evt.dx
		// console.log(evt.dx,d.x)
		d3.select(this).style('transform', `translateX(${d.x}px)`)
		// d3.select(this).style('left', `${d.x}px`)
		
		// .attr('transform', `translate(${[d.x += evt.dx, d.y]})`)
	})
	.on('end', _ => {
		d3.selectAll('div.chaine').classed('transition--none', true)
		d3.select('.paysage--vis').classed('dragging', false)
	})

Mountains.init = _data => {

	Mountains.data = _data ? Mountains.parseData(_data) : Mountains.data 
	if (_data) Mountains.data.forEach(d => d.display = true)

	Mountains.data.sort((a, b) => {
		if (!normalize) {
			const values = Mountains.rangeValues.filter(d => d.type === 'value')
			const sums = Mountains.rangeValues.filter(d => d.type === 'sum')
			const divisions = Mountains.rangeValues.filter(d => d.type === 'division')

			const totalize = _d => {
				const bValues = d3.sum(values.map(d => Mountains.height(_d, d.path)))
				const bSums = d3.sum(sums.map(d => d3.sum(d.sources, c => Mountains.height(_d, c.path))))
				const bDivisions = d3.sum(divisions.map(d => {
					const percentage = d.sources.filter(c => c.division === 'dividend').map(c => Mountains.height(_d, c.path))[0] / d.sources.filter(c => c.division === 'divisor').map(c => Mountains.height(_d, c.path))[0]
					return !isNaN(percentage) ? percentage : 0
				}))
				return bValues + bSums + bDivisions
			}
			return totalize(b) - totalize(a)
		}
		else return a['Commune_court'] - b['Commune_court']
	}) // MIGHT NEED TO CHANGE THIS TO ACCOUNT FOR SUMS

	if (!Mountains.position.domain().length) {
		Mountains.position.domain(Mountains.data.map(d => d['Commune']).shuffle())
	}



	const paysage = d3.select('div.paysage--vis')
		// .classed('dragging', true)
		.call(UI.drag)

	if (!test) {
		Mountains.horizon = (paysage.node().clientHeight || paysage.node().offsetHeight) * Mountains[normalize ? 'normHorizonP' : 'horizonP'] / 100
		Mountains.coverage = (paysage.node().clientHeight || paysage.node().offsetHeight) * Mountains[normalize ? 'normCoverageP' : 'coverageP'] / 100
	}
	else {
		Mountains.horizon = (paysage.node().clientHeight || paysage.node().offsetHeight) * Mountains['horizonP'] / 100
		Mountains.coverage = (paysage.node().clientHeight || paysage.node().offsetHeight) * Mountains['coverageP'] / 100
	}

	const baseHeight = paysage.node().clientHeight || paysage.node().offsetHeight

	// let montagnes = paysage.selectAll('div.montagnes')
	// 	.data([Mountains.data], function (d) { return d['Commune_court'] })
	// montagnes.exit().remove()
	// montagnes = montagnes.enter()
	const montagnes = paysage.addElems('div', 'montagnes', [Mountains.data], d => d['Commune_court'])
	// 	.append('div')
	// 	.attr('class', 'montagnes')
	// 	.each(function () {
	// 		console.log('recreated div.montagnes')
	// 	})
	// .merge(montagnes)
		// ('div', 'montagnes', [Mountains.data])

	let commune = montagnes.selectAll('div.commune')
		.data(d => d.filter(c => c.display), c => c['Commune_court'])
	commune.exit().remove()
	commune = commune.enter()
		.append('div')
		.attr('class', 'commune')
		.style('height', _ => {
			if (!test) return `${!normalize ? Math.round(Mountains.horizon * .75) : Mountains.coverage / Mountains.data.length}px`
			else return `${Math.round(Mountains.horizon * .75)}px`
		})
		// .style('margin-top', function () { return `-${!normalize ? Math.round(Mountains.horizon * .75) : Mountains.coverage / Mountains.data.length}px` })
		.style('margin-top', _ => {
			if (!test) return `-${!normalize ? Math.round(Mountains.horizon * .75) : Mountains.coverage / Mountains.data.length}px`
			else return `-${Math.round(Mountains.horizon * .75)}px`
		})
		.style('transform', (d, i) => {
			if (!test) return `translateY(${d.origin = d.y = Math.round(Mountains.horizon + i * Mountains.coverage / Mountains.data.length)}px)`
			else {
				return `translateY(${d.origin = d.y = Math.round(baseHeight * (Mountains[normalize ? 'normHorizonP' : 'horizonP'] / 100) + i * baseHeight * (Mountains[normalize ? 'normCoverageP' : 'coverageP'] / 100) / Mountains.data.length)}px)`
			}
		})
		// .style('top', (d, i) => `${d.origin = d.y = Math.round(Mountains.horizon + i * Mountains.coverage / Mountains.data.length)}px`) // NEED TO THINK ABOUT HOW TO ADJUST THIS FOR NORMALIZED VIEW
		.each(function () {
			console.log('(re)created div.commune')
		})
	.merge(commune)
		// .moveToFront()
		// .classed('animate--top', true)
		
		// .style('height', _ => `${!normalize ? Math.round(Mountains.horizon * .75) : Mountains.coverage / Mountains.data.length}px`)
		// .style('margin-top', function () { return `-${!normalize ? Math.round(Mountains.horizon * .75) : Mountains.coverage / Mountains.data.length}px` })
		// .style('top', (d, i) => `${d.origin = d.y = Math.round(Mountains.horizon + i * Mountains.coverage / Mountains.data.length)}px`)
	// .transition()
	// .duration(0)
		// .style('z-index', (d, i) => i)
		.style('height', _ => {
			if (!test) return `${!normalize ? Math.round(Mountains.horizon * .75) : Mountains.coverage / Mountains.data.length}px`
			else return `${Math.round(Mountains.horizon * .75)}px`
		})
		// .style('margin-top', function () { return `-${!normalize ? Math.round(Mountains.horizon * .75) : Mountains.coverage / Mountains.data.length}px` })
		.style('margin-top', _ => {
			if (!test) return `-${!normalize ? Math.round(Mountains.horizon * .75) : Mountains.coverage / Mountains.data.length}px`
			else return `-${Math.round(Mountains.horizon * .75)}px`
		})
	// .transition()
		// .duration(500)
		// .delay(250)
		// .style('transform', (d, i) => `translateY(${d.origin = d.y = Math.round(Mountains.horizon + i * Mountains.coverage / Mountains.data.length)}px)`)
		.style('transform', (d, i) => {
			if (!test) return `translateY(${d.origin = d.y = Math.round(Mountains.horizon + i * Mountains.coverage / Mountains.data.length)}px)`
			else {
				const height = paysage.node().clientHeight || paysage.node().offsetHeight
				return `translateY(${d.origin = d.y = Math.round(baseHeight * (Mountains[normalize ? 'normHorizonP' : 'horizonP'] / 100) + i * baseHeight * (Mountains[normalize ? 'normCoverageP' : 'coverageP'] / 100) / Mountains.data.length)}px)`
			}
		})
		// .style('top', (d, i) => `${d.origin = d.y = Math.round(Mountains.horizon + i * Mountains.coverage / Mountains.data.length)}px`)
	// .on('end', function () {
		// d3.select(this)
		// .on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
		// 	if (d3.event.propertyName === 'top') d3.selectAll('div.commune').classed('animate--top', false)
		// })
		// d3.select('div.paysage--vis').classed('dragging', false)
	// })
	setTimeout(_ => {
		commune.style('z-index', (d, i) => i)
	}, 1000)
	

	const label = commune.addElems('div', 'label--name')
		.html(d => d['Commune_court'])

	// let chaine = commune.selectAll('div.chaine')
	// 	.data(d => [d], c => c['Commune_court'])
	// chaine.exit().remove()
	// chaine = chaine.enter()
	// 	.append('div')
	// 	.attr('class', 'chaine')
	// .merge(chaine)
	const chaine = commune.addElems('div', 'chaine', d => [d], d => d['Commune_court'])
		.call(Mountains.drag)
		.each(Mountains.draw)
	// chaine.transition()
		/*.style('height', _ => {
			// `${!normalize ? Math.round(Mountains.horizon - Mountains.horizon * .33) : Math.round((UI.height - Mountains.horizon * .25) / (Mountains.data.length + 3))}px`
			return `${Math.round(Mountains.horizon * .5)}px`
		})
		.style('margin-top', function () { return `-${this.clientHeight || this.offsetHeight}px` })*/
		.style('transform', function (d) {
			d.x ? d.x = d.x : d.x = Math.round((Math.random() * .5) * (this.clientWidth || this.offsetWidth)) //Mountains.position(d['Commune'])
			return `translateX(${d.x}px)`
		})
		// .style('left', function (d) {
		// 	d.x ? d.x = d.x : d.x = Math.round((Math.random() * .5) * (this.clientWidth || this.offsetWidth)) //Mountains.position(d['Commune'])
		// 	return `${d.x}px`
		// })
		




	/*const svg = d3.select('svg')

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
		.on('mouseover', function (d) {
			if (svg.classed('dragging')) return null

			const node = this
			const sel = d3.select(this)

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
		})
		.on('mouseout', function (d, i) {
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
		})
		.call(Mountains.drag)
		.each(Mountains.draw)
	ranges.transition()
		.attr('transform', (d, i) => {
			const menu = d3.select('div.menu--indicators').node().getBoundingClientRect()
			d.x ? d.x = d.x : d.x = Mountains.position(d['Commune'])
			d.y = !normalize ? Mountains.horizon + i * ((UI.height - Mountains.horizon) * .75) / Mountains.data.length : (i + 2) * (UI.height - Mountains.horizon * .25) / (Mountains.data.length + 3)
			return `translate(${[!normalize ? d.x : menu.right, d.y]})`
		})
		.each(function (d) { d3.select(this).call(Mountains.placeLabels) })
		.style('fill', (d, i) => Mountains.colors(i))*/
}

Mountains.rangeRelations = _ => {
	const indicators = d3.select('div.menu--indicators').datum()
	const chaines = []

	Mountains.rangeValues.forEach((d1, i) => {
		if (d1.type === 'value') {
			const indexEchelle = indicators.filter(c => c['Structure'] === d1.path)[0]['Index_Echelle']
			
			// JUMP TO
			// PROBABLY CHANGE THIS TO d3.selection OF THE DISPLAYED chaines
			const max_y = d3.max(Mountains.data.filter(d => d.display).map(c => c[d1.path]))

			if (i === 0) chaines.push({ index: indexEchelle, max: max_y, values: [{ key: 'discrete', values: [d1] }] })
			else {
				// THIS IS THE PREVIOUS INDICATOR IN THE RANGE
				const d0 = Mountains.rangeValues[i - 1]
				if (d0.type !== 'value') {
					if (indexEchelle === chaines[chaines.length - 1].index) {
						chaines[chaines.length - 1].values.push({ key: 'discrete', values: [d1] })
						chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
					} 
					else {
						chaines.push({ index: indexEchelle, max: max_y, values: [{ key: 'discrete', values: [d1] }] })
					}
				}
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
					if (arr.filter(c => c === false).length <= 1 && arr[0] === true) {
						chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].key = 'ordinal'
						chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].values.push(d1)
						chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
					}
				}
				// 02 - IF THE INDICATOR *IS NOT* A SIBLING OF THE PREVIOUS ONE
				// IT IS A *DISCRETE* RELATIONSHIP (NO RELATIONSHIP) BY DEFAULT
				else if (h0p.join('_') !== h1p.join('_')) {
					if (indexEchelle === chaines[chaines.length - 1].index) {
						chaines[chaines.length - 1].values.push({ key: 'discrete', values: [d1] })
						chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
					} 
					else {
						chaines.push({ index: indexEchelle, max: max_y, values: [{ key: 'discrete', values: [d1] }] })
					}
				}
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
						if (Heuristics.hasYear(h1) === h1.length - 1 || h0.last() === h1.last()) {
							chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].key = 'series'
							chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].values.push(d1)
							chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
						}
						// 03.a.ii - IF THE SIBLING INDICATORS HAVE THE SAME YEAR IN THEIR HIERARCHY
						// IT IS AN *ORDINAL* RELATIONSHIP
						else if (h0[Heuristics.hasYear(h0)] === h1[Heuristics.hasYear(h1)]) {
							chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].key = 'ordinal'
							chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].values.push(d1)
							chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
						}
					}
					// 03.b - IF THERE IS NO YEAR IN THE HIERARCHY
					// IT IS AN *ORDINAL* RELATIONSHIP
					else {
						chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].key = 'ordinal'
						chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].values.push(d1)
						chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
					}
				}
			}
		}
		else {
			if (indexEchelle === chaines[chaines.length - 1].index) {
				chaines[chaines.length - 1].values.push({ key: 'discrete', values: [d1] })
				chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
			}
			else chaines.push({ index: indexEchelle, max: max_y, values: [{ key: 'discrete', values: [d1] }] })
		}
	})
	return chaines
}

// Mountains.renderings = _commune => { // WE STILL HAVE A SORTING PROBLEM HERE
// 	const relations = Mountains.rangeRelations()
// 	const indicators = d3.select('div.menu--indicators').datum()

// 	return

// 	const obj = {}
// 	obj.paths = []
// 	obj.labelPos = []
// 	obj.rate = []
// 	obj.x = 0

// 	let path = {}
// 	path.enter = []
// 	path.transition = []

// 	const axes = []

// 	const normalizingValue = normalize ? _commune[normalizingCol] !== 0 ? _commune[normalizingCol] : 1 : 1 // THIS COMPLICATED fn IS JUST TO MAKE SURE WE DO NOT END UP WITH A NORMALIZING VALUE OF 0 (WHICH WOULD RESULT IN NORMALIZED VALUES OF +Infintiy)

// 	Mountains.rangeValues.forEach((d, i) => {
// 		if (d.type === 'value') {
// 			const scale = indicators.filter(c => c['Structure'] === d.path)[0]['Index_Echelle']

// 			// CHECK WHETHER THE SCALE SHOULD BE NORMALIZED PER CAPITA
// 			// let isNormalized = false
// 			// let normalizingValue = 1

// 			// IF THE RELATION IS discrete, START A NEW PEAK
// 			if (relations[i] === 'discrete') { // THIS IS WHERE WE SHOULD CHECK FOR NEW SCALES
// 				// IF IT IS THE FIRST PEAK, THEN SET THE SCALE FOR THE RANGE
// 				if (i === 0) {
					
// 					// isNormalized = Mountains.normalizedValues.indexOf(scale) !== -1
// 					// normalizingValue = is!Normalize ? _commune['Enfance_Population'] !== 0 ? _commune['Enfance_Population'] : 1 : 1 // THIS COMPLICATED fn IS JUST TO MAKE SURE WE DO NOT END UP WITH A NORMALIZING VALUE OF 0 (WHICH WOULD RESULT IN NORMALIZED VALUES OF +Infintiy)

// 					Mountains.setScale(i)
// 					axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
// 				}
// 				// IF IT IS NOT THE FIRST PEAK, FINISH THE PREVIOUS PEAK WITH p0, THEN RESET THE SCALE FOR THE NEW RANGE (IF THE TYPE OF SCALE IS DIFFERENT)
// 				else if (i > 0) {
// 					// IF THE PREVIOUS PEAK IS NOT THE RESULT OF AN OPERAION
// 					if (Mountains.rangeValues[i - 1].type === 'value') {
// 						// CHECK WHETHER THE NEW PEAK SHOULD BE PROJECTED ON THE SAME SCALE
// 						const prevPath = Mountains.rangeValues[i - 1].path
// 						const prevScale = indicators.filter(c => c['Structure'] === prevPath)[0]['Index_Echelle']
// 						// MAKE SURE THE SCALE IS STILL THAT OF THE PREVIOUS PEAK
// 						// const isPrevNormalized = Mountains.normalizedValues.indexOf(prevScale) !== -1
// 						// const prevNormalizingValue = normalize ? _commune[normalizingCol] !== 0 ? _commune[normalizingCol] : 1 : 1

// 						// let p0
// 						// if (Mountains.rangeValues[i - 1].type === 'value') p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / normalizingValue)
// 						// else p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].sources[0].path] / normalizingValue) 
// 						const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / normalizingValue)
// 						obj.x -= p0 * .5
						
// 						path.enter.push(`L${[obj.x, 0]}`)
// 						path.transition.push(`L${[obj.x, 0]}`)
// 						obj.paths.push(path)
						
// 						path = {}
// 						path.enter = []
// 						path.transition = []
// 						// IF THE TYPE OF SCALE IS NOT THE SAME, THE CHANGE THE Mountains.scale.domain()
// 						// AND PUSH THE NEXT PEAK HORIZONTALLY AWAY
// 						if (prevScale !== scale) {
// 							// isNormalized = Mountains.normalizedValues.indexOf(scale) !== -1
// 							// normalizingValue = is!Normalize ? _commune['Enfance_Population'] !== 0 ? _commune['Enfance_Population'] : 1 : 1

// 							Mountains.setScale(i)
// 							obj.x += 50
// 							axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
// 						}
// 					}
// 					else {
// 						Mountains.setScale(i)
// 						obj.x += 50
// 						axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
// 					}
// 				}
// 				// SET THE HEIGHT (AND WIDTH) OF THE NEW PEAK
// 				const p1 = Mountains.scale(_commune[d.path] / normalizingValue)
// 				// console.log(Mountains.scale.domain(), Mountains.scale.range())
// 				// const p1 = Mountains.scale(_commune[d.path])
// 				// DETERMINE THE COLOR OF THE NEW PEAK
// 				path.color = d.path.split('_')[0]
// 				// START THE NEW PEAK
// 				path.enter.push(`M${[obj.x, 0]}`)
// 				path.transition.push(`M${[obj.x, 0]}`)
// 				// CREATE THE PEAK
// 				obj.x -= p1 * .5
// 				path.enter.push(`L${[obj.x, 0]}`)
// 				path.transition.push(`L${[obj.x, p1]}`)

// 				obj.labelPos.push({ x: obj.x, y: p1, value: _commune[d.path] / normalizingValue, label: printNumber(Math.round((_commune[d.path] / normalizingValue) * 100) / 100), curves: Math.max(3, Math.round(Math.random() * 5)) })
// 			}
// 			else if (relations[i] === 'ordinal') {
// 				const p1 = Mountains.scale(_commune[d.path] / normalizingValue)
// 				// const p1 = Mountains.scale(_commune[d.path])
// 				const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / normalizingValue)
// 				// const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path])
				
// 				if (Math.abs(p0) < Math.abs(p1)) {
// 					obj.x -= p0 * .25
// 					path.enter.push(`L${[obj.x, 0]}`)
// 					path.transition.push(`L${[obj.x, p0 * .5]}`)

// 					obj.x -= (p1 * .5 - p0 * .25)
// 					path.enter.push(`L${[obj.x, 0]}`)
// 					path.transition.push(`L${[obj.x, p1]}`)

// 					obj.labelPos.push({ x: obj.x, y: p1, value: _commune[d.path] / normalizingValue, label: printNumber(Math.round((_commune[d.path] / normalizingValue) * 100) / 100), curves: Math.max(3, Math.round(Math.random() * 5)) })
// 				}
// 				else {
// 					obj.x -= (p0 * .5 - p1 * .25)
// 					path.enter.push(`L${[obj.x, 0]}`)
// 					path.transition.push(`L${[obj.x, p1 * .5]}`)

// 					obj.x -= p1 * .25
// 					path.enter.push(`L${[obj.x, 0]}`)
// 					path.transition.push(`L${[obj.x, p1]}`)

// 					obj.labelPos.push({ x: obj.x, y: p1, value: _commune[d.path] / normalizingValue, label: printNumber(Math.round((_commune[d.path] / normalizingValue) * 100) / 100), curves: Math.max(3, Math.round(Math.random() * 5)) })
// 				}
// 			}
// 			else if (relations[i] === 'series') {
// 				const p1 = Mountains.scale(_commune[d.path] / normalizingValue)
// 				// const p1 = Mountains.scale(_commune[d.path])
// 				const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / normalizingValue)

// 				obj.x -= p1 * .5
// 				path.enter.push(`L${[obj.x, 0]}`)
// 				path.transition.push(`L${[obj.x, p1]}`)

// 				obj.labelPos.push({ x: obj.x, y: p1, value: _commune[d.path] / normalizingValue, label: printNumber(Math.round((_commune[d.path] / normalizingValue) * 100) / 100), curves: Math.max(3, Math.round(Math.random() * 5)) })
// 				obj.rate.push({ x1: obj.x + p1 * .5, x2: obj.x, y1: p0 * .5, y2: p1 * .5, value: Mountains.calculateAnnualRate(_commune[Mountains.rangeValues[i - 1].path], _commune[d.path], Math.abs(+d.key - +Mountains.rangeValues[i - 1].key)), years: Math.abs(+d.key - +Mountains.rangeValues[i - 1].key) })
// 			}

// 			if (i === Mountains.rangeValues.length - 1) {
// 				const p1 = Mountains.scale(_commune[d.path] / normalizingValue)
// 				// const p1 = Mountains.scale(_commune[d.path])

// 				obj.x -= p1 * .5
// 				path.enter.push(`L${[obj.x, 0]}`)
// 				path.transition.push(`L${[obj.x, 0]}`)

// 				obj.paths.push(path)
// 				// obj.labelPos.push(obj.x)
// 			}
// 		}
// 		else {
// 			const scale = d3.set(indicators.filter(c => d.sources.map(b => b.path).indexOf(c['Structure']) !== -1).map(c => c['Index_Echelle'])).values()[0]
// 			// THERE ARE ONLY DISCRETE RELATIONSHIPS AFTER AN OPERATION
// 			// IF IT IS THE FIRST PEAK, THEN SET THE SCALE FOR THE RANGE
// 			if (i === 0) {
// 				Mountains.setScale(i)
// 				axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
// 			}
// 			// IF IT IS NOT THE FIRST PEAK, FINISH THE PREVIOUS PEAK WITH p0, THEN RESET THE SCALE FOR THE NEW RANGE (IF THE TYPE OF SCALE IS DIFFERENT)
// 			else if (i > 0) {
// 				// IF THE PREVIOUS PEAK IS NOT THE RESULT OF AN OPERAION
// 				if (Mountains.rangeValues[i - 1].type === 'value') {
// 					// CHECK WHETHER THE NEW PEAK SHOULD BE PROJECTED ON THE SAME SCALE
// 					const prevPath = Mountains.rangeValues[i - 1].path
// 					const prevScale = indicators.filter(c => c['Structure'] === prevPath)[0]['Index_Echelle']
// 					// MAKE SURE THE SCALE IS STILL THAT OF THE PREVIOUS PEAK
// 					const p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / normalizingValue) 
// 					// let p0
// 					// if (Mountains.rangeValues[i - 1].type === 'value') p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].path] / normalizingValue)
// 					// else p0 = Mountains.scale(_commune[Mountains.rangeValues[i - 1].sources[0].path] / normalizingValue) 

// 					obj.x -= p0 * .5
					
// 					path.enter.push(`L${[obj.x, 0]}`)
// 					path.transition.push(`L${[obj.x, 0]}`)
// 					obj.paths.push(path)
					
// 					path = {}
// 					path.enter = []
// 					path.transition = []
// 					// IF THE TYPE OF SCALE IS NOT THE SAME, THE CHANGE THE Mountains.scale.domain()
// 					// AND PUSH THE NEXT PEAK HORIZONTALLY AWAY
// 					if (prevScale !== scale) {
// 						Mountains.setScale(i)
// 						obj.x += 50
// 						axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
// 					}
// 				}
// 				else {
// 					Mountains.setScale(i)
// 					obj.x += 50
// 					axes.push({ axis: d3.scaleLinear().range(Mountains.scale.range()).domain(Mountains.scale.domain()), type: scale, x: obj.x })
// 				}
// 			}
// 			// ITERATE OVER THE SOURCES OF THE OPERATION
// 			// let base = 0
// 			let base = 0
// 			let yOffset = 0
			
// 			if (d.type === 'sum') base = d3.sum(d.sources, c => Mountains.scale(_commune[c.path] / normalizingValue))
// 			else if (d.type === 'division') {
// 				// base = d3.min(d.sources, c => Mountains.scale(_commune[c.path] / normalizingValue)) // THIS IS d3.min SINCE IT IS A NEGATIVE VALUE
// 				base = Mountains.scale(100)
// 				// d.sources.sort((a, b) => Mountains.scale(_commune[a.path] / normalizingValue) - Mountains.scale(_commune[b.path] / normalizingValue))
// 				d.sources.sort((a, b) => Mountains.scale((_commune[a.path] / d3.max(d.sources, c => _commune[c.path])) * 100) - Mountains.scale((_commune[b.path] / d3.max(d.sources, c => _commune[c.path])) * 100))
// 			}
			
// 			d.sources.forEach((c, j) => {
// 				let x = obj.x
// 				if (d.type !== 'sum') yOffset = 0
// 				// SET THE HEIGHT (AND WIDTH) OF THE NEW PEAK
// 				let value = _commune[c.path] / normalizingValue
// 				if (d.type === 'division') {
// 					value = (_commune[c.path] / d3.max(d.sources, b => _commune[b.path])) * 100
// 					console.log(value, Mountains.scale(value))
// 					if (isNaN(value)) value = 0
// 				}
// 				const p1 = Mountains.scale(value)

// 				// if (j === 0) base = p1
// 				// DETERMINE THE COLOR OF THE NEW PEAK
// 				path.color = c.path.split('_')[0]
// 				// START THE NEW PEAK
// 				path.enter.push(`M${[x, 0]}`)
// 				path.transition.push(`M${[x, 0]}`)
// 				// CREATE THE PEAK
// 				x -= base * .5
				
// 				path.enter.push(`L${[x, yOffset]}`)
// 				path.transition.push(`L${[x, yOffset + p1]}`)

// 				// ADD A LABEL FOR EACH PART OF THE SUM
// 				// obj.labelPos.push({ x: x, y: yOffset + p1, value: _commune[c.path] / normalizingValue, curves: Math.max(3, Math.round(Math.random() * 5)) })
				
// 				// CLOSE OFF THE PEAK
// 				x -= base * .5

// 				path.enter.push(`L${[x, 0]}`)
// 				path.transition.push(`L${[x, 0]}`)

// 				if (d.type === 'sum') {
// 					path.enter.push(`L${[x + base * .5, yOffset]}`)
// 					path.transition.push(`L${[x + base * .5, yOffset]}`)
// 				}
// 				else if (d.type === 'division') {
// 					if (c.division === 'divisor') path.style = 'outline'
// 				}

// 				obj.paths.push(path)
				
// 				path = {}
// 				path.enter = []
// 				path.transition = []

// 				yOffset += p1
// 			})
// 			// ADD ONLY ONE LABEL FOR THE SUM
// 			if (d.type === 'sum') obj.labelPos.push({ x: obj.x - base * .5, y: yOffset, value: d3.sum(d.sources, c => _commune[c.path] / normalizingValue), label: printNumber(Math.round(d3.sum(d.sources, c => _commune[c.path] / normalizingValue) * 100) / 100), curves: Math.max(3, Math.round(Math.random() * 5)) })
// 			else if (d.type === 'division') {
// 				const percentage = (d.sources.filter(c => c.division === 'dividend').map(c => _commune[c.path])[0] / d.sources.filter(c => c.division === 'divisor').map(c => _commune[c.path])[0]) * 100
// 				// console.log(d.sources.filter(c => c.division === 'dividend').map(c => _commune[c.path] / normalizingValue)[0])
// 				// console.log(d.sources.filter(c => c.division === 'divisor').map(c => _commune[c.path] / normalizingValue)[0])
// 				// console.log(!isNaN(percentage) ? percentage : 0)
// 				obj.labelPos.push({ x: obj.x - base * .5, y: yOffset, value: !isNaN(percentage) ? percentage : 0, label: !isNaN(percentage) ? `${printNumber(Math.round(percentage * 100) / 100)}%` : `${0}%`, curves: Math.max(3, Math.round(Math.random() * 5)) })
// 			}
			
// 			obj.x -= base
// 		}
// 	})
// 	return { paths: obj, axes: axes }
// }

Mountains.draw = function (_d, _i) {
	// const svg = d3.select('svg')
	const sel = d3.select(this)
	const baseHeight = d3.select('div.paysage--vis').node().clientHeight || d3.select('div.paysage--vis').node().offsetHeight

	
	// WORKING HERE
	// const renderings = Mountains.renderings(_d)
	const relations = Mountains.rangeRelations()
	// console.log(relations)
	// console.log(Mountains.data)

	// let massif = sel.selectAll('div.massif')
	// 	.data(relations, (d, i) => `${d.index}-${i}`)
	// massif.exit().remove()
	// massif = massif.enter()
	// 	.append('div')
	// 	.attr('class', 'massif')
	// .merge(massif)
	const massif = sel.addElems('div', 'massif', relations) //, (d, i) => `${d.index}-${d.max}`)
		// .each((d, i) => console.log(`${d.index}-${d.max}`, d))
		.style('width', function (d, i) {
			// THIS IS TO ENSURE A TABULAR-LIKE VIEW WHEN PEAKS ARE NORMALIZED
			// SO THAT THEY ARE VERTICALLY ALIGNED
			if (normalize) {
				const height = !normalize ? Math.round(Mountains.horizon * .75) : baseHeight * (Mountains[normalize ? 'normCoverageP' : 'coverageP'] / 100) / Mountains.data.length

				const scale = d3.scaleLinear()
					.domain([0, d.max])
					.range([0, height])
				
				const widths = d.values.map(c => { 
					const obj = {} 
					obj.key = c.key 
					const values = Mountains.data.map(b => c.values.map(a => scale(b[a.path])))
					obj.values = values.filter(b => d3.sum(b) === d3.max(values.map(a => d3.sum(a)))).flatten()
					return obj
				})

				const mx = widths.map(c => {
					if (c.key === 'discrete') return d3.max(c.values)
					else if (c.key === 'series') return d3.max(c.values) * c.values.length * .75
					else if (c.key === 'ordinal') {
						return d3.sum(c, (c, j) => {
							current = c
							if (j === 0) return current
							else {
								prev = w[j - 1]
								if (prev < current) return current - prev / 2
								else return current / 2
							}
						})
					}
				})
				const width = mx.length === 1 ? mx[0] : d3.sum(mx) + (mx.length - 1) * 25
				// console.log(widths, width)

				return `${width}px`
			}
		})
	
	/*let contour = massif.selectAll('div.sommet-contour')
		.data(d => d.values, (c, j) => `${c.key}-${j}`)
	contour.exit().remove()
	contour = contour.enter()
		.append('div')
		.attr('class', function (d) { return `sommet-contour ${d.key}` })
		.style('width', function (d) { 
			const scale = d3.scaleLinear()
				.domain([0, this.parentNode['__data__'].max])
				.range([0, this.clientHeight || this.offsetHeight])
			
			const w = d.values.map(c => scale(_d[c.path]))

			if (d.key === 'discrete') return `${d3.max(w)}px` //`${this.clientHeight || this.offsetHeight}px` 
			else if (d.key === 'series') return `${d3.max(w) * (d.values.length * .75)}px` //`${(this.clientHeight || this.offsetHeight) * (d.values.length * 3 / 4)}px`
			else if (d.key === 'ordinal')  return `${d3.sum(w, (c, j) => j === 0 ? c : c * .75)}px`
		})
		.style('clip-path', function (d) {
			const poly = [['0% 100%'], ['50% 100%'], ['100% 100%']]
			return `polygon(${poly.join(',')})`
		})
	.merge(contour)
	contour.transition()
		.duration(0)
		.style('width', function (d) { 
			const scale = d3.scaleLinear()
				.domain([0, this.parentNode['__data__'].max])
				.range([0, this.clientHeight || this.offsetHeight])
			
			const w = d.values.map(c => scale(_d[c.path]))
			// if (this.parentNode.parentNode['__data__'].Commune_court === 'Total') console.log(d3.sum(w, c => c * .75), w, w.map(c => c * .75))

			if (d.key === 'discrete') return `${d3.max(w)}px`
			else if (d.key === 'series') return `${d3.max(w) * (d.values.length * .75)}px`
			else if (d.key === 'ordinal') {
				return `${d3.sum(w, (c, j) => {
					current = c
					if (j === 0) return current
					else {
						prev = w[j - 1]
						if (prev < current) return current - prev / 2
						else return current / 2
					}
				})}px`
			}
		})
		.style('clip-path', function (d) {
			wScale = d3.scaleLinear()
				.domain([0, d3.sum(d.values, (c, j) => {
					current = _d[c.path]
					if (j === 0) return current
					else {
						prev = _d[d.values[j - 1].path]
						if (prev < current) return current - prev / 2
						else return current / 2
					}
				})])
				.range([0, 100])
			hScale = d3.scaleLinear()
				.domain([0, this.parentNode['__data__'].max])
				.range([100, 0])

			const values = d.values.map(c => [wScale(_d[c.path]), hScale(_d[c.path])])

			let poly = []
			if (d3.sum(values, b => b[0])) {
				if (['discrete', 'series'].indexOf(d.key) !== -1) poly = values.map((c, j) => [`${(j + .5) * 100 / values.length}% ${c[1]}%`])
				else if (d.key === 'ordinal') {
					values.forEach((c, j) => {
						current = c[0]

						if (j === 0) poly.push([`${c[0] * .5}% ${c[1]}%`])
						else {
							const prev = values[j - 1]
							
							if ((100 - prev[1]) < (100 - c[1])) {
								poly.push([`${prev[0] * .75}% ${100 - (100 - prev[1]) * .5}%`])
								poly.push([`${prev[0] * .5 + c[0] * .5}% ${c[1]}%`])
							}
							else {
								poly.push([`${prev[0] - c[0] * .25}% ${100 - (100 - c[1]) * .5}%`])
								poly.push([`${prev[0]}% ${c[1]}%`])
							}
						}
					})
				}
				poly.unshift(['0% 100%'])
				poly.push(['100% 100%'])
			}
			else poly = [['0% 100%'], ['100% 100%']]

			return `polygon(${poly.join(',')})`
		})
	*/

	// let sommet = contour.selectAll('div.sommet')
	let sommet = massif.selectAll('div.sommet')
		.data(d => d.values, d => d.values.map(c => c.path).join('-'))//(c, j) => `${c.key}-${j}`)
	sommet.exit().remove()
	sommet = sommet.enter()
		.append('div')
		.attr('class', function (d) { return `sommet ${d.key}` })
		// .style('width', function (d) { 
		// 	const height = !normalize ? Math.round(Mountains.horizon * .75) : Mountains.coverage / Mountains.data.length

		// 	const scale = d3.scaleLinear()
		// 		.domain([0, this.parentNode['__data__'].max])
		// 		.range([0, height])
			
		// 	const w = d.values.map(c => scale(_d[c.path]))

		// 	if (d.key === 'discrete') return `${d3.max(w)}px`
		// 	else if (d.key === 'series') return `${(d3.max(w) * d.values.length) * .75}px`
		// 	else if (d.key === 'ordinal') {
		// 		return `${d3.sum(w, (c, j) => {
		// 			current = c
		// 			if (j === 0) return current
		// 			else {
		// 				prev = w[j - 1]
		// 				if (prev < current) return current - prev / 2
		// 				else return current / 2
		// 			}
		// 		})}px`
		// 	}
		// })
		// .style('clip-path', function (d) {
		// 	const poly = [['0% 100%'], ['50% 100%'], ['100% 100%']]
		// 	return `polygon(${poly.join(',')})`
		// })
		// .style('-webkit-clip-path', function (d) {
		// 	const poly = [['0% 100%'], ['50% 100%'], ['100% 100%']]
		// 	return `polygon(${poly.join(',')})`
		// })
		// .on('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', function () { // NOT WORKING
		// 	d3.select(this).classed('animate-in', false)
		// 		.classed('animation--none', true)
		// })
		.style('transform', _ => {
			if (!test) return null
			else if (normalize) return `scale(${0.127388535})`
			return null
		})
		.on('mouseover', function () {
			if (!d3.select('.paysage--vis').classed('dragging')) {
				const commune = this.parentNode.parentNode.parentNode
				d3.selectAll('div.commune')
					.classed('semi-transparent', false)
				.filter(function () { return this !== commune })
					.classed('semi-transparent', true)
			}
		})
		.on('mouseout', function () {
			d3.selectAll('div.commune').classed('semi-transparent', false)
		})
	.merge(sommet)
		.style('width', function (d) { 
			let height = 0
			if (!test) height = !normalize ? Math.round(Mountains.horizon * .75) : Mountains.coverage / Mountains.data.length
			else height = Math.round(Mountains.horizon * .75)

			const scale = d3.scaleLinear()
				.domain([0, this.parentNode['__data__'].max])
				.range([0, height])
			
			const widths = d.values.map(c => scale(_d[c.path]))
			let width = 0

			if (d.key === 'discrete') width = d3.max(widths)
			else if (d.key === 'series') width = d3.max(widths) * (d.values.length * .75)
			else if (d.key === 'ordinal') {
				width = d3.sum(widths, (c, j) => {
					current = c
					if (j === 0) return current
					else {
						prev = widths[j - 1]
						if (prev < current) return current - prev / 2
						else return current / 2
					}
				})
				// }) - 2}px` // THIS IS IF WE WANT AN OUTLINE
			}

			// const proportion = (Mountains.coverage / Mountains.data.length) / Math.round(Mountains.horizon * .75)
			// console.log(Mountains.coverage, proportion, width * proportion)

			return `${width}px`
		})
		.style('transform', _ => {
			if (!test) return null
			else if (normalize) return `scale(${0.127388535})`
			return null
		})
		.style('clip-path', function (d) {
			wScale = d3.scaleLinear()
				.domain([0, d3.sum(d.values, (c, j) => {
					current = _d[c.path]
					if (j === 0) return current
					else {
						prev = _d[d.values[j - 1].path]
						if (prev < current) return current - prev / 2
						else return current / 2
					}
				})])
				.range([0, 100])
			hScale = d3.scaleLinear()
				.domain([0, this.parentNode['__data__'].max])
				.range([100, 0])

			const values = d.values.map(c => [wScale(_d[c.path]), hScale(_d[c.path])])
			let poly = []
			
			if (d3.sum(values, b => b[0])) {
				if (['discrete', 'series'].indexOf(d.key) !== -1) {
					poly = values.map((c, j) => [`${(j + .5) * 100 / values.length}% ${c[1]}%`])
					d.values.forEach((c, j) => {
						c.peak = (j + .5) * 100 / values.length
					})
				}
				else if (d.key === 'ordinal') {
					let px = 0
					values.forEach((c, j) => {
						current = c[0]

						if (j === 0) {
							poly.push([`${px += c[0] * .5}% ${c[1]}%`])
							d.values[j].peak = px
						}
						else {
							const prev = values[j - 1]
							
							if ((100 - prev[1]) < (100 - c[1])) {
								poly.push([`${px += prev[0] * .25}% ${100 - (100 - prev[1]) * .5}%`])
								poly.push([`${px += c[0] * .5 - prev[0] * .25}% ${c[1]}%`])
								d.values[j].peak = px
							}
							else {
								poly.push([`${px += prev[0] * .5 - c[0] * .25}% ${100 - (100 - c[1]) * .5}%`])
								poly.push([`${px += c[0] * .25}% ${c[1]}%`])
								d.values[j].peak = px
							}
						}
					})
				}
				poly.unshift(['0% 100%'])
				poly.push(['100% 100%'])
			}
			else poly = [['0% 100%'], ['100% 100%']]

			return `polygon(${poly.join(',')})`
		})
		.style('-webkit-clip-path', function (d) {
			wScale = d3.scaleLinear()
				.domain([0, d3.sum(d.values, (c, j) => {
					current = _d[c.path]
					if (j === 0) return current
					else {
						prev = _d[d.values[j - 1].path]
						if (prev < current) return current - prev / 2
						else return current / 2
					}
				})])
				.range([0, 100])
			hScale = d3.scaleLinear()
				.domain([0, this.parentNode['__data__'].max])
				.range([100, 0])

			const values = d.values.map(c => [wScale(_d[c.path]), hScale(_d[c.path])])
			let poly = []
			
			if (d3.sum(values, b => b[0])) {
				if (['discrete', 'series'].indexOf(d.key) !== -1) {
					poly = values.map((c, j) => [`${(j + .5) * 100 / values.length}% ${c[1]}%`])
					d.values.forEach((c, j) => {
						c.peak = (j + .5) * 100 / values.length
					})
				}
				else if (d.key === 'ordinal') {
					let px = 0
					values.forEach((c, j) => {
						current = c[0]

						if (j === 0) {
							poly.push([`${px += c[0] * .5}% ${c[1]}%`])
							d.values[j].peak = px
						}
						else {
							const prev = values[j - 1]
							
							if ((100 - prev[1]) < (100 - c[1])) {
								poly.push([`${px += prev[0] * .25}% ${100 - (100 - prev[1]) * .5}%`])
								poly.push([`${px += c[0] * .5 - prev[0] * .25}% ${c[1]}%`])
								d.values[j].peak = px
							}
							else {
								poly.push([`${px += prev[0] * .5 - c[0] * .25}% ${100 - (100 - c[1]) * .5}%`])
								poly.push([`${px += c[0] * .25}% ${c[1]}%`])
								d.values[j].peak = px
							}
						}
					})
				}
				poly.unshift(['0% 100%'])
				poly.push(['100% 100%'])
			}
			else poly = [['0% 100%'], ['100% 100%']]

			return `polygon(${poly.join(',')})`
		})
	// sommet.transition()
		// .duration(0)
		
		
	// .on('end', function () {
	// 	d3.select(this).select('span.gradient')
	// 		// .style('width', function () { return `${this.parentNode.clientWidth || this.parentNode.offsetWidth}px` })
	// 		.style('height', function (d) {
	// 			const height = !normalize ? Math.round(Mountains.horizon * .75) : Mountains.coverage / Mountains.data.length

	// 			const scale = d3.scaleLinear()
	// 				.domain([0, this.parentNode.parentNode['__data__'].max])
	// 				.range([0, height])

	// 			return `${d3.max(d.values, c => scale(_d[c.path]))}px`
	// 		})
	// })







	// const gradient = sommet.addElems('span', 'gradient')
	let gradient = sommet.selectAll('span.gradient')
		.data(d => [d])
	gradient.exit().remove()
	gradient = gradient.enter()
		.append('span')
		.attr('class', 'gradient')
		.style('height', function (d) {
			let height = 0
			if (!test) height = !normalize ? Math.round(Mountains.horizon * .75) : Mountains.coverage / Mountains.data.length
			else height = Math.round(Mountains.horizon * .75)

			const scale = d3.scaleLinear()
				.domain([0, this.parentNode.parentNode['__data__'].max])
				.range([0, height])

			return `${d3.max(d.values, c => scale(_d[c.path]))}px`
		})
	.on('mouseover', function (d) {
		const massif = d3.select(this.parentNode.parentNode)
		massif.addElems('div', 'tooltip', d.values)
			.style('transform', c => `translateX(${c.peak / 100 * (this.clientWidth || this.offsetWidth)}px)`)
			// .style('left', c => `${c.peak / 100 * (this.clientWidth || this.offsetWidth)}px`)
			.style('bottom', c => {
				// THIS IS A SIMPLE ADAPTATION OF THE CALCULATIONS FOR THE clip-path
				hScale = d3.scaleLinear()
					.domain([0, this.parentNode.parentNode['__data__'].max])
					.range([0, 100])

				return `${hScale(_d[c.path]) / 100 * (this.parentNode.clientHeight || this.parentNode.offsetHeight)}px`
			})
			.html(c => printNumber(_d[c.path]))
	})
	.on('mouseout', _ => {
		d3.selectAll('div.massif').selectAll('div.tooltip').remove()
	})
	.merge(gradient)









		// .style('width', function () { return `${this.parentNode.clientWidth || this.parentNode.offsetWidth}px` })
		// .style('height', function (d) {
		// 	const sel = d3.select(this)

		// 	const scale = d3.scaleLinear()
		// 		.domain([0, this.parentNode.parentNode['__data__'].max])
		// 		.range([0, this.parentNode.clientHeight || this.parentNode.offsetHeight])

		// 	return `${d3.max(d.values, c => scale(_d[c.path]))}px`
		// })


	if (_i === 0) {

	}


	return
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
	}
	else {
		ridges.selectAll('g.axis--y').remove()
	}

}
/*Mountains.labels = _sel => {
	// console.log(_sel.datum())

	const labels = _sel.addElems('g', 'peak--label', d => d.labelPos)
		.attr('transform', d => `translate(${[d.x, 0]})`)
	

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
}*/
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
/*Mountains.setScale = _i => {
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
}*/
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