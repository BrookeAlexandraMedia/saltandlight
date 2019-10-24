/**
 * Global variables
 */
"use strict";

var userAgent = navigator.userAgent.toLowerCase(),
	initialDate = new Date(),

	$document = $(document),
	$window = $(window),
	$html = $("html"),

	isDesktop = $html.hasClass("desktop"),
	isIE = userAgent.indexOf("msie") != -1 ? parseInt(userAgent.split("msie")[1]) : userAgent.indexOf("trident") != -1 ? 11 : userAgent.indexOf("edge") != -1 ? 12 : false,
	isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
	windowReady = false,
	isNoviBuilder = false,
	isTouch = "ontouchstart" in window,

	plugins = {
		pointerEvents: isIE < 11 ? "js/pointer-events.min.js" : false,
		bootstrapTabs: $(".tabs"),
		responsiveTabs: $(".responsive-tabs"),
		maps: $(".google-map-container"),
		rdInputLabel: $(".form-label"),
		rdNavbar: $(".rd-navbar"),
		materialParallax: $(".parallax-container"),
		filePicker: $('.rd-file-picker'),
		fileDrop: $('.rd-file-drop'),
		regula: $("[data-constraints]"),
		radio: $("input[type='radio']"),
		checkbox: $("input[type='checkbox']"),
		toggles: $(".toggle-custom"),
		owl: $(".owl-carousel"),
		swiper: $(".swiper-slider"),
		customToggle: $("[data-custom-toggle]"),
		selectFilter: $("select"),
		pageLoader: $(".page-loader"),
		search: $(".rd-search"),
		searchResults: $('.rd-search-results'),
		rdMailForm: $(".rd-mailform"),
		homeHeadingsCustom: $('.home-headings-custom'),
		viewAnimate: $('.view-animate'),
		lightGallery: $( '[data-lightgallery="group"]' ),
		lightGalleryItem: $( '[data-lightgallery="item"]' ),
		lightDynamicGalleryItem: $( '[data-lightgallery="dynamic"]' ),
		counter: document.querySelectorAll( '.counter' ),
		progressLinear: document.querySelectorAll( '.progress-linear' ),
		videBG: $('.bg-vide'),
		preloader: $( '.preloader' )
	};

/**
 * @desc Check the element was been scrolled into the view
 * @param {object} elem - jQuery object
 * @return {boolean}
 */
function isScrolledIntoView ( elem ) {
	if ( isNoviBuilder ) return true;
	return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
}

/**
 * @desc Calls a function when element has been scrolled into the view
 * @param {object} element - jQuery object
 * @param {function} func - init function
 */
function lazyInit( element, func ) {
	var scrollHandler = function () {
		if ( ( !element.hasClass( 'lazy-loaded' ) && ( isScrolledIntoView( element ) ) ) ) {
			func.call();
			element.addClass( 'lazy-loaded' );
		}
	};

	scrollHandler();
	$window.on( 'scroll', scrollHandler );
}

