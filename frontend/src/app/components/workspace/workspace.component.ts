import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit {
  organizationId: string = ''; 
  name: string = ''; 
  emailAddress: string = ''; 
  user: any = {};
  organizationName: string = '';
  members: any[] = [];

  constructor(private userService: UserService, private route: ActivatedRoute, private spinner: NgxSpinnerService,
    private _toast: NgToastService) {}

  ngOnInit(): void { 
    const localStorageUser = localStorage.getItem('user');
    if (localStorageUser) {
      this.user = JSON.parse(localStorageUser);
    }

    this.route.params.subscribe(params => {
      this.organizationId = params['id']; 
    });
    this.checkOrganization(this.user._id);
  }

  checkOrganization(userId: string): void {
    this.userService.checkOrganization(userId).subscribe(
      (response: any) => {
        if (response.isSuccessful) {
          this.organizationId = response.result.organization._id;
          this.organizationName = response.result.organization.name;
          this.members = response.result.members;
        } else {
          console.error('Organization not found:', response.result.message);
        }
      },
      (error) => {
        console.error('Error fetching organization:', error);
      }
    );
  }


  sendInvitation() {
    this.spinner.show();
    this.userService.addOrganizationMember(this.organizationId, this.name, this.emailAddress)
      .subscribe(
        response => {
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          this._toast.success({ detail: "SUCCESS", summary: 'Invitation sent successfully!', position: 'br' });
          this.name = '';
          this.emailAddress = '';
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        error => {
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          
          this._toast.error({ detail: "ERROR", summary: 'Error sending invitation: ' + error, position: 'br' });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      );
  }

  removeMember(memberId: string): void {
    if (confirm("Are you sure you want to remove this member?")) {
      this.spinner.show();
      this.userService.removeMember(this.organizationId, memberId).subscribe(
        response => {
          this.spinner.hide();
          if (response.isSuccessful) {
            this._toast.success({ detail: "SUCCESS", summary: 'Member removed successfully!', position: 'br' });
            // Refresh the members list
            this.members = this.members.filter(member => member._id !== memberId);
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            this._toast.error({ detail: "ERROR", summary: 'Failed to remove member.', position: 'br' });
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        },
        error => {
          this.spinner.hide();
          console.error('Error removing member:', error);
          this._toast.error({ detail: "ERROR", summary: 'Error removing member: ' + error, position: 'br' });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      );
    }
  }
}
