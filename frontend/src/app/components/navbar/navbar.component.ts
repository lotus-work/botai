import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  constructor(
    public auth: AuthService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Check authentication status and get user data
    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      if (!isAuthenticated && !this.checkAuthKeysExist()) {
        this.router.navigate(['login']);
      } else if (isAuthenticated) {
        // Subscribe to the user observable to get user details
        this.auth.user$.subscribe(user => {
          if (user) {
         if(user.name && user.email){
            this.userService.addUser(user.name, user.email)
              .subscribe({
                next: (response) => {
                  if (response.isSuccessful) {
                    localStorage.setItem('user', JSON.stringify(response.result.user));
                  } else {
                    console.error('User addition failed:', response);
                  }
                },
                error: (err) => {
                  console.error('API error:', err);
                }
              });
         }

          }
        });
      }
    });
  }

  checkAuthKeysExist(): boolean {
    const keys = Object.keys(localStorage);
    const authKeys = keys.filter(key => key.startsWith('@@auth0spajs@@::'));
    return authKeys.length >= 2 && authKeys.every(key => localStorage.getItem(key));
  }

  async logout() {
    localStorage.removeItem('user');
    this.auth.logout({ logoutParams: { returnTo: window.location.origin + "/login" } });
  }
}
