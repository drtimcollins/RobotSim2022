
let black_threshold = 100;

function prC(z,n){
    return z.re.toFixed(n) + " " + z.im.toFixed(n);
}

class RobotCompiler{
	constructor(){
        this.isInit = false;
    }    
	init(par){
		// Find track Bounds
		let minmax = [par.track[0].x,par.track[0].y,par.track[0].x,par.track[0].y]; // [minx,miny,maxx,maxy]
		par.track.forEach(p => {
			if(p.x < minmax[0]) minmax[0] = p.x;
			if(p.y < minmax[1]) minmax[1] = p.y;
			if(p.x > minmax[2]) minmax[2] = p.x;
			if(p.y > minmax[3]) minmax[3] = p.y;
		});
		this.track = par.track;
		this.trackBounds = [new THREE.Vector2(minmax[0],minmax[1]), new THREE.Vector2(minmax[2],minmax[3])];
		console.log(this.trackBounds);
		this.bot = par.robot;
        this.sensorPos = [];
        for(var n = 0; n < this.bot.NumberOfSensors; n++) {
            this.sensorPos.push(new THREE.Vector3(this.bot.length, (n - (this.bot.NumberOfSensors-1.0)/2.0)*this.bot.SensorSpacing, 0));
        }		
        this.start = par.start;
        
        // Input format:
        // minmax0 mm1 mm2 mm3 NtrackPoints trackpoint_n_x trackpoint_n_y etc
        this.inString = minmax[0].toFixed(1) + " " + minmax[1].toFixed(1) + " " + minmax[2].toFixed(1) + " " + minmax[3].toFixed(1) + " " + par.track.length.toString();
        par.track.forEach(p =>{
            this.inString = this.inString + " " + p.x.toFixed(1) + " " + p.y.toFixed(1);
        })
		this.isInit = true;
	}

    exeCPP(callback){
        var cpp = this;
         $.get("scripts/RobotSrc.cpp", function (data){

            data = data.replace("#define DEFINES",
                "#define width " + cpp.bot.width.toString() 
                + "\n#define length " + cpp.bot.length.toString()
                + "\n#define NumberOfSensors " + cpp.bot.NumberOfSensors.toString()
                + "\n#define SensorSpacing " + cpp.bot.SensorSpacing.toString()
                + "\n#define XSTART " + (cpp.start.x-cpp.bot.length).toString()
                + "\n#define YSTART " + (cpp.start.y).toString());
            
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
                callback(data.Result);
            }).fail(function(data, err) {
                console.log("fail " + JSON.stringify(data) + " " + JSON.stringify(err));
            });
        });
    }
	exe(callback){
		this.speed 	=  new THREE.Vector2(0,0);
		let av 		=  new THREE.Vector2(0,0);
		let pose = {xy: math.Complex(this.start.x-this.bot.length,this.start.y), 
				    bearing: math.Complex(1), R: math.Complex(1), L: math.Complex(1), 
					an: new Array(this.bot.NumberOfSensors)};

        let recStr = "";
        for(var n = 0; n < 3000; n++){	// Assuming 50 fps (20ms delay)
			this.updateSensors(pose);
            this.RobotControl(pose);
            
            av.multiplyScalar(0.95).add(this.speed.clone().multiplyScalar(0.05));
			const vv = math.multiply(pose.bearing, (av.x+av.y)/2);        
			pose.bearing = math.multiply(pose.bearing, math.Complex.fromPolar(1, (av.x-av.y)/this.bot.width));
			pose.xy = math.add(pose.xy, vv);

			pose.R = math.multiply(pose.R, math.Complex.fromPolar(1, -av.y / 20.0));
            pose.L = math.multiply(pose.L, math.Complex.fromPolar(1, -av.x / 20.0));

            recStr = recStr + prC(pose.xy,1)+" "+prC(pose.bearing,3)+" "+prC(pose.L,3)+" "+prC(pose.R,3);
            for(var m = 0; m < this.bot.NumberOfSensors; m++)
                recStr = recStr + " " + ((pose.an[m] > 1000) ? "1" : "0");
            recStr = recStr + "\n";
		}
		callback(recStr);
    }
    Set_PWM(n, speed){
        if(n == 0)
            this.speed.x = speed / 100.0;
        else
            this.speed.y = speed / 100.0;
    }
	RobotControl(pose){
        if(pose.an[0] <= black_threshold && pose.an[1] > black_threshold)   // WHITE, BLACK
        {
            this.Set_PWM(0, 500);  // Motor 0 fast
            this.Set_PWM(1, 100);  // Motor 1 slow
        }
        else 
        if(pose.an[0] > black_threshold && pose.an[1] <= black_threshold)   // BLACK, WHITE
        {
            this.Set_PWM(0, 100);  // Motor 0 slow
            this.Set_PWM(1, 500);  // Motor 1 fast
        }
        else
        if(pose.an[0] > black_threshold && pose.an[1] > black_threshold)    // BLACK, BLACK
        {
            this.Set_PWM(0, 400);  // Motor 0 medium
            this.Set_PWM(1, 400);  // Motor 1 medium
        }    
      		
	}

	// Track detection functions
    updateSensors(pose){
        for(var n = 0; n < this.bot.NumberOfSensors; n++) {
            var sn = this.sensorPos[n].clone().applyAxisAngle(new THREE.Vector3(0,0,1),pose.bearing.toPolar().phi).add(new THREE.Vector3(pose.xy.re,pose.xy.im, 0));                                
            pose.an[n] = this.getSensorOutput(sn.x, sn.y);
          }        
    }	
	getSensorOutput(x, y){
        if(x < this.trackBounds[0].x || y < this.trackBounds[0].y || x > this.trackBounds[1].x || y > this.trackBounds[1].y)
            return 0;   
        else{
            const Nv = this.track.length;
            for(let n = 0; n < Nv/2; n++){
                if(this.isInQuad(x, y, n*2, n*2+1, (n*2+3)%Nv, (n*2+2)%Nv))
                    return 0xFFFFFF;
            }
            return 0;
        }
    }
    isInQuad(x, y, i0, i1, i2, i3){
        let d0 = this.signFn(x, y, this.track[i0], this.track[i1]);
        let d1 = this.signFn(x, y, this.track[i1], this.track[i2]);
        let d2 = this.signFn(x, y, this.track[i2], this.track[i3]);
        let d3 = this.signFn(x, y, this.track[i3], this.track[i0]);
        return (d0==d1 && d1==d2 & d2==d3);
    }
    signFn(x, y, p2, p3){
        return ((x-p3.x)*(p2.y-p3.y)-(p2.x-p3.x)*(y-p3.y) > 0) ? 1 : -1;
    }
}

export {RobotCompiler};