import { MAXSENSORS } from './RobotSimulator.js';

class RobotCompiler{
	constructor(){
        this.isInit = false;
    }    
	init(par){
		// Find track Bounds
		let minmax = [par.track[0].x,par.track[0].y,par.track[0].x,par.track[0].y]; // [minx,miny,maxx,maxy]
        let startIndex = 0;
        let bestD2 = (par.track[0].x - par.start.x)*(par.track[0].x - par.start.x) + (par.track[0].y - par.start.y)*(par.track[0].y - par.start.y);
		par.track.forEach(p => {
			if(p.x < minmax[0]) minmax[0] = p.x;
			if(p.y < minmax[1]) minmax[1] = p.y;
			if(p.x > minmax[2]) minmax[2] = p.x;
			if(p.y > minmax[3]) minmax[3] = p.y;
            let d2 = (p.x - par.start.x)*(p.x - par.start.x) + (p.y - par.start.y)*(p.y - par.start.y);
            if(d2 < bestD2){
                startIndex = par.track.indexOf(p);
                bestD2 = d2;
            }
		});
		this.track = par.track;
		this.trackBounds = [new THREE.Vector2(minmax[0],minmax[1]), new THREE.Vector2(minmax[2],minmax[3])];
		console.log(this.trackBounds);
		this.bot = par.robot;	
        this.start = par.start;
        this.startIndex = startIndex;

        // Input format:
        // minmax0 mm1 mm2 mm3 NtrackPoints trackpoint_n_x trackpoint_n_y etc
        this.inString = minmax[0].toFixed(1) + " " + minmax[1].toFixed(1) + " " + minmax[2].toFixed(1) + " " + minmax[3].toFixed(1) + " " + par.track.length.toString();
        par.track.forEach(p =>{
            this.inString = this.inString + " " + p.x.toFixed(1) + " " + p.y.toFixed(1);
        })
		this.isInit = true;
    }
    
    updateParams(params){
        this.bot = params;      
    }

    exe(fn, callback){
        var cpp = this;
         $.get("scripts/RobotSrc.cpp", function (data){
            data = data.replace("#define DEFINES",
                "#define width " + cpp.bot.width.toString() 
                + "\n#define length " + cpp.bot.length.toString()
                + "\n#define NumberOfSensors " + cpp.bot.NumberOfSensors.toString()
                + "\n#define SensorSpacing " + cpp.bot.SensorSpacing.toString()
                + "\n#define XSTART " + (cpp.start.x-cpp.bot.length).toString()
                + "\n#define YSTART " + (cpp.start.y).toString()
                + "\n#define ISTART " + (cpp.startIndex).toString());
            data = data.replace("#define ROBOTCONTROLFUNCTION", fn);
            var to_compile = {
                "LanguageChoice": "7",  // 6 = C, 7 = C++
                "Program": data,
                "Input": cpp.inString,
                "CompilerArgs" : "source_file.cpp -o a.out"
            };
           $.ajax ({
                url: "https://rextester.com/rundotnet/api",
                type: "POST",
                data: to_compile
            }).done(function(data) {
                console.log("Success: " + data.Stats);
                callback(data);
            }).fail(function(data, err) {
                console.log("fail " + JSON.stringify(data) + " " + JSON.stringify(err));
            });
        });
    }
}

export {RobotCompiler};