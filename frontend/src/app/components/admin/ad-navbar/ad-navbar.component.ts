import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ad-navbar',
  templateUrl: './ad-navbar.component.html',
  styleUrl: './ad-navbar.component.css'
})
export class AdNavbarComponent {
  constructor(private router: Router) {}

  signOut() {
    localStorage.removeItem('userData');
    this.router.navigate(['admin/login']);
  }
}
