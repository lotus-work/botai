import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']  // Corrected styleUrls
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      if (!isAuthenticated && !this.checkAuthKeysExist()) {
        this.router.navigate(['login']);
      } 
    });
  }

  checkAuthKeysExist(): boolean {
    const keys = Object.keys(localStorage);
    const authKeys = keys.filter(key => key.startsWith('@@auth0spajs@@::'));

    return authKeys.length >= 2 && authKeys.every(key => localStorage.getItem(key));
  }

  async logout() {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin + "/login" } });
  }
}
