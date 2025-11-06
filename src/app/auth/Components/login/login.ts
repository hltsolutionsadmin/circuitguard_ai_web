import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../Services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: Auth
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        localStorage.setItem('token', response.token);
        if (this.authService.isLoggedIn()) {
          this.userService.fetchUserDetails().subscribe({
            next: (user) => {
              const isAdmin = user.roles.some((r) => r.name === 'ROLE_BUSINESS_ADMIN');
              const allowedRoles = [
                'PROJECT_MANAGER',
                'DEVELOPER',
                'QA',
                'DESIGNER',
                'DEVOPS',
                'CLIENT_ADMIN',
              ];

              const hasAllowedRole = user.assignmentRoles?.some((r) => allowedRoles.includes(r));

              if (isAdmin || hasAllowedRole) {
                this.router.navigate(['/layout']);
              } else {
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
              this.router.navigate(['/login']);
            },
          });
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Login failed. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }
}
