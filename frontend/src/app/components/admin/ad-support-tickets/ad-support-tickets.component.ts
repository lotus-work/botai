import { Component } from '@angular/core';

@Component({
  selector: 'app-ad-support-tickets',
  templateUrl: './ad-support-tickets.component.html',
  styleUrl: './ad-support-tickets.component.css'
})
export class AdSupportTicketsComponent {
  tickets = [
    { 
      name: 'Lotus Biswas', 
      email: 'lotusbiswas@gmail.com', 
      issue: 'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.', 
      date: '2024-10-17 12:06 AM' 
    },
    { 
      name: 'John Doe', 
      email: 'johndoe@example.com', 
      issue: 'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.', 
      date: '2024-10-17 19:54 PM' 
    },
    { 
      name: 'Jane Smith', 
      email: 'janesmith@example.com', 
      issue: 'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.', 
      date: '2024-10-17 04:23 AM' 
    },
    { 
      name: 'Alice Johnson', 
      email: 'alice.j@example.com', 
      issue: 'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.', 
      date: '2024-10-17 14:26 PM' 
    }
  ];

  selectedTicket: any = null;

  selectTicket(ticket: any) {
    this.selectedTicket = ticket;
  }
}
