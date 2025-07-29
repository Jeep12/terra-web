import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BotterraComponent } from './components/public/botterra/botterra.component';
import { BotSpriteComponent } from "./components/public/bot-sprite/bot-sprite.component";
import { MiniAk4n1Component } from "./components/mini-ak4n1/mini-ak4n1.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BotterraComponent, MiniAk4n1Component],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}


