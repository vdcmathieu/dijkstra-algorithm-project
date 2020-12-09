/**
 * Variables.
 * */

var contextMenuClassName = "context-menu";
var contextMenuItemClassName = "context-menu__item";
var contextMenuLinkClassName = "context-menu__link";
var contextMenuActive = "context-menu--active";

var taskItemClassName = "cy";
var taskItemInContext;

var clickCoords;
var clickCoordsX;
var clickCoordsY;

var realClickCoordsX;
var realClickCoordsY;

var menus = {
    basic: document.querySelector("#context-menu"),
    node: document.querySelector("#context-menu-node"),
    edge: document.querySelector("#context-menu-edge")
};
var menusItems = {
    basic: menus.basic.querySelector(".context-menu__item"),
    node: menus.node.querySelector(".context-menu-node__item"),
    edge: menus.edge.querySelector(".context-menu-edge__item")
};
var menusState = {
    basic: 0,
    node: 0,
    edge: 0
};
var menuWidth;
var menuHeight;
var menuPosition;
var menuPositionX;
var menuPositionY;

var windowWidth;
var windowHeight;

var currentNode;
var currentEdge;

var lastAlgorithm;

var cytoscapeDefault = {
    container: document.getElementById('cy'),

    boxSelectionEnabled: false,
    autounselectify: true,

    style: cytoscape.stylesheet()
        .selector('node')
        .style({
            'content': 'data(id)',
            'background-color': `#727171`,
        })
        .selector('edge')
        .style({
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'width': 4,
            'line-color': '#ddd',
            'target-arrow-color': '#ddd',
            'label': 'data(weight)'
        })
        .selector('.highlighted')
        .style({
            'background-color': '#61bffc',
            'line-color': '#61bffc',
            'target-arrow-color': '#61bffc',
            'transition-property': 'background-color, line-color, target-arrow-color',
            'transition-duration': '0.5s'
        }),

    elements: {
        nodes: [
            { data: { id: 'a' } },
            { data: { id: 'b' } },
            { data: { id: 'c' } },
            { data: { id: 'd' } },
            { data: { id: 'e' } }
        ],

        edges: [
            { data: { id: 'ae_0', weight: 1, source: 'a', target: 'e' } },
            { data: { id: 'ab_0', weight: 3, source: 'a', target: 'b' } },
            { data: { id: 'be_0', weight: 4, source: 'b', target: 'e' } },
            { data: { id: 'bc_0', weight: 5, source: 'b', target: 'c' } },
            { data: { id: 'ce_0', weight: 6, source: 'c', target: 'e' } },
            { data: { id: 'cd_0', weight: 2, source: 'c', target: 'd' } },
            { data: { id: 'de_0', weight: 7, source: 'd', target: 'e' } }
        ]
    },

    layout: {
        name: 'breadthfirst',
        directed: true,
        roots: '#a',
        padding: 10
    }
}

var cy = cytoscape({
    container: cytoscapeDefault.container,

    boxSelectionEnabled: cytoscapeDefault.boxSelectionEnabled,
    autounselectify: cytoscapeDefault.autounselectify,

    style: cytoscapeDefault.style,

    elements: cytoscapeDefault.elements,

    layout: cytoscapeDefault.layout
});

/*
* Basic functions
* */

/*
* Function to create a Node when the 'Create node' item is clicked in the menu.
* */
function createNode(id) {
    removeHighlight()
    id = id || 'new' + Math.round( Math.random() * 100 );
    cy.add({
        classes: 'node',
        data: { id:  id},
        position: {
            x: realClickCoordsX,
            y: realClickCoordsY
        }
    });
    console.log(`Node created. Id: ${id}`);
}

function createEdge(sourceNode, targetNode, edgeWeight) {
    removeHighlight()
    var id;

    sourceNode = sourceNode || prompt('First node Id');
    targetNode = targetNode || prompt('Target node Id');
    edgeWeight = edgeWeight || prompt('Edge value')

    var sameEdges = cy.edges().filter(function( ele ){
        return ele.data('source') === sourceNode & ele.data('target') === targetNode;
    });
    if (sameEdges.length !== 0) {
        id = parseInt(sameEdges[sameEdges.length - 1].data('id').slice(sameEdges[sameEdges.length - 1].data('id').indexOf("_")+1)) + 1;
    }

    cy.add({
        classes: 'edge',
        data: { id: `${sourceNode}${targetNode}_${id}`, source: sourceNode, target: targetNode, weight: edgeWeight},
    });
    console.log(`Edge created. Id: ${sourceNode}${targetNode}_${id}`);
}

