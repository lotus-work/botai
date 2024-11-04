import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { ChatService } from '../../services/chat/chat.service';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrl: './bot.component.css',
})
export class BotComponent {
  @ViewChild('scrollContainer', { static: false }) private scrollContainer!: ElementRef;

  chatMessages: { role: string, content: string }[] = [];
  isTextareaDisabled: boolean = false;
  audioFile = new Audio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/success.mp3"
  );
  user: any;
  userMessage: string = '';
  conversationId: string = '';
  showFirstRow: boolean = true;

  constructor(public auth: AuthService, private router: Router, private _apiCallServices: ChatService, private _toast: NgToastService ) {
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

  autoResizeTextArea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    if (textarea.scrollHeight <= 100) {
      textarea.style.height = textarea.scrollHeight + 'px';
    } else {
      textarea.style.height = '100px';
      textarea.style.overflowY = 'scroll';
    }
  }

  playFile() {
    this.audioFile.play();
  }

  // Method to handle starting a new conversation
  private startNewConversation() {
    const userMessage = this.userMessage;
    this.userMessage = '';
    this.showFirstRow = false;

    this.chatMessages.push({ role: 'user', content: userMessage });
    this.chatMessages.push({ role: 'bot', content: '...' });
    this.isTextareaDisabled = true;

    this._apiCallServices.getResponseFromChatbot(userMessage).subscribe(res => {
      if (res.status === "success") {
        this.chatMessages.pop();
        this.playFile();
        this.chatMessages.push({ role: 'bot', content: res.response.content });
        this.isTextareaDisabled = false;

        // Start new conversation
        this._apiCallServices.addConversation(this.user._id, '672326987f64f5a5569de617', 'New Conversation', userMessage, res.response.content).subscribe(addRes => {
          if (addRes.success == true) {
            this.conversationId = addRes.conversationId;
            
          }
        });
      }
    });
  }

  // Method to send a message to an existing conversation
  private sendMessageToExistingConversation() {
    const userMessage = this.userMessage;
    this.userMessage = '';
    
    this.chatMessages.push({ role: 'user', content: userMessage });
    this.chatMessages.push({ role: 'bot', content: '...' });
    this.isTextareaDisabled = true;

    this._apiCallServices.getResponseFromChatbot(userMessage).subscribe(res => {
      if (res.status === "success") {
        this.chatMessages.pop();
        this.playFile();
        this.chatMessages.push({ role: 'bot', content: res.response.content });
        this.isTextareaDisabled = false;

        // Add message to existing conversation
        if (this.conversationId) {
          this._apiCallServices.addMessageToConversation(this.conversationId, this.user._id, userMessage, res.response.content).subscribe();
        }
      }
    });
  }

  sendMessage() {
    if (this.conversationId) {
      this.sendMessageToExistingConversation();
    } else {
      this.startNewConversation();
    }
    
    setTimeout(() => {
      const container = this.scrollContainer.nativeElement;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  }
}
