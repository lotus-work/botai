import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ad-navbar',
  templateUrl: './ad-navbar.component.html',
  styleUrl: './ad-navbar.component.css'
})
export class AdNavbarComponent implements OnInit{
  constructor(private router: Router) {}

  basicinfo : any = [];
  signOut() {
    localStorage.removeItem('userData');
    this.router.navigate(['admin/login']);
  }

  ngOnInit(): void {
    const basicDetails = localStorage.getItem('basicInfo');
    if (basicDetails) {
      this.basicinfo = JSON.parse(basicDetails);
    }
  }
}
