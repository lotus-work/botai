import { Component, OnInit } from '@angular/core';
import { AdServiceUsersService } from '../../../services/admin/ad-service-users/ad-service-users.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-ad-user',
  templateUrl: './ad-user.component.html',
  styleUrls: ['./ad-user.component.css']
})
export class AdUserComponent implements OnInit {
  users: any[] = [];  // Array to store users
  errorMessage = '';  // To store error message
  owners: any[] = [];
  selectedAssistantName: string = '';  // To bind Assistant Name
  selectedAssistantId: string = '';    // To bind Assistant Id
  selectedUserId: string = '';  
  selectedId: string = '';  
  selectedCreatedAt: string = '';  
  selectedUpdatedAt: string = '';  

  constructor(private adService: AdServiceUsersService,
    private spinner: NgxSpinnerService,
    private _toast: NgToastService ) {}

  ngOnInit(): void {
    this.getAllUsers(); 
  }

  getAllUsers() {
    this.spinner.show();
    this.adService.getAllUsers().subscribe(
      (response: any) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        this.users = response.result; 
        console.log(this.users);
        this.owners = this.users.filter(user => user.user.isOwner);
        console.log(this.owners);
      },
      (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        this._toast.error({ detail: "ERROR", summary: 'Try again later', position: 'br' });
        
      }
    );
  }
  
  setAssistantDetails(user: any) {
    console.log(user);
    this.selectedAssistantName = user.gptAssistants.assistantName; // or the relevant name field
    this.selectedAssistantId = user.gptAssistants.assistantId;   // or the relevant id field
    this.selectedUserId = user.user._id;
    this.selectedId = user.gptAssistants._id;
    this.selectedUpdatedAt = user.gptAssistants.updatedAt;
    this.selectedCreatedAt = user.gptAssistants.createdAt;
  }

  saveChanges() {
    this.spinner.show();
    const assistantData = {
      assistantName: this.selectedAssistantName,
      assistantId: this.selectedAssistantId
    };

    this.adService.updateAssistant(this.selectedUserId, assistantData)
      .subscribe(
        (response) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          this._toast.success({ detail: "SUCCESS", summary: 'Assistant updated successfully', position: 'br' });
          console.log('Assistant updated successfully:', response);
        },
        (error) => {
          console.error('Error updating assistant:', error);
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          this._toast.error({ detail: "ERROR", summary: 'Error updating assistant', position: 'br' }); 
        }
      );
  }

  // Method to check if the button should be disabled
  isSaveButtonDisabled(): boolean {
    return !this.selectedAssistantName || !this.selectedAssistantId;
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.spinner.show();
      this.adService.deleteUserAndAssociatedRecords(userId).subscribe(
        (response) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          this._toast.success({ detail: "SUCCESS", summary: 'User deleted successfully', position: 'br' });
          this.getAllUsers(); // Refresh the user list
        },
        (error) => {
          console.error('Error deleting user:', error);
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          this._toast.error({ detail: "ERROR", summary: 'Error deleting user', position: 'br' });
        }
      );
    }
  }
}
