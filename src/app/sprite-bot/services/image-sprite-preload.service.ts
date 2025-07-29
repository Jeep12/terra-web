// core/services/image-sprite-preload.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ANIMATION_PRIORITIES, AnimationKey, BOT_CONFIG } from '../config/bot-config';

export interface LoadingStatus {
  [key: string]: boolean;
}

export interface CacheStats {
  totalCached: number;
  totalAnimations: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageSpritePreloadService {
  private readonly _imageCache = new Map<string, HTMLImageElement>();
  private readonly _loadingProgress = new BehaviorSubject<number>(0);
  private readonly _isLoading = new BehaviorSubject<boolean>(false);

  public readonly loadingProgress$ = this._loadingProgress.asObservable();
  public readonly isLoading$ = this._isLoading.asObservable();

  constructor() {
    // Service inicializado
  }

  // Getters
  get imageCache(): Map<string, HTMLImageElement> {
    return this._imageCache;
  }

  get isLoading(): boolean {
    return this._isLoading.value;
  }

  get loadingProgress(): number {
    return this._loadingProgress.value;
  }

  /**
   * Precarga una animación específica
   */
  async preloadAnimation(animKey: AnimationKey): Promise<void> {
    const anim = BOT_CONFIG.animations[animKey];
    if (!anim) {
      console.warn(`⚠️ Animación no encontrada: ${animKey}`);
      return;
    }

    const promises: Promise<void>[] = [];

    for (let i = 0; i < anim.frames; i++) {
      const frameNumber = i.toString().padStart(3, '0');
      const src = this.buildFrameUrl(anim.folder, frameNumber);

      // Evitar cargas duplicadas
      if (this._imageCache.has(src)) {
        continue;
      }

      promises.push(this.loadSingleImage(src));
    }

    await Promise.all(promises);
          // console.log(`✅ Animación ${animKey} precargada (${anim.frames} frames)`);
  }

  /**
   * Precarga todas las imágenes de forma progresiva
   */
  async preloadAllImagesAsync(): Promise<void> {
    // console.log('🎮 Iniciando precarga progresiva de todas las animaciones...');
    this._isLoading.next(true);

    try {
      // Cargar por prioridades
      await this.loadAnimationBatch(ANIMATION_PRIORITIES.high, 'alta prioridad');
      await this.loadAnimationBatch(ANIMATION_PRIORITIES.medium, 'media prioridad');
      await this.loadAnimationBatch(ANIMATION_PRIORITIES.low, 'baja prioridad');

      // console.log('🎮 ¡Todas las animaciones han sido precargadas!');
      this._loadingProgress.next(100);
    } catch (error) {
      console.error('❌ Error en la precarga:', error);
    } finally {
      this._isLoading.next(false);
    }
  }

  /**
   * Carga un lote de animaciones
   */
  private async loadAnimationBatch(animations: readonly AnimationKey[], priority: string): Promise<void> {
    // console.log(`🎮 Cargando animaciones de ${priority}...`);

    for (const animKey of animations) {
      await this.preloadAnimation(animKey);
      
      // Actualizar progreso
      this.updateProgress();
      
      // Pequeña pausa para no bloquear el hilo principal
      await this.delay(BOT_CONFIG.loadingDelay);
    }

    // console.log(`✅ Completadas animaciones de ${priority}`);
  }

  /**
   * Carga una imagen individual
   */
  private loadSingleImage(src: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        this._imageCache.set(src, img);
        resolve();
      };
      
      img.onerror = () => {
        console.warn(`⚠️ Error cargando frame: ${src}`);
        resolve(); // Continuar aunque falle
      };
      
      img.src = src;
    });
  }

  /**
   * Carga una imagen bajo demanda
   */
  loadImageOnDemand(src: string): void {
    // Evitar cargas duplicadas
    if (this._imageCache.has(src)) {
      return;
    }

    const img = new Image();
    img.onload = () => {
      this._imageCache.set(src, img);
    };
    img.onerror = () => {
      console.warn(`⚠️ Error cargando imagen bajo demanda: ${src}`);
    };
    img.src = src;
  }

  /**
   * Verifica si una animación está completamente cargada
   */
  isAnimationLoaded(animKey: AnimationKey): boolean {
    const anim = BOT_CONFIG.animations[animKey];
    if (!anim) return false;

    for (let i = 0; i < anim.frames; i++) {
      const frameNumber = i.toString().padStart(3, '0');
      const src = this.buildFrameUrl(anim.folder, frameNumber);
      
      if (!this._imageCache.has(src)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Asegura que una animación esté cargada
   */
  ensureAnimationLoaded(animKey: AnimationKey): void {
    if (!this.isAnimationLoaded(animKey)) {
      // console.log(`🎮 Cargando animación bajo demanda: ${animKey}`);
      this.preloadAnimation(animKey);
    }
  }

  /**
   * Obtiene la URL del frame de una animación
   */
  getFrameUrl(animKey: AnimationKey, frameIndex: number): string {
    const anim = BOT_CONFIG.animations[animKey];
    if (!anim) return '';

    const frameNumber = frameIndex.toString().padStart(3, '0');
    return this.buildFrameUrl(anim.folder, frameNumber);
  }

  /**
   * Obtiene la imagen del cache o la URL directa
   */
  getFrameImage(animKey: AnimationKey, frameIndex: number): string {
    const src = this.getFrameUrl(animKey, frameIndex);
    
    // Usar imagen del cache si está disponible
    const cachedImg = this._imageCache.get(src);
    if (cachedImg) {
      return cachedImg.src;
    }

    // Si no está en cache, cargarla bajo demanda
    this.loadImageOnDemand(src);
    return src;
  }

  /**
   * Obtiene el estado de carga de todas las animaciones
   */
  getLoadingStatus(): LoadingStatus {
    const status: LoadingStatus = {};

    Object.keys(BOT_CONFIG.animations).forEach(animKey => {
      status[animKey] = this.isAnimationLoaded(animKey as AnimationKey);
    });

    return status;
  }

  /**
   * Obtiene estadísticas de la cache
   */
  getCacheStats(): CacheStats {
    const totalAnimations = Object.keys(BOT_CONFIG.animations).length;
    const loadedAnimations = Object.values(this.getLoadingStatus())
      .filter(loaded => loaded).length;

    return {
      totalCached: this._imageCache.size,
      totalAnimations,
      percentage: Math.round((loadedAnimations / totalAnimations) * 100)
    };
  }

  /**
   * Limpia la cache de imágenes
   */
  clearImageCache(): void {
    // console.log(`🎮 Limpiando cache de imágenes (${this._imageCache.size} imágenes)`);
    this._imageCache.clear();
    this._loadingProgress.next(0);
  }

  /**
   * Construye la URL completa de un frame
   */
  private buildFrameUrl(folder: string, frameNumber: string): string {
    return `${BOT_CONFIG.assetBasePath}${folder}/0_Skeleton_Crusader_${folder}_${frameNumber}.png`;
  }

  /**
   * Actualiza el progreso de carga
   */
  private updateProgress(): void {
    const stats = this.getCacheStats();
    this._loadingProgress.next(stats.percentage);
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}