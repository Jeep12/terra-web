import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AccountMaster } from '../../models/master.account.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NgOptimizedImage],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  navVisible = true;
  resolucionCambiada: boolean = false;
  accountM: AccountMaster | any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {


  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: user => {
        this.accountM = user ?? null;
        if (this.accountM) {

          

        } else {
          console.error('No user data found');
        }
      },
      error: err => {
        console.error('Error fetching user:', err);
        this.accountM = null;
      }
    });
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth >= 1080) {
      this.navVisible = true;
      console.log('Pasó los 1080px');
    }
  }

  toggleNav() {
    console.log('Toggling navigation visibility');
    this.navVisible = !this.navVisible;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => console.error(err)
    });
  }

  navigateToCreateAccountGame() {
    this.router.navigate(['/dashboard/create-account-game']);
  }

  navigateToChangePasswordGame() {
    this.router.navigate(['/dashboard/change-password-game']);
  }
}