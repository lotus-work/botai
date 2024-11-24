import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgToastService } from 'ng-angular-popup';
import { AdServiceSettingsService } from '../../services/admin/ad-service-settings/ad-service-settings.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit {
  aboutUsContent: string = '';
  basicinfo: any = [];
  constructor(
    private pageSettingsService: AdServiceSettingsService,
    private spinner: NgxSpinnerService,
    private _toast: NgToastService,
    private titleService: Title,  
  ) {}

  ngOnInit(): void {
    this.fetchAboutUsContent();
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


  fetchAboutUsContent(): void {
    this.spinner.show();
    this.pageSettingsService.getPageSettings('aboutUs').subscribe(
      (response) => {
        this.spinner.hide();
        if (response.isSuccessful && response.result) {
          this.aboutUsContent = response.result.aboutUs; // Assuming `aboutUs` is part of the response
        } else {
          this.aboutUsContent = 'No content available.';
        }
      },
      (error) => {
        this.spinner.hide();
        this._toast.error({ detail: "ERROR", summary: 'Error fetching About Us content', position: 'br' });
      }
    );
  }
}
