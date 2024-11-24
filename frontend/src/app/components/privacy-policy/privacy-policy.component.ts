import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgToastService } from 'ng-angular-popup';
import { AdServiceSettingsService } from '../../services/admin/ad-service-settings/ad-service-settings.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent implements OnInit {
  privacyPolicyContent: string = '';
  basicinfo: any = [];
  constructor(
    private pageSettingsService: AdServiceSettingsService,
    private spinner: NgxSpinnerService,
    private _toast: NgToastService,
    private titleService: Title,  
  ) {}

  ngOnInit(): void {
    this.fetchPrivacyPolicyContent();
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

  fetchPrivacyPolicyContent(): void {
    this.spinner.show();
    this.pageSettingsService.getPageSettings('privacyPolicy').subscribe(
      (response) => {
        this.spinner.hide();
        if (response.isSuccessful && response.result) {
          this.privacyPolicyContent = response.result.privacyPolicy; // Assuming `privacyPolicy` is part of the response
        } else {
          this.privacyPolicyContent = 'No content available.';
        }
      },
      (error) => {
        this.spinner.hide();
        this._toast.error({ detail: "ERROR", summary: 'Error fetching Privacy Policy content', position: 'br' });
      }
    );
  }
}
