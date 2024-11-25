import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router for navigation
import { AdServiceLoginService } from '../../../services/admin/ad-service-login/ad-service-login.service';
import { AdminLoginResponse } from '../../../interface/admin/admin-login-response.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-ad-login',
  templateUrl: './ad-login.component.html',
  styleUrls: ['./ad-login.component.css']
})
export class AdLoginComponent implements OnInit {
  emailAddress: string = '';
  password: string = '';

  constructor(private loginService: AdServiceLoginService, private router: Router, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
   
  }
  onSubmit() {
    console.log('Attempting to log in with:', this.emailAddress);
    this.spinner.show();
    this.loginService.login(this.emailAddress, this.password).subscribe({
      next: (response: AdminLoginResponse) => {
        console.log("Login response received");
        if (response.isSuccessful) {
          
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
          console.log('Login successful:', response.result);
          localStorage.setItem('userData', JSON.stringify(response.result));
          this.router.navigate(['/admin/home']);
        } else {
          
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
          alert('Login failed:' + response || 'Unknown error');
        }
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 1000);
        alert('Login error: ' + error);
      },
      complete: () => {
        console.log("Login process completed successfully");
      }
    });
  }
}
