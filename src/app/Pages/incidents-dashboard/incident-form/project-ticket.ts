import { Component, inject } from '@angular/core';
import { CreateTicketDto, TicketService } from '../../services/ticket-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from '../../../Common/services/common-service';
import { filter, Subject, take, takeUntil } from 'rxjs';
import { Auth } from '../../../auth/Services/auth';
import { ProjectResponse } from '../../projects/project-model';
import { Project } from '../../services/project';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-project-ticket',
  standalone: false,
  templateUrl: './project-ticket.html',
  styleUrl: './project-ticket.scss',
})
export class ProjectTicket {
  private fb = inject(FormBuilder);
  // private dialogRef = inject(MatDialogRef<ProjectTicket>);
  private incidentService = inject(TicketService);
  private commonService = inject(Auth);
  private projectService = inject(Project);
  private snackBar = inject(MatSnackBar);
  private route = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  form!: FormGroup;
  submitting = false;
  projectsLoading = true;
  user: any;
  organization: any;
  projectNames: any[] = [];
  private location = inject(Location);
  getCategory : any;
  getSubCategory: any;
  private destroy$ = new Subject<void>();
  projectId: any;

  constructor() {
  }
  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['LOW', Validators.required], // ← Default "LOW"
      dueDate: [''],
      projectId: [ this.projectId ],
      category: [1,Validators.required],
      subCategory: [1, Validators.required],
      impact: ['LOW', Validators.required],
      urgency: ['LOW', Validators.required],

    });
       this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const projectId = params.get('projectId');
        if (projectId) {
          this.form.patchValue({ projectId: +projectId });
          this.form.get('projectId')?.disable();
          console.log('fmerofjerofj o',projectId);
          this.projectId = projectId
        }
      });

    this.commonService.user$.pipe(
      filter(user => !!user),
      take(1)
    ).subscribe({
      next: (user) => {
        this.user = user.id;
        this.organization = user.organization.id;
        this.loadProjects();
        this.getAllTicketCategory();
        this.getAllTicketSubCategory();
      },
      error: () => {
        this.showError('Failed to load user. Please try again.');
        this.projectsLoading = false;
      }
    });
  }

  loadProjects(): void {
    if (!this.organization) {
      this.showError('Organization not found.');
      this.projectsLoading = false;
      return;
    }

    this.projectsLoading = true;
    this.projectService.getProjects(0, 100, this.organization).subscribe({
      next: (response: ProjectResponse) => {
        this.projectNames = response?.data?.content || [];
        this.projectsLoading = false;
      },
      error: (error) => {
        this.showError('Error loading projects. Please try again.');
        this.projectsLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting || this.projectsLoading) return;

    this.submitting = true;

    const selectedProjectId = this.form.value.projectId;
    const selectedPriority = this.projectId;
    const formValue = this.form.getRawValue();
     console.log(this.form.value.subCategory, this.form.value.subCategory)

    const payload: any = {
       title: formValue.title,
  description: formValue.description,
  status: 'OPEN',
  projectId: formValue.projectId,
  createdById: this.user,
  archived: false,
  impact: formValue.impact,
  urgency: formValue.urgency,
  subCategoryId: formValue.subCategory,
  categoryId: formValue.category
      
    };

    this.incidentService.createIncident(payload).subscribe({
      next: () => {
        this.snackBar.open('Incident created successfully!', 'OK', { duration: 3000 });
        this.location.back();
        // this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Create failed:', err);
        this.showError('Failed to create incident. Please try again.');
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.route.navigate(['/layout/project'])
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['bg-red-500', 'text-white']
    });
  }

  getAllTicketCategory() {
    this.incidentService.getTicketsCategory(this.organization, 0, 100 ).subscribe({
      next:(res) => {
         this.getCategory = res.data.content
      }
    })
  }

  getAllTicketSubCategory() {
    this.incidentService.getTicketsSubCategory(1, 0, 100 ).subscribe({
      next:(res) => {
         this.getSubCategory = res.data.content
      }
    })
  }
}
