import { Component, ViewChild, ElementRef, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-skeleton-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-button.component.html',
  styleUrls: ['./skeleton-button.component.css']
})
export class SkeletonButtonComponent implements OnInit, OnDestroy {
  @Output() skeletonActivated = new EventEmitter<void>();

  public isLoading = false;
  public isLoaded = false;
  public imagesAreCached = false; // Nueva propiedad para el resultado
  public shouldShowButton = true; // Nueva propiedad para controlar visibilidad

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Ocultar el botón inicialmente hasta que el preload se cierre
    this.isLoaded = false;
    this.isLoading = false;
    this.shouldShowButton = false;
    
    // Esperar a que el preload se cierre antes de mostrar el botón
    this.waitForPreloadToClose();
    
    // Escuchar evento de activación automática
    window.addEventListener('skeletonAutoActivated', this.onSkeletonAutoActivated.bind(this) as EventListener);
    
    // Esperar un poco más antes de verificar cache para dar tiempo al sprite
    setTimeout(() => {
      this.checkImagesCache().then(allCached => {
        this.imagesAreCached = allCached;
        
        // Si no están todas cacheadas, verificar si el sprite ya se activó automáticamente
        if (!allCached) {
          this.checkIfSkeletonIsAlreadyActive();
        }
      });
    }, 500); // Esperar 500ms para dar tiempo al sprite de verificar
    
