import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import { AuthService } from '@auth0/auth0-angular';
import { NgToastService } from 'ng-angular-popup';
import { NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';

@Component({
  selector: 'app-exportchat',
  templateUrl: './exportchat.component.html',
  styleUrls: ['./exportchat.component.css']
})
export class ExportchatComponent implements OnInit {

  startDate: string = '';
  endDate: string = '';
  user: any = {};

  constructor(private chatService: ChatService, public auth: AuthService,
              private _toast: NgToastService, private spinner: NgxSpinnerService) {}

  ngOnInit() {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    // Format dates as YYYY-MM-DD
    this.startDate = lastWeek.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];

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

  exportChats() {
    if (!this.startDate || !this.endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    this.spinner.show();
    this.chatService.exportConversations(this.startDate, this.endDate, this.user._id)
      .subscribe((response: Blob) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 100);
        this._toast.success({ detail: "SUCCESS", summary: 'Export success, please check your email', position: 'br' });
       

        // // Create a temporary URL for the Blob to trigger download
        // const url = window.URL.createObjectURL(response);
        
        // // Create a link element to programmatically trigger the download
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = 'chats_export_' + this.startDate + '.zip';  // Default name for the download file
        // document.body.appendChild(a);
        // a.click();
        
        // // Clean up by removing the link element
        // document.body.removeChild(a);

        // // Release the object URL
        // window.URL.revokeObjectURL(url);
      }, error => {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        this._toast.error({ detail: "ERROR", summary: 'Error exporting conversation', position: 'br' });
        console.error("Error exporting chats", error);
        alert("Failed to export chats.");
      });
  }

}
