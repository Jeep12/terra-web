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
    // No hacer nada aquí - el botón siempre se muestra
  }

  async onSkeletonActivated(): Promise<void> {
    if (this.skeletonComponent) {
      await this.skeletonComponent.activateSkeleton();
    }
  }
}


