import { Component, AfterViewInit, ElementRef, Renderer2, Input, OnChanges, SimpleChanges } from '@angular/core';
// @ts-ignore
import TweenMax from 'gsap';
// @ts-ignore
import { SteppedEase } from 'gsap/all';

@Component({
  selector: 'app-preload-open',
  templateUrl: './preload-open.component.html',
  styleUrl: './preload-open.component.css'
})
export class PreloadOpenComponent implements AfterViewInit, OnChanges {
  @Input() trigger: boolean = false;

  constructor(private renderer: Renderer2, private host: ElementRef) {}

  ngAfterViewInit(): void {
    if (this.trigger) {
      this.openPreloader();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trigger'] && changes['trigger'].currentValue) {
      this.openPreloader();
    }
  }

  openPreloader() {
    const preloader = this.host.nativeElement.querySelector('.nk-preloader');
    const preloaderBG = this.host.nativeElement.querySelector('.nk-preloader-bg');
    const skipBtn = this.host.nativeElement.querySelector('.nk-preloader-skip');
    const content = this.host.nativeElement.querySelector('.nk-preloader-content');
    if (!preloader || !preloaderBG) return;

    const closeFrames = parseInt(preloaderBG.getAttribute('data-close-frames'), 10) || 23;
    const closeSpeed = parseFloat(preloaderBG.getAttribute('data-close-speed')) || 1.2;
    const closeSprites = preloaderBG.getAttribute('data-close-sprites') || 'assets/images/preloader-bg.png';
    const openFrames = parseInt(preloaderBG.getAttribute('data-open-frames'), 10) || 23;
    const openSpeed = parseFloat(preloaderBG.getAttribute('data-open-speed')) || 1.2;
    const openSprites = preloaderBG.getAttribute('data-open-sprites') || 'assets/images/preloader-bg-bw.png';

    function prepareImage(img: string, frames: number) {
      preloaderBG.style.backgroundImage = 'url(' + img + ')';
      preloaderBG.style.width = (frames * 100) + '%';
      preloaderBG.style.transform = 'translateX(0%)';
    }

    function animateBG(frames: number, speed: number, from: number, to: number, cb: () => void) {
      TweenMax.set(preloaderBG, {x: from + '%'});
      TweenMax.to(preloaderBG, speed, {
        x: to + '%',
        ease: SteppedEase.config(frames),
        force3D: true,
        onComplete: cb
      });
    }

    function fadeOutPreloader(cb: () => void) {
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

    // Abrir preloader (animación BW)
    preloader.style.opacity = 1;
    preloader.style.display = 'block';
    prepareImage(openSprites, openFrames);
    preloaderBG.style.backgroundColor = 'transparent';
    animateBG(openFrames, openSpeed, 100, 0, () => {});
    TweenMax.set([content, skipBtn], {y: 0, opacity: 1, display: 'block'});
  }
}
