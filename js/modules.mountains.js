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
Mountains.coverageP = 60 // PERCENTAGE OF THE SCREEN
Mountains.normHorizonP = 10
Mountains.normCoverageP = 90

Mountains.rangeValues = []

Mountains.colors = d3.scaleLinear()
	.domain([0, Mountains.data.length])
	.range(['#344758', '#CED5E4'])

Mountains.drag = d3.drag()
	.on('start', function () {
		if (!normalize) {
			d3.selectAll('div.label--value').remove()
			d3.selectAll('div.sommet, div.axis').classed('transition--none', true)
			d3.selectAll('div.sommet, div.label--name').classed('semi-transparent', false)

			d3.select(this).classed('dragging', true)
			d3.select('div.paysage--vis').classed('dragging', true)
		}
	})
	.on('drag', function (d) {
		if (!normalize) {
			const evt = d3.event
			d.originleft += evt.dx

			d3.select(this).selectAll('div.sommet').style('transform', c => `translate(${d.originleft}px, ${d.top}px)`)
			d3.select(this).selectAll('div.axis').style('transform', c => `translateX(${d.originleft}px)`)
		}
	})
	.on('end',function () {
		if (!normalize) {
			d3.selectAll('div.sommet, div.axis').classed('transition--none', false)
			d3.select(this).classed('dragging', false)
			d3.select('div.paysage--vis').classed('dragging', false)
		}
	})

Mountains.init = _data => {
	Mountains.data = _data ? Mountains.parseData(_data) : Mountains.data
	if (_data) Mountains.data.forEach(d => d.display = true)

	Mountains.data.sort((a, b) => {
		// if (!normalize) {
			const values = Mountains.rangeValues.filter(d => d.type === 'value')
			const sums = Mountains.rangeValues.filter(d => d.type === 'sum')
			const divisions = Mountains.rangeValues.filter(d => d.type === 'division')

			// console.log(values, sums, divisions)

			const totalize = _d => {
				const bValues = d3.sum(values, d => !normalize ? _d[d.path] : _d[d.path] / _d[normalizingCol])//Mountains.height(_d, d.path)))
				const bSums = d3.sum(sums.map(d => d3.sum(d.sources, c => !normalize ? _d[c.path] : _d[c.path] / _d[normalizingCol])))//Mountains.height(_d, c.path))))
				const bDivisions = d3.sum(divisions.map(d => {
					const percentage = !normalize ? _d[d.sources.filter(c => c.division === 'dividend')[0]] / _d[d.sources.filter(c => c.division === 'divisor')[0]]
						: (_d[d.sources.filter(c => c.division === 'dividend')[0]] / _d[d.sources.filter(c => c.division === 'divisor')[0]]) / _d[normalizingCol]
					return percentage || 0
				}))
				// console.log(_d['Commune_court'], bValues, bSums, bDivisions)
				return bValues + bSums + bDivisions
			}

			return totalize(b) - totalize(a)
		// }
		// else return a['Commune_court'] - b['Commune_court']
	}) // MIGHT NEED TO CHANGE THIS TO ACCOUNT FOR SUMS

	const paysage = d3.select('div.paysage--vis')
		.call(UI.drag)
	const baseHeight = paysage.node().clientHeight || paysage.node().offsetHeight


	// NOT SURE THIS IS STILL USEFUL
	Mountains.horizon = baseHeight * Mountains['horizonP'] / 100
	Mountains.coverage = baseHeight * Mountains['coverageP'] / 100



	// START DRAWING
	// console.log(Mountains.data.map(d => d['Commune_court']))
	const montagnes = paysage.addElems('div', 'montagnes', [Mountains.data], d => d['Commune_court'])

	let commune = montagnes.selectAll('div.commune')
		.data(d => d.filter(c => c.display), c => c['Commune_court'])
	commune.exit().remove()
	commune = commune.enter()
		.append('div')
		.attr('class', 'commune')
	.each(function () {
		console.log('(re)created div.commune')
	})
	.merge(commune)
		.each(function (d, i) {
			!normalize ? d.originleft ? d.left = d.originleft : d.originleft = d.left = Math.round((Math.random() * .5) * (this.clientWidth || this.offsetWidth)) : d.left = 0
			d.origin = d.top = Math.round(baseHeight * (Mountains[normalize ? 'normHorizonP' : 'horizonP'] / 100) + i * baseHeight * (Mountains[normalize ? 'normCoverageP' : 'coverageP'] / 100) / Mountains.data.filter(d => d.display).length)
		})
		.style('z-index', (d, i) => d.z = i)
		.each(Mountains.draw)
		.call(Mountains.drag)
}