function removeNode() {
    currentNode.remove();
    console.log(`Node removed`);
}

function removeEdge() {
    currentEdge.remove();
    console.log(`Edge removed`);
}

function changeEdgeValue(newValue) {
    newValue = newValue || prompt('Enter new value')
    currentEdge.data('weight', newValue)
    console.log(`Edge value changed to ${newValue}`)
}

function changeNodeLabel(newLabel) {
    newLabel = newLabel || prompt('Enter new label')
    currentNode.data('id', newLabel)
    console.log(`Node label changed to ${newLabel}`)
}

function clearCy() {

}

function removeHighlight() {
    cy.elements().removeClass('highlighted')
}

function highlightNextEle(elements) {

    var i = 0;

    if( i < elements.path.length ){
        elements.path[i].addClass('highlighted');

        i++;
        setTimeout( highlightNextEle(elements), 250);
    }
}

function bfs(beginningNode) {
    removeHighlight()
    beginningNode = beginningNode || prompt("Enter beginning node")

    var bfs = cy.elements().bfs(`#${beginningNode}`, function(){}, true);

    highlightNextEle(bfs);
    lastAlgorithm = 'bfs';
    return bfs
}

function dfs(beginningNode) {
    removeHighlight()
    beginningNode = beginningNode || prompt("Enter beginning node")

    var dfs = cy.elements().dfs(`#${beginningNode}`, function(){}, true).path;

    var i = 0;
    var highlightNextEle = function(){
        if( i < dfs.length ){
            dfs[i].addClass('highlighted');

            i++;
            setTimeout(highlightNextEle, 250);
        }
    };

    // kick off first highlight
    highlightNextEle();
    lastAlgorithm = 'dfs';
    return dfs
}

function dijkstra(beginningNode, endNode){
    removeHighlight()
    beginningNode = beginningNode || prompt("Enter beginning node")
    endNode = endNode || prompt("Enter end node")

    var dijkstra = cy.elements().dijkstra(`#${beginningNode}`, function(edge){
        return edge.data('weight');
    }, true).pathTo(cy.$(`#${endNode}`));

    var i = 0;
    var highlightNextEle = function(){
        if( i < dijkstra.length ){
            dijkstra[i].addClass('highlighted');

            i++;
            setTimeout(highlightNextEle, 250);
        }
    };

    // kick off first highlight
    highlightNextEle();
    lastAlgorithm = 'dijkstra';
    return dijkstra
}

function aStar(beginningNode, endNode){
    removeHighlight()
    beginningNode = beginningNode || prompt("Enter beginning node")
    endNode = endNode || prompt("Enter end node")

    var aStar = cy.elements().aStar(`#${beginningNode}`, `#${endNode}`, function(){}, true);

    var i = 0;
    var highlightNextEle = function(){
        if( i < aStar.path.length ){
            aStar.path[i].addClass('highlighted');

            i++;
            setTimeout(highlightNextEle, 250);
        }
    };

    // kick off first highlight
    highlightNextEle();
    lastAlgorithm = 'aStar';
    return aStar
}

function floydWarshall(beginningNode, endNode){
    removeHighlight()
    beginningNode = beginningNode || prompt("Enter beginning node")
    endNode = endNode || prompt("Enter end node")

    var floydWarshall = cy.elements().floydWarshall(function(){}, true).path(`#${beginningNode}`, `#${endNode}`);
    console.log(floydWarshall)

    var i = 0;
    var highlightNextEle = function(){
        if( i < floydWarshall.length ){
            floydWarshall[i].addClass('highlighted');

            i++;
            setTimeout(highlightNextEle, 250);
        }
    };

    // kick off first highlight
    highlightNextEle();
    lastAlgorithm = 'floydWarshall';
    return floydWarshall
}

