var editor;

$(function(){
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/eclipse");
    editor.session.setMode("ace/mode/c_cpp");
    editor.setShowPrintMargin(false);	
});

function runCode(){
	var input = "4321 1234";
	var output = "";
	var config = {
		stdio: {
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
	}
}

