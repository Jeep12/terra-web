import { Component, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
// @ts-ignore
import TweenMax from 'gsap';
// @ts-ignore
import { SteppedEase } from 'gsap/all';

@Component({
  selector: 'app-preload',
  templateUrl: './preload.component.html',
  styleUrls: ['./preload.component.css']
})
export class PreloadComponent implements AfterViewInit {
  @ViewChild('preloader', { static: true }) preloaderRef!: ElementRef;
  @ViewChild('preloaderBG', { static: true }) preloaderBGRef!: ElementRef;
  @ViewChild('skipBtn', { static: true }) skipBtnRef!: ElementRef;
  @ViewChild('content', { static: true }) contentRef!: ElementRef;
  @ViewChild('preloadLogo') preloadLogo!: ElementRef<HTMLImageElement>;
  @ViewChild('preloadAnim') preloadAnim!: ElementRef<HTMLDivElement>;

  constructor(private renderer: Renderer2, private host: ElementRef) {}

  ngAfterViewInit(): void {
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

    // Al cargar el componente, animar a color y ocultar
    setTimeout(() => {
      this.closePreloader(preloader, preloaderBG, skipBtn, content, closeSprites, closeFrames, closeSpeed, prepareImage, animateBG, fadeOutPreloader);
    }, 500); // Puedes ajustar el tiempo si quieres que dure más/menos

    // Botón saltar
    if (skipBtn) {
      this.renderer.listen(skipBtn, 'click', () => {
        this.closePreloader(preloader, preloaderBG, skipBtn, content, closeSprites, closeFrames, closeSpeed, prepareImage, animateBG, fadeOutPreloader);
      });
    }
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