import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { ChatService } from '../../services/chat/chat.service';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrl: './bot.component.css',
})
export class BotComponent {
  @ViewChild('scrollContainer', { static: false }) private scrollContainer!: ElementRef;

  chatMessages: { role: string, content: string }[] = [
  ];
  isTextareaDisabled: boolean = false;
  audioFile = new Audio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/success.mp3"
  );
  user: any;
  userMessage: string = '';
  constructor(public auth: AuthService, private router: Router, private _apiCallServices: ChatService) {
    this.auth.user$.subscribe((userData) => {
      this.user = userData;
    });
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

  sendMessage() {
    const userMessage = this.userMessage;
    this.userMessage = "";
    setTimeout(() => {
      const container = this.scrollContainer.nativeElement;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);

    this.playFile();
    this.chatMessages.push({ role: 'user', content: userMessage });

    this.chatMessages.push({ role: 'bot', content: '...' });
    this.isTextareaDisabled = true;
  
    this._apiCallServices.getResponseFromChatbot(userMessage).subscribe(res => {
      console.log(res);
      if (res.status == "success") {
        this.chatMessages.pop();
        
        this.playFile();
        this.chatMessages.push({ role: 'bot', content: res.response.content });
        this.isTextareaDisabled = false;
  
        this.userMessage = '';
        setTimeout(() => {
          const container = this.scrollContainer.nativeElement;
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth' // Use smooth behavior for smooth scrolling
          });
        }, 100); // Adjust the delay as needed

      }
      // else if (res.status == "error") {
      //   alert(res.message);
      //   location.reload;
      //     setTimeout(() => {
      //         this.spinner.hide();
      //         window.location.reload();
      //     }, 1000);

      // } 
      else if (res.status == "timeout") {
        // alert(res.message);
        // location.reload;
        //   setTimeout(() => {
        //       this.spinner.hide();
        //       window.location.reload();
        //   }, 1000);

        this.chatMessages.pop();
        this.playFile();
        this.chatMessages.push({ role: 'bot', content: `Internal server error. Please try again later.` });
        this.isTextareaDisabled = false;
  
        setTimeout(() => {
          const container = this.scrollContainer.nativeElement;
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth' // Use smooth behavior for smooth scrolling
          });
        }, 100); // Adjust the delay as needed

      }

    });
  }
}