Mountains.rangeRelations = _ => {
	const indicators = d3.select('div.menu--indicators').datum()
	const chaines = []

	Mountains.rangeValues.forEach((d1, i) => {
		// console.log(d1.type)
		if (d1.type === 'value') {
			const indexEchelle = indicators.filter(c => c['Structure'] === d1.path)[0]['Index_Echelle']
			// console.log(indicators, indexEchelle)
			
			// JUMP TO
			// PROBABLY CHANGE THIS TO d3.selection OF THE DISPLAYED chaines
			const max_y = d3.max(Mountains.data.filter(d => d.display).map(c => !normalize ? c[d1.path] : c[d1.path] / c[normalizingCol]))

			if (i === 0) return chaines.push({ index: indexEchelle, max: max_y, values: [{ key: 'discrete', values: [d1] }] })
			else {
				// THIS IS THE PREVIOUS INDICATOR IN THE RANGE
				const d0 = Mountains.rangeValues[i - 1]
				if (d0.type !== 'value') { // IF THE PREVIOUS INDICATOR IS THE RESULT OF AN OPERATION, THEN CREATE A NEW massif
					if (indexEchelle === chaines[chaines.length - 1].index) { // IF IT SHARES THE SAME index Echelle
						chaines[chaines.length - 1].values.push({ key: 'discrete', values: [d1] })
						chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
						return 
					} 
					else {
						return chaines.push({ index: indexEchelle, max: max_y, values: [{ key: 'discrete', values: [d1] }] })
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
						// console.log('here')
						chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].key = 'ordinal'
						chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].values.push(d1)
						chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
						return
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
						return chaines.push({ index: indexEchelle, max: max_y, values: [{ key: 'discrete', values: [d1] }] })
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
							if (indexEchelle === chaines[chaines.length - 1].index) {
								chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].key = 'series'
								chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].values.push(d1)
								chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
								return 
							}
							else {
								return chaines.push({ index: indexEchelle, max: max_y, values: [{ key: 'discrete', values: [d1] }] })
							}
						}
						// 03.a.ii - IF THE SIBLING INDICATORS HAVE THE SAME YEAR IN THEIR HIERARCHY
						// IT IS AN *ORDINAL* RELATIONSHIP
						else if (h0[Heuristics.hasYear(h0)] === h1[Heuristics.hasYear(h1)]) {
							if (indexEchelle === chaines[chaines.length - 1].index) {
								chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].key = 'ordinal'
								chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].values.push(d1)
								chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
								return 
							}
							else {
								return chaines.push({ index: indexEchelle, max: max_y, values: [{ key: 'discrete', values: [d1] }] })
							}
						}
					}
					// 03.b - IF THERE IS NO YEAR IN THE HIERARCHY
					// IT IS AN *ORDINAL* RELATIONSHIP
					else {
						if (indexEchelle === chaines[chaines.length - 1].index) {
							chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].key = 'ordinal'
							chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].values.push(d1)
							chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
							return 
						}
						else {
							return chaines.push({ index: indexEchelle, max: max_y, values: [{ key: 'discrete', values: [d1] }] })
						}
					}
				}
			}
		}
		else if (d1.type === 'addition') { // THIS IS FOR OPERATIONS
			const indexEchelle = indicators.filter(b => b['Structure'] === d1.sources[0].path)[0]['Index_Echelle'] // HERE d1.sources[0] IS FINE SINCE WE MAKE SURE IN modules.reasoning THAT THE USER CAN ONLY DO OPERATIONS ON ELEMENTS THAT SHARE THE SAME SCALE INDEX
			// WE NEED TO CREATE A NEW ELEMENT
			// AND THEN ADD ALL THE SOURCE ELEMENTS TO IT
			const max_y = d3.max(Mountains.data.filter(d => d.display).map(d => !normalize ? d3.sum(d1.sources, c => d[c.path]) : d3.sum(d1.sources, c => d[c.path]) / d[normalizingCol]))
				
			if (chaines[chaines.length - 1] && indexEchelle === chaines[chaines.length - 1].index) {
				chaines[chaines.length - 1].values.push({ key: d1.type, values: d1.sources }) // d1.type IS EITHER addition OR division
				chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
				return 
			}
			else return chaines.push({ index: indexEchelle, max: max_y, values: [{ key: d1.type, values: d1.sources }] })
		}
		else if (d1.type === 'division') {
			const indexEchelle = d1.sources.map(b => indicators.filter(a => a['Structure'] === b.path)[0]['Index_Echelle']).join(' / ') // HERE d1.sources[0] IS FINE SINCE WE MAKE SURE IN modules.reasoning THAT THE USER CAN ONLY DO OPERATIONS ON ELEMENTS THAT SHARE THE SAME SCALE INDEX
			// WE NEED TO CREATE A NEW ELEMENT
			// AND THEN ADD ALL THE SOURCE ELEMENTS TO IT
			const max_y = d3.max(Mountains.data.filter(d => d.display && d[normalizingCol] > 0).map(d => {
				// console.log(d3.max([Math.ceil(d[d1.sources.filter(c => c.division === 'dividend')[0].path] / d[d1.sources.filter(c => c.division === 'divisor')[0].path] * 10) / 10, 1]) / d[normalizingCol])
				return !normalize ? d3.max([Math.ceil(d[d1.sources.filter(c => c.division === 'dividend')[0].path] / d[d1.sources.filter(c => c.division === 'divisor')[0].path] * 10) / 10, 1]) 
					: d3.max([Math.ceil(d[d1.sources.filter(c => c.division === 'dividend')[0].path] / d[d1.sources.filter(c => c.division === 'divisor')[0].path] * 10) / 10, 1]) / d[normalizingCol]
				// return !normalize ? d3.sum(d1.sources, c => d[c.path]) : d3.sum(d1.sources, c => d[c.path]) / d[normalizingCol]
			}))
				
			if (chaines[chaines.length - 1] && indexEchelle === chaines[chaines.length - 1].index) {
				chaines[chaines.length - 1].values.push({ key: d1.type, values: d1.sources }) // d1.type IS EITHER addition OR division
				chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
				return 
			}
			else return chaines.push({ index: indexEchelle, max: max_y, values: [{ key: d1.type, values: d1.sources }] })
		}
	})
	return chaines
}

