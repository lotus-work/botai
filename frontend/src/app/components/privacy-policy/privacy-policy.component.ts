import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgToastService } from 'ng-angular-popup';
import { AdServiceSettingsService } from '../../services/admin/ad-service-settings/ad-service-settings.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent implements OnInit {
  privacyPolicyContent: string = '';

  constructor(
    private pageSettingsService: AdServiceSettingsService,
    private spinner: NgxSpinnerService,
    private _toast: NgToastService
  ) {}

  ngOnInit(): void {
    this.fetchPrivacyPolicyContent();
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
