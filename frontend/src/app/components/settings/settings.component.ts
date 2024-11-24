import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../services/user/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgToastService } from 'ng-angular-popup'; // Import toast service for notifications

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  user: any = {};

  constructor(
    public auth: AuthService,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private _toast: NgToastService 
  ) {}

  ngOnInit(): void {
    try {
      const localStorageUser = localStorage.getItem('user');
      if (localStorageUser) {
        this.user = JSON.parse(localStorageUser);
      }

      this.auth.user$.subscribe((authUser) => {
        if (authUser && !this.user.emailAddress) {
          this.user.emailAddress = authUser.email;
        }
      });
    } catch (error) {
      this._toast.error({ detail: "ERROR", summary: 'An error occurred while loading user data', position: 'br' });
    }
  }

  updateUser() {
    const userId = this.user._id;
    const updatedData = {
      appName : this.user.appName,
      appLogo : this.user.appLogo,
      name: this.user.name,
      phoneNumber: this.user.phoneNumber,
      address: this.user.address
    };

    this.spinner.show();

    this.userService.updateUser(userId, updatedData).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);

        if (response && response.isSuccessful) {
          const updatedUser = response.result.user;
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.user = updatedUser;
          this._toast.success({ detail: "SUCCESS", summary: 'Profile has been updated successfully', position: 'br' });
        } else {
          this._toast.error({ detail: "ERROR", summary: 'Try again later', position: 'br' });
        }
      },
      error: (error) => {
        this.spinner.hide();
        this._toast.error({ detail: "ERROR", summary: 'Error updating user profile', position: 'br' });
      }
    });
  }
}
