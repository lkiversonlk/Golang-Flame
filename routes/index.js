var express = require('express');
var router = express.Router();
var formidable = require("formidable");
var fs = require("fs");

var GetRaw = require("../server/go-pprof-webcaller");
var ParseRaw = require("../server/go-pprof-parser");
var Render = require("../server/go-pprof-render");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

function outputRaw(raw, res){
    var parsed = ParseRaw(raw);
    if(parsed == null){
        return res.render("index", {
            error : "数据格式不正确"
        });
    }
    Render(parsed, function(error, svg){
        if(error){
            return res.render("result", {
                error: error
            });
        } else {
            return res.render("result", {
                svg: svg,
                raw: raw
            });
        }
    });
}
router.post('/submit', function(req, res, next){
    var form = new formidable.IncomingForm();
    return form.parse(req, function(err, fields, files){
        if(err){
            console.log("ERROR: parsing request failure, " + err);
            return next(err);
        } else {
            //url was considered first, then files
            if(fields["url"]) {
                GetRaw(fields["url"], function(err, raw){
                    if(err){
                        return res.render("index", {
                            error : "url " + fields["url"] + " error: " + err.message
                        });
                    }else{
                        return outputRaw(raw, res);
                    }
                })
            } else if(files["file"]){
                var file = files["file"];
                fs.readFile(file.path, function(err, buffer){
                    if(err){
                        return next(err);
                    } else {
                        return outputRaw(buffer.toString(), res);
                    }
                });
            } else {
                return next(new Error("ERROR: Invalid request params, url or file at least"));
            }
        }
    });
});


module.exports = router;
