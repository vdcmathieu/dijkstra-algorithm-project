var cy = cytoscape({

    container: document.getElementById('cy'), // container to render in

    elements: [ // list of graph elements to start with
        { // node a
            data: { id: 'a' }
        },
        { // node b
            data: { id: 'b' }
        },
        { // node c
            data: { id: 'c' }
        },
        { // node d
            data: { id: 'd' }
        },
        { // edge ab
            data: { id: 'ab', source: 'a', target: 'b' }
        }
    ],

    style: [ // the stylesheet for the graph
        {
            selector: 'node',
            style: {
                'background-color': '#0B9ED9',
                'label': 'data(id)'
            }
        },

        {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#021859',
                'target-arrow-color': '#021859',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier'
            }
        }
    ],

    layout: {
        name: 'grid',
        rows: 1
    }

});

/*
Interaction with Graph function
 */

function addNodeToGraph(graph,nodeId) {
    graph.add(
        {
            group: 'nodes',
            data: { id: nodeId }
        }
    )
}

function addEdgeToGraph(graph,edgeWeight) {
    graph.add(
        {
            group: 'edges',
            data: { weight: edgeWeight }
        }
    )
}