// Initialize scripts that require a loaded window
$window.on('load', function () {
	if (plugins.preloader.length && !isNoviBuilder) {
		pageTransition({
			target: document.querySelector( '.page' ),
			delay: 0,
			duration: 500,
			classIn: 'fadeIn',
			classOut: 'fadeOut',
			classActive: 'animated',
			conditions: function (event, link) {
				return link && !/(\#|javascript:void\(0\)|callto:|tel:|mailto:|:\/\/)/.test(link) && !event.currentTarget.hasAttribute('data-lightgallery');
			},
			onTransitionStart: function ( options ) {
				setTimeout( function () {
					plugins.preloader.removeClass('loaded');
				}, options.duration * .75 );
			},
			onReady: function () {
				plugins.preloader.addClass('loaded');
				windowReady = true;
			}
		});
	}

	// Counter
	if ( plugins.counter ) {
		for ( var i = 0; i < plugins.counter.length; i++ ) {
			var
				node = plugins.counter[i],
				counter = aCounter({
					node: node,
					duration: node.getAttribute( 'data-duration' ) || 1000
				}),
				scrollHandler = (function() {
					if ( Util.inViewport( this ) && !this.classList.contains( 'animated-first' ) ) {
						this.counter.run();
						this.classList.add( 'animated-first' );
					}
				}).bind( node ),
				blurHandler = (function() {
					this.counter.params.to = parseInt( this.textContent, 10 );
					this.counter.run();
				}).bind( node );

			scrollHandler();
			window.addEventListener( 'scroll', scrollHandler );
			node.addEventListener( 'blur', blurHandler );
		}
	}
});

$document.ready(function () {
	var isNoviBuilder = window.xMode;

	/**
	 * @desc Calculate the height of swiper slider basing on data attr
	 * @param {object} object - slider jQuery object
	 * @param {string} attr - attribute name
	 * @return {number} slider height
	 */
	function getSwiperHeight(object, attr) {
		var val = object.attr("data-" + attr),
			dim;

		if (!val) {
			return undefined;
		}

		dim = val.match(/(px)|(%)|(vh)|(vw)$/i);

		if (dim.length) {
			switch (dim[0]) {
				case "px":
					return parseFloat(val);
				case "vh":
					return $window.height() * (parseFloat(val) / 100);
				case "vw":
					return $window.width() * (parseFloat(val) / 100);
				case "%":
					return object.width() * (parseFloat(val) / 100);
			}
		} else {
			return undefined;
		}
	}

	/**
	 * @desc Toggle swiper videos on active slides
	 * @param {object} swiper - swiper slider
	 */
	function toggleSwiperInnerVideos(swiper) {
		var prevSlide = $(swiper.slides[swiper.previousIndex]),
			nextSlide = $(swiper.slides[swiper.activeIndex]),
			videos,
			videoItems = prevSlide.find("video");

		for (var i = 0; i < videoItems.length; i++) {
			videoItems[i].pause();
		}

		videos = nextSlide.find("video");
		if (videos.length) {
			videos.get(0).play();
		}
	}

	/**
	 * @desc Toggle swiper animations on active slides
	 * @param {object} swiper - swiper slider
	 */
	function toggleSwiperCaptionAnimation(swiper) {
		var prevSlide = $(swiper.container).find("[data-caption-animate]"),
			nextSlide = $(swiper.slides[swiper.activeIndex]).find("[data-caption-animate]"),
			delay,
			duration,
			nextSlideItem,
			prevSlideItem;

		for (var i = 0; i < prevSlide.length; i++) {
			prevSlideItem = $(prevSlide[i]);

			prevSlideItem.removeClass("animated")
				.removeClass(prevSlideItem.attr("data-caption-animate"))
				.addClass("not-animated");
		}


		var tempFunction = function (nextSlideItem, duration) {
			return function () {
				nextSlideItem
					.removeClass("not-animated")
					.addClass(nextSlideItem.attr("data-caption-animate"))
					.addClass("animated");
				if (duration) {
					nextSlideItem.css('animation-duration', duration + 'ms');
				}
			};
		};

		for (var i = 0; i < nextSlide.length; i++) {
			nextSlideItem = $(nextSlide[i]);
			delay = nextSlideItem.attr("data-caption-delay");
			duration = nextSlideItem.attr('data-caption-duration');
			if (!isNoviBuilder) {
				if (delay) {
					setTimeout(tempFunction(nextSlideItem, duration), parseInt(delay, 10));
				} else {
					tempFunction(nextSlideItem, duration);
				}

			} else {
				nextSlideItem.removeClass("not-animated")
			}
		}
	}

	/**
	 * @desc Initialize the gallery with set of images
	 * @param {object} itemsToInit - jQuery object
	 * @param {string} [addClass] - additional gallery class
	 */
	function initLightGallery ( itemsToInit, addClass ) {
		if ( !isNoviBuilder ) {
			$( itemsToInit ).lightGallery( {
				thumbnail: $( itemsToInit ).attr( "data-lg-thumbnail" ) !== "false",
				selector: "[data-lightgallery='item']",
				autoplay: $( itemsToInit ).attr( "data-lg-autoplay" ) === "true",
				pause: parseInt( $( itemsToInit ).attr( "data-lg-autoplay-delay" ) ) || 5000,
				addClass: addClass,
				mode: $( itemsToInit ).attr( "data-lg-animation" ) || "lg-slide",
				loop: $( itemsToInit ).attr( "data-lg-loop" ) !== "false"
			} );
		}
	}

	/**
	 * @desc Initialize the gallery with dynamic addition of images
	 * @param {object} itemsToInit - jQuery object
	 * @param {string} [addClass] - additional gallery class
	 */
	function initDynamicLightGallery ( itemsToInit, addClass ) {
		if ( !isNoviBuilder ) {
			$( itemsToInit ).on( "click", function () {
				$( itemsToInit ).lightGallery( {
					thumbnail: $( itemsToInit ).attr( "data-lg-thumbnail" ) !== "false",
					selector: "[data-lightgallery='item']",
					autoplay: $( itemsToInit ).attr( "data-lg-autoplay" ) === "true",
					pause: parseInt( $( itemsToInit ).attr( "data-lg-autoplay-delay" ) ) || 5000,
					addClass: addClass,
					mode: $( itemsToInit ).attr( "data-lg-animation" ) || "lg-slide",
					loop: $( itemsToInit ).attr( "data-lg-loop" ) !== "false",
					dynamic: true,
					dynamicEl: JSON.parse( $( itemsToInit ).attr( "data-lg-dynamic-elements" ) ) || []
				} );
			} );
		}
	}

	/**
	 * @desc Initialize the gallery with one image
	 * @param {object} itemToInit - jQuery object
	 * @param {string} [addClass] - additional gallery class
	 */
	function initLightGalleryItem ( itemToInit, addClass ) {
		if ( !isNoviBuilder ) {
			$( itemToInit ).lightGallery( {
				selector: "this",
				addClass: addClass,
				counter: false,
				youtubePlayerParams: {
					modestbranding: 1,
					showinfo: 0,
					rel: 0,
					controls: 0
				},
				vimeoPlayerParams: {
					byline: 0,
					portrait: 0
				}
			} );
		}
	}

	/**
	 * Live Search
	 * @description  create live search results
	 */
	function liveSearch(options) {
		$('#' + options.live).removeClass('cleared').html();
		options.current++;
		options.spin.addClass('loading');
		$.get(handler, {
			s: decodeURI(options.term),
			liveSearch: options.live,
			dataType: "html",
			liveCount: options.liveCount,
			filter: options.filter,
			template: options.template
		}, function (data) {
			options.processed++;
			var live = $('#' + options.live);
			if (options.processed == options.current && !live.hasClass('cleared')) {
				live.find('> #search-results').removeClass('active');
				live.html(data);
				setTimeout(function () {
					live.find('> #search-results').addClass('active');
				}, 50);
			}
			options.spin.parents('.rd-search').find('.input-group-addon').removeClass('loading');
		})
	}

	/**
	 * attachFormValidator
	 * @description  attach form validation to elements
	 */
	function attachFormValidator(elements) {
		for (var i = 0; i < elements.length; i++) {
			var o = $(elements[i]), v;
			o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
			v = o.parent().find(".form-validation");
			if (v.is(":last-child")) {
				o.addClass("form-control-last-child");
			}
		}

		elements
			.on('input change propertychange blur', function (e) {
				var $this = $(this), results;

				if (e.type != "blur") {
					if (!$this.parent().hasClass("has-error")) {
						return;
					}
				}

				if ($this.parents('.rd-mailform').hasClass('success')) {
					return;
				}

				if ((results = $this.regula('validate')).length) {
					for (i = 0; i < results.length; i++) {
						$this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error")
					}
				} else {
					$this.siblings(".form-validation").text("").parent().removeClass("has-error")
				}
			})
			.regula('bind');
	}

	/**
	 * isValidated
	 * @description  check if all elemnts pass validation
	 */
	function isValidated(elements) {
		var results, errors = 0;
		if (elements.length) {
			for (j = 0; j < elements.length; j++) {

				var $input = $(elements[j]);

				if ((results = $input.regula('validate')).length) {
					for (k = 0; k < results.length; k++) {
						errors++;
						$input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
					}
				} else {
					$input.siblings(".form-validation").text("").parent().removeClass("has-error")
				}
			}

			return errors == 0;
		}
		return true;
	}

	/**
	 * @desc Google map function for getting latitude and longitude
	 */
	function getLatLngObject(str, marker, map, callback) {
		var coordinates = {};
		try {
			coordinates = JSON.parse(str);
			callback(new google.maps.LatLng(
				coordinates.lat,
				coordinates.lng
			), marker, map)
		} catch (e) {
			map.geocoder.geocode({'address': str}, function (results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					var latitude = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();

					callback(new google.maps.LatLng(
						parseFloat(latitude),
						parseFloat(longitude)
					), marker, map)
				}
			})
		}
	}

	/**
	 * @desc Initialize Google maps
	 */
	function initMaps() {
		var key;

		for ( var i = 0; i < plugins.maps.length; i++ ) {
			if ( plugins.maps[i].hasAttribute( "data-key" ) ) {
				key = plugins.maps[i].getAttribute( "data-key" );
				break;
			}
		}

		$.getScript('//maps.google.com/maps/api/js?'+ ( key ? 'key='+ key + '&' : '' ) +'sensor=false&libraries=geometry,places&v=quarterly', function () {
			var head = document.getElementsByTagName('head')[0],
				insertBefore = head.insertBefore;

			head.insertBefore = function (newElement, referenceElement) {
				if (newElement.href && newElement.href.indexOf('//fonts.googleapis.com/css?family=Roboto') !== -1 || newElement.innerHTML.indexOf('gm-style') !== -1) {
					return;
				}
				insertBefore.call(head, newElement, referenceElement);
			};
			var geocoder = new google.maps.Geocoder;
			for (var i = 0; i < plugins.maps.length; i++) {
				var zoom = parseInt(plugins.maps[i].getAttribute("data-zoom"), 10) || 11;
				var styles = plugins.maps[i].hasAttribute('data-styles') ? JSON.parse(plugins.maps[i].getAttribute("data-styles")) : [];
				var center = plugins.maps[i].getAttribute("data-center") || "New York";

				// Initialize map
				var map = new google.maps.Map(plugins.maps[i].querySelectorAll(".google-map")[0], {
					zoom: zoom,
					styles: styles,
					scrollwheel: false,
					center: {lat: 0, lng: 0}
				});

				// Add map object to map node
				plugins.maps[i].map = map;
				plugins.maps[i].geocoder = geocoder;
				plugins.maps[i].keySupported = true;
				plugins.maps[i].google = google;

				// Get Center coordinates from attribute
				getLatLngObject(center, null, plugins.maps[i], function (location, markerElement, mapElement) {
					mapElement.map.setCenter(location);
				});

				// Add markers from google-map-markers array
				var markerItems = plugins.maps[i].querySelectorAll(".google-map-markers li");

				if (markerItems.length){
					var markers = [];
					for (var j = 0; j < markerItems.length; j++){
						var markerElement = markerItems[j];
						getLatLngObject(markerElement.getAttribute("data-location"), markerElement, plugins.maps[i], function(location, markerElement, mapElement){
							var icon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon");
							var activeIcon = markerElement.getAttribute("data-icon-active") || mapElement.getAttribute("data-icon-active");
							var info = markerElement.getAttribute("data-description") || "";
							var infoWindow = new google.maps.InfoWindow({
								content: info
							});
							markerElement.infoWindow = infoWindow;
							var markerData = {
								position: location,
								map: mapElement.map
							}
							if (icon){
								markerData.icon = icon;
							}
							var marker = new google.maps.Marker(markerData);
							markerElement.gmarker = marker;
							markers.push({markerElement: markerElement, infoWindow: infoWindow});
							marker.isActive = false;
							// Handle infoWindow close click
							google.maps.event.addListener(infoWindow,'closeclick',(function(markerElement, mapElement){
								var markerIcon = null;
								markerElement.gmarker.isActive = false;
								markerIcon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon");
								markerElement.gmarker.setIcon(markerIcon);
							}).bind(this, markerElement, mapElement));


							// Set marker active on Click and open infoWindow
							google.maps.event.addListener(marker, 'click', (function(markerElement, mapElement) {
								if (markerElement.infoWindow.getContent().length === 0) return;
								var gMarker, currentMarker = markerElement.gmarker, currentInfoWindow;
								for (var k =0; k < markers.length; k++){
									var markerIcon;
									if (markers[k].markerElement === markerElement){
										currentInfoWindow = markers[k].infoWindow;
									}
									gMarker = markers[k].markerElement.gmarker;
									if (gMarker.isActive && markers[k].markerElement !== markerElement){
										gMarker.isActive = false;
										markerIcon = markers[k].markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon")
										gMarker.setIcon(markerIcon);
										markers[k].infoWindow.close();
									}
								}

								currentMarker.isActive = !currentMarker.isActive;
								if (currentMarker.isActive) {
									if (markerIcon = markerElement.getAttribute("data-icon-active") || mapElement.getAttribute("data-icon-active")){
										currentMarker.setIcon(markerIcon);
									}

									currentInfoWindow.open(map, marker);
								}else{
									if (markerIcon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon")){
										currentMarker.setIcon(markerIcon);
									}
									currentInfoWindow.close();
								}
							}).bind(this, markerElement, mapElement))
						})
					}
				}
			}
		});
	}

	/**
	 * initOwlCarousel
	 * @description  Init owl carousel plugin
	 */
	function initOwlCarousel(c) {
		var aliaces = ["-", "-xs-", "-sm-", "-md-", "-lg-", "-xl-"],
			values = [0, 480, 768, 992, 1200, 1800],
			responsive = {},
			j, k;

		for (j = 0; j < values.length; j++) {
			responsive[values[j]] = {};
			for (k = j; k >= -1; k--) {
				if (!responsive[values[j]]["items"] && c.attr("data" + aliaces[k] + "items")) {
					responsive[values[j]]["items"] = k < 0 ? 1 : parseInt(c.attr("data" + aliaces[k] + "items"), 10);
				}
				if (!responsive[values[j]]["stagePadding"] && responsive[values[j]]["stagePadding"] !== 0 && c.attr("data" + aliaces[k] + "stage-padding")) {
					responsive[values[j]]["stagePadding"] = k < 0 ? 0 : parseInt(c.attr("data" + aliaces[k] + "stage-padding"), 10);
				}
				if (!responsive[values[j]]["margin"] && responsive[values[j]]["margin"] !== 0 && c.attr("data" + aliaces[k] + "margin")) {
					responsive[values[j]]["margin"] = k < 0 ? 30 : parseInt(c.attr("data" + aliaces[k] + "margin"), 10);
				}
			}
		}

		// Enable custom pagination
		if (c.attr('data-dots-custom')) {
			c.on("initialized.owl.carousel", function (event) {
				var carousel = $(event.currentTarget),
					customPag = $(carousel.attr("data-dots-custom")),
					active = 0;

				if (carousel.attr('data-active')) {
					active = parseInt(carousel.attr('data-active'), 10);
				}

				carousel.trigger('to.owl.carousel', [active, 300, true]);
				customPag.find("[data-owl-item='" + active + "']").addClass("active");

				customPag.find("[data-owl-item]").on('click', function (e) {
					e.preventDefault();
					carousel.trigger('to.owl.carousel', [parseInt(this.getAttribute("data-owl-item"), 10), 300, true]);
				});

				carousel.on("translate.owl.carousel", function (event) {
					customPag.find(".active").removeClass("active");
					customPag.find("[data-owl-item='" + event.item.index + "']").addClass("active")
				});
			});
		}

		c.owlCarousel({
			autoplay: isNoviBuilder ? false: c.attr("data-autoplay") === "true",
			loop: isNoviBuilder ? false : c.attr("data-loop") === "true",
			items: 1,
			dotsContainer: c.attr("data-pagination-class") || false,
			navContainer: c.attr("data-navigation-class") || false,
			mouseDrag: isNoviBuilder ? false : c.attr("data-mouse-drag") !== "false",
			nav: c.attr("data-nav") === "true",
			dots: ( isNoviBuilder && c.attr("data-nav") !== "true" ) ? true : c.attr("data-dots") === "true",
			dotsEach: c.attr("data-dots-each") ? parseInt(c.attr("data-dots-each"), 10) : false,
			animateIn: c.attr('data-animation-in') ? c.attr('data-animation-in') : false,
			animateOut: c.attr('data-animation-out') ? c.attr('data-animation-out') : false,
			responsive: responsive,
			navText: $.parseJSON(c.attr("data-nav-text")) || [],
			navClass: $.parseJSON(c.attr("data-nav-class")) || ['owl-prev', 'owl-next']
		});
	}

	/**
	 * IE Polyfills
	 * @description  Adds some loosing functionality to IE browsers
	 */
	if (isIE) {
		if (isIE < 10) {
			$html.addClass("lt-ie-10");
		}

		if (isIE < 11) {
			if (plugins.pointerEvents) {
				$.getScript(plugins.pointerEvents)
					.done(function () {
						$html.addClass("ie-10");
						PointerEventsPolyfill.initialize({});
					});
			}
		}

		if (isIE === 11) {
			$("html").addClass("ie-11");
		}

		if (isIE === 12) {
			$("html").addClass("ie-edge");
		}
	}

	// Swiper
	if (plugins.swiper.length) {
		for (var i = 0; i < plugins.swiper.length; i++) {
			var s = $(plugins.swiper[i]);
			var pag = s.find(".swiper-pagination"),
				next = s.find(".swiper-button-next"),
				prev = s.find(".swiper-button-prev"),
				bar = s.find(".swiper-scrollbar"),
				swiperSlide = s.find(".swiper-slide"),
				autoplay = false;

			for (var j = 0; j < swiperSlide.length; j++) {
				var $this = $(swiperSlide[j]),
					url;

				if (url = $this.attr("data-slide-bg")) {
					$this.css({
						"background-image": "url(" + url + ")",
						"background-size": "cover"
					})
				}
			}

			swiperSlide.end()
				.find("[data-caption-animate]")
				.addClass("not-animated")
				.end();

			s.swiper({
				autoplay: !isNoviBuilder && $.isNumeric( s.attr('data-autoplay') ) ? s.attr('data-autoplay') : false,
				direction: s.attr('data-direction') ? s.attr('data-direction') : "horizontal",
				effect: s.attr('data-slide-effect') ? s.attr('data-slide-effect') : "slide",
				speed: s.attr('data-slide-speed') ? s.attr('data-slide-speed') : 600,
				keyboardControl: s.attr('data-keyboard') === "true",
				mousewheelControl: s.attr('data-mousewheel') === "true",
				mousewheelReleaseOnEdges: s.attr('data-mousewheel-release') === "true",
				nextButton: next.length ? next.get(0) : null,
				prevButton: prev.length ? prev.get(0) : null,
				pagination: pag.length ? pag.get(0) : null,
				paginationClickable: pag.length ? pag.attr("data-clickable") !== "false" : false,
				paginationBulletRender: pag.length ? pag.attr("data-index-bullet") === "true" ? function (swiper, index, className) {
					return '<span class="' + className + '">' + (index + 1) + '</span>';
				} : null : null,
				scrollbar: bar.length ? bar.get(0) : null,
				scrollbarDraggable: bar.length ? bar.attr("data-draggable") !== "false" : true,
				scrollbarHide: bar.length ? bar.attr("data-draggable") === "false" : false,
				loop: isNoviBuilder ? false : s.attr('data-loop') !== "false",
				simulateTouch: s.attr('data-simulate-touch') && !isNoviBuilder ? s.attr('data-simulate-touch') === "true" : false,
				onTransitionStart: function (swiper) {
					toggleSwiperInnerVideos(swiper);
				},
				onTransitionEnd: function (swiper) {
					toggleSwiperCaptionAnimation(swiper);
				},
				onInit: function (swiper) {
					toggleSwiperInnerVideos(swiper);
					toggleSwiperCaptionAnimation(swiper);
					initLightGalleryItem(s.find('[data-lightgallery="item"]'), 'lightGallery-in-carousel');
				}
			});

			$window.on("resize", (function (s) {
				return function () {
					var mh = getSwiperHeight(s, "min-height"),
						h = getSwiperHeight(s, "height");
					if (h) {
						s.css("height", mh ? mh > h ? mh : h : h);
					}
				}
			})(s)).trigger("resize");
		}
	}

	/**
	 * @module     ViewPort Universal
	 * @description Add class in viewport
	 */
	if (plugins.viewAnimate.length) {
		for (i = 0; i < plugins.viewAnimate.length; i++) {
			if (isNoviBuilder) {
				$(plugins.viewAnimate[i]).not('.active').addClass("active")
			}
			else {
				var view = $(plugins.viewAnimate[i]).not('.active');
				$document.on("scroll", $.proxy(function () {

					if (isScrolledIntoView(this)) {
						this.addClass("active");
					}
				}, view))
					.trigger("scroll");
			}
		}
	}

	/**
	 * Copyright Year
	 * @description  Evaluates correct copyright year
	 */
	var o = $(".copyright-year");
	if (o.length) {
		o.text(initialDate.getFullYear());
	}

	/**
	 * Bootstrap tabs
	 * @description Activate Bootstrap Tabs
	 */
	if (plugins.bootstrapTabs.length) {
		var i;
		for (i = 0; i < plugins.bootstrapTabs.length; i++) {
			var bootstrapTab = $(plugins.bootstrapTabs[i]);

			bootstrapTab.on("click", "a", function (event) {
				event.preventDefault();
				$(this).tab('show');
			});
		}
	}

	/**
	 * Responsive Tabs
	 * @description Enables Responsive Tabs plugin
	 */
	if (plugins.responsiveTabs.length) {
		var i = 0;
		for (i = 0; i < plugins.responsiveTabs.length; i++) {
			var $this = $(plugins.responsiveTabs[i]);
			$this.easyResponsiveTabs({
				type: $this.attr("data-type"),
				tabidentify: $this.find(".resp-tabs-list").attr("data-group") || "tab"
			});
		}
		if ($(".tabs-nav").length) {
			$('.resp-tabs-list').find("li").eq(parseInt(window.location.hash.split('#').pop())).trigger('click');
			window.location.hash = "";
			$('.tabs-nav a').click(function (e) {
				e.preventDefault();
				$('.resp-tabs-list').find("li").eq($(this).parent().index()).trigger('click');
			});
		}
	}

	/**
	 * RD Input Label
	 * @description Enables RD Input Label Plugin
	 */
	if (plugins.rdInputLabel.length) {
		plugins.rdInputLabel.RDInputLabel();
	}

	/**
	 * Radio
	 * @description Add custom styling options for input[type="radio"]
	 */
	if (plugins.radio.length) {
		var i;
		for (i = 0; i < plugins.radio.length; i++) {
			var $this = $(plugins.radio[i]);
			$this.addClass("radio-custom").after("<span class='radio-custom-dummy'></span>")
		}
	}

	/**
	 * Checkbox
	 * @description Add custom styling options for input[type="checkbox"]
	 */
	if (plugins.checkbox.length) {
		var i;
		for (i = 0; i < plugins.checkbox.length; i++) {
			var $this = $(plugins.checkbox[i]);
			$this.addClass("checkbox-custom").after("<span class='checkbox-custom-dummy'></span>")
		}
	}

	/**
	 * Regula
	 * @description Enables Regula plugin
	 */
	if (plugins.regula.length) {
		attachFormValidator(plugins.regula);
	}

	/**
	 * WOW
	 * @description Enables Wow animation plugin
	 */
	if ($html.hasClass('desktop') && $html.hasClass("wow-animation") && $(".wow").length) {
		new WOW().init();
	}

	// RD Navbar
	if ( plugins.rdNavbar.length ) {
		var
			navbar = plugins.rdNavbar,
			aliases = { '-': 0, '-sm-': 576, '-md-': 768, '-lg-': 992, '-xl-': 1200, '-xxl-': 1600 },
			responsive = {};

		for ( var alias in aliases ) {
			var link = responsive[ aliases[ alias ] ] = {};
			if ( navbar.attr( 'data'+ alias +'layout' ) )          link.layout        = navbar.attr( 'data'+ alias +'layout' );
			if ( navbar.attr( 'data'+ alias +'device-layout' ) )   link.deviceLayout  = navbar.attr( 'data'+ alias +'device-layout' );
			if ( navbar.attr( 'data'+ alias +'hover-on' ) )        link.focusOnHover  = navbar.attr( 'data'+ alias +'hover-on' ) === 'true';
			if ( navbar.attr( 'data'+ alias +'auto-height' ) )     link.autoHeight    = navbar.attr( 'data'+ alias +'auto-height' ) === 'true';
			if ( navbar.attr( 'data'+ alias +'stick-up-offset' ) ) link.stickUpOffset = navbar.attr( 'data'+ alias +'stick-up-offset' );
			if ( navbar.attr( 'data'+ alias +'stick-up' ) )        link.stickUp       = navbar.attr( 'data'+ alias +'stick-up' ) === 'true';
			if ( isNoviBuilder ) link.stickUp = false;
			else if ( navbar.attr( 'data'+ alias +'stick-up' ) )   link.stickUp       = navbar.attr( 'data'+ alias +'stick-up' ) === 'true';
		}

		plugins.rdNavbar.RDNavbar({
			anchorNav: !isNoviBuilder,
			stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone") && !isNoviBuilder) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
			responsive: responsive,
			anchorNavOffset: -78,
			callbacks: {
				onStuck: function () {
					var navbarSearch = this.$element.find('.rd-search input');

					if (navbarSearch) {
						navbarSearch.val('').trigger('propertychange');
					}
				},
				onDropdownOver: function () {
					return !isNoviBuilder;
				},
				onUnstuck: function () {
					if (this.$clone === null)
						return;

					var navbarSearch = this.$clone.find('.rd-search input');

					if (navbarSearch) {
						navbarSearch.val('').trigger('propertychange');
						navbarSearch.trigger('blur');
					}

				}
			}
		});
	}

	/**
	 * Select2
	 * @description Enables select2 plugin
	 */
	if (plugins.selectFilter.length) {
		var i;
		for (i = 0; i < plugins.selectFilter.length; i++) {
			var select = $(plugins.selectFilter[i]);

			select.select2({
				theme: "bootstrap"
			}).next().addClass(select.attr("class").match(/(input-sm)|(input-lg)|($)/i).toString().replace(new RegExp(",", 'g'), " "));
		}
	}

	/**
	 * Page loader
	 * @description Enables Page loader
	 */
	if (plugins.pageLoader.length > 0) {

		$window.on("load", function () {
			var loader = setTimeout(function () {
				plugins.pageLoader.addClass("loaded");
				$window.trigger("resize");
			}, 200);
		});

	}

	/**
	 * RD Search
	 * @description Enables search
	 */
	if (plugins.search.length || plugins.searchResults) {
		var handler = "bat/rd-search.php";
		var defaultTemplate = '<h5 class="search_title"><a target="_top" href="#{href}" class="search_link">#{title}</a></h5>' +
			'<p>...#{token}...</p>' +
			'<p class="match"><em>Terms matched: #{count} - URL: #{href}</em></p>';
		var defaultFilter = '*.html';

		if (plugins.search.length) {

			for (i = 0; i < plugins.search.length; i++) {
				var searchItem = $(plugins.search[i]),
					options = {
						element: searchItem,
						filter: (searchItem.attr('data-search-filter')) ? searchItem.attr('data-search-filter') : defaultFilter,
						template: (searchItem.attr('data-search-template')) ? searchItem.attr('data-search-template') : defaultTemplate,
						live: (searchItem.attr('data-search-live')) ? searchItem.attr('data-search-live') : false,
						liveCount: (searchItem.attr('data-search-live-count')) ? parseInt(searchItem.attr('data-search-live')) : 4,
						current: 0, processed: 0, timer: {}
					};

				if ($('.rd-navbar-search-toggle').length) {
					var toggle = $('.rd-navbar-search-toggle');
					toggle.on('click', function () {
						if (!($(this).hasClass('active'))) {
							searchItem.find('input').val('').trigger('propertychange');
						}
					});
				}

				if (options.live) {
					searchItem.find('input').on("keyup input propertychange", $.proxy(function () {
						this.term = this.element.find('input').val().trim();
						this.spin = this.element.find('.input-group-addon');
						clearTimeout(this.timer);

						if (this.term.length > 2) {
							this.timer = setTimeout(liveSearch(this), 200);
						} else if (this.term.length == 0) {
							$('#' + this.live).addClass('cleared').html('');
						}
					}, options, this));
				}

				searchItem.submit($.proxy(function () {
					$('<input />').attr('type', 'hidden')
						.attr('name', "filter")
						.attr('value', this.filter)
						.appendTo(this.element);
					return true;
				}, options, this))
			}
		}

		if (plugins.searchResults.length) {
			var regExp = /\?.*s=([^&]+)\&filter=([^&]+)/g;
			var match = regExp.exec(location.search);

			if (match != null) {
				$.get(handler, {
					s: decodeURI(match[1]),
					dataType: "html",
					filter: match[2],
					template: defaultTemplate,
					live: ''
				}, function (data) {
					plugins.searchResults.html(data);
				})
			}
		}
	}

	/**
	 * UI To Top
	 * @description Enables ToTop Button
	 */
	if (isDesktop && !isNoviBuilder) {
		$().UItoTop({
			easingType: 'easeOutQuart',
			containerClass: 'ui-to-top icon icon-xs icon-circle icon-darker-filled mdi mdi-chevron-up'
		});
	}

	/**
	 * RD Mailform
	 * @version      3.2.0
	 */
	if (plugins.rdMailForm.length) {
		var i, j, k,
			msg = {
				'MF000': 'Successfully sent!',
				'MF001': 'Recipients are not set!',
				'MF002': 'Form will not work locally!',
				'MF003': 'Please, define email field in your form!',
				'MF004': 'Please, define type of your form!',
				'MF254': 'Something went wrong with PHPMailer!',
				'MF255': 'Aw, snap! Something went wrong.'
			};

		for (i = 0; i < plugins.rdMailForm.length; i++) {
			var $form = $(plugins.rdMailForm[i]),
				formHasCaptcha = false;

			$form.attr('novalidate', 'novalidate').ajaxForm({
				data: {
					"form-type": $form.attr("data-form-type") || "contact",
					"counter": i
				},
				beforeSubmit: function (arr, $form, options) {
					if (isNoviBuilder)
						return;

					var form = $(plugins.rdMailForm[this.extraData.counter]),
						inputs = form.find("[data-constraints]"),
						output = $("#" + form.attr("data-form-output")),
						captcha = form.find('.recaptcha'),
						captchaFlag = true;

					output.removeClass("active error success");

					if (isValidated(inputs, captcha)) {

						// veify reCaptcha
						if (captcha.length) {
							var captchaToken = captcha.find('.g-recaptcha-response').val(),
								captchaMsg = {
									'CPT001': 'Please, setup you "site key" and "secret key" of reCaptcha',
									'CPT002': 'Something wrong with google reCaptcha'
								};

							formHasCaptcha = true;

							$.ajax({
								method: "POST",
								url: "bat/reCaptcha.php",
								data: {'g-recaptcha-response': captchaToken},
								async: false
							})
								.done(function (responceCode) {
									if (responceCode !== 'CPT000') {
										if (output.hasClass("snackbars")) {
											output.html('<p><span class="icon text-middle fa fa-check icon-xxs"></span><span>' + captchaMsg[responceCode] + '</span></p>')

											setTimeout(function () {
												output.removeClass("active");
											}, 3500);

											captchaFlag = false;
										} else {
											output.html(captchaMsg[responceCode]);
										}

										output.addClass("active");
									}
								});
						}

						if (!captchaFlag) {
							return false;
						}

						form.addClass('form-in-process');

						if (output.hasClass("snackbars")) {
							output.html('<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>');
							output.addClass("active");
						}
					} else {
						return false;
					}
				},
				error: function (result) {
					if (isNoviBuilder)
						return;

					var output = $("#" + $(plugins.rdMailForm[this.extraData.counter]).attr("data-form-output")),
						form = $(plugins.rdMailForm[this.extraData.counter]);

					output.text(msg[result]);
					form.removeClass('form-in-process');

					if (formHasCaptcha) {
						grecaptcha.reset();
					}
				},
				success: function (result) {
					if (isNoviBuilder)
						return;

					var form = $(plugins.rdMailForm[this.extraData.counter]),
						output = $("#" + form.attr("data-form-output")),
						select = form.find('select');

					form
						.addClass('success')
						.removeClass('form-in-process');

					if (formHasCaptcha) {
						grecaptcha.reset();
					}

					result = result.length === 5 ? result : 'MF255';
					output.text(msg[result]);

					if (result === "MF000") {
						if (output.hasClass("snackbars")) {
							output.html('<p><span class="icon text-middle fa fa-check icon-xxs"></span><span>' + msg[result] + '</span></p>');
						} else {
							output.addClass("active success");
						}
					} else {
						if (output.hasClass("snackbars")) {
							output.html(' <p class="snackbars-left"><span class="icon icon-xxs fa fa-exclamation-triangle text-middle"></span><span>' + msg[result] + '</span></p>');
						} else {
							output.addClass("active error");
						}
					}

					form.clearForm();

					if (select.length) {
						select.select2("val", "");
					}

					form.find('input, textarea').trigger('blur');

					setTimeout(function () {
						output.removeClass("active error success");
						form.removeClass('success');
					}, 3500);
				}
			});
		}
	}

	/**
	 * Custom Toggles
	 */
	if (plugins.customToggle.length) {
		var i;

		$document.delegate("[data-custom-toggle]", "click", function (e) {
			e.preventDefault();
			$("#" + $(this).attr('data-custom-toggle')).add(this).toggleClass('active');
		});
		for (i = 0; i < plugins.customToggle.length; i++) {
			var $this = $(plugins.customToggle[i]);
			if ($this.attr("data-custom-toggle-disable-on-blur") === "true") {
				$("body").on("click", $this, function (e) {
					if (e.target !== e.data[0] && $("#" + e.data.attr('data-custom-toggle')).find($(e.target)).length == 0 && e.data.find($(e.target)).length == 0) {
						$("#" + e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active');
					}
				})
			}
		}
	}

	/**
	 * RD Filepicker
	 * @description Enables RD Filepicker plugin
	 */
	if (plugins.filePicker.length || plugins.fileDrop.length) {
		var i;
		for (i = 0; i < plugins.filePicker.length; i++) {
			var filePickerItem = plugins.filePicker[i];

			$(filePickerItem).RDFilepicker({
				metaFieldClass: "rd-file-picker-meta"
			});
		}

		for (i = 0; i < plugins.fileDrop.length; i++) {
			var fileDropItem = plugins.fileDrop[i];

			$(fileDropItem).RDFilepicker({
				metaFieldClass: "rd-file-drop-meta",
				buttonClass: "rd-file-drop-btn",
				dropZoneClass: "rd-file-drop"
			});
		}
	}

	/**First word selector
	 *
	 */
	if (plugins.homeHeadingsCustom.length) {
		var i;
		$('.home-headings-custom').each(function () {
			var words = $(this).text().split(' ').length;
			if (words > 1) {
				var html = $(this).html();
				var word = html.substr(0, html.indexOf(" "));
				var rest = html.substr(html.indexOf(" "));
				$(this).html(rest).prepend($("<span/>").html(word).addClass("first-word"));
			}
		});
	}

	/**
	 * Material Parallax
	 * @description Enables Material Parallax plugin
	 */
	if (plugins.materialParallax.length) {
		var i;

		if (!isNoviBuilder && !isIE && !isMobile) {
			plugins.materialParallax.parallax();
		} else {
			for (i = 0; i < plugins.materialParallax.length; i++) {
				var parallax = $(plugins.materialParallax[i]),
					imgPath = parallax.data("parallax-img");

				parallax.css({
					"background-image": 'url(' + imgPath + ')',
					"background-attachment": "fixed",
					"background-size": "cover"
				});
			}
		}
	}

	// Google maps
	if( plugins.maps.length ) {
		lazyInit( plugins.maps, initMaps );
	}

	/**
	 * Owl carousel
	 * @description Enables Owl carousel plugin
	 */
	if (plugins.owl.length) {
		for (var i = 0; i < plugins.owl.length; i++) {
			var c = $(plugins.owl[i]);
			plugins.owl[i] = c;

			//skip owl in bootstrap tabs
			if (!c.parents('.tab-content').length) {
				initOwlCarousel(c);
			}
		}
	}

	/**
	 * Background Video
	 * @description  Enable Video plugin
	 */
	if ( plugins.videBG.length ) {
		for ( var i = 0; i < plugins.videBG.length; i++ ) {
			var $element = $(plugins.videBG[i]),
				options = $element.data('vide-options'),
				path = $element.data('vide-bg');

			$element.vide( path, options );

			var videObj = $element.data('vide').getVideoObject();

			if ( isNoviBuilder ) {
				videObj.pause();
			} else {
				document.addEventListener( 'scroll', function ( $element, videObj ) {
					return function () {
						if ( isScrolledIntoView( $element ) ) videObj.play();
						else videObj.pause();
					}
				}( $element, videObj ) );
			}
		}
	}

	// Progress Bar
	if ( plugins.progressLinear ) {
		for ( var i = 0; i < plugins.progressLinear.length; i++ ) {
			var
				container = plugins.progressLinear[i],
				counter = aCounter({
					node: container.querySelector( '.progress-linear-counter' ),
					duration: container.getAttribute( 'data-duration' ) || 1000,
					onStart: function() {
						this.custom.bar.style.width = this.params.to + '%';
					}
				});

			counter.custom = {
				container: container,
				bar: container.querySelector( '.progress-linear-bar' ),
				onScroll: (function() {
					if ( ( Util.inViewport( this.custom.container ) && !this.custom.container.classList.contains( 'animated' ) ) || isNoviBuilder ) {
						this.run();
						this.custom.container.classList.add( 'animated' );
					}
				}).bind( counter ),
				onBlur: (function() {
					this.params.to = parseInt( this.params.node.textContent, 10 );
					this.run();
				}).bind( counter )
			};

			counter.custom.onScroll();
			if ( isNoviBuilder ) counter.params.node.addEventListener( 'blur', counter.custom.onBlur );
			else window.addEventListener( 'scroll', counter.custom.onScroll );
		}
	}

	// lightGallery
	if (plugins.lightGallery.length) {
		for (var i = 0; i < plugins.lightGallery.length; i++) {
			initLightGallery(plugins.lightGallery[i]);
		}
	}

	// lightGallery item
	if (plugins.lightGalleryItem.length) {
		// Filter carousel items
		var notCarouselItems = [];

		for (var z = 0; z < plugins.lightGalleryItem.length; z++) {
			if (!$(plugins.lightGalleryItem[z]).parents('.owl-carousel').length &&
				!$(plugins.lightGalleryItem[z]).parents('.swiper-slider').length &&
				!$(plugins.lightGalleryItem[z]).parents('.slick-slider').length) {
				notCarouselItems.push(plugins.lightGalleryItem[z]);
			}
		}

		plugins.lightGalleryItem = notCarouselItems;

		for (var i = 0; i < plugins.lightGalleryItem.length; i++) {
			initLightGalleryItem(plugins.lightGalleryItem[i]);
		}
	}

	// Dynamic lightGallery
	if (plugins.lightDynamicGalleryItem.length) {
		for (var i = 0; i < plugins.lightDynamicGalleryItem.length; i++) {
			initDynamicLightGallery(plugins.lightDynamicGalleryItem[i]);
		}
	}
});
