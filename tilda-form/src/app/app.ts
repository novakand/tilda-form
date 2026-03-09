import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Form } from './form/form';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Form],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('tilda-form');
}
