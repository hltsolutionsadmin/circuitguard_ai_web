import { Component, HostListener, inject, Inject, ViewChild } from '@angular/core';
import { Auth } from '../auth/Services/auth';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
 
  authService = inject(Auth)

  logout() {
    this.authService.logout();
  }
}
