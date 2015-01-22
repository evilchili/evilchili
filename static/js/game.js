(function(){
    "use strict";

	// true if animation is running
    var running = false;

	// the x coordinate of the last terrain segment we generated.
	// We track this to know if we shoudl generate a new segment,
	// and to calculate how many segments are needed to fill the
	// canvas after a window resize.
    var last_x = 0;


    var canvas = new fabric.Canvas('c');
    var terrain = null;

    window.addEventListener('resize', resize_canvas, false);

    function resize_canvas() {
      canvas.setWidth(window.innerWidth);
	  if (running) {
		stop();
		fill_terrain();
		main();
	  }
      canvas.renderAll();
    }

	// debug controls
    var tv_ctrl = document.getElementById('variation');
    var bs_ctrl = document.getElementById('block_size');
    var sp_ctrl = document.getElementById('speed');
    var hf_ctrl = document.getElementById('hole');

	// get the parameterse from the controls
    var terrain_variation = parseInt(tv_ctrl.value);
    var block_size = parseInt(bs_ctrl.value);
    var hole_frequency = parseInt(hf_ctrl.value);
    var speed = parseInt(sp_ctrl.value);

	// add event listeners to the controls to update 
	// parameters in real-time.
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
        main();
    }, false);
    hf_ctrl.addEventListener('change', function(e) {
        hole_frequency = parseInt(hf_ctrl.value);
    }, false);

    // resize on page load, so the canvas is the full width of the page.
    resize_canvas();

	// remember the canvas dimensions
    var canvas_height = canvas.getHeight();
    var canvas_width = canvas.getWidth();

	// no configuring this params, for now
    var terrain_max_height = 4;
    var last_height = 2;

    var terrain_height_pixels = terrain_max_height * block_size;

    function cointoss(pct) {
		/*
		 * return true pct percent of th etime
		 *
		 */
        return Math.floor(Math.random() * 100) <= pct;
    }

    function random_height() {
		/*
		 * return a random height, in number-of-blocks, for a terrain segment.
		 *
		 */
        var h = Math.floor(Math.random() * terrain_max_height) + 1;

		// restrict how much variation there is in heights of adjacent segments
        if (!cointoss(terrain_variation)) {
            h = last_height;    
        }

		// occasionally, create a hole (height of zero)
        if (cointoss(hole_frequency)) {
            h = 0;
        }

        last_height = h;
        return h;
    }

	// alternate colors for adjacent terrain segments, for debug
    var c = 0;
    var color = ['rgb(25,128,25)', 'rgb(25,25,128)'];

	// create a new terrain segment of random hight, and 
	// append it to the fabric group so it can be rendered.
    function gen_terrain_segment() {
        var y = random_height() * (block_size / 2);
        c = c == 0 ? 1 : 0;
		last_x = terrain.size() ? terrain.item(terrain.size() - 1).left + block_size : 0;
        terrain.add(new fabric.Rect({
            left: last_x,
            top: canvas_height - y,
            fill: color[c],
            width: block_size,
            height: y,
        }));

    };

    function init() {
        /*
         * fill up the canvas with terrain, to begin.
         * 
         */
        terrain = new fabric.Group();
        last_x = 0;
		fill_terrain();
        running = true;
	}

	function fill_terrain() {
        while (last_x <= canvas_width + block_size + speed) {
           gen_terrain_segment();
        }
        canvas.add(terrain);
    };

	function animate_one_step() {
        /*
         * move all the terrain segments to the left, and draw new 
         * randomly-generated segments off-screen so they slide in.
         */
        if (! terrain ) {
            stop();
            return;
        }

        // everybody to the left, some number of pixels. The larger
        // the step size, the faster the scrolling appears to go.
        terrain.forEachObject(function(obj, idx, all) {
            obj.set('left', obj.left - speed)
        });

		// if the right-most terrain segment is fully on-screen, 
		// generate a new random segment and append it to the group.
		var last = terrain.item(terrain.size() - 1);
		if (last.left <= canvas_width - block_size) {
            gen_terrain_segment();
		}

		// if the left-most segment is completely offscreen, we
		// can remove it to free up memory.
		if (terrain.item(0).left < -2 * block_size + speed) {
            terrain.remove(terrain.item(0));
		}

        // render the changes
        canvas.renderAll();
	}

    var timer = null;
    function main() {
        timer = window.setInterval(animate_one_step, 10);
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

	// for debugging, use the click-to-step function and disable the main() call.
    main();
	/*
	document.addEventListener('click', function (e) {
		animate_one_step();
	}, false);
	*/


})();

