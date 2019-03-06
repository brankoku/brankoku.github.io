// given an animation and the current time (in milliseconds),
// get and return the appropriate frame
function framenow(anim, ms) {
	var i=0, cur=0;
	ms %= anim.ms;
	while(i<anim.frames-1) {
		var frame = anim.frame[i];
		if( ms >= cur && ms < cur+frame.num )
			return frame;
		cur += frame.num;
		i++;
	}
	return anim.frame[i];
}

var g_anim = 0, g_anim_max = 0, g_mirror_x = 0, g_show_origin = 1;

function button_prev() {
	if(!g_anim)
		g_anim = g_anim_max;
	g_anim--;
}

function button_next() {
	g_anim++;
	if(g_anim >= g_anim_max)
		g_anim = 0;
}

function button_mirror_x_toggle() {
	g_mirror_x = !g_mirror_x;
}

function button_origin_toggle() {
	g_show_origin = !g_show_origin;
}

(function () {
			
	var spritesheetImage,
		canvas,
		spriteDB;

	function mainLoop () {
	
		window.requestAnimationFrame(mainLoop);
		
		// clear canvas
		var context = canvas.getContext("2d");
		context.clearRect(0, 0, 500, 500);	
		
		// draw current animation
		anim = spriteDB.animation[g_anim];
		var ms = Date.now();
		var frame = framenow(anim, ms);
		var x, y, w, h, center_x = 250, center_y = 250;
		x = center_x;
		y = center_y;
		w = frame.w;
		h = frame.h;
		
		// account for offsets
		// and horizontal mirroring
		if(g_mirror_x) {
			x -= frame.ox + frame.w - 1;
			context.scale(-1, 1);
			w *= -1;
			x *= -1;
		} else
			x += frame.ox;
		y += frame.oy;
	  
		// render animation frame
		context.drawImage(
			spritesheetImage[frame.sheet],
			frame.x, // crop xy
			frame.y,
			frame.w, // crop wh
			frame.h,
			x, // sprite xy
			y,
			w, // sprite wh
			h
		);
		
		if(g_mirror_x)
			context.setTransform(1, 0, 0, 1, 0, 0);
		
		if(g_show_origin) {
			context.globalAlpha = 0.25;
			context.fillRect(0, 0, center_x, center_y);
			context.fillRect(center_x, center_y, center_x, center_y);
			context.globalAlpha = 1.0;
		}
	}
	
	// get canvas
	canvas = document.getElementById("gfs-canvas");
	canvas.width = 500;
	canvas.height = 500;

	// load sprite database from JSON
	$.ajax({
		url: "sprites.json",
		dataType: "json",
		async: false,
		success: function( data ) {
			spriteDB = data;
			// put sprite sheets on page for testing purposes
			var items = [];
			for(var i = 0; i < data.sheet.length; i++) {
				items.push( "<img class='sprite-sheet' src='" + data.sheet[i].src + "'>" );
			};

			$( "<p/>", {
				html: items.join( "<br/>" )
			}).appendTo( "body" );
		}
	});
	
	// initialize sprite sheet database
	spritesheetImage = new Array();
	for(var i=0; i<spriteDB.sheet.length; i++) {
		spritesheetImage[i] = new Image();
		spritesheetImage[i].src = spriteDB.sheet[i].src;
	}
	
	// by default, animation frame times are stored in numerator/denominator format;
	// for this example, convert so frame.num is duration in milliseconds 
	for(var i=0; i<spriteDB.animation.length; i++) {
		var anim = spriteDB.animation[i];
		for(var k=0; k<anim.frame.length; k++) {
			var frame = anim.frame[k];
			frame.num = (frame.num / frame.den) * 1000;
		}
	}
	
	// set button max for demo
	g_anim_max = spriteDB.animation.length;
	
	mainLoop();

} ());

