import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  user: any;
  constructor(public auth: AuthService) {
    this.auth.user$.subscribe((userData) => {
      this.user = userData;
    });
  }
}