function downloadJson(){
    var graph = cy
    if (graph !== null) {
        document.getElementById('graph-json-content').innerHTML = JSON.stringify(graph.json(), null, 4);
        var text = document.getElementById("graph-json-content").value;
        text = text.replace(/\n/g, "\r\n"); // To retain the Line breaks.
        var blob = new Blob([text], { type: "text/plain"});
        var anchor = document.createElement("a");
        anchor.download = "my_graph.json";
        anchor.href = window.URL.createObjectURL(blob);
        anchor.target ="_blank";
        anchor.style.display = "none"; // just to be safe!
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }
}

function downloadImage(){
    if (cy !== null) {
        var png = cy.png({'output': 'blob'});
        var blob = new Blob([png], {type: 'image/png'});
        var anchor = document.createElement("a");
        anchor.download = "my_graph.png";
        anchor.href = window.URL.createObjectURL(blob);
        anchor.target ="_blank";
        anchor.style.display = "none"; // just to be safe!
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }
}

function exportAnimation() {
    var algorithm;
    switch (lastAlgorithm){
        case 'bfs': algorithm = bfs();
        case 'dfs': algorithm = dfs();
    }
    var gif = new GIF({
        workers: 2,
        quality: 10
    });

    var i = 0;
    var whileElementExport = function(){
        if( i < algorithm.length ){
            algorithm[i].addClass('highlighted');
            var png = cy.png({'output': 'blob'});
            var blob = new Blob([png], {type: 'image/png'});
            gif.addFrame(blob);
            i++;
            whileElementExport();
        }
    };

    whileElementExport();
    gif.on('finished', function(blob) {
        window.open(URL.createObjectURL(blob));
    });
    gif.render();
}


/**
 * Define new Cy layout
 *
 * @param {string} name Layout name
 * */
function changeLayout(name) {
    name = name || 'random'
    var layout = cy.layout({
        name: name,
        animate: true,
        animationDuration: 500,
        animationThreshold: 250,
        refresh: 20,
        fit: true
    });
    layout.run();
}


/*
* Menu functions
* */

