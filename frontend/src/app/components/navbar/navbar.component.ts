import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../services/user/user.service';
import { Title } from '@angular/platform-browser'; 

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userData: any = [];
  constructor(
    public auth: AuthService,
    private router: Router,
    private userService: UserService,
    private titleService: Title 
  ) {}

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      if (!isAuthenticated && !this.checkAuthKeysExist()) {
        this.router.navigate(['login']);
      } else if (isAuthenticated) {
        // Subscribe to the user observable to get user details
        this.auth.user$.subscribe(user => {
          if (user) {
            if (user.name && user.email) {
              this.userService.addUser(user.name, user.email)
                .subscribe({
                  next: (response) => {
                    if (response.isSuccessful) {
                      this.userData = response.result.user;
                      const userWithOrganization = {
                        ...response.result.user,
                        organization: response.result.organization,
                        gptAssistant : response.result.gptAssistant
                      };
        
                      // Store the combined object in localStorage
                      localStorage.setItem('user', JSON.stringify(userWithOrganization));
                      
                      // Conditionally set the title based on userData
                      if (this.userData && this.userData.appName && this.userData.appName !== "") {
                        this.titleService.setTitle(this.userData.appName);
                      } else {
                        this.titleService.setTitle("Welcome");
                      }

                      if (this.userData.appLogo) {
                        this.updateFavicon(this.userData.appLogo);
                      }

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

  updateFavicon(faviconPath: string) {
    const linkElement: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
    linkElement.type = 'image/x-icon';
    linkElement.rel = 'shortcut icon';
    linkElement.href = faviconPath;
  
    // Append to head if it doesn't already exist
    if (!document.querySelector("link[rel*='icon']")) {
      document.head.appendChild(linkElement);
    }
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
