import { Component } from '@angular/core';
import { Auth } from './auth/Services/auth';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  constructor(
    private authService: Auth,
    private router: Router,
     private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    const token = this.authService.getToken();

    if (!token) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.authService.fetchUserDetails().subscribe({
      next: (user) => {
        const isAdmin = user.roles.some(r => r.name === 'ROLE_BUSINESS_ADMIN');

        if (isAdmin) {
          this.router.navigate(['/layout']);
        } else if(!isAdmin) {
            this.router.navigate(['/login']);
            this.snackBar.open('Access Denied!', 'Close', {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                });
             this.authService.logout();
            this.authService.clearUser();
            this.router.navigate(['/login']);
          }
      },
      error: (err) => {
        console.error('Failed to load user details', err);
        this.authService.logout();
        this.authService.clearUser();
        this.router.navigate(['/login']);
      },
    });
  }
}
