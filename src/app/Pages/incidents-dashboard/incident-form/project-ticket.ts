import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-project-ticket',
  standalone: false,
  templateUrl: './project-ticket.html',
  styleUrl: './project-ticket.scss',
})
export class ProjectTicket {
  constructor(private location: Location) {}

  goBack(): void {
  this.location.back();
}
}
