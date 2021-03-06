if (!Menu) { var Menu = {} }
Menu.init = function (_data) {
	const body = d3.select('div.menu--vis')

	const title = body.addElem('div', 'title')
		
	// title.addElem('h1', 'title-block').html('Données&mdash;en&mdash;cordée').fitText()
	// title.addElems('p', 'instruction')
	// 	.html('Le paysage actuel est généré aléatoirement. Vous pouvez filtrer les territoires qui vous intéressent en sélectionnant ou désélectionnant les zones de la carte ci-dessus. Puis, affichez les indicateurs de votre choix parmi ceux proposés dans les listes déroulantes ci-dessous. Les indicateurs sélectionnés s’affichent sous forme de cercles dans l’ordre de sélection sur la barre en bas de l’écran. Vous pouvez les combiner, les réordonner et les supprimer en manipulant (glisser/déplacer) les cercles qui les représentent.')
		// .html('Le paysage actuel est généré aléatoirement. Sélectionnez un ou plusieurs indicateurs dans les listes déroulantes ci-dessous pour peindre un nouveau paysage social.')
	// title.addElem('h3', 'title-block').html('Un paysage social du département de l’Isère').fitText()
	title.addElems('h1')
		.html('Les indicateurs')

	const hierarchie = Menu.data(_data)


	// THIS SETS UP AN INITIAL SET OF MOUNTAINS
	const hierarchieflat = hierarchie.map(function (d) {
		if (d.values) {
			return d.values.map(function (c) {
				if (c.values) {
					return c.values.map(function (b) {
						if (b.values) {
							return b.values.map(function (a) {
								if (a.values) {
									return a.values.map(function (z) {
										if (z.values) return z.values
										else return z
									}).flatten()
								}
								else return a
							}).flatten()
						}
						else return b
					}).flatten()
				}
				else return c
			}).flatten()
		}
		else return d
	}).flatten()

	const rand = Math.round(Math.random() * 10)
	const randRange = d3.range(Math.max(2, rand))
	randRange.forEach(function (d) {
		const randId = Math.round(Math.random() * d)
		const deepcopy = JSON.parse(JSON.stringify(hierarchieflat[randId]))
		hierarchieflat.splice(randId, 1)
		deepcopy.type = 'value'
		Mountains.rangeValues.push(deepcopy)
	})

	
	const menu = body.addElems('div', 'menu--indicators', [_data])
	menu.addElems('ul', 'menu-list', hierarchie)
		.addElems('li', 'list-item')
		.classed('node', function (d) { return d.values.length })
		.classed('leaf', function (d) { return !d.values.length })
		.html(function (d) { return d.key })
	.each(Menu.list)

	d3.selectAll('.node')
		.on('click', function (d) {
			d3.event.stopPropagation()
			const node = this
			const sel = d3.select(this)
			
			if (sel.classed('list-item')) d3.selectAll('.list-item.expanded').filter(function () { return this !== node }).call(Menu.expand)
			sel.call(Menu.expand)
		})
	d3.selectAll('.leaf')
		.on('click', function (d) {
			d3.event.stopPropagation()
			d3.select(this).classed('selected', !d3.select(this).classed('selected'))

			const deepcopy = JSON.parse(JSON.stringify(d))
			deepcopy.type = 'value'
			Mountains.rangeValues.push(deepcopy)
			// console.log(Mountains.rangeValues)

			// Mountains.rangeValues.push(Object.assign({ type: 'value' }, d)) // CHANGE TYPE HERE ++++++ OBJECT ASSIGN DOES NOT WORK IN IE

			// REDRAW THE MOUNTAINS
			UI.redraw()
		})

	const foot = body.addElems('div', 'foot')
		.addElems('p', 'instruction')
		.html('Le paysage actuel est généré aléatoirement. Vous pouvez filtrer les territoires qui vous intéressent en sélectionnant ou désélectionnant les zones de la carte ci-dessus. Puis, affichez les indicateurs de votre choix parmi ceux proposés dans les listes déroulantes ci-dessous. Les indicateurs sélectionnés s’affichent sous forme de cercles dans l’ordre de sélection sur la barre en bas de l’écran. Vous pouvez les combiner, les réordonner et les supprimer en manipulant (glisser/déplacer) les cercles qui les représentent.')
}
Menu.data = function (_data) { 
	indicateurs_nombres = _data.filter(function (d) { return d['Type_JB'].toLowerCase() === 'nombre' })
	const indicateurs_uniques = indicateurs_nombres.map(function (d) { return d['Structure'] })
	const rgx = /_/g
	const indicateurs_decomposes = indicateurs_uniques.map(function (d) { return d.split(rgx).filter(function (c) { return c.length }) })

	const hierarchie = []
	indicateurs_decomposes.forEach(function (d) {
		if (hierarchie.map(function (c) { return c.key }).indexOf(d[0]) === -1) hierarchie.push({ key: d[0], path: d[0] })
		let obj = hierarchie.filter(function (c) { return c.key === d[0] })[0]
		d.forEach(function (c, j) {
			if (j > 0) {
				if (!obj.values) obj.values = []
				if (obj.values.map(function (b) { return b.key }).indexOf(c) === -1) {
					if (_data.filter(function (a) { return a['Structure'] === obj.path + '_' + c })[0]) {
						const indicateur_detail = _data.filter(function (a) { return a['Structure'] === obj.path + '_' + c })[0]['Indicateur']
						obj.values.push({ key: c, path: obj.path + '_' + c, value: indicateur_detail })
					}
					else obj.values.push({ key: c, path: obj.path + '_' + c })
				}
				obj = obj.values.filter(function (b) { return b.key === c })[0]
			}
		})
	})
	return hierarchie
}
Menu.list = function (_d) {
	const sel = d3.select(this)
		.classed('node', function (d) { return d.values && d.values.length })
		.classed('leaf', function (d) { return !(d.values && d.values.length) })
		
	// CHECK THE CHILD NODES: IF THEY ARE ALL AT THE SAME LEVEL (NO GRAND CHILDREN)
	// ADD THEM IN PARENTHESES, OTHERWISE RE-ITERATE
	if (_d.values) {
		const grandChildren = _d.values.map(function (d) { return d.values ? d.values.length : 0 })
		if (!d3.sum(grandChildren) && _d.values.length > 1) {
			sel.classed('node leaf', false)
				.classed('multi-leaf', true)
				.on('click', function () { d3.event.stopPropagation() })
			.addElems('span', 'leaf', function (d) { return d.values })
				.html(function (d, i) {
					if (i === 0 && _d.values.length === 1) return ' (<u>' + d.key + '</u>)'
					else if (i === 0 && _d.values.length > 1) return ' (<u>' + d.key + '</u> | '
					else if (i === _d.values.length - 1) return '<u>' + d.key + '</u>)'
					else return '<u>' + d.key + '</u> | '
				})
		}
		else {
			const list = sel.addElems('ul', 'sub-list', function (d) { return d.values })
				.addElems('li', 'sub-item')
				.html(function (d) { return d.key })
			.each(Menu.list)
		}
	}
}
Menu.expand = function (_sel) {
	if (!_sel.node()) return null
	const sublist = Array.prototype.slice.call(_sel.node().children)
	// const sublist = _sel.node().children
	const isExpanded = _sel.classed('expanded')
	const lineHeight = 9
	
	if (sublist) {
		if (!isExpanded) {
			_sel.classed('expanded', true)

			// for (let node of sublist) {
			sublist.forEach(function (node) {
			// for (let node of sublist) {
				if (node.nodeName === 'UL' || node.nodeName === 'ul') {
					const ul = d3.select(node)
					const li = ul.select('li.sub-item').node()
					li.style.maxHeight = lineHeight + 'rem'
				}
			})
			
			const parentItem = _sel.findAncestor('list-item')

			parentItem.selectAll('li.expanded')
			.style('max-height', function () {
				return ((
					d3.select(this).selectAll('.sub-item')
					.filter(function () { 
						return this.style.maxHeight 
					}).size() + 1) * lineHeight
				) + 'rem'
			})
		}
		else {
			_sel.classed('expanded', false)
				.selectAll('li.sub-item')
				.classed('expanded', false)
				.style('max-height', null)
		}
	}
}