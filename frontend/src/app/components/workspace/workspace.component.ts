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

  removeMember(memberId: string): void {
    console.log(`Removing member with ID: ${memberId}`);
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
        },
        error => {
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          
          this._toast.error({ detail: "ERROR", summary: 'Error sending invitation: ' + error, position: 'br' });
        }
      );
  }
}
