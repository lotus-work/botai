import { Component } from '@angular/core';

@Component({
  selector: 'app-ad-user',
  templateUrl: './ad-user.component.html',
  styleUrl: './ad-user.component.css'
})
export class AdUserComponent {
  people = [
    { name: 'Lotus Biswas', email: 'lotusbiswas@gmail.com', phone: '8250366763', date: '2024-10-17' },
    { name: 'John Doe', email: 'johndoe@example.com', phone: '1234567890', date: '2024-10-17' },
    { name: 'Jane Smith', email: 'janesmith@example.com', phone: '9876543210', date: '2024-10-17' },
    { name: 'Alice Johnson', email: 'alice.j@example.com', phone: '1122334455', date: '2024-10-17' }
  ];
}
