function evalSupport() {
	try {
		('use strict');
		// 'class' statement is available
		eval('class Something {}');
		// Arrow functions are available
		eval('var f = x => 1');
		// 'let' statement is available
		eval('let a = 1');
		// 'const' statement is available
		eval('const a = 1');
		// 'Promise' is available
		typeof Promise !== 'undefined';
		return true;
	} catch (err) {
		return false;
	}
}

window.addEventListener('load', supportState, false);
function supportState() {
	var s = document.createElement('script');
	s.setAttribute('async', 'true');
	if (evalSupport()) {
		// Browser supports everything
		s.src = 'assets/scripts/main.es6.min.js';
		document.body.appendChild(s);
	} else {
		// Browser doesn't support everything
		s.src = 'assets/scripts/main.es5.min.js';
		document.body.appendChild(s);
	}
}
