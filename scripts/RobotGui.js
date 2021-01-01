const guiAR = 6.0;
const skewFactor = 10.0;
const onCol = '#001020';
const offCol = '#E0E0FF';
const segDec = [[1,1,1,1,1,1,0],[0,1,1,0,0,0,0],[1,1,0,1,1,0,1],[1,1,1,1,0,0,1],[0,1,1,0,0,1,1],[1,0,1,1,0,1,1]
                ,[1,0,1,1,1,1,1],[1,1,1,0,0,0,0],[1,1,1,1,1,1,1],[1,1,1,1,0,1,1]];
class RobotGui{
    constructor(){
        this.two = new Two({width:500,height:500/guiAR}).appendTo(document.getElementById('guiWin'));
    
        this.rect = this.two.makeRectangle(400,40,100,40);
        this.rect.fill = '#110011';
        //this.text = new Two.Text("0123456789 message", 250, 7);
        this.two.add(this.text); 
        this.timers = [new Digits(100,10,8, this.two), new Digits(100,30,8, this.two)];
        this.two.update();
        this.rect._renderer.elem.addEventListener('click',function(){console.log("Rect was clicked!");},false);
        this.two.play();       
    }
    
    resize(newWidth){
        if(this.two != null){
            this.two.height = newWidth/guiAR;
            this.two.width = newWidth;
            this.two.scene.scale = newWidth/500;
            this.two.update();
        }    
    }
}

class Digits extends Two.Group{
    constructor(x, y, h, two){
        super();
        this.digits = [new Digit(-h*4.9, 0, h, two), new Digit(-h*3.1, 0, h, two),
                       new Digit(-h*.9, 0, h, two), new Digit(h*.9, 0, h, two), 
                       new Digit(h*3.1, 0, h, two), new Digit(h*4.9, 0, h, two),
                       new Digit(h*2, 0, h, two, true), new Digit(-h*2, 0, h, two, true)];
        this.digits.forEach(el =>{this.add(el);});
        this.translation.x = x;
        this.translation.y = y;
        two.add(this);
        for(var n = 0; n < 6; n++){
            this.digits[n].setNum(0);
        }
    }
    setTime(ms){
        var z = Math.floor(ms/10);
        for(var n = 0; n < 6; n++){
            let d = (n==3) ? 6 : 10;
            let z1 = Math.floor(z/d);
            this.digits[5-n].setNum(z - z1*d);
            z = z1;
        }
    }
}
class Digit extends Two.Group{
    constructor(x, y, h, two, isSep=false){
        super();
        if(isSep){
            this.segs = [two.makeCircle(-0.4 / skewFactor, 0.4, 0.15), two.makeCircle(0.4 / skewFactor, -0.4, 0.15)];
            this.segs.forEach(el => {
                this.add(el);            
                this.fill = onCol;         
            });  
        } else {
        this.segs = [two.makePath(-0.6,-0.9, -0.5,-1, 0.5,-1, 0.6,-0.9, 0.5,-0.8, -0.5,-0.8, true),
            two.makePath(0.6,-0.9, 0.7,-0.8, 0.7,0, 0.6,0, 0.5,-0.1, 0.5,-0.8, true),
            two.makePath(0.6,0.9, 0.7,0.8, 0.7,0, 0.6,0, 0.5,0.1, 0.5,0.8, true),
            two.makePath(-0.6,0.9, -0.5,1, 0.5,1, 0.6,0.9, 0.5,0.8, -0.5,0.8, true),
            two.makePath(-0.6,0.9, -0.7,0.8, -0.7,0, -0.6,0, -0.5,0.1, -0.5,0.8, true),
            two.makePath(-0.6,-0.9, -0.7,-0.8, -0.7,0, -0.6,0, -0.5,-0.1, -0.5,-0.8, true),
            two.makePath(-0.6,0, -0.5,.1, 0.5,.1, 0.6,0, 0.5,-0.1, -0.5,-0.1, true)];
            this.segs.forEach(el => {
                this.skew(el);
                this.add(el);   
//                this.fill = '#AA00AA';         
            });  
        }

        this.translation.x = x;
        this.translation.y = y;
        this.scale = h;
        
        this.noStroke();
        two.add(this);
    }
    skew(el){
        el._collection.forEach(element => {
            element.x *= 0.9;
            element.y *= 0.9;
            element.x -= (element.y + el._translation.y) / skewFactor;    
        });
    }
    setNum(z){
        for(var n = 0; n < 7; n++){
            this.segs[n].fill = (segDec[z][n]==1) ? onCol : offCol;
        }
    }
}

export { RobotGui }; 