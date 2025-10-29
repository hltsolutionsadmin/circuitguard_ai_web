import { Component, inject } from '@angular/core';
import { CreateTicketDto, TicketService } from '../../services/ticket-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from '../../../Common/services/common-service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-project-ticket',
  standalone: false,
  templateUrl: './project-ticket.html',
  styleUrl: './project-ticket.scss',
})
export class ProjectTicket {
 private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProjectTicket>);
  private incidentService = inject(TicketService);
  private data = inject(MAT_DIALOG_DATA);
  private commonService = inject(CommonService)

  projectId: any;
  form!: FormGroup;
  submitting = false;
  user: any;

  ngOnInit(): void {
    this.projectId = this.data.projectId;
    if (!this.projectId) {
      this.dialogRef.close();
      return;
    }
    this.commonService.user$.pipe(
          filter(user => !!user),
          take(1) 
        ).subscribe({
          next: (user) => {
            this.user = user.id;
          }
        })

    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;

    this.submitting = true;

    const payload: CreateTicketDto = {
      title: this.form.value.title,
      description: this.form.value.description,
      priority: this.form.value.priority,
      status: 'OPEN',
      projectId: this.projectId,
      createdById: this.user,
      dueDate: this.formatDate(this.form.value.dueDate),
      archived: false
    };

    this.incidentService.createIncident(payload).subscribe({
      next: () => {
        this.dialogRef.close(true); // true = success
      },
      error: (err) => {
        console.error('Create failed:', err);
        alert('Failed to create incident. Please try again.');
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString();
  }
}
