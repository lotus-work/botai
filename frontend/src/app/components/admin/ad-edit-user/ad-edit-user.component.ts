import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdServiceUsersService } from '../../../services/admin/ad-service-users/ad-service-users.service';
import { UserService } from '../../../services/user/user.service';

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
    this.adUserService.getUserDetails(this.userId).subscribe(
      (response: any) => {
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
        alert('Error fetching user details: ' + error);
      }
    );
  }

  updateUserDetails() {
    this.adUserService.updateUserDetails(this.userId, this.userData).subscribe(
      () => {
        alert('User updated successfully!');
        window.location.reload();
      },
      error => {
        alert('Error updating user:'+ error);
        window.location.reload();
      }
    );
  }

  removeMember(organizationId: string, memberId: string) {
    if (confirm('Are you sure you want to remove this member from the organization?')) {
      this.adUserService.deleteUserFromOrganization(organizationId, memberId).subscribe(
        (response: any) => {
          // Remove the member from the UI list after deletion
          this.organizationMembers = this.organizationMembers.filter(member => member.userId !== memberId);
          alert('Member removed successfully!');
        },
        error => {
          console.error('Error removing member:', error);
        }
      );
    }
  }


  editMember(memberId: string) {
    this.router.navigate(['/admin/user/edit', memberId]); // Navigate to edit page
  }

  sendInvite() {
    if (!this.newMember.name || !this.newMember.email) {
      alert('Both name and email are required to send an invite.');
      return;
    }

    const organizationId = this.userInfo.organization._id; // Assuming you have organizationId in userInfo
    this.userService
      .addOrganizationMember(organizationId, this.newMember.name, this.newMember.email)
      .subscribe(
        (response: any) => {
          alert('Invite sent successfully!');
          this.organizationMembers.push({
            name: this.newMember.name,
            email: this.newMember.email,
          });
          this.newMember = { name: '', email: '' }; // Reset form fields
        },
        (error) => {
          console.error('Error sending invite:', error);
          alert('Failed to send invite. Please try again.');
        }
      );
  }
}
