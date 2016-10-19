(function(){
	"use strict";
	/*jshint jquery: true */
	var execute = [];
	
	$(document).ready(function () {
		$(".keypad-btn").click(e => {
			onKeypadBtn($(e.target).attr("value"), execute);
			refreshDisplay();
		});
		
		$("#clear").click(clearDisplay);
		$("#delete").click(backspace);
		$("#execute").click(e => executeOps(execute));
		$("#instructionPanel").blur(formatInput);
	});
	
	function formatInput(){
		var executeStr = $("#instructionPanel").val();
		if(executeStr.match(/^[0-9][*/+-] /gi)){      
			console.error("UNACCEPTED CHARS IN INPUT: ");
			//TODO highlight error or flash red
		}else{
			var ops = executeStr.split("");
			var newExecute = [];

			ops.forEach(userChar => {
				onKeypadBtn(userChar, newExecute);
			});
			
			execute = newExecute;
			refreshDisplay();
		}
	}
	
	function onKeypadBtn(keyValue, opsList){
		if(keyValue.match(/[*/+-]/gi)){
			//i.e only let operator input if numbers previously
			if(opsList.length >= 1 && opsList[opsList.length - 1].match(/[0-9]/gi))
				opsList.push(keyValue);
		}else if(keyValue.match(/[0-9]/gi)){
			//Push as digit of existing num, if prev input != num then start a new number
			if(opsList.length >= 1 && opsList[opsList.length - 1].match(/[0-9]/gi))
				opsList[opsList.length - 1] += keyValue;
			else
				opsList.push(keyValue);
		}
	}
	
	function onKeyDown(e){
		var keyCode = parseInt(e.which);
		if(keyCode === 8)
			backspace();
		else
			onKeypadBtn(String.fromCharCode(keyCode));
	}
	
	function refreshDisplay(){
		var displayString = "";
		execute.forEach(elem => displayString += elem + " ");
		$("#instructionPanel").val(displayString);
	}
	
	function clearDisplay(){
		execute = [];
		$("#solutionPanel").val("");
		refreshDisplay();
	}
	
	function executeOps(){
		if(execute[execute.length - 1].match(/[*/+-]/gi))
			return 1;
		
		var sum = 0;
		
		if($("#solutionPanel").val() === ""){
			sum = Number(execute[0]);
			for(var i = 0; i < execute.length; i++){
				var elem = execute[i];
				
				//Reached next op, execute lastNum (lastOp) sum
				if(elem.match(/[*/+-]/gi) && i > 1){
					var lastOp = execute[i - 2];
					var lastNum = parseInt(execute[i - 1]);
					sum = conductOp(sum, lastOp, lastNum);
				}
			}
		}else{
			//Repeat last op + answer, like a calculator
			if(execute.length >= 3){
				sum = Number($("#solutionPanel").val());
			}
		}
		
		sum = conductOp(sum, execute[execute.length - 2], execute[execute.length - 1]);
		$("#solutionPanel").val(sum);
	}
	
	function conductOp(sum, operator, number){
		number = Number(number);
		
		switch(operator){
			case "+":
				sum += 	number;
				break;
			case "-":
				sum -= number;
				break;
			case "*":
				sum *= number;
				break;
			case "/":
				sum /= number;
				break;
			default:
				console.error("Unknown operator: " + operator);
				break;
		}
		
		return sum;
	}
	
	function backspace(){
		execute.pop();
		refreshDisplay();
	}
})();