import { Component, AfterViewInit, ElementRef, Renderer2, ViewChild, OnInit } from '@angular/core';
// @ts-ignore
import TweenMax from 'gsap';
// @ts-ignore
import { SteppedEase } from 'gsap/all';

@Component({
  selector: 'app-preload',
  templateUrl: './preload.component.html',
  styleUrls: ['./preload.component.css']
})
export class PreloadComponent implements AfterViewInit, OnInit {
  @ViewChild('preloader', { static: true }) preloaderRef!: ElementRef;
  @ViewChild('preloaderBG', { static: true }) preloaderBGRef!: ElementRef;
  @ViewChild('skipBtn', { static: true }) skipBtnRef!: ElementRef;
  @ViewChild('content', { static: true }) contentRef!: ElementRef;
  @ViewChild('preloadLogo') preloadLogo!: ElementRef<HTMLImageElement>;
  @ViewChild('preloadAnim') preloadAnim!: ElementRef<HTMLDivElement>;

  private isFirstLoad = true;
  private resourcesLoaded = false;
  private preloaderClosed = false;
  private angularReady = false;

  constructor(private renderer: Renderer2, private host: ElementRef) {}

  ngOnInit(): void {
    // Detectar cuando Angular está completamente cargado
    this.detectAngularReady();
  }

