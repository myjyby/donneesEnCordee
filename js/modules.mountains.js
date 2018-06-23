if (!Montagnes) { var Montagnes = {} }
Montagnes.scale = d3.scaleLinear()
Montagnes.axisScale = d3.scaleLinear()
Montagnes.position = d3.scaleBand()
	.rangeRound([width() * .25, width() - width() * .25])
	.padding(.1)
Montagnes.chaine = []
Montagnes.drag = d3.drag()
	.on('start', () => {
		d3.select('svg').classed('dragging', true)
		d3.selectAll('line.axis--link').remove()
		d3.selectAll('.label').remove()
	})
	.on('drag', function (d) {
		const evt = d3.event
		d3.select(this).attr('transform', `translate(${[d.x += evt.dx, d.y]})`)
	})
	.on('end', () => d3.select('svg').classed('dragging', false))
Montagnes.init = _data => {
	const data = _data ? Montagnes.data(_data) : d3.selectAll('g.chaine').data()

	const indicateurs = Montagnes.chaine //d3.select('ul.menu-list').selectAll('li.selected').data()
	data.sort((a, b) => 
		d3.sum(indicateurs.map(c => Montagnes.height(b, c.path))) - d3.sum(indicateurs.map(c => Montagnes.height(a, c.path)))
	)

	const sums = data.map(d => d3.max(indicateurs.map(c => Montagnes.height(d, c.path))))

	Montagnes.scale
		.domain([0, d3.max(sums)])
		.range([0, horizon - horizon * .33]) // CHANGE THIS FOR MOUNT HEIGHT
	Montagnes.axisScale
		.domain([d3.max(sums), 0])
		.range([0, horizon - horizon * .33])

	const greyscale = d3.scaleLinear()
		.domain([0, data.length])
		// .range(['#333', 'steelblue'])
		.range(['#344758', '#CED5E4'])

	if (!Montagnes.position.domain().length) {
		Montagnes.position
			.domain(data.map(d => d['Commune']).shuffle())
	}

	const svg = d3.select('svg')
	const montagnes = svg.select('g.montagnes')
	const echelle = svg.select('g.axis--y')

	const chaines = montagnes.selectAll('g.chaine')
		.data(data)
	chaines.exit().remove()
	const chainesEnter = chaines.enter()
		.append('g')
		.attrs({
			'class': 'chaine',
			'transform': (d, i) => `translate(${[d.x = Montagnes.position(d['Commune']), d.y = horizon + i * maxHeight / 5]})`
		})
		.on('mouseover', function (d) {
			const svg = d3.select('svg')
			if (svg.classed('dragging')) return null

			const node = this
			const sel = d3.select(this)

			if (Math.round(d.y) === Math.round(horizon)) {
				chainesEnter.filter(function () { return this !== node })
					.transition()
					.duration(150)
					.style('opacity', .25)
					
				sel.style('fill', '#344758')
			}
		})
		.on('mouseout', function (d, i) {
			const sel = d3.select(this)

			chainesEnter
				.transition()
				.duration(150)
				.style('opacity', 1)
				
			sel.style('fill', greyscale(i))
		})
	.call(Montagnes.drag)
	.merge(chaines)
	chainesEnter.moveToFront()
		.each(Montagnes.draw)
	.transition()
		.attr('transform', (d, i) => `translate(${[d.x = Montagnes.position(d['Commune']), d.y = horizon + i * maxHeight / 5]})`)
		.style('fill', (d, i) => greyscale(i))

	// echelle.attr('transform', `translate(${[d3.min(data, d => Montagnes.position(d['Commune'])), horizon - d3.max(Montagnes.scale.range()) - 1]})`)
	

	echelle.attr('transform', `translate(${[d3.min(Montagnes.position.range()), horizon - d3.max(Montagnes.scale.range()) - 1]})`)
	.transition()
		.call(d3.axisLeft(Montagnes.axisScale))
}
Montagnes.data = _data => {
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
Montagnes.paths = _commune => { // WE STILL HAVE A SORTING PROBLEM HERE
	const indicateurs = Montagnes.chaine

	const obj = {}
	obj.paths = []
	obj.x = 0
	let path = {}
	path.enter = []
	path.transition = []
	path.peaks = []

	indicateurs.forEach((d1, i) => {

		let v1 = 0
		if (d1.type === 'sum') v1 = d3.sum(d1.sources.map(d => Montagnes.height(_commune, d.path)))
		else v1 = Montagnes.height(_commune, d1.path)
		const p1 = Montagnes.scale(v1)

		if (i === 0) {
			path.enter.push([`M${[obj.x, 0]}`])
			path.transition.push([`M${[obj.x, 0]}`])

			obj.x += p1 / 2
			path.enter.push(`L${[obj.x, 0]}`)
			path.transition.push(`L${[obj.x, -p1]}`)
			path.peaks.push({ point: [obj.x, -p1], value: v1 })
		} 
		else {
			const d0 = indicateurs[i - 1]
			// HERE p STANDS FOR *point* (1D VALUE FOR THE HEIGHT OF THE PEAK)
			const p0 = Montagnes.scale(Montagnes.height(_commune, d0.path))

			// HERE h STANDS FOR *hierarchy*
			const h0 = d0.path.split('_')
			const h1 = d1.path.split('_')
			// HERE h*p STANDS FOR *hierarchy OF THE PARENT*
			const h0p = h0.slice(0)
			h0p.pop()
			const h1p = h1.slice(0)
			h1p.pop()

			// 01 - IF THE INDICATOR *IS NOT* A SIBLING OF THE PREVIOUS ONE
			if (h0p.join('_') !== h1p.join('_')) {
				// IT IS A *DISCRETE* RELATIONSHIP (NO RELATIONSHIP) BY DEFAULT
				
				// 01.a - CLOSE OFF THE PREVIOUS PATH p0
				obj.x += p0 / 2
				path.enter.push(`L${[obj.x, 0]} Z`)
				path.transition.push(`L${[obj.x, 0]} Z`)
				
				obj.paths.push(path)
				
				// 01.b - BEGIN A NEW ONE WITH THIS p1
				path = {}
				path.enter = [`M${[obj.x, 0]}`]
				path.transition = [`M${[obj.x, 0]}`]
				path.peaks = []
				
				obj.x += p1 / 2
				path.enter.push(`L${[obj.x, 0]}`)
				path.transition.push(`L${[obj.x, -p1]}`)
				path.peaks.push({ point: [obj.x, -p1], value: v1 })
			}
			// 02 - IF THE INDICATOR *IS* A SIBLING OF THE PREVIOUS ONE				
			else {
				// IT IS EITHER A *SERIES* OR AN *ORDINAL* RELATIONSHIP

				// 02.a - IF THERE IS A YEAR IN THE HIERARCHY AND THE SIBLING INDICATORS HAVE A *TEMPORAL* (YEAR) CONNECTION
				if (Heuristics.hasYear(h1) !== -1 && Heuristics.hasYear(h0) === Heuristics.hasYear(h1)) {

					// 02.a.i - IF THE YEAR IS THE LAST LEAF OF THE HIERARCHY TREE (e.g., APA_domicile_Annee_2016),
					// OR IF THERE IS A YEAR IN THE HIERARCHY TREE, BUT IT IS NOT THE LAST LEAF, AND THE LAST LEAF OF THE SIBLING INDICATORS IS THE SAME (e.g. Demographie_2013_Age_60-79 AND Demographie_2008_Age_60-79)
					if (Heuristics.hasYear(h1) === h1.length - 1 || h0.last() === h1.last()) {
						// IT IS A *SERIES* RELATIONSHIP
						obj.x += p0 / 2 + p1 / 2
						path.enter.push(`L${[obj.x, 0]}`)
						path.transition.push(`L${[obj.x, -p1]}`)
						path.peaks.push({ point: [obj.x, -p1], value: v1 })
					}
					// 02.a.ii - IF THE SIBLING INDICATORS HAVE THE SAME YEAR IN THEIR HIERARCHY
					else if (h0[Heuristics.hasYear(h0)] === h1[Heuristics.hasYear(h1)]) {
						// IT IS AN *ORDINAL* RELATIONSHIP

						obj.x += d3.min([p0, p1]) / 2
						path.enter.push(`L${[obj.x, 0]}`)
						path.transition.push(`L${[obj.x, -d3.min([p0, p1]) / 2]}`)
						
						obj.x += p1 / 2
						path.enter.push(`L${[obj.x, 0]}`)
						path.transition.push(`L${[obj.x, -p1]}`)
						path.peaks.push({ point: [obj.x, -p1], value: v1 })
					}
				}
				// 02.b - IF THERE IS NO YEAR IN THE HIERARCHY
				else {
					// IT IS AN *ORDINAL* RELATIONSHIP

					obj.x += d3.min([p0, p1]) / 2
					path.enter.push(`L${[obj.x, 0]}`)
					path.transition.push(`L${[obj.x, -d3.min([p0, p1]) / 2]}`)
					
					obj.x += p1 / 2
					path.enter.push(`L${[obj.x, 0]}`)
					path.transition.push(`L${[obj.x, -p1]}`)
					path.peaks.push({ point: [obj.x, -p1], value: v1 })
				}

			}
		}
		// THIS CLOSES OFF THE PATH
		if (i === indicateurs.length - 1) {
			obj.x += p1 / 2
			path.enter.push(`L${[obj.x, 0]} Z`)
			path.transition.push(`L${[obj.x, 0]} Z`)
			
			obj.paths.push(path)
		}
	})
	// console.log(obj)
	return obj
}
Montagnes.draw = function (_d, _i) {
	const sel = d3.select(this)
	const svg = d3.select('svg')
	
	// WORKING HERE
	const paths = Montagnes.paths(_d)

	const monts = sel.addElems('g', 'monts', [paths])
	monts.transition()
		.attr('transform', (d, i) => `translate(${[-d.x / 2, 0]})`)
		
	const pics = monts.selectAll('path.pic')
		.data(d => d.paths)
	pics.exit()
		.transition()
		.attrs({
			'd': c => c.enter.join(' ')
		})
	.on('end', function () { d3.select(this).remove() })
	const picsEnter = pics.enter()
		.append('path')
		.attrs({
			'class': 'pic',
			'd': c => c.enter.join(' ')
		})
		.on('mouseover', function (d) {
			if (svg.classed('dragging')) return null
			const peakBBox = this.getBoundingClientRect()

			monts.addElems('line', 'axis--link', d.peaks)
				.attrs({
					'x1': c => c.point[0],
					'x2': c => c.point[0],
					'y1': 0,
					'y2': c => c.point[1] - 16
				})
			const labels = monts.addElems('g', 'label', d.peaks)
				.attr('transform', c => `translate(${[c.point[0], c.point[1] - (16 + 8)]})`)
			labels.addElems('text', 'label--value')
				.attrs({
					'text-anchor': 'start',
					'x': 10,
					'dy': '.07em'
				})
				.text(c => printNumber(c.value))
			labels.insertElems('text.label--value', 'rect', 'label--box')
				.attrs({
					'x': function (c) {
						// const bbox = d3.select(this.parentNode).select('text.label--value').node().getBBox()
						// return -(bbox.width / 2 + 10)
						return 0
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
		})
		.on('mouseout', () => {
			d3.selectAll('line.axis--link').remove()
			d3.selectAll('.label').remove()
		})
		.on('dblclick', function (d) {
			console.log(d)
		})
	.merge(pics)
	picsEnter.transition()
		// .duration(500)
		.attrs({
			'd': c => c.transition.join(' ')
		})

	monts.addElems('line', 'basis')
		.attrs({
			'x1': c => -c.x / 5,
			'x2': c => c.x * 6 / 5,
			'y1': 0,
			'y2': 0
		})
	const nameLabel = monts.addElems('g', 'namelabel')
		// .attr('transform', d => `translate(${[0, ]})`)
	nameLabel.addElems('text', 'label--value')
		.attrs({
			'text-anchor': 'start',
			'x': 10
		})
		.text(_d['Commune_court'])
	nameLabel.attr('transform', d => {
		const bbox = d3.select(this).select('text.label--value').node().getBBox()
		return `translate(${[-d.x / 5, bbox.height]})`
	})
	nameLabel.insertElems('text.label--value', 'rect', 'label--box')
		.attrs({
			'x': 0,
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

}
Montagnes.height = (_d, _path) => {
	if (debug) {
		const obj = {}
		for (let key in _d)
			if (key.indexOf(_path) !== -1) obj[key] = _d[key]
	}

	let value = 0
	for (let key in _d) {
		if (key.indexOf(_path) !== -1) value += +_d[key]
	}
	return value
}