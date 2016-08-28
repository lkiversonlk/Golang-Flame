
function Sample (stacks, time){
    this.stacks = stacks;
    this.time = time;
}

//the sample raw line is like:
//1   10000000: 248 249 165 171 250 11 251 3 4 5 6 7
//and the location table is like:
//
function ParseRaw(raw){
    var ret = [];
    var lines = raw.split('\n');
    var state = "ignore";

    var samples = [];
    var locations = {};
    var seperator = /\s+/;

    for(var i = 0; i < lines.length; i ++){
        var line = lines[i];
        switch(state){
            case "ignore":
                /**
                 * The Samples line is like:
                 * Samples:
                 * samples/count cpu/nanoseconds
                 */
                if(line.trim() == "Samples:"){
                    console.log("Find Sample Section!");
                    state = "sample";
                } 
                i ++;
                break;
            case "sample":
                if(line.trim() == "Locations") {
                    console.log("Find Location Section!");
                    state = "location"
                } else {
                    var data = line.trim().split(seperator);
                    //now the datas should be like [time, time in nanoseconds, ...stacks]
                    if(data.length < 3) {
                        console.log("ERROR SAMPLE: " + line);
                        return null;
                    } else {
                        samples.push(data);
                    }
                }
                break;
            case "location":
                if(line.trim() == "Mappings"){
                    console.log("Find Mappings Section!");
                    state = "mappings"
                } else {
                    //227: 0x4740b runtime.newstack :0 s=0
                    var data = line.trim().split(seperator)
                    //now data should be like [symbolId:, address, symbolName, ...]
                    var symbolId = data[0].substr(0, data[0].length - 1);
                    locations[symbolId] = data[2];
                }
                break;
            default:
                break;
        }
    }

    raw = null;
    lines = null;
    if(state != "mappings"){
        console.log("ERROR: after parsing the state is not in mappings");
        return null;
    }

    for(var i = 0; i < samples.length; i ++){
        var sample = samples[i];

        var stacks = [];
        var stack = 2;

        //1   10000000: 248 249 165 171 250 11 251 3 4 5 6 7
        //desired output:
        //
        //dd;write;system_call_[k];sys_write_[k];vfs_write_[k];fsnotify_[k];__srcu_read_unlock_[k] 1
        
        for(var j = 2; j < sample.length; j ++){
            var symbolId = sample[j];
            if(locations[symbolId]){
                stacks.unshift(locations[symbolId]);
            } else {
                stacks.unshift("Unknown:" + symbolId);
            }
        }

        var line = stacks.join(";") + " " + sample[0];
        ret.push(line);
    }
    return ret.join('\n');
}

module.exports = ParseRaw;
