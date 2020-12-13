var editor;
var codeFn;

$(function(){
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/eclipse");
    editor.session.setMode("ace/mode/c_cpp");
    editor.setShowPrintMargin(false);	

    codeFn = initTestCode();

    var a = 12;
    var b = 10;

    console.log(codeFn());
    a = 1;
    console.log(codeFn());
});

function runCode(){
/*	var c = 0;
	var input = "";
	var output = "";
	var config = {
		stdio: {
			drain: function(){
				input=null;
				c++;
				return c.toString();
			},
			write: function(s) {
				output += s;
			}
		}
	};
	try{
		var exitCode = JSCPP.run("#include <iostream> using namespace std; " + editor.getValue(), input, config);
		$("#outBox").val(output + "\nprogram exited with code " + exitCode);
	} catch(error) {
		$("#outBox").val(error);
	}*/
}

function runCode2(){
	//var JSCPP = require('JSCPP');
	//var Runtime = JSCPP.Runtime;
/*	var inputbuffer = "1 2 3";
	var rt = new Runtime({
    stdio: {
        drain: function() {
            // This method will be called when program requires additional input
            // so you can return "1", "2" and "3" seperately during three calls.
            // Returning null value means EOF.
            var x = inputbuffer;
            inputbuffer = null;
            return x;
        },
        write: function(s) {
            process.stdout.write(s);
        }
	}
	});
	rt.config.includes.iostream.load(rt);
	var ast = JSCPP.ast;
	var tree = ast.parse(code);
	console.log('passed syntax check');*/
}

function setPWM(a){
    console.log("Set PWM called: " + a);
}

function initTestCode(){
    var a = 5;
    var b = 2;
    function fn(){
        a += b;
        setPWM(a+b);
        return localFn(a);
    };
    function localFn(x){
        return x*2;
    }
    return fn;
}