requirejs.config({
    baseUrl: 'static/js',
});

// Start the main app logic.
requirejs(['terrain'],
function(Terrain) {
    "use strict";

    // create a new fabric.js Canvas objet
    var canvas = new fabric.Canvas('c');

    // debug controls
    var tv_ctrl = document.getElementById('variation');
    var bs_ctrl = document.getElementById('block_size');
    var sp_ctrl = document.getElementById('speed');
    var hf_ctrl = document.getElementById('hole');

    // add event listeners to the controls to update parameters in real-time.
    tv_ctrl.addEventListener('change', function(e) {
        terrain.variation = parseInt(tv_ctrl.value);
    }, false);
    bs_ctrl.addEventListener('change', function(e) {
        stop();
        terrain.block_size = parseInt(bs_ctrl.value);
        main();

    }, false);
    sp_ctrl.addEventListener('change', function(e) {
        terrain.step_size = parseInt(sp_ctrl.value);
        stop();
        main();
    }, false);
    hf_ctrl.addEventListener('change', function(e) {
        terrain.hole_frequency = parseInt(hf_ctrl.value);
    }, false);

    var timer = null;
    function main() {
        /*
         * The main animiation loop
         *
         */
        timer = window.setInterval(function() {
            terrain.animate(canvas);
            canvas.renderAll();
        }, 10);
    }

    function stop() {
        /*
         * stop animation.
         */
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    function clear() {
        /*
         * reset the entire canvas, destroying all modules
         */
        stop();
        canvas.remove(terrain.group);
        terrain.group = null;
    }

    function resize_canvas() {
        /*
         * event handler for window resizes. Stops animations,
         * reconfigures modules for the new window dimentions,
         * and continues.
         */
        stop();
        canvas.setWidth(window.innerWidth);
        terrain.fill(canvas);
        main();
    }

    // create a terrain module
    var terrain = Terrain({
        variation:  parseInt(tv_ctrl.value),
        block_size: parseInt(bs_ctrl.value),
        hole_frequency: parseInt(hf_ctrl.value),
        step_size: parseInt(sp_ctrl.value),
    });

   
    // resize on page load, so the canvas is the full width of the page.
    // the resize function will also invoke main(), starting the main execution loop.
    terrain.init();
    resize_canvas();

    // listen for resize events
    window.addEventListener('resize', resize_canvas, false);

    /*
    document.addEventListener('click', function (e) {
        animate_one_step();
    }, false);
    */

});
