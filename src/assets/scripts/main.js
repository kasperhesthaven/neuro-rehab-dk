// =============================================================================
// Global functions
// =============================================================================

'use strict';

// Check ready state
function ready(fn) {
	if (
		document.attachEvent
			? document.readyState === 'complete'
			: document.readyState !== 'loading'
	) {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

// Scrolling with ease-in-out
function smoothScrollTo(target, duration = 650) {
	const initY = window.pageYOffset;
	const targetY = target.offsetTop;
	const yDifference = Math.abs(initY - targetY);
	let start = null;

	function step(timestamp) {
		if (!start) start = timestamp;
		const progress = Math.min(1, (timestamp - start) / duration);
		const timing =
			progress < 0.5
				? 2 * progress * progress
				: -1 + (4 - 2 * progress) * progress;
		window.scrollTo(0, timing * yDifference + initY);
		if (progress < 1) {
			window.requestAnimationFrame(step);
		}
	}
	window.requestAnimationFrame(step);
}

// Google map
var map;
function initMap(mapContainer) {
	map = new google.maps.Map(mapContainer, {
		panControl: true,
		rotateControl: false,
		scaleControl: false,
		scrollwheel: false,
		streetViewControl: false,
		zoomControl: true,
		mapTypeControl: false,
		draggable: true,
		center: {lat: 57.043245, lng: 9.911282},
		zoom: 15
	});

	var image = '../assets/images/icons/google-marker.png';
	var contentString = '<p><strong>Neurorehab</strong></p>' + '<p>Godsbanen 16</p>' + '<p>9000 Aalborg</p><br>' + '<a href="https://goo.gl/maps/DCiWLz6bbrw" target="_blank">Rutevejledning</a>';
	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});

	var marker = new google.maps.Marker({
		position:{lat: 57.041988, lng: 9.923712},
		map: map,
		icon: image
	});

	marker.addListener('click', function() {
		infowindow.open(map, marker);
	});
}

function polyfills() {
	// Matches()
	if (!Element.prototype.matches) {
		Element.prototype.matches =
			Element.prototype.matchesSelector ||
			Element.prototype.mozMatchesSelector ||
			Element.prototype.msMatchesSelector ||
			Element.prototype.oMatchesSelector ||
			Element.prototype.webkitMatchesSelector ||
			function(s) {
				var matches = (this.document || this.ownerDocument).querySelectorAll(s);
				var i = matches.length;
				while (--i >= 0 && matches.item(i) !== this) {}
				return i > -1;
			};
		console.log("Matches() polyfilled.");
	}
	// Closest()
	if (!Element.prototype.closest) {
		Element.prototype.closest = function(s) {
			var el = this;
			if (!document.documentElement.contains(el)) return null;
			do {
 				if (el.matches(s)) return el;
				el = el.parentElement || el.parentNode;
			} while (el !== null && el.nodeType === 1);
			return null;
		};
		console.log("Closest() polyfilled.");
	}
}


// ==========================================================================
// Initialize
// ==========================================================================

console.log("File loaded.");

function initialize() {
	console.log("JavaScript loaded and initialized.");
	polyfills();

	// WoW init
	setTimeout(() => {
		if (~document.body.className.indexOf('preload')) document.body.classList.remove('preload');
	}, 325);
	new WOW().init();

	// Contact page
	var contactMapContainer = document.getElementsByClassName('contact-map__map-container');
	if (contactMapContainer.length !== 0) {
		initMap(contactMapContainer[0]);
	}

	// Hero scroll button
	var heroScrollBtns = document.getElementsByClassName("scroll-btn");
	if (heroScrollBtns.length !== 0) {
		heroScrollBtns[0].addEventListener('click', function() {
			smoothScrollTo(heroScrollBtns[0].closest('section').nextElementSibling);
		})
	}

	// Expandable lists
	var expandableLists = document.getElementsByClassName("expandable-list");
	if (expandableLists.length !== 0) {
		function listItemEventListener(listItem) {
			listItem.addEventListener('click', function() {
				listItem.classList.toggle('js-active');
			})
		}

		for (var i = 0; i < expandableLists.length; ++i) {
			var listItems = expandableLists[i].getElementsByClassName('expandable-list__item');
			for (var i = 0; i < listItems.length; ++i) {
				listItemEventListener(listItems[i]);
			}
		}
	}

	// FAQ
	var faqLists = document.getElementsByClassName("faq-list");
	if (faqLists.length !== 0) {
		function listItemEventListener(listItem) {
			listItem.addEventListener('click', function(e) {
				// Don't close FAQs on content to allow selecting
				if (!e.target.classList.contains('faq-list__item-content')) {
					listItem.classList.toggle('js-active');
				};
			})
		}

		for (var i = 0; i < faqLists.length; ++i) {
			var listItems = faqLists[i].getElementsByClassName('faq-list__item');
			for (var i = 0; i < listItems.length; ++i) {
				listItemEventListener(listItems[i]);
			}
		}
	}

	// Mobile navigation
	const navigationContainer = document.getElementById('topNavigationContainer');
	var burgerBtn = document.getElementById('burgerToggle');
	if (burgerBtn !== null) {
		burgerBtn.addEventListener('click', function() {
			navigationContainer.classList.toggle('js-active');
			burgerBtn.classList.toggle('js-active');
		})
	}
	var submenuContainers = document.getElementsByClassName('navigation-list__item--submenu');
	function submenuEventListener(submenu) {
		submenu.addEventListener('click', function(e) {
			if (!submenu.classList.contains('js-active') && topNavigationContainer.classList.contains('js-active')) {
				e.preventDefault();
			}
			submenu.classList.toggle('js-active');
		})
	}
	if (submenuContainers.length !== 0) {
		for (var i = 0; i < submenuContainers.length; ++i) {
			submenuEventListener(submenuContainers[i]);
		}
	}

	// Navigation reveal
	const heroSection = document.getElementsByClassName('hero');

	// Gets ClientRect bottom if object, else assumes it's integer
	function isBelow(target) {
		if (target.nodeType === 1) {
			return (
				target.getBoundingClientRect().bottom -
					navigationContainer.scrollHeight < 0
			);
		}
		return target - navigationContainer.scrollHeight < 0;
	}

	if (navigationContainer !== null) {
		let lastScrollPos = 0;
		let currentScrollPos = 0;
		let tick;
		let scrolledByElm = 0;

		// If page has hero use instead of 0
		if (heroSection[0] !== undefined) {
			scrolledByElm = heroSection[0];
		}

		function navigationReveal(currentScroll) {
			if (lastScrollPos < currentScroll) {
				if (~navigationContainer.className.indexOf('js-active')) { navigationContainer.classList.remove('js-active'); }
				lastScrollPos = currentScroll;
			} else {
				if (isBelow(scrolledByElm)) {
					if (!~navigationContainer.className.indexOf('js-active')) { navigationContainer.classList.add('js-active'); }
				}
				lastScrollPos = currentScroll;
			}
		}

		if (window.matchMedia("(min-width: 1024px)").matches) {
			window.addEventListener('scroll', () => {
				currentScrollPos = window.scrollY;
				if (!tick) {
					window.requestAnimationFrame(() => {
						navigationReveal(currentScrollPos);
						tick = false;
					});
					tick = true;
				}
			});
		}
	}
}

ready(initialize);
