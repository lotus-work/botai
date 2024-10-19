import { Component } from '@angular/core';

@Component({
  selector: 'app-ad-user',
  templateUrl: './ad-user.component.html',
  styleUrl: './ad-user.component.css'
})
export class AdUserComponent {
  people = [
    { name: 'Lotus Biswas', email: 'lotusbiswas@gmail.com', organization: 'XYZ Org', date: '2024-10-17' },
    { name: 'John Doe', email: 'johndoe@example.com', organization: 'ABC Org', date: '2024-10-17' },
    { name: 'Jane Smith', email: 'janesmith@example.com', organization: 'DEF Org', date: '2024-10-17' },
    { name: 'Alice Johnson', email: 'alice.j@example.com', organization: 'QSD Org', date: '2024-10-17' }
  ];
}
