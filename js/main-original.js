"use strict";
// Initialization 
$(document).on('ready',function() {
	/* 0. Init console to avoid error */
	var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
	
	/* 1. Clock attribute */
	try{
		// check if clock is initialised
		$('.clock-countdown').downCount({
			date: $('.site-config').attr('data-date'),
			offset: +10
		});
	}
	catch(error){
	  // Clock error : clock is unavailable
		console.log("clock disabled/unavailable");
	}

	/* 2. Background for page / section */
	var background = '#ccc';
	var backgroundMask = 'rgba(255,255,255,0.92)';
	var backgroundVideoUrl = 'none';

	// Background image as data attribut
	var list = $('.bg-img');
	for (var i = 0; i < list.length; i++) {
		var src = list[i].getAttribute('data-image-src');
		list[i].style.backgroundImage = "url('" + src + "')";
		list[i].style.backgroundRepeat = "no-repeat";
		list[i].style.backgroundPosition = "center";
		list[i].style.backgroundSize = "cover";
	}

	// Background color as data attribut 
	var list = $('.bg-color');
	for (var i = 0; i < list.length; i++) {
		var src = list[i].getAttribute('data-bgcolor');
		list[i].style.backgroundColor = src;
	}

	// Background slide show Background variables
	var imageList = $('.slide-show .img');
	var imageSlides = [];
	for (var i = 0; i < imageList.length; i++) {
		var src = imageList[i].getAttribute('data-src');
		imageSlides.push({src: src});
	}


	/* 3. Slideshow Background */
	var isSlide = false;
	var slideElem = $('.slide');
	var arrowElem = $('.p-footer .arrow-d');
	var pageElem = $('.page');

	// Init Slidesow background 
	$('.slide-show').vegas({
		delay: 5000,
		shuffle: true,
		slides: imageSlides,
		//transition: [ 'zoomOut', 'burn' ],
		animation: [ 'kenburnsUp', 'kenburnsDown', 'kenburnsLeft', 'kenburnsRight' ]
	});
	
	/* 4. Init video background */
	$('.video-container video, .video-container object').maximage('maxcover');
	
	// Init youtube video background 
	if (backgroundVideoUrl != 'none') {
		//disable video background for smallscreen
		if ($(window).width() > 640) {
			$.okvideo({
				source: backgroundVideoUrl,
				adproof: true
			});
		}
	}
	
	/* 5. fullpage.js fullscreen page */
	var pageSectionDivs = $('.section.page');
	var pageSections = [];
	var pageAnchors = [];
	for (var i = 0; i < pageSectionDivs.length; i++) {
		pageSections.push(pageSectionDivs[i]);
	}
	// Collect sections
	window.asyncEach(pageSections, function(pageSection , cb){
		var anchor = pageSection.getAttribute('id');
		anchor = anchor.substr(2,anchor.length);
		pageAnchors.push(anchor + "");
		cb();
	}, function(err){
		
		// Init fullpage
		$('#mainpage').fullpage({
			menu: '#qmenu',
			anchors: pageAnchors,
	//		responsive: 720, // uncomment to scroll on mobile 
			scrollOverflow: true,
			css3: false,
			navigation: true,
			onLeave: function(index, nextIndex, direction){
				arrowElem.addClass('gone');
				pageElem.addClass('transition');
				slideElem.removeClass('transition');
				isSlide = false;
			},
			afterLoad: function(anchorLink, index){
				arrowElem.removeClass('gone');
				pageElem.removeClass('transition');
				if(isSlide){
					slideElem.removeClass('transition');
				}
			},

			afterRender: function(){}
		});
		$('#fp-nav').css("margin-top",0);
	});
	
	// Scroll to fullPage.js next/previous section
    $('.p-footer a').on('click', function () {
        $.fn.fullpage.moveSectionDown();
    });

});


// Page Loader : hide loader when all are loaded
$(window).on('load', function(){
    $('#page-loader').addClass('hidden');
});

