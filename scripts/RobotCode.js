var editor;

$(function(){
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/eclipse");
    editor.session.setMode("ace/mode/c_cpp");
    editor.setShowPrintMargin(false);	
});

function runCode(){
	var c = 0;
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
	}
}

function runCode2(){
	var to_compile = {
		"LanguageChoice": "7",  // 6 = C, 7 = C++
		"Program": "#include <iostream>\n using namespace std;\n" + editor.getValue(),
		"Input": "3 1 4 1",
		"CompilerArgs" : "source_file.cpp -o a.out"
	};

	$.ajax ({
			url: "https://rextester.com/rundotnet/api",
			type: "POST",
			data: to_compile
		}).done(function(data) {
			$("#outBox").val("Success: " + data.Stats + "\n\n" + data.Result);
			//$("#outBox").val(JSON.stringify(data));
		}).fail(function(data, err) {
			$("#outBox").val("fail " + JSON.stringify(data) + " " + JSON.stringify(err));
		});
}



