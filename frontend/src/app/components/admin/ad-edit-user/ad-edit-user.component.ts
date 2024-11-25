import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdServiceUsersService } from '../../../services/admin/ad-service-users/ad-service-users.service';
import { UserService } from '../../../services/user/user.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-ad-edit-user',
  templateUrl: './ad-edit-user.component.html',
  styleUrls: ['./ad-edit-user.component.css']
})
export class AdEditUserComponent implements OnInit {
  userInfo : any = [];
  userId: string = '';
  userData = {
    appName : '',
    appLogo : '',
    name: '',
    phoneNumber: '',
    emailAddress: '',
    address: '',
    isOwner: false,
    isActive: true,
    role: 'User',
    organizationName: ''
  };
  organizationMembers: any[] = [];
  newMember = {
    name: '',
    email: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adUserService: AdServiceUsersService,
    private userService: UserService,
    private spinner: NgxSpinnerService,
  ) {}

  ngOnInit() {
    // Extract user ID from route parameters
    this.route.params.subscribe(params => {
      const newUserId = params['id']; // Get the updated user ID
      if (newUserId && newUserId !== this.userId) {
        this.userId = newUserId; // Update the userId
        this.getUserDetails();   // Fetch user details for the new ID
      }
    });
  }

  getUserDetails() {
    this.spinner.show();
    this.adUserService.getUserDetails(this.userId).subscribe(
      (response: any) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        this.userInfo = response.result;
        this.userData.appName = response.result.appName || '',
        this.userData.appLogo = response.result.appLogo || '',
        this.userData.name = response.result.name || '';
        this.userData.phoneNumber = response.result.phoneNumber || '';
        this.userData.emailAddress = response.result.emailAddress || '';
        this.userData.address = response.result.address || '';
        this.userData.isOwner = response.result.isOwner || false;
        this.userData.isActive = response.result.isActive || true;
        this.userData.role = response.result.role || 'User';
        this.userData.organizationName = response.result.organization?.name || '';

        this.organizationMembers = response.result.organizationMembers || [];
      },
      error => {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        alert('Error fetching user details: ' + error);
        window.location.reload();
      }
    );
  }

  updateUserDetails() {
    this.spinner.show();
    this.adUserService.updateUserDetails(this.userId, this.userData).subscribe(
      () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        alert('User updated successfully!');
        window.location.reload();
      },
      error => {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        alert('Error updating user:'+ error);
        window.location.reload();
      }
    );
  }

  removeMember(organizationId: string, memberId: string) {
    if (confirm('Are you sure you want to remove this member from the organization?')) {
      this.spinner.show();
      this.adUserService.deleteUserFromOrganization(organizationId, memberId).subscribe(
        (response: any) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          // Remove the member from the UI list after deletion
          this.organizationMembers = this.organizationMembers.filter(member => member.userId !== memberId);
          alert('Member removed successfully!');
        },
        error => {
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          console.error('Error removing member:', error);
        }
      );
    }
  }


  editMember(memberId: string) {
    this.router.navigate(['/admin/user/edit', memberId]); // Navigate to edit page
  }

  sendInvite() {
    this.spinner.show();
    if (!this.newMember.name || !this.newMember.email) {
      setTimeout(() => {
        this.spinner.hide();
      }, 1000);
      alert('Both name and email are required to send an invite.');
      return;
    }

    const organizationId = this.userInfo.organization._id; // Assuming you have organizationId in userInfo
    this.userService
      .addOrganizationMember(organizationId, this.newMember.name, this.newMember.email)
      .subscribe(
        (response: any) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          alert('Invite sent successfully!');
          this.organizationMembers.push({
            name: this.newMember.name,
            email: this.newMember.email,
          });
          this.newMember = { name: '', email: '' }; // Reset form fields
        },
        (error) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          console.error('Error sending invite:', error);
          alert('Failed to send invite. Please try again.');
        }
      );
  }
}