Mountains.renderRelations = (_relations, _commune, _i) => {
	const paysage = d3.select('div.paysage--vis')
	const baseHeight = paysage.node().clientHeight || paysage.node().offsetHeight
	const maxHeight = !normalize ? Math.round(Mountains.horizon * .75) : Math.round(baseHeight * (Mountains['normCoverageP'] / 100) / Mountains.data.filter(d => d.display).length) * .75
	
	const scale = d3.scaleLinear()
		.range([0, maxHeight])

	const psw = d3.scaleLinear() // psw = PATH SCALE WIDTH
		.range([0, 100])
	const psh = d3.scaleLinear() // psh = PATH SCALE HEIGHT
		// .range([100, 0])

	const valley = 50 // THIS IS THE DISTANCE BETWEEN TWO CONSECUTIVE MOUNTAINS
	let x = !normalize ? 0 : maxHeight // IF THE VIEW IS NORMALIZED, THEN OFFSET THE FIRST PEAK SO THAT THE AXIS IS NOT CLUTTERED WITH THE TITLE
	let y = 0

	return _relations.map(d => {
		scale.domain([0, d.max])

		d.left = x
		d.maxHeight = maxHeight

		const renders = []

		d.values.forEach(c => {
		// d.values = d.values.map(c => {
			// CALCULATE WIDTH AND HEIGHT
			const widths = c.values.map(b => scale(!normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol]))
			let w = h = 0

			if (c.key === 'discrete') { 
				w = h = d3.max(widths)
			}
			else if (c.key === 'series') {
				w = d3.max(widths) * (c.values.length * .75)
				h = d3.max(widths)
			}
			else if (c.key === 'ordinal') {
				w = d3.sum(widths, (b, k) => {
					current = b
					if (k === 0) return current
					else {
						prev = widths[k - 1]
						if (prev < current) return current - prev / 2
						else return current / 2
					}
				})
				h = d3.max(widths)
			}
			else if (c.key === 'addition') {
				w = h = d3.sum(widths)
			}
			else if (c.key === 'division') {
				// console.log(c.values)
				w = h = scale(!normalize ? 1 : 1 / _commune[normalizingCol])
				// w = h = maxHeight // THIS ACTUALLY NEEDS TO BE THE WIDTH OF 100%
			}

			// CALCULATE THE CLIP PATH
			psw.domain([0, d3.sum(c.values, (b, k) => {
				current = !normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol]
				if (k === 0) return current
				else {
					prev = !normalize ? _commune[c.values[k - 1].path] : _commune[c.values[k - 1].path] / _commune[normalizingCol]
					if (prev < current) return current - prev / 2
					else return current / 2
				}
			})])
			if (['discrete', 'series', 'ordinal'].indexOf(c.key) !== -1) {
				psh.domain([0, d3.max(c.values, b => !normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol])]) 
					.range([100, 0])
			}
			else if (c.key === 'addition') {
				psh.domain([0, d3.sum(c.values, b => !normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol])])
					.range([0, 100])
			}
			else if (c.key === 'division') {
				const dividend = c.values.filter(b => b.division === 'dividend')[0]
				const divisor = c.values.filter(b => b.division === 'divisor')[0]
				const division = _commune[dividend.path] / _commune[divisor.path] || 0
				const max = division > 1 ? Math.round(division * 100) : 100
				psh.domain([0, !normalize ? max : max / _commune[normalizingCol]])
					.range([0, 100])
			}

			// let values = []
			// if (['discrete', 'series', 'ordinal', 'addition'].indexOf(c.key) !== -1) 
			const values = c.values.map(b => [psw(!normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol]), psh(!normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol]), !normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol] || 0]) // THE LAST VALUE IS THE ACTUAL VALUE
			// NEED TO DO THE DIVISION FOR THE SCALE HERE > ACTUALLY SCALES AND values ARE NOT NEEDED SINCE WE ONLY HAVE ONE PEAK TO DRAW AND THE 100% PEAK
			// else if (c.key === 'division') values = c.values.filter(b => b.division === 'dividend').map(b => [psw(!normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol]), psh(!normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol]), !normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol] || 0]) // THE LAST VALUE IS THE ACTUAL VALUE
			const poly = []
			let points = []

			const renderObj = (_path, _points, _height) => {
				const obj = JSON.parse(JSON.stringify(c))
				obj.width = Math.round(w) || 0
				obj.height = _height ? Math.round(_height) : Math.round(h) || 0
				obj.left = !normalize ? Math.round(x) : Math.round(x) + (maxHeight - Math.round(w)) / 2 || 0 // IF THE VIEW IS NORMALIZED, THEN CENTER THE PEAK
				obj.top = _height ? Math.round(_height) : Math.round(h) || 0
				obj.path = _path
				obj.points = _points
				return renders.push(obj)
			}

			if (d3.sum(values, b => b[0])) {
				if (c.key === 'discrete') {
					const path = values.map((b, k) => [(k + .5) * 100 / values.length, b[1]])
					path.unshift([0, 100])
					path.push([100, 100])
					
					points = values.map((b, k) => [(k + .5) * 100 / values.length, b[1], b[2]])

					renderObj(path, points)
				}
				if (c.key === 'series') {
					const path = values.map((b, k) => [(k + .5) * 100 / values.length, b[1]])
					path.unshift([0, 100])
					path.push([100, 100])
					
					points = values.map((b, k) => [(k + .5) * 100 / values.length, b[1], b[2], +c.values[k].key])

					renderObj(path, points)
				}
				else if (c.key === 'ordinal') {
					const path = []
					let px = 0

					values.forEach((b, k) => {
						current = b[0]
						if (k === 0) {
							path.push([px += b[0] * .5, b[1]])
							points.push([px, b[1], b[2]])
						}
						else {
							const prev = values[k - 1]
							
							if ((100 - prev[1]) < (100 - b[1])) {
								path.push([px += prev[0] * .25, 100 - (100 - prev[1]) * .5])
								path.push([px += b[0] * .5 - prev[0] * .25, b[1]])
								points.push([px, b[1], b[2]])
							}
							else {
								path.push([px += prev[0] * .5 - b[0] * .25, 100 - (100 - b[1]) * .5])
								path.push([px += b[0] * .25, b[1]])
								points.push([px, b[1], b[2]])
							}
						}
					})
					path.unshift([0, 100])
					path.push([100, 100])

					renderObj(path, points)
				}
				else if (c.key === 'addition') {
					let height = 0
					const objs = [] // WE NEED THIS TO REVERSE THE ORDER OF THE RENDERING SO THAT BIG PEAKS GET DRAWN FIRST
					values.forEach((b, k) => {
						height += scale(b[2])
						
						const path = []
						path.push([(height * 100 / h) / 2, 0])
						path.push([100 - (height * 100 / h) / 2, 0])
						path.unshift([0, 100])
						path.push([100, 100])

						points = [[50, 0, b[2]]]

						objs.unshift({ path: path, points: points, height: height })
					})

					objs.forEach(b => renderObj(b.path, b.points, b.height))
				}
				else if (c.key === 'division') {
					// HERE WE NEED TO USE THE TWO ELEMENTS (THERE SHOULD ONLY EVER BE TWO)
					// 1) THE DIVIDEND AND 2) THE DIVISOR
					// console.log(c.values, values)
					const dividend = c.values.filter(b => b.division === 'dividend')[0]
					const divisor = c.values.filter(b => b.division === 'divisor')[0]
					const division = _commune[dividend.path] / _commune[divisor.path] || 0

					const objs = []
					const height = scale(!normalize ? division : division / _commune[normalizingCol])
					const path = []
					path.push([50, 0])
					path.unshift([0, 100])
					path.push([100, 100])

					points = [[50, 0, !normalize ? division : division / _commune[normalizingCol]]]
					renderObj(path, points, height)
					// console.log(path, points, height)
					// if (d)
					// console.log(values)
				}
				
			}
			else {
				const path = [[0, 100], [100, 100]]
				const points = [[50, 100, 0]]
				renderObj(path, points)
			}

			x += !normalize ? Math.round(w) + valley : maxHeight + valley
		})
		d.values = renders
		return d
	})	
}

