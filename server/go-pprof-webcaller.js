var child_process = require("child_process");
var url = require("url");

function GetRaw(url_provided, callback){    
    var command_url = url.parse(url_provided);
    var pprofUrl = command_url.protocol + "//" + command_url.host + "/debug/pprof/profile";
    var gt = child_process.spawn("go", ["tool", "pprof", "-raw", pprofUrl]);

    var raw = "";
    gt.stdout.on("data", function(chunk){
        raw += chunk;
    });
    gt.stdout.on("end", function(){
        return callback(null, raw);
    });
    gt.on("error", function(error){
        console.log("ERROR: error when getting profile, "  + error);
        return callback(error);
    });
}

module.exports = GetRaw;