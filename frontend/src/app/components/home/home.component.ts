import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  user: any = [];
  workspaceName: string = '';
  errorMessage: string = '';

  constructor(public auth: AuthService, private router: Router, private userService: UserService) {
   
  }
  ngOnInit(){
    const localStorageUser = localStorage.getItem('user');
    if (localStorageUser) {
      this.user = JSON.parse(localStorageUser);
    }
  }

  async logout() {
    this.auth.logout({ logoutParams: { returnTo: "https://chatgptbotai.netlify.app/login" } });
  }

    createWorkspace(): void {
   
      this.userService.createOrganization(this.user._id, this.workspaceName).subscribe({
        next: (response) => {
          if (response.isSuccessful) {
            console.log( response.result._id);
            this.router.navigate(['/workspace/' + response.result.organization._id]);
          }
        },
        error: (error) => console.error('Error creating organization:', error)
      });
  }
  manageWorkspace(): void{
  console.log(this.user._id);
  this.userService.checkOrganization(this.user._id).subscribe({
    next: (hasWorkspace) => {
      if (hasWorkspace.isSuccessful == true) {
        console.log(hasWorkspace.result._id);
        this.router.navigate(['/workspace/' + hasWorkspace.result.organization._id]);
      } else {
        const manageWorkspaceModal = new bootstrap.Modal(document.getElementById('exampleModal'));
        manageWorkspaceModal.show();
      }
    },
    error: (error) => console.error('Error checking workspaces:', error)
  });
}
  }
