import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BotterraComponent } from "./components/public/botterra/botterra.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BotterraComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'terra-web';

  constructor() {

  }


}


