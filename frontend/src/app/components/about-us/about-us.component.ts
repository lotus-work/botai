import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgToastService } from 'ng-angular-popup';
import { AdServiceSettingsService } from '../../services/admin/ad-service-settings/ad-service-settings.service';

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
    private _toast: NgToastService
  ) {}

  ngOnInit(): void {
    this.fetchAboutUsContent();
    const basicDetails = localStorage.getItem('basicInfo');
    if (basicDetails) {
      this.basicinfo = JSON.parse(basicDetails);
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
