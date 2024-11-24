import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgToastService } from 'ng-angular-popup';
import { AdServiceSettingsService } from '../../services/admin/ad-service-settings/ad-service-settings.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.css']
})
export class TermsOfUseComponent implements OnInit {
  termsOfUseContent: string = '';
  basicinfo: any = [];
  constructor(
    private pageSettingsService: AdServiceSettingsService,
    private spinner: NgxSpinnerService,
    private _toast: NgToastService,
    private titleService: Title, 
  ) {}

  ngOnInit(): void {
    this.fetchTermsOfUseContent();
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
  
  fetchTermsOfUseContent(): void {
    this.spinner.show();
    this.pageSettingsService.getPageSettings('termsOfUse').subscribe(
      (response) => {
        this.spinner.hide();
        if (response.isSuccessful && response.result) {
          this.termsOfUseContent = response.result.termsOfUse; // Assuming `termsOfUse` is part of the response
        } else {
          this.termsOfUseContent = 'No content available.';
        }
      },
      (error) => {
        this.spinner.hide();
        this._toast.error({ detail: "ERROR", summary: 'Error fetching Terms of Use content', position: 'br' });
      }
    );
  }
}
