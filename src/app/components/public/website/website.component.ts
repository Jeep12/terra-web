import { CommonModule } from "@angular/common";
import { Component, HostListener, OnInit, OnDestroy } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-website",
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: "./website.component.html",
  styleUrls: ["./website.component.css"],
})
export class WebsiteComponent implements OnInit, OnDestroy {
  isLoggedIn$!: Observable<boolean>;
  private destroy$ = new Subject<void>();
  isMenuOpen = false;

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = this.authService.isLoggedIn();
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const navbar = document.querySelector(".navbar-container");
    if (this.isMenuOpen && navbar && !navbar.contains(target)) {
      this.closeMenu();
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize(): void {
    if (window.innerWidth >= 768) {
      this.closeMenu();
    }
  }
}
