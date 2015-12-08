function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function normalize(domainMin, domainMax, rangeMin, rangeMax, x) {
    return (rangeMin + (x-domainMin)*(rangeMax-rangeMin)/(domainMax-domainMin));
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

CanvasRenderingContext2D.prototype.clear = function() {
    // Store the current transformation matrix
    this.save();

    // Use the identity matrix while clearing the canvas
    this.setTransform(1, 0, 0, 1, 0, 0);
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Restore the transform
    this.restore();
}

function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function tableToJson(table) {
    var json = [];
    // first row:
    for(i = 1; i < table.length; i++) {
        var entry = {};
        for(j = 0; j < table[0].length; j++) {
            entry[table[0][j]] = table[i][j];
        }
        json.push(entry);
    }
    return json;
}

function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search)) {
        return decodeURIComponent(name[1]);
    }
}

if ( !Date.prototype.toISOString ) {
    ( function() {
        function pad(number) {
            var r = String(number);
            if ( r.length === 1 ) {
                r = '0' + r;
            }
            return r;
        }

        Date.prototype.toISOString = function() {
            return this.getUTCFullYear()
                    + '-' + pad( this.getUTCMonth() + 1 )
                    + '-' + pad( this.getUTCDate() )
                    + 'T' + pad( this.getUTCHours() )
                    + ':' + pad( this.getUTCMinutes() )
                    + ':' + pad( this.getUTCSeconds() )
                    + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
                    + 'Z';
        };

    }() );
}
