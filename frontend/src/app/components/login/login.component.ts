import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { AdServiceSettingsService } from '../../services/admin/ad-service-settings/ad-service-settings.service';
import { Title, DomSanitizer, SafeResourceUrl  } from '@angular/platform-browser'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  originUrl: string = document.location.origin;  // Define the origin URL
  basicinfo : any = [];
  mainLogoUrl: SafeResourceUrl | string = '';
  faviconUrl: SafeResourceUrl | string = '';

  constructor(public auth: AuthService, private router: Router, private adSettingsService : AdServiceSettingsService,  private titleService: Title,   private sanitizer: DomSanitizer ) {
    
  }
  ngOnInit() {
    this.fetchAndStoreBasicInfo();
    // Check if user is authenticated or if two specific keys in localStorage exist with values
    if (this.auth.isAuthenticated$ && this.checkAuthKeysExist()) {
      this.router.navigate(['']);
    }
  }

  fetchAndStoreBasicInfo() {
    this.adSettingsService.getBasicInfo('yourPage').subscribe(
      (data) => {
        this.basicinfo = data;
        localStorage.setItem('basicInfo', JSON.stringify(data));

        if (this.basicinfo.appName) {
          this.titleService.setTitle(this.basicinfo.appName);
        } else {
          this.titleService.setTitle('Welcome');
        }

        if (this.basicinfo.websiteFaviconPath) {
          this.updateFavicon(this.basicinfo.websiteFaviconPath);
        }
      },
      (error) => {
        console.error('Error fetching basic info:', error);
      }
    );
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
