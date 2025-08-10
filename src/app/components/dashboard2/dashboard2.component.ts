import { Component, type OnInit, HostListener, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterModule, RouterOutlet } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { AccountMaster } from "../../models/master.account.model"
import { Subscription, take } from 'rxjs';
import { PreloadComponent } from "../public/preload/preload.component";

@Component({
  selector: "app-dashboard2",
  imports: [CommonModule, RouterOutlet, RouterModule, PreloadComponent],
  standalone: true,
  templateUrl: "./dashboard2.component.html",
  styleUrl: "./dashboard2.component.css",
})
export class Dashboard2Component implements OnInit, OnDestroy {
  sidebarCollapsed = false
  isMobile = false
  accountMaster: AccountMaster | any = null;
  isLoading = true;
  private subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router) {

  }

  ngOnInit() {
    this.checkScreenSize()
    // Initialize sidebar state based on screen size
    if (this.isMobile) {
      this.sidebarCollapsed = true
    }
    this.loadUserData();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.checkScreenSize()
    // Auto-collapse sidebar on mobile
    if (this.isMobile && !this.sidebarCollapsed) {
      this.sidebarCollapsed = true
    }
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed
  }

  loadUserData() {
    console.log('🔍 [DASHBOARD2] loadUserData() llamado');
    this.isLoading = true;
    
    // Limpiar suscripción anterior si existe
    this.subscription.unsubscribe();
    this.subscription = new Subscription();

    console.log('🔍 [DASHBOARD2] Haciendo llamada a getCurrentUser()');
    const userSub = this.authService.getCurrentUser().pipe(take(1)).subscribe({
      next: user => {
        console.log('🔍 [DASHBOARD2] Respuesta exitosa de getCurrentUser:', user);
        if (user) {
          this.accountMaster = user;
          console.log('🔍 [DASHBOARD2] Usuario establecido:', this.accountMaster);
        } else {
          console.error('🔍 [DASHBOARD2] No user data found');
          this.accountMaster = null;
        }
        this.isLoading = false;
        console.log('🔍 [DASHBOARD2] Loading completado');
      },
      error: err => {
        console.error('🔍 [DASHBOARD2] Error fetching user:', err);
        console.error('🔍 [DASHBOARD2] Error status:', err?.status);
        console.error('🔍 [DASHBOARD2] Error message:', err?.message);
        this.accountMaster = null;
        this.isLoading = false;
        
        // Manejar errores específicos
        if (err?.status === 401) {
          console.log('🔍 [DASHBOARD2] Error 401 detectado, intentando refresh token');
          // Token expirado, intentar refresh UNA SOLA VEZ
          const refreshSub = this.authService.refreshToken().pipe(take(1)).subscribe({
            next: (refreshResponse) => {
              console.log('🔍 [DASHBOARD2] Refresh token exitoso:', refreshResponse);
              console.log('🔍 [DASHBOARD2] Cookies después del refresh:', document.cookie);
              // NO llamar loadUserData() de nuevo para evitar loops
              // En su lugar, redirigir al login si el refresh falla
              console.log('🔍 [DASHBOARD2] Token refreshed successfully');
            },
            error: (refreshError) => {
              console.error('🔍 [DASHBOARD2] Refresh token failed:', refreshError);
              console.error('🔍 [DASHBOARD2] Refresh error status:', refreshError?.status);
              console.error('🔍 [DASHBOARD2] Refresh error message:', refreshError?.message);
              this.router.navigate(['/login']);
            }
          });
          this.subscription.add(refreshSub);
        } else if (err?.message === '2FA required') {
          console.log('🔍 [DASHBOARD2] 2FA required, navegando a two-factor');
          this.router.navigate(['/two-factor-step']);
        } else {
          // Otros errores, redirigir al login
          console.log('🔍 [DASHBOARD2] Otro error, navegando a login');
          this.router.navigate(['/login']);
        }
      }
    });

    this.subscription.add(userSub);
  }

  logout() {
    const logoutSub = this.authService.logout().pipe(take(1)).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: err => {
        console.error('Logout error:', err);
        // Forzar logout local
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });

    this.subscription.add(logoutSub);
  }
}
