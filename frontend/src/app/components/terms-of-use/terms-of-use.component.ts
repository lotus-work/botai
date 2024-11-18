import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgToastService } from 'ng-angular-popup';
import { AdServiceSettingsService } from '../../services/admin/ad-service-settings/ad-service-settings.service';

@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.css']
})
export class TermsOfUseComponent implements OnInit {
  termsOfUseContent: string = '';

  constructor(
    private pageSettingsService: AdServiceSettingsService,
    private spinner: NgxSpinnerService,
    private _toast: NgToastService
  ) {}

  ngOnInit(): void {
    this.fetchTermsOfUseContent();
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
