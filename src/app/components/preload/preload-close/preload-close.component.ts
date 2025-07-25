import { Component } from '@angular/core';
import { AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
// @ts-ignore
import TweenMax from 'gsap';
// @ts-ignore
import { SteppedEase } from 'gsap/all';
@Component({
  selector: 'app-preload-close',
  imports: [],
  templateUrl: './preload-close.component.html',
  styleUrl: './preload-close.component.css'
})
export class PreloadCloseComponent {
  constructor(private renderer: Renderer2, private host: ElementRef) { }

   ngAfterViewInit(): void {
    // Selección de elementos para ambos preloaders
    const preloaderOpen = this.host.nativeElement.querySelector('.nk-preloader-open');
    const preloaderBGOpen = preloaderOpen.querySelector('.nk-preloader-bg');
    const skipBtnOpen = preloaderOpen.querySelector('.nk-preloader-skip');
    const contentOpen = preloaderOpen.querySelector('.nk-preloader-content');

    const preloaderClose = this.host.nativeElement.querySelector('.nk-preloader-close');
    const preloaderBGClose = preloaderClose.querySelector('.nk-preloader-bg');
    const skipBtnClose = preloaderClose.querySelector('.nk-preloader-skip');
    const contentClose = preloaderClose.querySelector('.nk-preloader-content');

    // Función genérica para preparar y animar
    function prepareImage(bg: HTMLElement, img: string, frames: number) {
      bg.style.backgroundImage = 'url(' + img + ')';
      bg.style.width = (frames * 100) + '%';
      bg.style.transform = 'translateX(0%)';
    }
    function animateBG(bg: HTMLElement, frames: number, speed: number, from: number, to: number, cb: () => void) {
      TweenMax.set(bg, { x: from + '%' });
      TweenMax.to(bg, speed, {
        x: to + '%',
        ease: SteppedEase.config(frames),
        force3D: true,
        onComplete: cb
      });
    }
    function fadeOutPreloader(preloader: HTMLElement, content: HTMLElement, skipBtn: HTMLElement, cb: () => void) {
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

    // Animación de apertura (BW)
    function openPreloader(cb?: () => void) {
      preloaderOpen.style.opacity = 1;
      preloaderOpen.style.display = 'block';
      const frames = parseInt(preloaderBGOpen.getAttribute('data-frames'), 10) || 23;
      const speed = parseFloat(preloaderBGOpen.getAttribute('data-speed')) || 1.2;
      const sprites = preloaderBGOpen.getAttribute('data-sprites') || '';
      prepareImage(preloaderBGOpen, sprites, frames);
      preloaderBGOpen.style.backgroundColor = 'transparent';
      TweenMax.set([contentOpen, skipBtnOpen], { y: 0, opacity: 1, display: 'block' });
      animateBG(preloaderBGOpen, frames, speed, 100, 0, () => {
        fadeOutPreloader(preloaderOpen, contentOpen, skipBtnOpen, cb || (() => {}));
      });
    }

    // Animación de cierre (color)
    function closePreloader(cb?: () => void) {
      preloaderClose.style.opacity = 1;
      preloaderClose.style.display = 'block';
      const frames = parseInt(preloaderBGClose.getAttribute('data-frames'), 10) || 23;
      const speed = parseFloat(preloaderBGClose.getAttribute('data-speed')) || 1.2;
      const sprites = preloaderBGClose.getAttribute('data-sprites') || '';
      prepareImage(preloaderBGClose, sprites, frames);
      preloaderBGClose.style.backgroundColor = 'transparent';
      TweenMax.set([contentClose, skipBtnClose], { y: 0, opacity: 1, display: 'block' });
      animateBG(preloaderBGClose, frames, speed, 0, 100, () => {
        fadeOutPreloader(preloaderClose, contentClose, skipBtnClose, cb || (() => {}));
      });
    }

    // Mostrar solo el preloader de apertura al inicio
    openPreloader();

    // Botón skip para ambos preloaders
    if (skipBtnOpen) {
      this.renderer.listen(skipBtnOpen, 'click', () => {
        fadeOutPreloader(preloaderOpen, contentOpen, skipBtnOpen, () => {});
      });
    }
    if (skipBtnClose) {
      this.renderer.listen(skipBtnClose, 'click', () => {
        fadeOutPreloader(preloaderClose, contentClose, skipBtnClose, () => {});
      });
    }

    // Puedes exponer closePreloader/openPreloader para ser llamados desde fuera si lo necesitas
    // Por ejemplo, para navegación entre rutas
    (window as any).openPreloader = openPreloader;
    (window as any).closePreloader = closePreloader;
  }
}
