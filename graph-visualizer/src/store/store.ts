import cytoscape from 'cytoscape'
import cola from 'cytoscape-cola'
import { v4 as uuidv4 } from 'uuid'

import layoutOptions from './layout'
import defaultStyle from './style'

cytoscape.use(cola)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createStore() {
  const store = {
    graph: cytoscape({
      style: defaultStyle,
      layout: { name: 'preset' },
      elements: [
        // list of graph elements to start with
        {
          // node a
          data: { id: 'a' },
        },
        {
          // node b
          data: { id: 'b' },
        },
        {
          // edge ab
          data: { id: 'ab', source: 'a', target: 'b' },
        },
      ],
      maxZoom: 1,
    }),
    resetGraph() {
      this.graph.elements().remove()
    },

    layout: {} as cytoscape.Layouts,
    createLayout(options: cytoscape.LayoutOptions) {
      this.layout = this.graph.layout(options)
    },
    refreshLayout() {
      this.layout.stop()
      this.layout = this.graph.elements().makeLayout(layoutOptions.cola)
      this.layout.run()
    },

    addNode(id: string) {
      this.graph.add({ data: { id } })
      this.refreshLayout()
    },
    addEdge() {
      this.graph.nodes().removeListener('click')
      this.graph.nodes().on('click', (event) => {
        const source = this?.graph.$('node:selected').id()
        const target = event.target.id()
        this.graph.add({ data: { id: uuidv4(), source, target } })
        this.graph.nodes().removeListener('click')
        this.refreshLayout()
      })
    },
    deleteNode() {
      this.graph.remove('node:selected')
    },
    deleteEdge() {
      this.graph.remove('edge:selected')
    },
    bfs() {
      this.graph.elements().bfs({
        roots: `node:selected`,
        visit: (v, e, u, i, depth) => {
          setTimeout(() => v.addClass('alg'), 1000 * depth)
        },
      })
    },
    complete(n: number) {
      this.resetGraph()

      for (let i = 0; i < n; i += 1) {
        const newNode = uuidv4()
        const connectors = this.graph.nodes()
        this.graph.add({ data: { id: newNode } })
        connectors.forEach((connector) => {
          this.graph.add({ data: { id: uuidv4(), source: connector.id(), target: newNode } })
        })
      }

      this.refreshLayout()
    },
    star(v: number) {
      this.resetGraph()

      const center = uuidv4()
      this.graph.add({ data: { id: center } })

      for (let i = 0; i < v; i += 1) {
        const newLeg = uuidv4()
        this.graph.add({ data: { id: newLeg } })
        this.graph.add({ data: { id: uuidv4(), source: center, target: newLeg } })
      }
      this.refreshLayout()
    },
  }

  store.createLayout(layoutOptions.cola)

  store.refreshLayout()

  return store
}

export type TStore = ReturnType<typeof createStore>
