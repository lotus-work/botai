import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { ChatService } from '../../services/chat/chat.service';
import { NgToastService } from 'ng-angular-popup';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrl: './bot.component.css',
})
export class BotComponent implements OnInit {
  @ViewChild('scrollContainer', { static: false }) private scrollContainer!: ElementRef;
  @Input() selectedConversationId: string = '';
  @Input() selectedUserId: string = '';

  
  convertedMarkdown: SafeHtml | undefined; 

  chatMessages: { role: string, content: SafeHtml }[] = [];
  isTextareaDisabled: boolean = false;
  audioFile = new Audio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/success.mp3"
  );
  user: any;
  basicinfo: any = [];
  userMessage: string = '';
  conversationId: string = '';
  showFirstRow: boolean = true;
  temperature = 0.7;
  public safeHtml: SafeHtml = '';

  public date = "<p>Of course! Here are some key points to help you get started with learning C#:</p> <ol> <li><p><strong>Introduction to C#:</strong></p> <ul> <li>C# is a modern, versatile programming language developed by Microsoft.</li> <li>It is used for developing various types of applications, including desktop, web, mobile, and more.</li> </ul> </li> <li><p><strong>Basic Syntax:</strong></p> <ul> <li>C# is case-sensitive and uses curly braces {} to define code blocks.</li> <li>Statements end with a semicolon (;).</li> </ul> </li> <li><p><strong>Variables and Data Types:</strong></p> <ul> <li>Variables are used to store data in C#. They must be declared with a specific data type.</li> <li>Common data types include int (integer), string (text), double (decimal number), bool (boolean), etc.</li> </ul> </li> <li><p><strong>Control Structures:</strong></p> <ul> <li>C# includes control structures like if-else statements, loops (for, while, do-while), and switch-case for decision-making and iterating through code.</li> </ul> </li> <li><p><strong>Functions and Methods:</strong></p> <ul> <li>Functions in C# are blocks of code that perform a specific task.</li> <li>Methods are functions that are associated with a class or object.</li> </ul> </li> <li><p><strong>Classes and Objects:</strong></p> <ul> <li>C# is an object-oriented programming language, where classes are used to define objects.</li> <li>Objects are instances of classes that contain data (attributes) and methods (functions).</li> </ul> </li> <li><p><strong>Inheritance and Polymorphism:</strong></p> <ul> <li>Inheritance allows a class to inherit properties and behavior from another class.</li> <li>Polymorphism enables objects to be treated as instances of their parent class.</li> </ul> </li> <li><p><strong>Exception Handling:</strong></p> <ul> <li>C# provides mechanisms to handle exceptions that may occur during program execution using try-catch blocks.</li> </ul> </li> <li><p><strong>.NET Framework:</strong></p> <ul> <li>C# is commonly used with the .NET Framework, a software development platform for building Windows applications.</li> </ul> </li> <li><p><strong>Practice and Resources:</strong></p> <ul> <li>Practice coding regularly to improve your skills.</li> <li>Online tutorials, courses, and documentation can further enhance your understanding of C#.</li> </ul> </li> </ol> <p>I hope these points help you start your journey with C#! Is there anything specific you would like to learn more about?</p>";
  constructor(public auth: AuthService, private router: Router, private _apiCallServices: ChatService, private sanitizer: DomSanitizer, private _toast: NgToastService ) {
   
  }
  ngOnInit() {
    try {
      const localStorageUser = localStorage.getItem('user');
      const basicDetails = localStorage.getItem('basicInfo');
      if (localStorageUser && basicDetails) {
        this.user = JSON.parse(localStorageUser);
        this.basicinfo = JSON.parse(basicDetails);
      }
    } catch (error) {
      this._toast.error({ detail: "ERROR", summary: 'An error occurred while loading user data', position: 'br' });
    }
    if (this.selectedConversationId && this.selectedUserId) {
      console.log("clicked");
      this.loadChatHistory(this.selectedConversationId, this.selectedUserId);
    }
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.date);
  }

  loadChatHistory(conversationId: string, userId: string) {
    this._apiCallServices.getConversation(conversationId, userId).subscribe(data => {
      this.chatMessages = data.messages; 
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

  // Method to handle starting a new conversation
  private startNewConversation() {
    console.log()
    const userMessage = this.userMessage;
    this.userMessage = '';
    this.showFirstRow = false;

    this.chatMessages.push({ role: 'user', content: userMessage });
    this.chatMessages.push({ role: 'bot', content: '<img src="https://cdn.pixabay.com/animation/2024/04/02/07/57/07-57-40-974_512.gif" width="60px;"></img>' });
    this.isTextareaDisabled = true;

    this._apiCallServices.getResponseFromChatbot(this.user._id, userMessage, this.temperature, this.user.isOwner).subscribe(async res => {
      if (res.status === "success") {
        this.chatMessages.pop();
        this.playFile();
        
        // Format and sanitize response
        const formattedResponse = await this.formatMarkdown(res.response.content);
        const sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(formattedResponse);
        
        // Push the sanitized content to chatMessages
        this.chatMessages.push({ role: 'bot', content: sanitizedContent });
        
        this.isTextareaDisabled = false;
        
        const conversationName = this.getWordsUpToFiveSpaces(userMessage);
        // Add message to new conversation
        this._apiCallServices.addConversation(this.user._id, this.user.gptAssistant.assistantId, conversationName, userMessage, formattedResponse).subscribe(addRes => {
          if (addRes.success == true) {
            this.conversationId = addRes.conversationId;
          }
        });
      }
    });
    
  }
  getWordsUpToFiveSpaces(text: string): string {
    let spaceCount = 0;
    let result = '';

    for (let i = 0; i < text.length; i++) {
      if (text[i] === ' ') {
        spaceCount++;
      }
      result += text[i];
      if (spaceCount === 5) {
        break;
      }
    }

    return result.trim();
  }
  // Method to send a message to an existing conversation
  private sendMessageToExistingConversation() {
    const userMessage = this.userMessage;
    this.userMessage = '';
    
    this.chatMessages.push({ role: 'user', content: userMessage });
    this.chatMessages.push({ role: 'bot', content: '<img src="https://cdn.pixabay.com/animation/2024/04/02/07/57/07-57-40-974_512.gif" width="60px;"></img>' });
    this.isTextareaDisabled = true;

    this._apiCallServices.getResponseFromChatbot(this.user._id, userMessage, this.temperature, this.user.isOwner).subscribe(async res => {
      if (res.status === "success") {
        this.chatMessages.pop();
        this.playFile();
        
        // Format and sanitize response
        const formattedResponse = await this.formatMarkdown(res.response.content);
        const sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(formattedResponse);
        
        // Push the sanitized content to chatMessages
        this.chatMessages.push({ role: 'bot', content: sanitizedContent });
        
        this.isTextareaDisabled = false;
        
        // Add message to existing conversation
        if (this.conversationId) {
          this._apiCallServices.addMessageToConversation(this.conversationId, this.user._id, userMessage, formattedResponse).subscribe();
        }
      }
    });
    
  }

  sendMessage() {
    console.log(this.conversationId);
    if (this.conversationId) {
      console.log("if");
      this.sendMessageToExistingConversation();
    } else {
      console.log("else");
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
  
  async formatMarkdown(content: string): Promise<string> {
    return await marked(content); // Return the converted HTML as a Promise<string>
  }

  
}
