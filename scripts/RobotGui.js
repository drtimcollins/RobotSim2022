const guiAR = 6.0;
const skewFactor = 10.0;
const onCol = '#003040';
const offCol = '#BBDDFF';

class RobotGui{
    constructor(){
        this.two = new Two({width:500,height:500/guiAR}).appendTo(document.getElementById('guiWin'));
    
        var circle = this.two.makeCircle(20, 20, 13);    
        circle.fill = '#00AAAA';
        circle.stroke = 'orangered'; // Accepts all valid css color
        circle.linewidth = 1;
        this.rect = this.two.makeRectangle(400,40,100,40);
        this.rect.fill = '#110011';
        this.text = new Two.Text("0123456789 message", 250, 7);
        this.two.add(this.text); 
        this.digit = new Digits(100,30,10, this.two);
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
            var z1 = Math.floor(z/10);
            this.digits[5-n].setNum(z - z1*10);
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
            element.x *= 0.95;
            element.y *= 0.95;
            element.x -= (element.y + el._translation.y) / skewFactor;    
        });
    }
    setNum(z){
        const segDec = [[1,1,1,1,1,1,0],[0,1,1,0,0,0,0],[1,1,0,1,1,0,1],[1,1,1,1,0,0,1],[0,1,1,0,0,1,1],[1,0,1,1,0,1,1]
        ,[1,0,1,1,1,1,1],[1,1,1,0,0,0,0],[1,1,1,1,1,1,1],[1,1,1,1,0,1,1]];
        for(var n = 0; n < 7; n++){
            this.segs[n].fill = (segDec[z][n]==1) ? onCol : offCol;
        }
    }
}



export { RobotGui }; 