Mountains.draw = function (_d, _i) {
	const renderData = Mountains.renderRelations(Mountains.rangeRelations(), _d, _i)
	const sel = d3.select(this)
	
	// WORKING HERE
	let label = sel.selectAll('div.label--name')
		.data(d => [d])
	label.exit().remove()
	label = label.enter()
		.append('div')
		.attr('class', 'label--name')
		.html(d => d['Commune_court'])
	.merge(label)
		.style('transform', `translateY(${_d.top}px)`)
	.on('mouseover', function (d) {
		if (!d3.select('.paysage--vis').classed('dragging')) {
			d3.select(this).html(`Masquer: ${d['Commune_court']}`) 
			
			d3.selectAll('div.sommet, div.label--name')
				.classed('semi-transparent', false)
			d3.selectAll('div.commune').filter(c => c['Commune_court'] !== d['Commune_court'])
				.selectAll('div.sommet, div.label--name')
				.classed('semi-transparent', true)

			d3.selectAll('div.commune').filter(c => c['Commune_court'] === d['Commune_court'])
				.selectAll('div.shape')
				.each(Mountains.labels)
		}
	})
	.on('mouseout', function (d) {
		d3.select(this).html(d['Commune_court'])
		d3.selectAll('div.sommet, div.label--name').classed('semi-transparent', false)
		d3.selectAll('div.label--value').remove()
		d3.selectAll('.trend-ref').remove()
	})
	.on('click', function (d) {
		Mountains.data.forEach(c => { if (c['Commune_court'] === d['Commune_court']) c.display = false })
		d3.selectAll('div.sommet, div.label--name').classed('semi-transparent', false)
		d3.select('g.carte--communes').selectAll('path.outline').filter(c => c['commune'] === d['Commune_court'])
			.classed('active', false)
		UI.redraw()
	})

	const relations = Mountains.rangeRelations()
	
	const massif = sel.addElems('div', 'massif', renderData) //, (d, i) => `${d.index}-${d.max}`)
		
	let s_i = 0 // THIS IS AN INCREMENTOR HACK FOR THE div.sommet
	let sommet = massif.selectAll('div.sommet')
		.data(d => d.values, d => `${d.key}-${d.values.map(c => c.path).join('-')}-${'rien'}`) // (c, j) => `${c.key}-${j}`)
	sommet.exit().remove()
	sommet = sommet.enter()
		.append('div')
		.attr('class', 'sommet')
	.merge(sommet)
		.each(function (d) { d3.select(this).classed(`${d.key} ${d.key}-${s_i ++}`, true) })
		.style('width', d => `${isFinite(d.width) ? d.width : 0}px`)
		.style('height', d => `${isFinite(d.height) ? d.height : 0}px`)
		.style('top', d => `${-d.top}px`) // THE 1.25rem ARE EXTRA FOR THE VALUE LABELS
		// .style('top', d => `calc(${-d.top}px - 1.25rem)`) // THE 1.25rem ARE EXTRA FOR THE VALUE LABELS
		.style('left', d => `${d.left}px`)
		.style('transform', d => `translate(${_d.left}px, ${_d.top}px)`)

	let shape = sommet.addElems('div', 'overflow--hidden')
		.style('width', d => `${d.width}px`)
		.style('height', d => `${d.height}px`)
	.selectAll('div.shape')
		// .data(d => d.paths)
		.data(d => [d])
	shape.exit().remove()
	shape = shape.enter()
		.append('div')
		.attr('class', 'shape')
		.on('mouseover', function (d) {
			if (!d3.select('.paysage--vis').classed('dragging')) {
				const sel = d3.select(this)
				const sommet = sel.findAncestor('sommet')
				const commune = sel.findAncestor('commune').node()
				const datum = sommet.datum()
				// const datum = this.parentNode['__data__']

				d3.selectAll('div.sommet')
					.classed('semi-transparent', false)
				.filter(function () { return d3.select(this).findAncestor('commune').node() !== commune })
					.classed('semi-transparent', true)

				d3.selectAll('div.label--name')
					.classed('semi-transparent', false)
				.filter(function () { return d3.select(this).findAncestor('commune').node() !== commune })
					.classed('semi-transparent', true)

				// ADD THE LABEL
				d3.select(this).each(Mountains.labels)
			}
		})
		.on('mouseout', function () {
			d3.selectAll('div.label--value').remove()
			d3.selectAll('.trend-ref').remove()
			d3.selectAll('div.sommet').classed('semi-transparent', false)
			d3.selectAll('div.label--name').classed('semi-transparent', false)
		})
	.merge(shape)
		.style('clip-path', d => `polygon(${d.path.map(c => c.map(b => `${b}%`).join(' ')).join(',')})`)
		.style('-webkit-clip-path', d => `polygon(${d.path.map(c => c.map(b => `${b}%`).join(' ')).join(',')})`)
		.style('-moz-clip-path', d => `polygon(${d.path.map(c => c.map(b => `${b}%`).join(' ')).join(',')})`)
		.style('-o-clip-path', d => `polygon(${d.path.map(c => c.map(b => `${b}%`).join(' ')).join(',')})`)
		.style('-ms-clip-path', d => `polygon(${d.path.map(c => c.map(b => `${b}%`).join(' ')).join(',')})`)
		// .style('transform', (d, i) => `translateY(${shape.size() - i}px)`)
		// .style('z-index', (d, i) => shape.size() - i)

	
	// ADD THE REFERENCES FOR THE ADDITIONS
	let ref_addition = sommet.filter((d, i) => d.key === 'addition' && i > 0) // WE DO NOT WANT THE FIRST ONE AS IT IS THE BACKGROUND (HIGHEST) PEAK
	.selectAll('svg.operation-ref')
		.data(d => [d])
	ref_addition.exit().remove()
	ref_addition = ref_addition.enter()
		.append('svg')
		.attr('class', 'operation-ref')
	.merge(ref_addition)
		.attrs({ 'width': d => isFinite(d.width) ? d.width : 0,
				 'height': d => isFinite(d.height) ? d.height : 0,
				 'viewBox': '0 0 100 100',
				 'preserveAspectRatio': 'none' })
		.style('top', d => '0px')
		// .style('top', d => `${isFinite(d.height) ? -d.height : 0}px`)
	ref_addition.addElems('path', 'line')
		.attr('d', d => `M${d.path.filter((c, j) => j > 0 && j < d.path.length - 1).join(' L')}`)
		.style('stroke-width', d => 2 * 100 / d.height)


	// ADD THE REFERENCES FOR THE DIVISIONS
	let ref_division = sommet.filter(d => d.key === 'division')
	.selectAll('svg.operation-ref')
		.data(d => [d])
	ref_division.exit().remove()
	ref_division = ref_division.enter()
		.append('svg')
		.attr('class', 'operation-ref')
	.merge(ref_division)
		.attrs({ 'width': d => isFinite(d.width) ? d.width : 0,
				 'height': d => isFinite(d.width) ? d.width : 0,
				 'viewBox': '0 0 100 100',
				 'preserveAspectRatio': 'xMinYMid meet' })
		.style('top', d => `${d.height - d.width}px`)
	ref_division.addElems('path', 'line')
		.attr('d', d => `M${d.path.join(' L')}`)
		.style('stroke-width', d => 100 / d.height)


	// IF THIS IS THE TOP CHAIN, DRAW AEXS
	if (_d.z === 0) {
		massif.addElems('div', 'axis')
			.style('height', d => `${d.maxHeight}px`)
			.style('left', d => `${d3.min(d.values, c => c.left)}px`)
			.style('top', d => `${_d.top - d.maxHeight}px`)
			.style('transform', d => `translateX(${_d.left}px)`)
			.each(function (d) {
				const sel = d3.select(this)

				const digits = Math.round(d.max).toString().length
				const power = Math.pow(10, digits)

				const step = axisStep(Math.floor(d.max * 10 / power) / 10) * power / 10 // HERE WE OFFSET WITH Math.floor TO MAKE SURE THE SUM INCREMENT <= d.max
				
				const tickScale = d3.scaleLinear()
					.domain([0, d.max])
					.range([this.clientHeight || this.offsetHeight, 0])

				console.log(d.max, digits, power, step)
				// console.log(d3.range(Math.ceil(d.max / step)).map(c => c * step))

				// sel.addElems('div', 'tick', !normalize ? d3.range(Math.ceil(d.max / step)).map(c => c * step) : [0, 5 * step, 10 * step])
				sel.addElems('div', 'tick', !normalize ? d3.range(Math.ceil(d.max / step)).map(c => c * step) : [0, Math.floor(d.max * 10) / 10])
					.style('transform', function (c) { 
						return `translateY(${tickScale(c) - (this.clientHeight || this.offsetHeight) - 1}px)` 
					})
					.html(c => printNumber(Math.round(c * 100) / 100))
			})
		.addElems('div', 'axis--label')
			.html(d => d.index)
		
	}
	else massif.selectAll('div.axis').remove()
}