(function() {

    "use strict";

    /**
     * Function to check if we clicked inside an element with a particular class
     * name.
     *
     * @param {Object} e The event
     * @param {String} className The class name to check against
     * @return {Boolean}
     */
    function clickInsideElement( e, className ) {
        var el = e.srcElement || e.target;

        if ( el.classList.contains(className) ) {
            return el;
        } else {
            while ( el = el.parentNode ) {
                if ( el.classList && el.classList.contains(className) ) {
                    return el;
                }
            }
        }

        return false;
    }

    /**
     * Get's exact position of event.
     *
     * @param {Object} e The event passed in
     * @return {Object} Returns the x and y position
     */
    function getPosition(e) {
        var posx = 0;
        var posy = 0;

        if (!e) var e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        return {
            x: posx,
            y: posy
        }
    }

    /**
     * Initialise our application's code.
     */
    function init() {
        contextListener();
        clickListener();
        keyupListener();
        resizeListener();
        console.log('Init done')
    }

    /**
     * Listens for contextmenu events.
     */
    function contextListener() {
        window.addEventListener("contextmenu", e => e.preventDefault());
        document.addEventListener('DOMContentLoaded', function(){

            cy.on('cxttap', function( evt ){ //when right clicking cy background
                evt.preventDefault();
                toggleMenuOff('all');
                toggleMenuOn('basic');
                positionMenu(evt, 'basic');
            });

            cy.on('cxttap', 'node', function( evt ){ //when right clicking node
                currentNode = evt.target || evt.cyTarget;
                evt.preventDefault();
                toggleMenuOff('all');
                toggleMenuOn('node');
                positionMenu(evt, 'node');
            });

            cy.on('cxttap', 'edge', function( evt ){ //when right clicking edge
                currentEdge = evt.target || evt.cyTarget;
                evt.preventDefault();
                toggleMenuOff('all');
                toggleMenuOn('edge');
                positionMenu(evt, 'edge');
            });

            cy.$('node').on('grab', function (evt) {
                currentNode = evt.target || evt.cyTarget;
                currentNode.style({'background-color': '#7D07F2'});
                currentNode.connectedEdges(`edge[source = "${currentNode._private.data.id}"]`).style({ 'line-color': '#7D07F2', 'target-arrow-color': '#7D07F2' });
                currentNode.connectedEdges(`edge[target = "${currentNode._private.data.id}"]`).style({ 'line-color': '#23D9B7', 'target-arrow-color': '#23D9B7' });
            });

            cy.$('node').on('free', function (evt) {
                currentNode = evt.target || evt.cyTarget;
                currentNode.style({'background-color': '#727171'});
                currentNode.connectedEdges().style({ 'line-color': '#ddd', 'target-arrow-color': '#ddd' });
            });

            document.getElementById('graph-file').addEventListener('change', function (event) {

                var reader = new FileReader();
                console.log(`file loaded`);
                reader.onload = function(event) {

                    var graph_definition;
                    const {result} = event.target;
                    graph_definition = JSON.parse(result);

                    document.getElementById('cy').innerHTML = ""
                    if (cy !== null) {
                        cy.destroy();
                    };

                    cy = cytoscape({
                        container: cytoscapeDefault.container,
                        boxSelectionEnabled: cytoscapeDefault.boxSelectionEnabled,
                        autounselectify: cytoscapeDefault.autounselectify,
                        elements: graph_definition['elements'],
                        style: cytoscapeDefault.style,
                        // Draw nodes at given positions
                        layout: cytoscapeDefault.layout
                    });
                    changeLayout('breadthfirst');
                    cy.fit();
                }

                const files = event.target.files;
                if (files.length <= 0) {
                    return false;
                }

                reader.readAsText(files.item(0));
                init();
            });
        });
    }

    /**
     * Listens for click events.
     */
    function clickListener() {
        document.addEventListener( "click", function(e) {
            var clickeElIsLink = clickInsideElement( e, contextMenuLinkClassName );

            if ( clickeElIsLink ) {
                e.preventDefault();
                toggleMenuOff('all')
            }
            else {
                var button = e.which || e.button;
                if ( button === 1 ) {
                    toggleMenuOff('all');
                }
            }
        });
    }

    /**
     * Listens for keyup events.
     */
    function keyupListener() {
        window.onkeyup = function(e) {
            if ( e.keyCode === 27 ) {
                toggleMenuOff('all');
            }
        }
    }

    /**
     * Window resize event listener
     */
    function resizeListener() {
        window.onresize = function(e) {
            toggleMenuOff('all');
        };
    }

    /**
     * Turns the custom context menu on.
     *
     * @param {string} id
     */
    function toggleMenuOn(id) {
        if ( menusState[id] !== 1 ) {
            console.log(`${id} menu on`);
            menusState[id] = 1;
            menus[id].classList.add( contextMenuActive );
        }
    }

    /**
     * Turns the custom context menu off.
     *
     * @param {string} id
     */
    function toggleMenuOff(id) {

        if ( menusState[id] !== 0 && id in menus) {
            console.log(`${id} menu off`);
            menusState[id] = 0;
            menus[id].classList.remove( contextMenuActive );
        } else if (id === 'all') {
            for (let key in menus) {
                toggleMenuOff(key);
            }
        }
    }

    /**
     * Positions the menu properly.
     *
     * @param {Object} e The event
     * @param {str} id
     */
    function positionMenu(e, id) {
        // clickCoords = getPosition(e);
        // clickCoordsX = clickCoords.x;
        // clickCoordsY = clickCoords.y;

        clickCoordsX = e.position.x;
        clickCoordsY = e.position.y;

        realClickCoordsX = e.position.x;
        realClickCoordsY = e.position.y;

        menuWidth = menus[id].offsetWidth + 4;
        menuHeight = menus[id].offsetHeight + 4;

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        if ( (windowWidth - clickCoordsX) < menuWidth ) {
            menus[id].style.left = windowWidth - menuWidth + "px";
        } else {
            menus[id].style.left = clickCoordsX + "px";
        }

        if ( (windowHeight - clickCoordsY) < menuHeight ) {
            menus[id].style.top = windowHeight - menuHeight + "px";
        } else {
            menus[id].style.top = clickCoordsY + "px";
        }
    }

    /**
     * Run the app.
     */
    init();

})();
