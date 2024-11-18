import { Component, OnInit } from '@angular/core';
import { AdServiceSettingsService } from '../../../services/admin/ad-service-settings/ad-service-settings.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-ad-settings',
  templateUrl: './ad-settings.component.html',
  styleUrls: ['./ad-settings.component.css']
})
export class AdSettingsComponent implements OnInit {
  settings: any = {
    appName: '',
    homePageTitle: '',
    systemEmail: {
      username: '',
      emailAddress: '',
      password: ''
    },
    chatGPT: {
      url: '',
      apiKey: '',
      modelName: '',
      masterInstruction: ''
    },
    companyContact: {
      phone: '',
      emailAddress: '',
      fullAddress: ''
    },
    websiteContent: {
      mainLogoPath: '',
      faviconPath: ''
    },
    oktaSSO: {
      domain: '',
      clientId: '',
      redirectURL: ''
    }
  };

  constructor(private settingsService: AdServiceSettingsService,
    
    private spinner: NgxSpinnerService,
    private _toast: NgToastService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.settingsService.getSettings().subscribe(
      (data) => {
        this.settings = data.result;
      },
      (error) => {
        console.error('Error loading settings:', error);
      }
    );
  }

  onSubmit(): void {
    this.spinner.show();
    this.settingsService.updateSettings(this.settings).subscribe(
      (response) => {
        this.spinner.hide();
        if (response.isSuccessful) {
          this._toast.success({ detail: "SUCCESS", summary: 'Settings updated successfully!', position: 'br' });
        }
      },
      (error) => {
        this.spinner.hide();
        this._toast.error({ detail: "ERROR", summary: 'Error updating settings', position: 'br' });
      }
    );
  }
}