  ngAfterViewInit(): void {
    // Verificar si es la primera carga
    this.isFirstLoad = !sessionStorage.getItem('terra_web_loaded');
    
    // Selección de elementos dentro del componente
    const preloader = this.host.nativeElement.querySelector('.nk-preloader');
    const preloaderBG = this.host.nativeElement.querySelector('.nk-preloader-bg');
    const skipBtn = this.host.nativeElement.querySelector('.nk-preloader-skip');
    const content = this.host.nativeElement.querySelector('.nk-preloader-content');
    if (!preloader || !preloaderBG) return;

    // Leer atributos de datos
    const closeFrames = parseInt(preloaderBG.getAttribute('data-close-frames'), 10) || 23;
    const closeSpeed = parseFloat(preloaderBG.getAttribute('data-close-speed')) || 1.2;
    const closeSprites = preloaderBG.getAttribute('data-close-sprites') || 'assets/images/preloader-bg.png';
    const openFrames = parseInt(preloaderBG.getAttribute('data-open-frames'), 10) || 23;
    const openSpeed = parseFloat(preloaderBG.getAttribute('data-open-speed')) || 1.2;
    const openSprites = preloaderBG.getAttribute('data-open-sprites') || 'assets/images/preloader-bg-bw.png';

    // Ajustar el ancho del bg para el efecto de steps
    function prepareImage(img: string, frames: number) {
      preloaderBG.style.backgroundImage = 'url(' + img + ')';
      preloaderBG.style.width = (frames * 100) + '%';
      preloaderBG.style.transform = 'translateX(0%)';
    }

    // Animar el sprite sheet con GSAP SteppedEase
    function animateBG(frames: number, speed: number, from: number, to: number, cb: () => void) {
      TweenMax.set(preloaderBG, {x: from + '%'});
      TweenMax.to(preloaderBG, speed, {
        x: to + '%',
        ease: SteppedEase.config(frames),
        force3D: true,
        onComplete: cb
      });
    }

    // Fade out del preloader y contenido
    function fadeOutPreloader(cb?: () => void) {
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

    // Mostrar BW al inicio
    prepareImage(openSprites, openFrames);
    preloader.style.opacity = 1;
    preloader.style.display = 'block';
    TweenMax.set([content, skipBtn], {y: 0, opacity: 1, display: 'block'});

    // Si es la primera carga, esperar a que todos los recursos estén listos
    if (this.isFirstLoad) {
      this.waitForCompleteLoad(() => {
        this.closePreloader(preloader, preloaderBG, skipBtn, content, closeSprites, closeFrames, closeSpeed, prepareImage, animateBG, fadeOutPreloader);
      });
    } else {
      // Si no es la primera carga, cerrar después de un tiempo mínimo
      setTimeout(() => {
        this.closePreloader(preloader, preloaderBG, skipBtn, content, closeSprites, closeFrames, closeSpeed, prepareImage, animateBG, fadeOutPreloader);
      }, 500);
    }

    // Botón saltar
    if (skipBtn) {
      this.renderer.listen(skipBtn, 'click', () => {
        this.closePreloader(preloader, preloaderBG, skipBtn, content, closeSprites, closeFrames, closeSpeed, prepareImage, animateBG, fadeOutPreloader);
      });
    }
  }

  private detectAngularReady(): void {
    // Esperar a que Angular esté completamente cargado
    const checkAngularReady = () => {
      // Verificar si Angular está listo
      if (document.readyState === 'complete' && 
          typeof window !== 'undefined' && 
          window.performance && 
          window.performance.timing) {
        
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        if (loadTime > 0) {
          this.angularReady = true;
          return;
        }
      }
      
      // Si no está listo, intentar de nuevo
      setTimeout(checkAngularReady, 100);
    };
    
    checkAngularReady();
  }

  private waitForCompleteLoad(callback: () => void) {
    const criticalResources = [
      'assets/images/logot.png',
      'assets/images/preloader-bg.png',
      'assets/images/preloader-bg-bw.png',
      'assets/images/3433814.jpg',
      'assets/images/4857390.jpg',
      'assets/images/5968949.jpg',
      // Agregar aquí otros recursos críticos que necesites
    ];

    let loadedCount = 0;
    const totalResources = criticalResources.length;

    // Función para verificar si un recurso está cargado
    const checkResource = (url: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount >= totalResources) {
            resolve();
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount >= totalResources) {
            resolve();
          }
        };
        img.src = url;
      });
    };

    // Esperar a que todos los recursos críticos estén cargados Y Angular esté listo
    const checkComplete = () => {
      if (this.resourcesLoaded && this.angularReady) {
        callback();
      }
    };

    Promise.all(criticalResources.map(url => checkResource(url))).then(() => {
      // Esperar también a que el DOM esté completamente listo
      setTimeout(() => {
        this.resourcesLoaded = true;
        checkComplete();
      }, 300);
    });

    // Verificar periódicamente si Angular está listo
    const angularCheck = setInterval(() => {
      if (this.angularReady) {
        clearInterval(angularCheck);
        checkComplete();
      }
    }, 100);

    // Fallback: si después de 8 segundos no se han cargado todos los recursos, continuar
    setTimeout(() => {
      clearInterval(angularCheck);
      if (!this.resourcesLoaded || !this.angularReady) {
        this.resourcesLoaded = true;
        this.angularReady = true;
        callback();
      }
    }, 8000);
  }

  // Nueva versión como método de clase
  private closePreloader(
    preloader: HTMLElement,
    preloaderBG: HTMLElement,
    skipBtn: HTMLElement,
    content: HTMLElement,
    closeSprites: string,
    closeFrames: number,
    closeSpeed: number,
    prepareImage: (img: string, frames: number) => void,
    animateBG: (frames: number, speed: number, from: number, to: number, cb: () => void) => void,
    fadeOutPreloader: (cb?: () => void) => void,
    cb?: () => void
  ) {
    if (this.preloaderClosed) return;
    this.preloaderClosed = true;

    // Marcar como cargada la primera vez
    if (this.isFirstLoad) {
      sessionStorage.setItem('terra_web_loaded', 'true');
    }

    // Fade out rápido SOLO del logo y la animación (0.05s = 50ms)
    if (this.preloadLogo && this.preloadLogo.nativeElement) {
      TweenMax.to(this.preloadLogo.nativeElement, 0.05, {
        opacity: 0,
        display: 'none',
        force3D: true
      });
    }
    if (this.preloadAnim && this.preloadAnim.nativeElement) {
      TweenMax.to(this.preloadAnim.nativeElement, 1, {
        opacity: 0,
        display: 'none',
        force3D: true
      });
    }
    prepareImage(closeSprites, closeFrames);
    preloaderBG.style.backgroundColor = 'transparent';
    animateBG(closeFrames, closeSpeed, 0, 100, function() {
      fadeOutPreloader(cb || (() => {}));
    });
  }
}