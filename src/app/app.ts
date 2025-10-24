import { Component, signal } from '@angular/core';
import { CommonService } from './Common/services/common-service';
import { Auth } from './auth/Services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  constructor(
    private userService: CommonService,
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.userService.fetchUserDetails().subscribe({
        next: (user) => {
          const isAdmin = user.roles.some(
            (role) => role.name === 'ROLE_BUSINESS_ADMIN'
          );
          if (isAdmin) {
            this.router.navigate(['/layout']);
          } else {
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          console.error('Failed to load user details', err);
          this.authService.logout();
          this.router.navigate(['/login']);
        },
      });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
