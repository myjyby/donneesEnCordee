const bgColor = '#FFF'
// const bgColor = '#E5E2D9'
const usePattern = true
const useHighlights = false

if (!UI) { var UI = {} }
UI.drag = d3.drag()
	.on('start', function () {
		d3.selectAll('div.sommet, div.label--name, div.axis').classed('transition--none', true)
		d3.select('div.paysage--vis').classed('dragging', true)
	})
	.on('drag', function () {
		const evt = d3.event
		
		if (!normalize) {
			d3.selectAll('div.sommet')
				.style('transform', function (d) {
					const datum = this.parentNode.parentNode['__data__']
					if (datum.top - evt.dy * datum.z / 25 > Mountains.horizon) {
						datum.top -= evt.dy * datum.z / 25
						if (datum.top >= datum.origin) datum.top = datum.origin
					}
					else datum.top = Mountains.horizon
					datum.originleft -= (evt.dx * (datum.z + 1) / 25)
					
					return `translate(${datum.originleft}px, ${datum.top}px)`
				})
			d3.selectAll('div.axis')
				.style('transform', function (d) {
					const datum = this.parentNode.parentNode['__data__']
					return `translateX(${datum.originleft}px)`
				})
			d3.selectAll('div.label--name')
				.style('transform', function (d) {
					const datum = this.parentNode['__data__']
					return `translateY(${datum.top}px)`
				})
		}
	})
	.on('end', function () {
		d3.selectAll('div.sommet, div.label--name, div.axis').classed('transition--none', false)
		d3.select('div.paysage--vis').classed('dragging', false)
	})

UI.init = function () {
	const btns = d3.select('div.header').selectAll('div.btn')
	btns.on('click', function () {
		btns.classed('active', false)
		const sel = d3.select(this)
		sel.classed('active', true)
		if (sel.classed('abs-scale')) {
			normalize = false
			d3.select('div.montagnes').classed('table', false)
		}
		if (sel.classed('norm-scale')) {
			normalize = true
			d3.select('div.montagnes').classed('table', true)
		}
		UI.redraw()
	})
}
UI.redraw = function () {
	Mountains.init()
	Reasoning.init()
}
