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
        name: 'random'
    }

});

/*
* Basic functions
* */

/*
* Function to create a Node when the 'Create node' item is clicked in the menu.
* */
function createNode() {
    var id = 'new' + Math.round( Math.random() * 100 );
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

function createEdge() {
    var nodeId_1 = prompt('First node Id');
    var nodeId_2 = prompt('Second node Id');
    var nodeValue = prompt('Edge id');
    cy.add({
        classes: 'edge',
        data: { id: nodeValue, source: nodeId_1, target: nodeId_2},
    });
    console.log(`Edge created. Id: ${nodeValue}`);
}

function removeNode() {
    currentNode.remove();
    console.log(`Node removed`);
}

function removeEdge() {
    currentEdge.remove();
    console.log(`Edge removed`);
}

function renameNode() {
    currentNode.data('id',prompt('Enter new value'));
}

function changeEdgeValue() {

}

function clearCy() {

}

/**
 * Define new Cy layout
 *
 * @param {string} name Layout name
 * */
function changeLayout(name) {
    if (!name) {
        var layout = cy.layout({
            name: 'random'
        });
        layout.run();
    } else {
        var layout = cy.layout({
            name: name
        });
        layout.run();
    }
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
    }

    /**
     * Listens for contextmenu events.
     */
    function contextListener() {
        document.addEventListener('DOMContentLoaded', function(){

            cy.on('cxttap', function( evt ){ //when right clicking cy background
                var tgt = evt.target || evt.cyTarget;
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
