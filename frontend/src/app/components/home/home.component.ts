import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(public auth: AuthService, private router: Router) {
   
  }
  ngOnInit(){
    if (this.auth.isAuthenticated$ && this.checkAuthKeysExist()) {
      this.router.navigate(['']);
    }else{
      this.router.navigate(['login']);
    }
  }

  checkAuthKeysExist(): boolean {
    const keys = Object.keys(localStorage);
    const authKeys = keys.filter(key => key.startsWith('@@auth0spajs@@::'));
    
    // Check if there are at least 2 keys starting with @@auth0spajs@@:: and their values exist
    return authKeys.length >= 2 && authKeys.every(key => localStorage.getItem(key));
  }
  async logout() {
    this.auth.logout({ logoutParams: { returnTo: "http://localhost:4200/login" } });
  }
}
