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
// Mountains.horizon = UI.height - UI.height * .6

// Mountains.position = d3.scaleBand()
// 	.rangeRound([UI.width * .25, UI.width - UI.width * .25])
// 	.padding(.1)

Mountains.rangeValues = []

Mountains.colors = d3.scaleLinear()
	.domain([0, Mountains.data.length])
	.range(['#344758', '#CED5E4'])

Mountains.drag = d3.drag()
	.on('start', d => {
		if (!normalize) {
			// svg.selectAll('line.axis--link').remove()
			d3.selectAll('div.label--value').remove()
			d3.selectAll('div.sommet, div.axis').classed('transition--none', true)
			d3.select('.paysage--vis').classed('dragging', true)
		}
	})
	.on('drag', function (d) {
		if (!normalize) {
			const evt = d3.event
			d.originleft += evt.dx

			d3.select(this).selectAll('div.sommet').style('transform', c => `translate(${d.originleft}px, ${d.top}px)`)
			d3.select(this).selectAll('div.axis').style('transform', c => `translateX(${d.originleft}px)`)
			// d3.select(this).selectAll('div.axis').style('transform', c => `translate(${d.originleft + c.axisLeft}px, ${d.top - c.maxHeight}px)`)
			
			// d3.select(this).style('transform', `translateX(${d.x}px)`)
			// d3.select(this).style('left', `${d.x}px`)
			
			// .attr('transform', `translate(${[d.x += evt.dx, d.y]})`)
		}
	})
	.on('end', _ => {
		if (!normalize) {
			d3.selectAll('div.sommet, div.axis').classed('transition--none', false)
			d3.select('.paysage--vis').classed('dragging', false)
		}
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

	// if (!Mountains.position.domain().length) {
	// 	Mountains.position.domain(Mountains.data.map(d => d['Commune']).shuffle())
	// }



	const paysage = d3.select('div.paysage--vis')
		.call(UI.drag)
	const baseHeight = paysage.node().clientHeight || paysage.node().offsetHeight

	if (!test) {
		Mountains.horizon = baseHeight * Mountains[normalize ? 'normHorizonP' : 'horizonP'] / 100
		Mountains.coverage = baseHeight * Mountains[normalize ? 'normCoverageP' : 'coverageP'] / 100
	}
	else {
		Mountains.horizon = baseHeight * Mountains['horizonP'] / 100
		Mountains.coverage = baseHeight * Mountains['coverageP'] / 100
	}

	

	// const baseHeight = paysage.node().clientHeight || paysage.node().offsetHeight
	// const maxHeight = !normalize ? Math.round(Mountains.horizon * .75) : baseHeight / Mountains.data.length


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
			// if (normalize) {
				!normalize ? d.originleft ? d.left = d.originleft : d.originleft = d.left = Math.round((Math.random() * .5) * (this.clientWidth || this.offsetWidth)) : d.left = 0
				// console.log(d.left)
			// }
			d.origin = d.top = Math.round(baseHeight * (Mountains[normalize ? 'normHorizonP' : 'horizonP'] / 100) + i * baseHeight * (Mountains[normalize ? 'normCoverageP' : 'coverageP'] / 100) / Mountains.data.filter(d => d.display).length)
		})
		.style('z-index', (d, i) => d.z = i)
		.each(Mountains.draw)
		.call(Mountains.drag)

	// console.log(commune.nodes().length)
	// console.log(Mountains.data.map(d => d.display))
}

