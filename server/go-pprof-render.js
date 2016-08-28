var child_process = require("child_process");

function Render(raw, callback){
    var fg = child_process.spawn("./server/flamegraph.pl");
    var svg = "";
    fg.stdout.on("data", function(chunk){
        svg += chunk;
    });
    fg.stdout.on("end", function(){
        return callback(null, svg);
    });
    fg.on("error", function(error){
        console.log("ERROR: error when rendering, "  + error);
        return callback(error);
    });
    fg.stdin.write(raw);
    fg.stdin.end();    
}

module.exports = Render;