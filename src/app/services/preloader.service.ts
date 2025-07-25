// src/app/services/preloader.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PreloaderService {
  public showPreloadOpen$ = new BehaviorSubject(false);
  public showPreloadClose$ = new BehaviorSubject(false);
  public showBlackScreen$ = new BehaviorSubject(false);

  constructor(private router: Router) { }

  showOpen() {
    // Espera 300ms para que la pantalla negra quede visible antes de la animación open
    setTimeout(() => {
      this.showPreloadOpen$.next(true);
      setTimeout(() => {
        this.showPreloadOpen$.next(false);
        this.showBlackScreen$.next(false); // Quita el negro solo después del open
      }, 1500);
    }, 300);
  }

  showClose() {
    this.showPreloadClose$.next(true);
    setTimeout(() => {
      this.showPreloadClose$.next(false);
      this.showBlackScreen$.next(true);
    }, 1500);
  }

    navigateWithPreload(targetRoute: string): void {
    // Ejecutar la animación de cierre
    const closeFn = (window as any).closePreloader;
    if (typeof closeFn === 'function') {
      closeFn(() => {
        // Después de la animación, navegar
        this.router.navigateByUrl(targetRoute);
      });
    } else {
      // fallback si no está definido
      this.router.navigateByUrl(targetRoute);
    }
  }
}
