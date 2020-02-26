'use strict';
const  DELAY_START = 1000*10;
const  DELAY_RECONNECT = 1000*2;
var button = document.getElementById('healButton');
var timeGo;
var allStrings;
var idTimeoutMatrix;
var idTimeoutBackInStart;
var idTimeoutBackInDisconnect; 
var engine = 'on';  

var startState = {
	start:function() {
		timeGo = undefined;
		allStrings = undefined;
		button.addEventListener('click', goAnalisys);
		$('#matrixBlock').css('display', 'block'); 
		$('#pRunningText').html(''); 
		$('#barStart').css('display', 'block'); 
		$('#healButton').addClass('healButtonStart');
		$('#healButton').text('лечить');
		$('#bodyImg').attr('src','img/human_start.jpg');
		$('#barAnalysis').css('display', 'none'); 
		$('#pRunningText').height('auto');
		$('#pRunningText').html('');
	},
	exit:function() {
		button.removeEventListener('click', goAnalisys);
		$('#barStart').css('display', 'none');
		$('#healButton').removeClass('healButtonStart');
		$('#pRunningText').perfectScrollbar('destroy');
		$('#bodyImg').attr('src','');
	}
};

var analisysState = {
	start:function() {
		idTimeoutMatrix=setTimeout(requestAnimationFrame, 500, reqId);
		timeGo = Date.now();
		button.addEventListener('click', goInterrupt);
		progressbar();
		$('#barAnalysis').css('display', 'block'); 
		$('#bar').addClass('barGo');
		$('#healButton').addClass('healButtonAnalisys');
		$('#healButton').text('прервать процесс');
		$('#bodyImg').attr('src','img/human_spin.gif');
	},
	exit:function() {
		button.removeEventListener('click', goInterrupt);
		clearTimeout(idTimeoutMatrix);
		$('#healButton').removeClass('healButtonAnalisys');
	}
};

var resultState = {
	start:function() {
		$('#pRunningText').html(allStrings);
		$('#healButton').addClass('healButtonDisabled');
		$('#healButton').attr('disabled', 'disabled');
		$('#healButton').text('готово');
		$('#bodyImg').attr('src','img/humam_result.jpg');
		$('#pRunningText').scrollTop(document.getElementById('pRunningText').scrollHeight);
		$('#pRunningText').perfectScrollbar('update');
		idTimeoutBackInStart = setTimeout(goStart,  DELAY_START);
	},
	exit:function() {
		clearTimeout(idTimeoutBackInStart);
		$('#healButton').removeClass('healButtonDisabled');
		$('#healButton').removeAttr('disabled');
		$('#bar').removeClass('barGo'); 
	}
};

var interruptState = {
	start:function() {
		timeGo = undefined; 
		idTimeoutBackInStart = setTimeout(goStart, DELAY_START);
		$('#pRunningText').html(allStrings);
		$('#bar').removeClass('barGo');
		$('#healButton').addClass('healButtonDisabled');
		$('#healButton').text('процесс не завершен');
		$('#bodyImg').attr('src','img/humam_result.jpg');
	},
	exit:function() {
		clearTimeout(idTimeoutBackInStart);
		$('#healButton').removeClass('healButtonDisabled');
	}
};

var disconnectState = {
	start:function() {
		timeGo = undefined; 
		$('#pRunningText').html(''); 
		$('#matrixBlock').css('display', 'none');
		$('#forErrorScreen').css('display', 'flex');
		$('#errorScreen').css('display', 'flex');
		$('#barStart').css('display', 'block'); 
		$('#bar').removeClass('barGo');
		$('#pb').addClass('barError');
		$('#barAnalysis').css('display', 'none');
		$('#healButton').addClass('healButtonDisabled');
		$('#healButton').addClass('disconnect');
		$('#healButton').text('восстановить связь с капсулой');
		$('#bodyImg').addClass('barError');
		$('#bodyImg').attr('src','img/human_start.jpg');
		if (engine == 'on') {
			button.addEventListener('click', goConnect);	
		}
		else {
			button.addEventListener('click', goError);
		}
	},
	exit:function() {
		button.removeEventListener('click', goConnect);
		button.removeEventListener('click', goError);
		$('#healButton').removeClass('healButtonDisabled');
		$('#healButton').removeAttr('disabled');
		$('#forErrorScreen').css('display', 'none');
		$('#pb, #bodyImg').removeClass('barError');	
		$('#healButton').removeClass('disconnect');
	}
};

var errorState = {
	start:function() {
		allStrings = undefined;
		idTimeoutBackInDisconnect = setTimeout(goDisconnect, DELAY_RECONNECT); 
		$('#matrixBlock').css('display', 'none');
		$('#pb').addClass('barError');
		$('#healButton').text('повторите попытку позже');
		$('#healButton').addClass('healButtonDisabled');
		$('#bodyImg').addClass('barError');
		$('#forErrorScreen').css('display', 'flex');
		$('#errorScreen').css('display', 'none');
		$('#connectScreen').css('display', 'flex');
		$('#connectScreen').addClass('noConnect');
		$('#connectScreen').text('оборудование не подключено');
	},
	exit:function() {
		clearTimeout(idTimeoutBackInDisconnect);
		$('#pb').removeClass('barError');
		$('#healButton').removeClass('healButtonDisabled');
		$('#bodyImg').removeClass('barError');
		$('#connectScreen').css('display', 'none');
		$('#connectScreen').removeClass('noConnect');
		$('#connectScreen').text('');
	}
};

