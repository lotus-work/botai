import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mis-navbar',
  templateUrl: './mis-navbar.component.html',
  styleUrl: './mis-navbar.component.css'
})
export class MisNavbarComponent implements OnInit{
  basicinfo : any = [];
  ngOnInit(): void {
    const basicDetails = localStorage.getItem('basicInfo');
    if (basicDetails) {
      this.basicinfo = JSON.parse(basicDetails);
    }
  }
}
