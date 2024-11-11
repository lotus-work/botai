import { Component, OnInit } from '@angular/core';
import { AdServiceSettingsService } from '../../../services/admin/ad-service-settings/ad-service-settings.service';
import { NgToastService } from 'ng-angular-popup';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-ad-page-settings',
  templateUrl: './ad-page-settings.component.html',
  styleUrls: ['./ad-page-settings.component.css']
})
export class AdPageSettingsComponent implements OnInit {
  
  pageSettings = {
    aboutUs: '',
    termsOfUse: '',
    privacyPolicy: '',
    updatedBy: ''
  };

  constructor(private pageSettingsService: AdServiceSettingsService,  private spinner: NgxSpinnerService,
    private _toast: NgToastService) {}

  ngOnInit(): void {
    // Retrieve user ID from local storage and assign it to updatedBy
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.pageSettings.updatedBy = userData.id || ''; // Adjust to match the correct ID property in local storage
  }

  // Check if all fields have values
  allFieldsFilled(): boolean {
    return (
      this.pageSettings.aboutUs.trim() !== '' &&
      this.pageSettings.termsOfUse.trim() !== '' &&
      this.pageSettings.privacyPolicy.trim() !== ''
    );
  }

  // Method to call updatePageSettings from the service
  updatePageSettings() {
    this.spinner.show();
    this.pageSettingsService.updatePageSettings(this.pageSettings).subscribe(
      response => {
        this.spinner.hide();
        if (response.isSuccessful) {
          this._toast.success({ detail: "SUCCESS", summary: 'Page settings updated successfully!', position: 'br' });
        }
      },
      error => {
        this.spinner.hide();
        this._toast.error({ detail: "ERROR", summary: 'Error updating page settings', position: 'br' });
      }
    );
  }
}