var connectState = {
	start:function() {
		allStrings = undefined;
		idTimeoutBackInStart = setTimeout(goStart, DELAY_RECONNECT); 
		$('#healButton').text('подготовка к работе...');
		$('#healButton').addClass('healButtonDisabled');
		$('#forErrorScreen').css('display', 'flex');
		$('#errorScreen').css('display', 'none');
		$('#connectScreen').css('display', 'flex');
		$('#connectScreen').text('оборудование подключено');

	},
	exit:function() {
		clearTimeout(idTimeoutBackInStart);
		$('#forErrorScreen').css('display', 'none');
		$('#forErrorScreen').removeClass('connect');
		$('#healButton').removeClass('healButtonDisabled');
		$('#forErrorScreen').css('display', 'none');
		$('#errorScreen').css('display', 'flex');
		$('#connectScreen').css('display', 'none');
	}
};

var matrix = textRunning();
function textRunning() {  
	var txt = text; 
	var lineNumber = 0; 
	var currentItem = 0; 
	var paragraph = document.getElementById('pRunningText');
	var lineText = paragraph.innerHTML; 

	return function() {
		if (paragraph.innerHTML.length==0) {
			lineText='';
			lineNumber++;
		} 
		if (lineNumber>=txt.length) { lineNumber=0; } 
		if (lineNumber<txt.length) {
			if (currentItem > txt[lineNumber].length) {
				currentItem = 0;
				lineText=paragraph.innerHTML+'<br>';
				allStrings=lineText;
				lineNumber++; 
			}
			else { 
			paragraph.innerHTML = lineText + txt[lineNumber].substring(0, currentItem);
			allStrings = lineText + txt[lineNumber].substring(0, txt[lineNumber].length);
			}
		}
		currentItem++; 
	}
} 
 
var reqId = animationRunningText();  
function animationRunningText() { 
	var tact=0;
	var property = {tact:0, interval:1, action:matrix};
	var duration;
	var elapsedTime;

	bar.addEventListener('animationend', eT);
	function eT(event) {
		elapsedTime = event.elapsedTime;
	}

	return function() {
		duration = Date.now()-timeGo;
		$('#bar').css('marginLeft', Number.parseInt($('#bar').css('marginLeft'))+'px');

		if ((duration >=elapsedTime) || (isNaN(duration))) { 
			cancelAnimationFrame(reqId);
			elapsedTime = undefined;  
			property['tact']=0;
		} 
		else { 
			tact=Math.floor(duration/property['interval']); 
			if (property['tact']!=tact) { 
				property['tact']=tact; 
				property['action'](); 
				
				$('#pRunningText').height('auto'); 
				if ($('#pRunningText').height() > $('#wrapper').height()) {
					$('#pRunningText').height($('#wrapper').height());
					$('#pRunningText').perfectScrollbar(); 
				} 

				$('#pRunningText').scrollTop(document.getElementById('pRunningText').scrollHeight);
				$('#pRunningText').perfectScrollbar('update');  	
			}
			requestAnimationFrame(reqId); 
		}
	}
}

var stateManager = {
	cur_state:undefined, 
	setCurState:function(state) { 
		if(state===this.cur_state) { 
		return; 
	}
	if(this.cur_state) { 
			this.cur_state.exit(); 
	}
	this.cur_state=state; 
	this.cur_state.start(); 
	}
}

function goStart() {
	stateManager.setCurState(startState); 
} 
function goAnalisys() {
	stateManager.setCurState(analisysState);
}
function goInterrupt() {
	stateManager.setCurState(interruptState);
}
function goDisconnect() {
	stateManager.setCurState(disconnectState);
}
function goError() {
	stateManager.setCurState(errorState);
}
function goConnect() {
	stateManager.setCurState(connectState);
}


function progressbar() {
	var bar = document.getElementById('bar');
	bar.addEventListener('animationend', animationEnd); 
	function animationEnd(ev) {
		stateManager.setCurState(resultState);
	}
}


$(document).ready(function() { 
	$(window).resize(function() { 
		$('#pRunningText').height('auto'); 
		$('#pRunningText').perfectScrollbar('destroy'); 
		if ($('#pRunningText').height() > $('#wrapper').height()) { 
			$('#pRunningText').height($('#wrapper').height());
			$('#pRunningText').perfectScrollbar(); 
		}
	}); 

	if (engine=='on')	stateManager.setCurState(startState);
	else stateManager.setCurState(disconnectState);

	$('#equipment').click(handler); 
	$('#pRunningText').perfectScrollbar();  
});

function handler(event) {
	var title = $('#equipment');

	if(engine == 'on') { 
		engine = 'off';
		title.attr('data-title', 'Отключено');
		stateManager.setCurState(disconnectState);
	}
	else { 
		engine = 'on';
		title.attr('data-title', 'Подключено');
		stateManager.setCurState(errorState);
		stateManager.setCurState(disconnectState);
	}
}