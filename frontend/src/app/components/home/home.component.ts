import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../services/user/user.service';
import { ChatService } from '../../services/chat/chat.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgToastService } from 'ng-angular-popup';
import { Console } from 'console';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  user: any = [];
  workspaceName: string = '';
  errorMessage: string = '';
  todayConversations: any[] = [];
  olderConversations: any[] = [];
  selectedConversationId: string = '';
  selectedUserId: string = '';
  constructor(public auth: AuthService, private router: Router, private userService: UserService, private chatService: ChatService,    private spinner: NgxSpinnerService,
    private _toast: NgToastService ) {
    
    }

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      if (!isAuthenticated && !this.checkAuthKeysExist()) {
        this.router.navigate(['login']);
      } else if (isAuthenticated) {
        // Subscribe to the user observable to get user details
        this.auth.user$.subscribe(user => {
          if (user) {
         if(user.name && user.email){
            this.userService.addUser(user.name, user.email)
              .subscribe({
                next: (response) => {
                  if (response.isSuccessful) {
                    localStorage.setItem('user', JSON.stringify(response.result.user));
                    console.log(response.result.user._id);
                      this.getAllChats(response.result.user._id);
                  } else {
                    console.error('User addition failed:', response);
                  }
                },
                error: (err) => {
                  console.error('API error:', err);
                }
              });
         }

          }
        });
      }
    });
    const localStorageUser = localStorage.getItem('user');
    if (localStorageUser) {
      this.router.navigate(['/']);
      this.user = JSON.parse(localStorageUser);
      console.log(this.user);
    }
  }

  checkAuthKeysExist(): boolean {
    const keys = Object.keys(localStorage);
    const authKeys = keys.filter(key => key.startsWith('@@auth0spajs@@::'));
    return authKeys.length >= 2 && authKeys.every(key => localStorage.getItem(key));
  }

  async logout() {
    this.auth.logout({ logoutParams: { returnTo: "https://chatgptbotai.netlify.app/login" } });
  }

  createWorkspace(): void {
    this.userService.createOrganization(this.user._id, this.workspaceName).subscribe({
      next: (response) => {
        if (response.isSuccessful) {
          this.router.navigate(['/workspace/' + response.result.organization._id]);
        }
      },
      error: (error) => console.error('Error creating organization:', error)
    });
  }

  manageWorkspace(): void {
    this.userService.checkOrganization(this.user._id).subscribe({
      next: (hasWorkspace) => {
        if (hasWorkspace.isSuccessful) {
          this.router.navigate(['/workspace/' + hasWorkspace.result.organization._id]);
        } else {
          const manageWorkspaceModal = new bootstrap.Modal(document.getElementById('exampleModal'));
          manageWorkspaceModal.show();
        }
      },
      error: (error) => console.error('Error checking workspaces:', error)
    });
  }

  getAllChats(userid: string) {
    this.chatService.getAllChatsByUserId(userid).subscribe({
      next: (response) => {
        if (response.success) {
          const today = new Date();
          this.todayConversations = response.conversations.filter((conversation: { conversation: { startedAt: string | number | Date; }; }) => {
            const startedAt = new Date(conversation.conversation.startedAt);
            return startedAt.toDateString() === today.toDateString();
          });
          this.olderConversations = response.conversations.filter((conversation: { conversation: { startedAt: string | number | Date; }; }) => {
            const startedAt = new Date(conversation.conversation.startedAt);
            return startedAt.toDateString() !== today.toDateString();
          });
        }
      },
      error: (error) => console.error('Error fetching chats:', error)
    });
  }

  selectConversation(conversationId: string, userId: string) {
    this.selectedConversationId = conversationId;
    this.selectedUserId = userId;
  }

  deleteConversation(conversationId: string) {
    this.spinner.show();
    this.chatService.deleteConversation(conversationId).subscribe(
      response => {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        this._toast.success({ detail: "SUCCESS", summary: 'Conversation deleted successfully', position: 'br' });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      error => {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        this._toast.error({ detail: "ERROR", summary: 'Error deleting conversation', position: 'br' });
      }
    );
  }

  exportChat(conversationId: string, userId: string, conversationName: string, conversationUpdatedAt: string) {
    this.spinner.show();
    this.chatService.exportConversation(conversationId, userId).subscribe(
      (response: any) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 100);
        this._toast.success({ detail: "SUCCESS", summary: 'Download started..', position: 'br' });
  
        const blob = new Blob([response], { type: 'text/plain' });
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
  
        // Generate the filename based on the conversationName and conversationUpdatedAt
        const filename = `${conversationName}_${conversationUpdatedAt}.txt`;
  
        link.href = url;
        link.download = filename;  // Use the generated filename here
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        this._toast.error({ detail: "ERROR", summary: 'Error exporting conversation', position: 'br' });
      }
    );
  }
  
  newChatOpen(){
    this.selectedConversationId = "";
    this.selectedUserId = "";
    window.location.reload();
  }
  
}
