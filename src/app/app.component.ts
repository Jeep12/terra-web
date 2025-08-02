import { Component, ViewChild, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BotterraComponent } from './components/public/botterra/botterra.component';
import { MiniAk4n1Component } from "./components/mini-ak4n1/mini-ak4n1.component";
import { SkeletonButtonComponent } from "./components/mini-ak4n1/skeleton-button.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BotterraComponent, MiniAk4n1Component, SkeletonButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  @ViewChild('skeletonComponent') skeletonComponent!: MiniAk4n1Component;
  @ViewChild('skeletonButton') skeletonButton!: SkeletonButtonComponent;

  ngOnInit(): void {
    // Verificar si el skeleton ya está cargado al inicializar
    this.checkAndAutoLoadSkeleton();
  }

  async onSkeletonActivated(): Promise<void> {
    if (this.skeletonComponent) {
      await this.skeletonComponent.activateSkeleton();
    }
  }

  /**
   * Limpia el estado del skeleton (para testing o reset)
   */
  public clearSkeletonState(): void {
    sessionStorage.removeItem('skeleton_loaded');
    console.log('🧹 Estado del skeleton limpiado');
    
    // Simular limpieza de cache de imágenes
    console.log('🧹 Cache de imágenes limpiada (simulado)');
    
    // Recargar la página para aplicar los cambios
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  /**
   * Verifica si el skeleton ya está cargado y lo activa automáticamente
   */
  private async checkAndAutoLoadSkeleton(): Promise<void> {
    const skeletonLoaded = sessionStorage.getItem('skeleton_loaded');
    
    if (skeletonLoaded === 'true') {
      // Verificar si las imágenes están realmente en cache
      const imagesInCache = await this.checkImagesInCache();
      
      if (imagesInCache) {
        console.log('🔄 Skeleton detectado como previamente cargado, activando automáticamente...');
        
        // Esperar un poco para que el componente esté listo
        setTimeout(async () => {
          if (this.skeletonComponent) {
            await this.skeletonComponent.activateSkeleton();
            console.log('✅ Skeleton activado automáticamente');
          }
        }, 1000);
      } else {
        console.log('⚠️ Skeleton marcado como cargado pero imágenes no en cache, limpiando estado...');
        sessionStorage.removeItem('skeleton_loaded');
        
        // Actualizar el estado del botón después de limpiar
        setTimeout(() => {
          if (this.skeletonButton) {
            this.skeletonButton.updateButtonState();
            console.log('🔄 Estado del botón actualizado después de limpiar cache');
          }
        }, 100);
      }
    } else {
      console.log('ℹ️ Skeleton no cargado previamente, esperando activación manual');
      // Limpiar cualquier estado residual
      sessionStorage.removeItem('skeleton_loaded');
    }
  }

  /**
   * Verifica si las imágenes del skeleton están en cache
   */
  private async checkImagesInCache(): Promise<boolean> {
    try {
      // Lista de URLs de imágenes críticas del skeleton
      const criticalImages = [
        '/assets/sprite-boot/_PNG/1_KNIGHT/Knight_01__ATTACK_000.png',
        '/assets/sprite-boot/_PNG/1_KNIGHT/Knight_01__IDLE_000.png',
        '/assets/sprite-boot/_PNG/1_KNIGHT/Knight_01__WALKING_000.png'
      ];

      // Verificar cada imagen
      for (const imageUrl of criticalImages) {
        const isCached = await this.isImageCached(imageUrl);
        if (!isCached) {
          console.log(`❌ Imagen no en cache: ${imageUrl}`);
          return false;
        }
      }

      console.log('✅ Todas las imágenes críticas están en cache');
      return true;
    } catch (error) {
      console.error('❌ Error verificando cache de imágenes:', error);
      return false;
    }
  }

  /**
   * Verifica si una imagen específica está en cache
   */
  private async isImageCached(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        // Si se carga rápidamente, probablemente está en cache
        resolve(true);
      };
      
      img.onerror = () => {
        resolve(false);
      };
      
      // Agregar timestamp para evitar cache del navegador
      const urlWithTimestamp = `${imageUrl}?t=${Date.now()}`;
      img.src = urlWithTimestamp;
      
      // Timeout después de 2 segundos
      setTimeout(() => {
        resolve(false);
      }, 2000);
    });
  }
}


