import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BotterraComponent } from './components/public/botterra/botterra.component';
import { BotSpriteComponent } from "./components/public/bot-sprite/bot-sprite.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BotterraComponent, BotSpriteComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}


