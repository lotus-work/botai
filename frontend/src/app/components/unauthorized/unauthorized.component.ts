import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent implements OnInit{
  basicinfo: any = [];
  constructor(
    private spinner: NgxSpinnerService,
    private titleService: Title, 
  ) {}
  ngOnInit(): void {
    this.spinner.show();
    const basicDetails = localStorage.getItem('basicInfo');
    if (basicDetails) {
      this.basicinfo = JSON.parse(basicDetails);
      this.updateFavicon(this.basicinfo.websiteFaviconPath);
    }

    if (this.basicinfo.appName) {
      this.titleService.setTitle(this.basicinfo.appName);
    } else {
      this.titleService.setTitle('Welcome');
    }

    setTimeout(() => {
      this.spinner.hide();
    }, 1000);

        localStorage.clear();
        sessionStorage.clear();
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
}
