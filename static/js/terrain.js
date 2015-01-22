/*
 * terrain.js
 *    -- RequireJS module for procedurally-generating and animating terrain segments.
 */
define([], function() {
    return function(args) {
        /*
         * Returns an object representing the terrain, via a fabric.js Group
         * consisting of procedurally-generated tiles.
         */

        "use strict";

    	// create an object that we will return when the module is invoked
        var o = {};
    	o._debug = false;

        // alternate colors for adjacent terrain segments, for debug
        var color_index = 0;
        var colors = ['rgb(25,128,25)', 'rgb(25,25,128)'];


    	/***********************************************************************
    	 * PROPERTIES
    	 ***********************************************************************/

    	// last_x stores the x coordinate of the last terrain segment we generated, 
    	// so that we can calculate the coordates of the next segment.
        o.last_x = 0;

    	// last_block_size remembers the size, in pixels, of the last segment we
    	// generated. We need this in case the block size changes between tiles.
    	o.last_block_size = 0;

    	// terrain variation is a percentage that controls how often the height of
    	// adjacent terrain segments may differ.
        o.variation = args['variation'] || 20;

    	// terrain segments are squares; block_size is the size of a side, in pixels
        o.block_size = args['block_size'] || 25;

    	// hole_frequency is a percentage controlling how often we should generate
    	// terrain segments of height zero, ie, holes.
        o.hole_frequency = args['hole_frequency'] || 1;

    	// step_size controls how many pixels segments will be shifted left during animation.
    	// The higher the step size, the faster the apparent scrolling.
        o.step_size = args['step_size'] || 1;
    
        // do not allow terrain segments to be taller than this many blocks.
    	// WAT This could be dependent upon the height of the canvas.
        var terrain_max_height = 4;

    	// remember the height of the last segment we generated
        var last_height = 2;

    	// the maximum height, in pixels, of any given terrain segment.
        var terrain_height_pixels = terrain_max_height * o.block_size;
    
    	/***********************************************************************
    	 * PUBLIC METHODS
    	 ***********************************************************************/

        o.init = function() {
            /*
             * reset the terrain segments
             * 
             */
            this.group = new fabric.Group();
            this.last_x = 0;
    		this.last_block_size = this.block_size;
    		return this;
        };
    
        o.fill = function(canvas) {
    		/*
    		 * Generate enough terrain segments to completely fill the specified canvas
    		 *
    		 */
            this.width = canvas.getWidth();
            this.height = canvas.getHeight();
            while (this.last_x <= this.width + this.block_size + this.step_size) {
               this._gen_segment();
            }
            canvas.add(this.group);
    		return this;
        };
    
        o.animate = function(canvas) {
            /*
             * move all the terrain segments to the left, and draw new 
             * randomly-generated segments off-screen so they slide in.
             */

            if (! this.group ) {
                return this;
            }
    
            // everybody to the left, some number of pixels. The larger
            // the step size, the faster the scrolling appears to go.
            this.group.forEachObject(function(obj, idx, all) {
                obj.set('left', obj.left - o.step_size)
            });
    
            // if the right-most terrain segment is fully on-screen, 
            // generate a new random segment and append it to the group.
            var last = this.group.item(this.group.size() - 1);
            if (last.left <= this.width - this.block_size) {
                this._gen_segment();
            }
    
            // if the left-most segment is completely offscreen, we
            // can remove it to free up memory.
            if (this.group.item(0).left < -2 * this.block_size + this.step_size) {
                this.group.remove(this.group.item(0));
            }

    		return this;
        };
    

    	/***********************************************************************
    	 * PRIVATE METHODS
    	 ***********************************************************************/
 
        o._random_height = function() {
            /*
             * return a random height, in number-of-blocks, for a terrain segment.
             *
             */
            var h = Math.floor(Math.random() * terrain_max_height) + 1;
    
            // restrict how much variation there is in heights of adjacent segments
            if (this.last_height && Math.floor(Math.random() * 100) > this.variation) {
                h = this.last_height;    
            }
    
            // occasionally, create a hole (height of zero)
            if (Math.floor(Math.random() * 100) <= this.hole_frequency) {
                h = 0;
            }
            this.last_height = h;
            return h;
        }
    
    
        o._gen_segment = function() {
    		/*
    		 * Create a new terrain segment of random hight, and 
    		 * append it to the fabric.js group so it can be rendered.
    		 */
    		if (this._debug) {
    			color_index = color_index == 0 ? 1 : 0;
    		}

    		// determine a height for the new segment
            var y = this._random_height() * this.block_size;

    		// calcualte and record the x coordinate of the new segment such that it abuts the previous segment,
    		var last = this.group.size() > 0 ? this.group.item(this.group.size() - 1) : null;
            this.last_x = last ? last.left + this.last_block_size : 0;

    		// create a new fabric.js rectangle
            this.group.add(new fabric.Rect({
                left: this.last_x,
                top: this.height - y,
                fill: colors[color_index],
                width: this.block_size,
                height: y,
            }));

    		// remember the size of the block we just generated
    		this.last_block_size = this.block_size;
        };


        return o;
    };
});
