"use strict";

// Initialization
$(document).on("ready", function () {
  /* 0. Init console to avoid error */
  var method;
  var noop = function () {};
  var methods = [
    "assert", "clear", "count", "debug", "dir", "dirxml", "error",
    "exception", "group", "groupCollapsed", "groupEnd", "info", "log",
    "markTimeline", "profile", "profileEnd", "table", "time", "timeEnd",
    "timeStamp", "trace", "warn"
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});
  while (length--) {
    method = methods[length];
    if (!console[method]) console[method] = noop;
  }

  /*
   * Page Loader
   * IMPORTANT: hide ASAP to avoid inflating LCP.
   * We don't wait for window.load (images/fonts/etc.).
   */
  (function hideLoaderASAP() {
    var $loader = $("#page-loader");
    if (!$loader.length) return;

    var hide = function () { $loader.addClass("hidden"); };

    if (window.requestAnimationFrame) requestAnimationFrame(hide);
    else setTimeout(hide, 0);

    setTimeout(hide, 800);
  })();

  /* 1. Clock attribute (after paint) */
  (function initCountdownAfterPaint() {
    var run = function () {
      try {
        $(".clock-countdown").downCount({
          date: $(".site-config").attr("data-date"),
          offset: +10
        });
      } catch (error) {
        console.log("clock disabled/unavailable");
      }
    };

    if (window.requestAnimationFrame) requestAnimationFrame(run);
    else setTimeout(run, 0);
  })();

  /* 2. Background for page / section */
  var background = "#ccc";
  var backgroundMask = "rgba(255,255,255,0.92)";
  var backgroundVideoUrl = "none";

  // Background image as data attribute
  var list = $(".bg-img");
  for (var i = 0; i < list.length; i++) {
    var src = list[i].getAttribute("data-image-src");
    list[i].style.backgroundImage = "url('" + src + "')";
    list[i].style.backgroundRepeat = "no-repeat";
    list[i].style.backgroundPosition = "center";
    list[i].style.backgroundSize = "cover";
  }

  // Background color as data attribute
  list = $(".bg-color");
  for (var j = 0; j < list.length; j++) {
    var src2 = list[j].getAttribute("data-bgcolor");
    list[j].style.backgroundColor = src2;
  }

  // Background slide show variables
  var imageList = $(".slide-show .img");
  var imageSlides = [];
  for (var k = 0; k < imageList.length; k++) {
    var src3 = imageList[k].getAttribute("data-src");
    imageSlides.push({ src: src3 });
  }

  /* 3. Slideshow Background */
  var isSlide = false;
  var slideElem = $(".slide");
  var arrowElem = $(".p-footer .arrow-d");
  var pageElem = $(".page");

  $(".slide-show").vegas({
    delay: 5000,
    shuffle: true,
    slides: imageSlides,
    animation: ["kenburnsUp", "kenburnsDown", "kenburnsLeft", "kenburnsRight"]
  });

  /* 4. Init video background */
  $(".video-container video, .video-container object").maximage("maxcover");

  if (backgroundVideoUrl !== "none") {
    if ($(window).width() > 640) {
      $.okvideo({ source: backgroundVideoUrl, adproof: true });
    }
  }

  /* =====================================================
     SAFE AREA PARA MOBILE (COUNTDOWN + FOOTER)
     Esto NO debe afectar desktop.
  ===================================================== */
  function isMobileMode() {
    return window.innerWidth <= 768;
  }

  function getSafePadding() {
    var countdown = document.getElementById("s-when");
    var footer = document.querySelector(".primal-fixed-footer");

    var cdH = countdown ? countdown.offsetHeight : 160;
    var ftH = footer ? footer.offsetHeight : 80;

    // aire visual (ajustable)
    var gapTop = 0;
    var gapBottom = 50;

    return {
      top: cdH + gapTop,
      bottom: ftH + gapBottom
    };
  }

  /* 5. fullpage.js fullscreen page */
  var pageSectionDivs = $(".section.page");
  var pageSections = [];
  var pageAnchors = [];

  for (var m = 0; m < pageSectionDivs.length; m++) {
    pageSections.push(pageSectionDivs[m]);
  }

  // Collect sections
  window.asyncEach(
    pageSections,
    function (pageSection, cb) {
      var anchor = pageSection.getAttribute("id");
      anchor = anchor.substr(2, anchor.length);
      pageAnchors.push(anchor + "");
      cb();
    },
    function () {
      var lastMode = isMobileMode() ? "mobile" : "desktop";
      var fpInited = false;

      function buildOptions() {
        var opt = {
          menu: "#qmenu",
          anchors: pageAnchors,
          scrollOverflow: true,

          // ✅ FIX: permite que los taps/clicks en links funcionen con scrollOverflow (iScroll)
          scrollOverflowOptions: {
            click: true,
            tap: true
          },

          css3: false,
          navigation: true,
          scrollingSpeed: 600, // Faster page transitions (default is 700)
          onLeave: function () {
            arrowElem.addClass("gone");
            pageElem.addClass("transition");
            slideElem.removeClass("transition");
            isSlide = false;
          },
          afterLoad: function () {
            arrowElem.removeClass("gone");
            pageElem.removeClass("transition");
            if (isSlide) slideElem.removeClass("transition");
          },
          afterRender: function () {}
        };

        // ✅ SOLO MOBILE: padding para que el contenido viva entre countdown y footer
        if (isMobileMode()) {
          var safe = getSafePadding();
          opt.paddingTop = safe.top + "px";
          opt.paddingBottom = safe.bottom + "px";
        } else {
          opt.paddingTop = "0px";
          opt.paddingBottom = "0px";
        }

        return opt;
      }

      function initFullpage(force) {
        try {
          if (fpInited) {
            $.fn.fullpage.destroy("all");
            fpInited = false;
          }
        } catch (e) {}

        $("#mainpage").fullpage(buildOptions());
        $("#fp-nav").css("margin-top", 0);
        fpInited = true;
      }

      // Init 1ra vez
      initFullpage(true);

      // Re-init inteligente en resize/orientation
      var resizeTimer = null;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          var mode = isMobileMode() ? "mobile" : "desktop";
          if (mode !== lastMode) {
            lastMode = mode;
            initFullpage(true);
            return;
          }
          // Si seguimos en mobile, re-init para recalcular safe padding real (iPhone SE)
          if (mode === "mobile") {
            initFullpage(true);
          }
        }, 220);
      });

      window.addEventListener("orientationchange", function () {
        setTimeout(function () {
          var mode = isMobileMode() ? "mobile" : "desktop";
          lastMode = mode;
          initFullpage(true);
        }, 450);
      });
    }
  );
  /* =====================================================
     FIX MOBILE: Links de WhatsApp deben navegar SIEMPRE.
     fullPage + scrollOverflow (iScroll) puede comerse el tap.
  ===================================================== */
  (function forceWhatsAppLinksToNavigate(){
    var touched = false;

    $(document).on("touchend", "a.btn-whatsapp-primal", function(e){
      touched = true;
      e.preventDefault();
      e.stopPropagation();
      // navegar directo (misma pestaña)
      window.location.href = this.href;
      setTimeout(function(){ touched = false; }, 400);
    });

    $(document).on("click", "a.btn-whatsapp-primal", function(e){
      // si ya se manejó por touchend, evitamos doble disparo
      if (touched) { e.preventDefault(); e.stopPropagation(); return; }
      // igual forzamos navegación por si algún handler lo bloquea
      e.preventDefault();
      e.stopPropagation();
      window.location.href = this.href;
    });
  })();

  // Scroll to fullPage.js next section
  $(".p-footer a").on("click", function () {
    $.fn.fullpage.moveSectionDown();
  });
});
