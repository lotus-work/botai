import { Component } from '@angular/core';
import { AdServiceUsersService } from '../../../services/admin/ad-service-users/ad-service-users.service';  // Import your service
import { Router } from '@angular/router';

@Component({
  selector: 'app-ad-add-user',
  templateUrl: './ad-add-user.component.html',
  styleUrls: ['./ad-add-user.component.css']
})
export class AdAddUserComponent {
  userData = {
    appName: '',
    appLogo : '',
    name: '',
    phoneNumber: '',
    emailAddress: '',
    assistantName: '',
    assistantId: ''
  };

  constructor(private userService: AdServiceUsersService, private router: Router) {}

  // This will be triggered when the form is submitted
  addUser() {
    this.userService.addUser(this.userData).subscribe(
      (response: any) => {
        alert('User added successfully!');
        this.router.navigate(['admin/users']); // Navigate back to the home or any other page after success
      },
      (error: any) => {
        alert('Error adding user' + error.message);
      }
    );
  }
  isFormValid(): boolean {
    // Check if all fields in userData have non-empty values
    return Object.values(this.userData).every(field => field.trim() !== '');
  }
}
