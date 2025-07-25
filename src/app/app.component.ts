import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BotterraComponent } from './components/public/botterra/botterra.component';
import { SpriteBotComponent } from './components/public/sprite-bot/sprite-bot.component';
import { MiniAk4n1Component } from "./components/public/mini-ak4n1/mini-ak4n1.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BotterraComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}


