(function(){
    "use strict";

    var canvas = new fabric.Canvas('c');
    var terrain = null;

    window.addEventListener('resize', resize_canvas, false);

    function resize_canvas() {
      canvas.setWidth(window.innerWidth);
      canvas.renderAll();
    }

    var tv_ctrl = document.getElementById('variation');
    var bs_ctrl = document.getElementById('block_size');
    var sp_ctrl = document.getElementById('speed');
    var hf_ctrl = document.getElementById('hole');

    var terrain_variation = parseInt(tv_ctrl.value);
    var block_size = parseInt(bs_ctrl.value);
    var hole_frequency = parseInt(hf_ctrl.value);
    var speed = parseInt(sp_ctrl.value);

    tv_ctrl.addEventListener('change', function(e) {
        terrain_variation = parseInt(tv_ctrl.value);
    }, false);

    bs_ctrl.addEventListener('change', function(e) {
        block_size = parseInt(bs_ctrl.value);
        clear();
        init();
    }, false);

    sp_ctrl.addEventListener('change', function(e) {
        speed = parseInt(sp_ctrl.value);
        stop();
        animate();
    }, false);

    hf_ctrl.addEventListener('change', function(e) {
        hole_frequency = parseInt(hf_ctrl.value);
    }, false);

    // resize on init
    resize_canvas();

    var canvas_height = canvas.getHeight();
    var canvas_width = canvas.getWidth();

    var terrain_max_height = 4;
    var last_height = 2;

    var terrain_height_pixels = terrain_max_height * block_size;

    function cointoss(pct) {
        return Math.floor(Math.random() * 100) <= pct;
    }

    function random_height() {
        var h = Math.floor(Math.random() * terrain_max_height) + 1;

        if (!cointoss(terrain_variation)) {
            h = last_height;    
        }

        if (cointoss(hole_frequency)) {
            h = 0;
        }

        last_height = h;
        return h;
    }

    var running = false;
    var last_x = 0;
    var c = 0;
    var color = ['rgb(25,128,25)', 'rgb(25,25,128)'];
    function gen_terrain_segment() {
        var y = random_height() * (block_size / 2);
        c = c == 0 ? 1 : 0;
        terrain.add(new fabric.Rect({
            //left: running ? canvas_width - speed : last_x,
            left: last_x,
            top: canvas_height - y,
            fill: color[c],
            width: block_size,
            height: y,
        }));

        if (!running) {
            last_x += block_size;
        }
    };

    function init() {
        /*
         * fill up the canvas with terrain, to begin.
         * 
         */
        terrain = new fabric.Group();
        last_x = 0;
        var w = 0;
        while (w <= canvas_width + block_size) {
           gen_terrain_segment();
           w += block_size;
        }
        canvas.add(terrain);
        running = true;
    };

    var timer = null;
    function animate() {
        /*
         * move all the terrain segments to the left, and draw new 
         * randomly-generated segments off-screen so they slide in.
         */
        timer = window.setInterval(function() {
            if (! terrain ) {
                stop();
                return;
            }

            // everybody to the left, some number of pixels. The larger
            // the step size, the faster the scrolling appears to go.
            terrain.forEachObject(function(obj, idx, all) {
                obj.set('left', obj.left - speed)
            });

            // if the left-most terrain segment is completely off-screen,
            // remove it, and append a new random segment to the right side.
            if (terrain.item(0).left <= -1 * block_size) {
                gen_terrain_segment();
                terrain.remove(terrain.item(0));
            }

            // render the changes
            canvas.renderAll();
        }, 10);
    }

    function stop() {
        window.clearInterval(timer);
        timer = null;
    }
    function clear() {
        stop();
        canvas.remove(terrain);
        terrain = null;
        running = false;
    }

    init();
    animate();

})();

