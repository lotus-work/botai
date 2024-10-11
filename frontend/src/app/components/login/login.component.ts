import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  originUrl: string = document.location.origin;  // Define the origin URL

  constructor(public auth: AuthService, private router: Router) {
    
  }
  ngOnInit() {
    // Check if user is authenticated or if two specific keys in localStorage exist with values
    if (this.auth.isAuthenticated$ && this.checkAuthKeysExist()) {
      this.router.navigate(['']);
    }
  }
  // Trigger login
  login() {
    this.auth.loginWithRedirect();
  }
  checkAuthKeysExist(): boolean {
    const keys = Object.keys(localStorage);
    const authKeys = keys.filter(key => key.startsWith('@@auth0spajs@@::'));
    
    // Check if there are at least 2 keys starting with @@auth0spajs@@:: and their values exist
    return authKeys.length >= 2 && authKeys.every(key => localStorage.getItem(key));
  }
}
