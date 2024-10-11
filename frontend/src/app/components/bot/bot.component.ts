import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrl: './bot.component.css',
})
export class BotComponent {
  user: any;
  userMessage: string = '';
  constructor(public auth: AuthService, private router: Router) {
    this.auth.user$.subscribe((userData) => {
      this.user = userData;
    });
  }
  // Method to auto-resize the textarea
  autoResizeTextArea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reset the height to auto
    if (textarea.scrollHeight <= 100) {
      textarea.style.height = textarea.scrollHeight + 'px'; // Adjust the height based on content
    } else {
      textarea.style.height = '100px'; // Limit the height to 100px
      textarea.style.overflowY = 'scroll'; // Enable scrolling if content exceeds 100px
    }
  }
}
