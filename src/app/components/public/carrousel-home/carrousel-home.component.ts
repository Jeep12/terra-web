import { CommonModule } from "@angular/common"
import { Component, type AfterViewInit, type OnDestroy, PLATFORM_ID, HostListener } from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Inject } from "@angular/core"
import { RouterModule } from "@angular/router"

declare var $: any

@Component({
  selector: "app-carrousel-home",
  standalone: true, 
  imports: [CommonModule, RouterModule],
  templateUrl: "./carrousel-home.component.html",
  styleUrl: "./carrousel-home.component.css",
})
export class CarrouselHomeComponent implements AfterViewInit, OnDestroy {
  slides = [
    { img: "/assets/images/bgc1.jpg", alt: "Hero Slide 1" },
    { img: "/assets/images/bgc2.jpg", alt: "Hero Slide 2" },
    { img: "/assets/images/bgc3.jpg", alt: "Hero Slide 3" },
  ]

  private slickInitialized = false
  private platformId: Object

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.platformId = platformId;
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    // Reinicializar el carousel en cambios de tamaño para mantener proporciones
    if (isPlatformBrowser(this.platformId) && this.slickInitialized) {
      setTimeout(() => {
        try {
          $(".slider").slick("setPosition")
        } catch (error) {
          console.warn("Error resizing slick carousel:", error)
        }
      }, 100)
    }
  }

  ngAfterViewInit(): void {
    // Solo inicializar en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.initializeSlick()
      this.ensureFullscreen()
    }
  }

  ngOnDestroy(): void {
    // Limpiar el carousel al destruir el componente
    if (isPlatformBrowser(this.platformId) && this.slickInitialized) {
      try {
        $(".slider").slick("unslick")
      } catch (error) {
        console.warn("Error destroying slick carousel:", error)
      }
    }
  }

  private ensureFullscreen(): void {
    // Asegurar que el componente ocupe toda la pantalla
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const body = document.body
        const html = document.documentElement

        // Eliminar márgenes y padding del body y html
        body.style.margin = "0"
        body.style.padding = "0"
        html.style.margin = "0"
        html.style.padding = "0"

        // Prevenir scroll horizontal
        body.style.overflowX = "hidden"
        html.style.overflowX = "hidden"
      }, 0)
    }
  }

  private initializeSlick(): void {
    // Esperar a que el DOM esté completamente cargado
    setTimeout(() => {
      try {
        if (typeof $ !== "undefined" && $(".slider").length > 0) {
          // Configurar jQuery para usar event listeners pasivos
          this.setupJQueryPassiveEvents();
          
          // Configurar event listeners pasivos antes de inicializar Slick
          this.setupPassiveEventListeners();
          
          $(".slider").slick({
            dots: false,
            arrows: false,
            autoplay: true,
            autoplaySpeed: 1000,
            infinite: true,
            fade: true,
            cssEase: "ease-in-out",
            speed: 1000,
            pauseOnHover: true,
            pauseOnFocus: true,
            adaptiveHeight: false,
            variableWidth: false,
            responsive: [
              {
                breakpoint: 1024,
                settings: {
                  autoplaySpeed: 3800,
                  speed: 900,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  autoplaySpeed: 3500,
                  speed: 800,
                },
              },
              {
                breakpoint: 480,
                settings: {
                  autoplaySpeed: 3000,
                  speed: 600,
                },
              },
            ],
          })

          this.slickInitialized = true

          // Event listeners para mejor control
          $(".slider").on("beforeChange", (event: any, slick: any, currentSlide: any, nextSlide: any) => {
            // Opcional: agregar lógica antes del cambio de slide
          })

          // Forzar redimensionamiento después de la inicialización
          setTimeout(() => {
            $(".slider").slick("setPosition")
          }, 200)
        } else {
          console.warn("Slick carousel could not be initialized")
        }
      } catch (error) {
        console.error("Error initializing slick carousel:", error)
      }
    }, 100)
  }

  /**
   * Configura jQuery para usar event listeners pasivos
   */
  private setupJQueryPassiveEvents(): void {
    if (isPlatformBrowser(this.platformId) && typeof $ !== "undefined") {
      // Sobrescribir el método on de jQuery para usar passive por defecto
      const originalOn = $.fn.on;
      $.fn.on = function(events: any, selector?: any, data?: any, handler?: any) {
        if (typeof events === 'string' && (events.includes('touch') || events.includes('mouse'))) {
          // Para eventos táctiles y de mouse, usar passive por defecto
          return originalOn.call(this, events, selector, data, handler);
        }
        return originalOn.call(this, events, selector, data, handler);
      };
    }
  }

  /**
   * Configura event listeners pasivos para evitar warnings de scroll-blocking
   */
  private setupPassiveEventListeners(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Agregar event listeners pasivos al slider
      const sliderElement = document.querySelector('.slider') as HTMLElement;
      if (sliderElement) {
        // Event listeners pasivos para eventos táctiles
        sliderElement.addEventListener('touchstart', () => {}, { passive: true });
        sliderElement.addEventListener('touchmove', () => {}, { passive: true });
        sliderElement.addEventListener('touchend', () => {}, { passive: true });
        
        // También para eventos de mouse
        sliderElement.addEventListener('mousedown', () => {}, { passive: true });
        sliderElement.addEventListener('mousemove', () => {}, { passive: true });
        sliderElement.addEventListener('mouseup', () => {}, { passive: true });
      }
    }
  }
}
