import { Component, ViewChild, ElementRef, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-button.component.html',
  styleUrls: ['./skeleton-button.component.css']
})
export class SkeletonButtonComponent implements OnInit {
  @Output() skeletonActivated = new EventEmitter<void>();

  public isLoading = false;
  public isLoaded = false;

  ngOnInit(): void {
    console.log('🔘 SkeletonButtonComponent inicializado');
    
    // Verificar si ya está cargado desde sessionStorage
    this.updateButtonState();
    
    // Verificar que el botón esté en el DOM solo si no está cargado
    if (!this.isLoaded) {
      setTimeout(() => {
        this.checkButtonVisibility();
      }, 100);
    }
  }

  /**
   * Actualiza el estado del botón basado en sessionStorage
   */
  public updateButtonState(): void {
    const skeletonLoaded = sessionStorage.getItem('skeleton_loaded');
    if (skeletonLoaded === 'true') {
      this.isLoaded = true;
      console.log('🔘 Skeleton ya cargado anteriormente - ocultando botón');
    } else {
      this.isLoaded = false;
      console.log('🔘 Skeleton no cargado, mostrando botón');
    }
    
    console.log('🔘 Estado final - isLoaded:', this.isLoaded, 'isLoading:', this.isLoading);
  }

  private checkButtonVisibility(): void {
    const button = document.querySelector('.skeleton-button-container');
    if (button) {
      console.log('✅ Botón encontrado en el DOM');
      const rect = button.getBoundingClientRect();
      console.log('📍 Posición del botón:', rect);
      console.log('👁️ Botón visible:', rect.width > 0 && rect.height > 0);
    } else {
      console.log('❌ Botón NO encontrado en el DOM');
    }
  }

  async toggleSkeleton(): Promise<void> {
    console.log('🔘 Botón skeleton clickeado');
    
    if (this.isLoaded) {
      // Si ya está cargado, solo mostrar un mensaje
      this.showNotification('¡El Skeleton ya está activo!', 'info');
      return;
    }

    if (this.isLoading) {
      return; // Evitar múltiples clics
    }

    this.isLoading = true;
    console.log('🔘 Iniciando carga del skeleton...');

    try {
      // Emitir evento para activar el skeleton
      this.skeletonActivated.emit();
      
      // Esperar a que el skeleton esté realmente cargado
      await this.waitForSkeletonToLoad();
      
      this.isLoaded = true;
      this.isLoading = false;
      
      // Guardar en sessionStorage
      sessionStorage.setItem('skeleton_loaded', 'true');
      
      this.showNotification('¡Skeleton cargado exitosamente!', 'success');
      console.log('🔘 Skeleton cargado exitosamente');
      
    } catch (error) {
      console.error('❌ Error cargando skeleton:', error);
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
    
    console.log('⏳ Esperando a que el skeleton se cargue completamente...');
    
    while (elapsedTime < maxWaitTime) {
      // Buscar el elemento del skeleton en el DOM
      const skeletonElement = document.querySelector('.skeleton-wrapper');
      const spriteElement = document.querySelector('.sprite');
      
      // Verificar si el skeleton está visible y el sprite está cargado
      if (skeletonElement && spriteElement) {
        const sprite = spriteElement as HTMLImageElement;
        
        // Verificar si la imagen está completamente cargada
        if (sprite.complete && sprite.naturalWidth > 0) {
          console.log('✅ Skeleton detectado como cargado completamente');
          return;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsedTime += checkInterval;
    }
    
    console.warn('⚠️ Timeout esperando skeleton, pero continuando...');
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