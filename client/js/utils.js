function assert(condition, message) {
	if (!condition) {
		throw message || "Assertion failed";
	}
}

JSON.stringify = JSON.stringify || function (obj) {
	var t = typeof (obj);
	if (t != "object" || obj === null) {
		// simple data type
		if (t == "string") obj = '"'+obj+'"';
		return String(obj);
	}
	else {
		// recurse array or object
		var n, v, json = [], arr = (obj && obj.constructor == Array);
		for (n in obj) {
			v = obj[n]; t = typeof(v);
			if (t == "string") v = '"'+v+'"';
			else if (t == "object" && v !== null) v = JSON.stringify(v);
			json.push((arr ? "" : '"' + n + '":') + String(v));
		}
		return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	}
};

function clearCanvas(canvas, context) {
	// Store the current transformation matrix
	context.save();

	// Use the identity matrix while clearing the canvas
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Restore the transform
	context.restore();
}

function formatNumber(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function drawCircle(context, x, y, radius, color) {
	context.beginPath();
	context.arc(x, y, radius, 0, 2 * Math.PI, false);
	context.fillStyle = color;
	context.fill();
	context.lineWidth = 5;
	context.strokeStyle = color;
	context.stroke();
}

function drawText(context, x, y, font, color, text) {
	context.fillStyle = color;
	context.font=font;
	context.fillText(text, x, y);
}

CanvasRenderingContext2D.prototype.fillTextArc = function(text, x, y, radius, startRotation, degreesPerLetter){
	// To fill entire circlular arc:
	// var degreesPerLetter = 2*Math.PI / text.length;
	this.save();
	this.translate(x,y);
	this.rotate(startRotation);

	for(var i=0;i<text.length;i++){
		this.save();
		this.translate(radius, 0);
		this.translate(10, -10);
		this.rotate(1.4)
		this.translate(-10, 10);          
		this.fillText(text[i],0,0);
		this.restore();
		this.rotate(degreesPerLetter);
	}
	this.restore();
}