Mountains.rangeRelations = _ => {
	const indicators = d3.select('div.menu--indicators').datum()
	const chaines = []

	Mountains.rangeValues.forEach((d1, i) => {
		if (d1.type === 'value') {
			const indexEchelle = indicators.filter(c => c['Structure'] === d1.path)[0]['Index_Echelle']
			// console.log(indexEchelle)
			
			// JUMP TO
			// PROBABLY CHANGE THIS TO d3.selection OF THE DISPLAYED chaines
			const max_y = d3.max(Mountains.data.filter(d => d.display).map(c => !normalize ? c[d1.path] : c[d1.path] / c[normalizingCol]))
			// console.log(max_y)

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
						// console.log('here')
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
							if (indexEchelle === chaines[chaines.length - 1].index) {
								chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].key = 'series'
								chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].values.push(d1)
								chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
							}
							else {
								chaines.push({ index: indexEchelle, max: max_y, values: [{ key: 'discrete', values: [d1] }] })
							}
						}
						// 03.a.ii - IF THE SIBLING INDICATORS HAVE THE SAME YEAR IN THEIR HIERARCHY
						// IT IS AN *ORDINAL* RELATIONSHIP
						else if (h0[Heuristics.hasYear(h0)] === h1[Heuristics.hasYear(h1)]) {
							if (indexEchelle === chaines[chaines.length - 1].index) {
								chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].key = 'ordinal'
								chaines[chaines.length - 1].values[chaines[chaines.length - 1].values.length - 1].values.push(d1)
								chaines[chaines.length - 1].max = d3.max([chaines[chaines.length - 1].max, max_y])
							}
							else {
								chaines.push({ index: indexEchelle, max: max_y, values: [{ key: 'discrete', values: [d1] }] })
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
						}
						else {
							chaines.push({ index: indexEchelle, max: max_y, values: [{ key: 'discrete', values: [d1] }] })
						}
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

Mountains.renderRelations = (_relations, _commune, _i) => {
	const paysage = d3.select('div.paysage--vis')
	const baseHeight = paysage.node().clientHeight || paysage.node().offsetHeight
	const maxHeight = !normalize ? Math.round(Mountains.horizon * .75) : Math.round(baseHeight * (Mountains['normCoverageP'] / 100) / Mountains.data.filter(d => d.display).length) * .75
	// const maxHeight = !normalize ? Math.round(Mountains.horizon * .75) : baseHeight / Mountains.data.length
	
	// NEED TO FACTOR IN normalizingCol FOR NORMALIZED VIEW
	// const normalizingValue = normalize ? d3.max(Mountains.data, d => d['Enfance_Population']) : 1

	const scale = d3.scaleLinear()
		.range([0, maxHeight])

	const psw = d3.scaleLinear() // psw = PATH SCALE WIDTH
		.range([0, 100])
	const psh = d3.scaleLinear() // psh = PATH SCALE HEIGHT
		.range([100, 0])

	const valley = 50 // THIS IS THE DISTANCE BETWEEN TWO CONSECUTIVE MOUNTAINS
	let x = !normalize ? 0 : maxHeight // IF THE VIEW IS NORMALIZED, THEN OFFSET THE FIRST PEAK SO THAT THE AXIS IS NOT CLUTTERED WITH THE TITLE
	let y = 0

	return _relations.map(d => {
		scale.domain([0, d.max])

		d.left = x
		d.maxHeight = maxHeight
		// y = _commune.top

		d.values = d.values.map(c => {
			// CALCULATE WIDTH AND HEIGHT
			const widths = c.values.map(b => scale(!normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol]))
			let w = h = 0

			if (c.key === 'discrete') { 
				w = d3.max(widths)
				// w = h = d3.max(widths)
			}
			else if (c.key === 'series') {
				w = d3.max(widths) * (c.values.length * .75)
				// h = d3.max(widths)
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
				// h = d3.max(widths)
			}
			h = d3.max(widths)

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
			psh.domain([0, d3.max(c.values, b => !normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol])]) // THIS SHOULD BE ON THE LOCAL MAX, NOT THE TOTAL MAX

			const values = c.values.map(b => [psw(!normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol]), psh(!normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol]), !normalize ? _commune[b.path] : _commune[b.path] / _commune[normalizingCol]]) // THE LAST VALUE IS THE ACTUAL VALUE
			let poly = []
			let points = []

			if (d3.sum(values, b => b[0])) {
				if (['discrete', 'series'].indexOf(c.key) !== -1) {
					poly = values.map((b, k) => [(k + .5) * 100 / values.length, b[1]])
					// poly = values.map((b, k) => [`${(k + .5) * 100 / values.length}% ${b[1]}%`])
					// c.values.forEach((b, k) => {
					// 	b.peak = (k + .5) * 100 / values.length
					// })
					points = values.map((b, k) => [(k + .5) * 100 / values.length, b[1], b[2]])
				}
				else if (c.key === 'ordinal') {
					let px = 0
					values.forEach((b, k) => {
						current = b[0]
						if (k === 0) {
							poly.push([px += b[0] * .5, b[1]])
							// poly.push([`${px += b[0] * .5}% ${b[1]}%`])
							// c.values[k].peak = px
							points.push([px, b[1], b[2]])
						}
						else {
							const prev = values[k - 1]
							
							if ((100 - prev[1]) < (100 - b[1])) {
								poly.push([px += prev[0] * .25, 100 - (100 - prev[1]) * .5])
								// poly.push([`${px += prev[0] * .25}% ${100 - (100 - prev[1]) * .5}%`])
								poly.push([px += b[0] * .5 - prev[0] * .25, b[1]])
								// poly.push([`${px += b[0] * .5 - prev[0] * .25}% ${b[1]}%`])
								// c.values[k].peak = px
								points.push([px, b[1], b[2]])
							}
							else {
								poly.push([px += prev[0] * .5 - b[0] * .25, 100 - (100 - b[1]) * .5])
								// poly.push([`${px += prev[0] * .5 - b[0] * .25}% ${100 - (100 - b[1]) * .5}%`])
								poly.push([px += b[0] * .25, b[1]])
								// poly.push([`${px += b[0] * .25}% ${b[1]}%`])
								// c.values[k].peak = px
								points.push([px, b[1], b[2]])
							}
						}
					})
				}
				poly.unshift([0, 100])
				// poly.unshift(['0% 100%'])
				poly.push([100, 100])
				// poly.push(['100% 100%'])
			}
			else poly = [[0, 100], [100, 100]]
			// else poly = [['0% 100%'], ['100% 100%']]

			// ADD THE NEW ATTRIBUTES TO THE RETURNED OBJECT
			c.width = Math.round(w) || 0
			c.height = Math.round(h) || 0
			c.left = !normalize ? x : x + (maxHeight - Math.round(w)) / 2 || 0 // IF THE VIEW IS NORMALIZED, THEN CENTER THE PEAK
			c.top = Math.round(h) || 0
			// console.log(c.height, c.top, maxHeight)
			// c.top = y - Math.round(h)
			c.path = poly
			c.points = points

			x += !normalize ? Math.round(w) + valley : maxHeight + valley

			return c
		})
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
		d3.select(this).html(`Masquer: ${d['Commune_court']}`) 
		
		d3.selectAll('div.sommet, div.label--name')
			.classed('semi-transparent', false)
		d3.selectAll('div.commune').filter(c => c['Commune_court'] !== d['Commune_court'])
			.selectAll('div.sommet, div.label--name')
			.classed('semi-transparent', true)

		d3.selectAll('div.commune').filter(c => c['Commune_court'] === d['Commune_court'])
			.selectAll('div.shape')
			.each(Mountains.labels)
	})
	.on('mouseout', function (d) {
		d3.select(this).html(d['Commune_court'])
		d3.selectAll('div.sommet, div.label--name').classed('semi-transparent', false)
		d3.selectAll('div.label--value').remove()
	})
	.on('click', function (d) {
		Mountains.data.forEach(c => { if (c['Commune_court'] === d['Commune_court']) c.display = false })
		// d3.selectAll('div.sommet, div.label--name').classed('semi-transparent', false)
		d3.select('g.carte--communes').selectAll('path.outline').filter(c => c['commune'] === d['Commune_court'])
			.classed('active', false)
		UI.redraw()
	})

	const relations = Mountains.rangeRelations()
	
	const massif = sel.addElems('div', 'massif', renderData) //, (d, i) => `${d.index}-${d.max}`)
		
	let sommet = massif.selectAll('div.sommet')
		.data(d => d.values, d => d.values.map(c => c.path).join('-')) // (c, j) => `${c.key}-${j}`)
	sommet.exit().remove()
	sommet = sommet.enter()
		.append('div')
		.attr('class', function (d) { return `sommet ${d.key}` })
	.merge(sommet)
		.style('width', d => `${d.width}px`)
		.style('height', d => `${d.height}px`)
		.style('top', d => `${-d.top}px`) // THE 1.25rem ARE EXTRA FOR THE VALUE LABELS
		// .style('top', d => `calc(${-d.top}px - 1.25rem)`) // THE 1.25rem ARE EXTRA FOR THE VALUE LABELS
		.style('left', d => `${d.left}px`)
		.style('transform', d => `translate(${_d.left}px, ${_d.top}px)`)

	let shape = sommet.selectAll('div.shape')
		.data(d => [d])
	shape.exit().remove()
	shape = shape.enter()
		.append('div')
		.attr('class', 'shape')
		.on('mouseover', function (d) {
			if (!d3.select('.paysage--vis').classed('dragging')) {
				const commune = this.parentNode.parentNode.parentNode
				const datum = this.parentNode['__data__']

				d3.selectAll('div.sommet')
					.classed('semi-transparent', false)
				.filter(function () { return this.parentNode.parentNode !== commune })
					.classed('semi-transparent', true)

				d3.selectAll('div.label--name')
					.classed('semi-transparent', false)
				.filter(function () { return this.parentNode !== commune })
					.classed('semi-transparent', true)

				// ADD THE LABEL WITH THE VALUE FOR THE PEAK
				// MOVE OUT TO EXTERNAL FUNCTION
				// d3.select(commune).insertElems('div.massif', 'div', 'label--value', d.points)
				// 	.style('transform', (c, j) => {
				// 		if (d.height > 100) return `translate(${Math.floor((!normalize ? _d.originleft : _d.left) + datum.left + datum.width * c[0] / 100)}px, calc(${Math.round(_d.top - datum.top * (100 - c[1]) / 100)}px - ${1.25 * 2}rem))`
				// 		else return `translate(${Math.floor((!normalize ? _d.originleft : _d.left) + datum.left + datum.width * c[0] / 100)}px, calc(${Math.round(_d.top - datum.top)}px - ${1.25 * (j % 2 ? 1 : 2)}rem))`
				// 	})
				// 	.html(c => printNumber(Math.round(c[2] * 100) / 100))
				// .each(function (c, j) {
				// 	d3.select(this).addElems('div', 'label--connector')
				// 		.style('height', _ => {
				// 			if (d.height > 100) return `calc(${1.25 * 2}rem + ${Math.floor(datum.top * (100 - c[1]) / 100)}px)`
				// 			return `calc(${(j % 2 ? 1 : 2) * 1.25}rem + ${datum.top}px)`
				// 		})
				// })
				d3.select(this).each(Mountains.labels)
			}
		})
		.on('mouseout', function () {
			d3.selectAll('div.label--value').remove()
			d3.selectAll('div.sommet').classed('semi-transparent', false)
			d3.selectAll('div.label--name').classed('semi-transparent', false)
		})
	.merge(shape)
		.style('clip-path', d => `polygon(${d.path.map(c => c.map(b => `${b}%`).join(' ')).join(',')})`)
		.style('-webkit-clip-path', d => `polygon(${d.path.map(c => c.map(b => `${b}%`).join(' ')).join(',')})`)
		.style('-moz-clip-path', d => `polygon(${d.path.map(c => c.map(b => `${b}%`).join(' ')).join(',')})`)
		.style('-o-clip-path', d => `polygon(${d.path.map(c => c.map(b => `${b}%`).join(' ')).join(',')})`)
		.style('-ms-clip-path', d => `polygon(${d.path.map(c => c.map(b => `${b}%`).join(' ')).join(',')})`)


	// const gradient = sommet.addElems('span', 'gradient')
	// let gradient = sommet.selectAll('span.gradient')
	// 	.data(d => [d])
	// gradient.exit().remove()
	// gradient = gradient.enter()
	// 	.append('span')
	// 	.attr('class', 'gradient')
	// 	.style('height', function (d) {
	// 		let height = 0
	// 		if (!test) height = !normalize ? Math.round(Mountains.horizon * .75) : Mountains.coverage / Mountains.data.length
	// 		else height = Math.round(Mountains.horizon * .75)

	// 		const scale = d3.scaleLinear()
	// 			.domain([0, this.parentNode.parentNode['__data__'].max])
	// 			.range([0, height])

	// 		return `${d3.max(d.values, c => scale(_d[c.path]))}px`
	// 	})
	// .on('mouseover', function (d) {
	// 	const massif = d3.select(this.parentNode.parentNode)
	// 	massif.addElems('div', 'tooltip', d.values)
	// 		.style('transform', c => `translateX(${c.peak / 100 * (this.clientWidth || this.offsetWidth)}px)`)
	// 		// .style('left', c => `${c.peak / 100 * (this.clientWidth || this.offsetWidth)}px`)
	// 		.style('bottom', c => {
	// 			// THIS IS A SIMPLE ADAPTATION OF THE CALCULATIONS FOR THE clip-path
	// 			hScale = d3.scaleLinear()
	// 				.domain([0, this.parentNode.parentNode['__data__'].max])
	// 				.range([0, 100])

	// 			return `${hScale(_d[c.path]) / 100 * (this.parentNode.clientHeight || this.parentNode.offsetHeight)}px`
	// 		})
	// 		.html(c => printNumber(_d[c.path]))
	// })
	// .on('mouseout', _ => {
	// 	d3.selectAll('div.massif').selectAll('div.tooltip').remove()
	// })
	// .merge(gradient)








	if (_d.z === 0) {
		massif.addElems('div', 'axis')
			.style('height', d => `${d.maxHeight}px`)
			// .style('height', d => `${d3.max(d.values, c => c.height)}px`)
			.style('left', d => `${d3.min(d.values, c => c.left)}px`)
			.style('top', d => `${_d.top - d.maxHeight}px`)
			.style('transform', d => `translateX(${_d.left}px)`)
			.each(function (d) {
				const sel = d3.select(this)

				const digits = d.max.toString().length
				const power = Math.pow(10, digits)

				// console.log(Math.floor(d.max * 10 / power) / 10 * power)
				const step = axisStep(Math.floor(d.max * 10 / power) / 10) * power / 10 // HERE WE OFFSET WITH Math.floor TO MAKE SURE THE SUM INCREMENT <= d.max
				
				const tickScale = d3.scaleLinear()
					.domain([0, d.max])
					.range([this.clientHeight || this.offsetHeight, 0])

				sel.addElems('div', 'tick', !normalize ? d3.range(Math.ceil(d.max / step)).map(c => c * step) : [0, 5 * step, 10 * step])
					.style('transform', function (c) { 
						return `translateY(${tickScale(c) - (this.clientHeight || this.offsetHeight) - 1}px)` 
					})
					.html(c => printNumber(c))
			})
		.addElems('div', 'axis--label')
			.html(d => d.index)
		
	}
	else massif.selectAll('div.axis').remove()
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



/*Mountains.rates = _sel => {
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
}*/
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

Mountains.labels = function (d, i) {
	// if (!d3.select('div.paysage--vis').classed('dragging')) {
		const sel = d3.select(this)
		const commune = sel.findAncestor('commune')
		const _d = commune.datum()
		const datum = sel.node().parentNode['__data__']
		
		commune.insertElems('div.massif', 'div', `label--value label--${i}`, d.points)
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
	// }
}

/*Mountains.placeLabels = _sel => {
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
}*/