    setTimeout(() => {
      this.checkButtonVisibility();
    }, 100);
  }

  ngOnDestroy(): void {
    // Remover listener al destruir el componente
    window.removeEventListener('skeletonAutoActivated', this.onSkeletonAutoActivated.bind(this) as EventListener);
  }

  /**
   * Maneja el evento de activación automática del skeleton
   */
  private onSkeletonAutoActivated(event: Event): void {
    // Esperar un poco para asegurar que el sprite esté completamente cargado
    setTimeout(() => {
      this.isLoaded = true;
      this.shouldShowButton = false;
    }, 100);
  }

  /**
   * Verifica si las imágenes críticas están en cache
   * @returns true si todas las imágenes están cacheadas, false si no
   */
  public async checkImagesCache(): Promise<boolean> {
    const criticalImages = [
      'https://assets.l2terra.online/sprites/Skeleton_Crusader_3/PNG/PNG%20Sequences/Idle/0_Skeleton_Crusader_Idle_000.png',
      'https://assets.l2terra.online/sprites/Skeleton_Crusader_3/PNG/PNG%20Sequences/Walking/0_Skeleton_Crusader_Walking_000.png',
      'https://assets.l2terra.online/sprites/Skeleton_Crusader_3/PNG/PNG%20Sequences/Running/0_Skeleton_Crusader_Running_000.png'
    ];
    let cachedCount = 0;
    const totalImages = criticalImages.length;
    
    for (const imageUrl of criticalImages) {
      const isCached = await this.isImageCached(imageUrl);
      if (isCached) {
        cachedCount++;
      }
    }
    
    const allCached = cachedCount === totalImages;
    
    return allCached;
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
      
      // NO agregar timestamp para permitir que el cache funcione
      img.src = imageUrl;
      
      // Timeout después de 1 segundo (más rápido para detectar cache)
      setTimeout(() => {
        resolve(false);
      }, 1000);
    });
  }

  /**
   * Método público para usar en el HTML
   * @returns true si las imágenes están cacheadas
   */
  public areImagesCached(): boolean {
    return this.imagesAreCached;
  }

  /**
   * Actualiza el estado del botón
   */
  public updateButtonState(): void {
    // Estado del botón actualizado
  }

  private checkButtonVisibility(): void {
    const button = document.querySelector('.skeleton-button-container');
    if (button) {
      const rect = button.getBoundingClientRect();
      // Botón visible en el DOM
    }
  }

  /**
   * Espera a que el preload se cierre antes de mostrar el botón
   */
  private waitForPreloadToClose(): void {
    let checkCount = 0;
    const maxChecks = 100; // Máximo 10 segundos (100 * 100ms)
    
    const checkPreload = () => {
      checkCount++;
      const preloader = document.querySelector('.nk-preloader') as HTMLElement;
      
      if (preloader) {
        const isVisible = preloader.style.display !== 'none' && 
                         preloader.style.opacity !== '0' && 
                         preloader.offsetParent !== null;
        
        if (isVisible && checkCount < maxChecks) {
          // El preload aún está visible, esperar más
          setTimeout(checkPreload, 100);
        } else {
          // El preload se cerró o timeout, verificar si el sprite ya está activo
          this.checkSpriteStateAfterPreload();
        }
      } else {
        // No hay preload, verificar estado del sprite
        this.checkSpriteStateAfterPreload();
      }
    };
    
    // Esperar un poco antes de empezar a verificar
    setTimeout(checkPreload, 500);
  }

  /**
   * Verifica el estado del sprite después de que el preload se cierre
   */
  private checkSpriteStateAfterPreload(): void {
    // Esperar un poco para que el sprite tenga tiempo de activarse si va a hacerlo automáticamente
    setTimeout(() => {
      const skeletonElement = document.querySelector('.skeleton-wrapper') as HTMLElement;
      const spriteElement = document.querySelector('.sprite') as HTMLImageElement;
      
      if (skeletonElement && spriteElement) {
        const isSpriteActive = skeletonElement.style.display !== 'none' && 
                              skeletonElement.offsetParent !== null &&
                              spriteElement.complete && 
                              spriteElement.naturalWidth > 0;
        
        if (isSpriteActive) {
          this.isLoaded = true;
          this.shouldShowButton = false;
        } else {
          this.shouldShowButton = true;
        }
      } else {
        this.shouldShowButton = true;
      }
    }, 1000); // Esperar 1 segundo para dar tiempo a la activación automática
  }

  /**
   * Verifica si el skeleton ya está activo (por activación automática)
   */
  private checkIfSkeletonIsAlreadyActive(): void {
    // Verificar si el skeleton está visible en el DOM
    const skeletonElement = document.querySelector('.skeleton-wrapper') as HTMLElement;
    const spriteElement = document.querySelector('.sprite') as HTMLImageElement;
    
    if (skeletonElement && spriteElement) {
      const isVisible = skeletonElement.style.display !== 'none' && 
                       skeletonElement.offsetParent !== null &&
                       spriteElement.complete && 
                       spriteElement.naturalWidth > 0;
      
      if (isVisible) {
        this.isLoaded = true;
        this.shouldShowButton = false;
        return;
      }
    }
    
    // También verificar si el evento de activación automática ya se disparó
    if (this.imagesAreCached) {
      // Esperar un poco más para dar tiempo a que el sprite se active
      setTimeout(() => {
        this.checkIfSkeletonIsAlreadyActive();
      }, 1000);
    }
  }

  async toggleSkeleton(): Promise<void> {
    if (this.isLoaded) {
      // Si ya está cargado, solo mostrar un mensaje
      this.showNotification('¡El Skeleton ya está activo!', 'info');
      return;
    }

    if (this.isLoading) {
      return; // Evitar múltiples clics
    }

    this.isLoading = true;

    try {
      // Emitir evento para activar el skeleton
      this.skeletonActivated.emit();
      
      // Esperar a que el skeleton esté realmente cargado
      await this.waitForSkeletonToLoad();
      
      this.isLoaded = true;
      this.isLoading = false;
      this.shouldShowButton = false; // Ocultar el botón después de cargar manualmente
      
      this.showNotification('¡Skeleton cargado exitosamente!', 'success');
      
    } catch (error) {
      this.isLoading = false;
      this.showNotification('Error al cargar el Skeleton', 'error');
    }
  }

  /**
   * Espera a que el skeleton esté realmente cargado
   */
  private async waitForSkeletonToLoad(): Promise<void> {
    const maxWaitTime = 30000; // 30 segundos máximo
    const checkInterval = 100; // Verificar cada 100ms
    let elapsedTime = 0;
    
    while (elapsedTime < maxWaitTime) {
      // Buscar el elemento del skeleton en el DOM
      const skeletonElement = document.querySelector('.skeleton-wrapper');
      const spriteElement = document.querySelector('.sprite');
      
      // Verificar si el skeleton está visible y el sprite está cargado
      if (skeletonElement && spriteElement) {
        const sprite = spriteElement as HTMLImageElement;
        
        // Verificar si la imagen está completamente cargada
        if (sprite.complete && sprite.naturalWidth > 0) {
          return;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsedTime += checkInterval;
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      z-index: 10001;
      animation: slideIn 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
} 