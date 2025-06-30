import { Component, type OnInit, HostListener } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterModule, RouterOutlet } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { AccountMaster } from "../../models/master.account.model"


@Component({
  selector: "app-dashboard2",
  imports: [CommonModule, RouterOutlet, RouterModule],
  standalone: true,
  templateUrl: "./dashboard2.component.html",
  styleUrl: "./dashboard2.component.css",
})
export class Dashboard2Component implements OnInit {
  sidebarCollapsed = false
  isMobile = false
  accountMaster: AccountMaster | any = null;

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
    this.authService.getCurrentUser().subscribe({
      next: user => {
        if (user) {
          this.accountMaster = user;
        } else {
          console.error('No user data found');
          this.accountMaster = null;
        }
      },
      error: err => {
        console.error('Error fetching user:', err);
        if (err?.message === '2FA required') {
          this.router.navigate(['/two-factor-step']);
        }
      }
    });
  }
  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => console.error(err)
    });
  }


}