// THIS IS STILL USED FOR ORDERING THE CHAINS VERTICALLY
// // BUT IT MIGHT BE WORTH REMOVING THIS
// Mountains.height = (_d, _path) => { // THIS CAN PROBABLY BE REMOVED SINCE WE ARE NOT SUMMING UP THINGS IN HIGHER HIERARCHIES
// 	let value = 0
// 	for (let key in _d) {
// 		if (key.indexOf(_path) !== -1) value += +_d[key]
// 	}
// 	return value
// }



Mountains.labels = function (d, i) {
	const sel = d3.select(this)
	const sommet = sel.findAncestor('sommet')
	// const sommet = d3.select(this.parentNode)
	const massif = sel.findAncestor('massif')
	const commune = sel.findAncestor('commune')
	const _d = commune.datum()
	const datum = sommet.datum()
	
	massif.insertElems(`div.${sommet.node().className.replace(/\s/g, '.')}`, 'div', `label--value label--${i}`, d.points)
		.style('transform', (c, j) => {
			if (d.height > 100) return `translate(${Math.floor((!normalize ? _d.originleft : _d.left) + datum.left + datum.width * c[0] / 100)}px, calc(${Math.round(_d.top - datum.top * (100 - c[1]) / 100)}px - ${1.25 * 2}rem))`
			else return `translate(${Math.floor((!normalize ? _d.originleft : _d.left) + datum.left + datum.width * c[0] / 100)}px, calc(${Math.round(_d.top - datum.top)}px - ${1.25 * (j % 2 ? 1 : 2)}rem))`
		})
		.html(c => printNumber(Math.round(c[2] * 100) / 100))
	.each(function (c, j) {
		d3.select(this).addElems('div', 'label--connector')
			.style('height', _ => {
				if (d.height > 100) return `calc(${1.25 * 2}rem + ${Math.floor(datum.top * (100 - c[1]) / 100)}px)`
				return `calc(${(j % 2 ? 1 : 2) * 1.25}rem + ${datum.top}px)`
			})
	})

	// IF THE PEAK IS A SERIES, THEN ADD THE TREND scaleLinear
	if (d.key === 'series') {
		if (d.height > 50) {
			const padding = 10
			const trend = sommet.addElems('svg', 'trend-ref')
				.attrs({ 'width': c => isFinite(c.width) ? c.width : 0,
						 'height': c => `${(isFinite(c.height) ? c.height : 0) + padding}`,
						 'viewBox': '0 0 100 100',
						 'preserveAspectRatio': 'none' })
				.style('top', d => `${-padding}px`)
			const defs = trend.addElems('defs')
			const arrowhead = defs.addElems('marker')
				.attrs({ 'id': 'arrowhead',
						 'viewBox': '0 0 10 10',
						 'refX': 5,
						 'refY': 5, 
						 'markerUnits': 'strokeWidth',
						 'markerWidth': 5,
						 'markerHeight': 10,
						 'orient': 'auto'
				})
				.addElems('path')
					.attr('d', 'M2,2 L5,5 L2,8')
					.style('stroke-width', 2)

			trend.addElems('path', 'trend')
				.attrs({ 'd': c =>  `M${c.points.sort((a, b) => a[3] - b[3]).map(b => [b[0], isFinite(b[1] + padding * 100 / c.height) ? b[1] + padding * 100 / c.height : 0]).join(' L')}`,
						 'marker-end': 'url(#arrowhead)'}) // NEED TO Y OFFSET
				.style('stroke-width', c => 100 * 2 / c.height)
		}
		sommet.addElems('div', 'trend--value trend-ref')
			.html(c => {
				const values = c.values.map(b => b).sort((a, b) => +a.key - +b.key)
				const years = Math.abs(+values[values.length - 1].key - +values[0].key)
				const vi = _d[values[0].path]
				const vf = _d[values[values.length - 1].path]
				const evol = Mountains.calculateAnnualRate(vi, vf, years) || 0
				return `${evol >= 0 ? '+' : '-'} ${Math.abs(Math.round(evol * 1000) / 10).toString().replace(/\./g, ',')} %`
			})
	}
}

