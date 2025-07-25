(function() {
    // Configuración
    var preloader = document.querySelector('.nk-preloader');
    var preloaderBG = document.querySelector('.nk-preloader-bg');
    var skipBtn = document.querySelector('.nk-preloader-skip');
    var content = document.querySelector('.nk-preloader-content');
    if (!preloader || !preloaderBG) return;

    // Leer atributos de datos
    var closeFrames = parseInt(preloaderBG.getAttribute('data-close-frames'), 10) || 23;
    var closeSpeed = parseFloat(preloaderBG.getAttribute('data-close-speed')) || 1.2;
    var closeSprites = preloaderBG.getAttribute('data-close-sprites') || 'preloader-bg.png';
    var openFrames = parseInt(preloaderBG.getAttribute('data-open-frames'), 10) || 23;
    var openSpeed = parseFloat(preloaderBG.getAttribute('data-open-speed')) || 1.2;
    var openSprites = preloaderBG.getAttribute('data-open-sprites') || 'preloader-bg-bw.png';

    // Ajustar el ancho del bg para el efecto de steps
    function prepareImage(img, frames) {
        preloaderBG.style.backgroundImage = 'url(' + img + ')';
        preloaderBG.style.width = (frames * 100) + '%';
        preloaderBG.style.transform = 'translateX(0%)';
    }

    // Animar el sprite sheet con GSAP SteppedEase
    function animateBG(frames, speed, from, to, cb) {
        TweenMax.set(preloaderBG, {x: from + '%'});
        TweenMax.to(preloaderBG, speed, {
            x: to + '%',
            ease: SteppedEase.config(frames),
            force3D: true,
            onComplete: cb
        });
    }

    // Fade out del preloader y contenido
    function fadeOutPreloader(cb) {
        TweenMax.to([content, skipBtn], 0.3, {
            y: -20,
            opacity: 0,
            display: 'none',
            force3D: true
        });
        TweenMax.to(preloader, 0.3, {
            opacity: 0,
            display: 'none',
            force3D: true,
            delay: 0.2,
            onComplete: cb
        });
    }

    // Cerrar preloader (animación color)
    function closePreloader(cb) {
        prepareImage(closeSprites, closeFrames);
        preloaderBG.style.backgroundColor = 'transparent';
        animateBG(closeFrames, closeSpeed, 0, 100, function() {
            fadeOutPreloader(cb);
        });
    }

    // Abrir preloader (animación BW)
    function openPreloader(cb) {
        preloader.style.opacity = 1;
        preloader.style.display = 'block';
        prepareImage(openSprites, openFrames);
        preloaderBG.style.backgroundColor = 'transparent';
        animateBG(openFrames, openSpeed, 100, 0, cb);
        TweenMax.set([content, skipBtn], {y: 0, opacity: 1, display: 'block'});
    }

    // Mostrar BW al inicio
    prepareImage(openSprites, openFrames);
    preloader.style.opacity = 1;
    preloader.style.display = 'block';
    TweenMax.set([content, skipBtn], {y: 0, opacity: 1, display: 'block'});

    // Al cargar la página, animar a color y ocultar
    window.addEventListener('load', function() {
        closePreloader();
    });
    // Botón saltar
    skipBtn && skipBtn.addEventListener('click', function() {
        closePreloader();
    });

    // Fade entre páginas (interceptar clicks)
    document.addEventListener('click', function(e) {
        var a = e.target.closest('a');
        if (!a) return;
        if (a.classList.contains('no-fade') || a.target === '_blank' || a.href.startsWith('mailto:') || a.href.startsWith('javascript:')) return;
        // Comparar solo la parte de la URL sin hash ni search
        var current = window.location.origin + window.location.pathname;
        var dest = a.href.split('#')[0].split('?')[0];
        if (dest === current) return; // No abrir preloader si es la misma página
        if (a.href === '' || a.href === window.location.href) return;
        e.preventDefault();
        openPreloader(function() {
            window.location.href = a.href;
        });
    }, true);

    // Safari back button fix
    window.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            preloader.style.display = 'none';
        }
    });
})();
