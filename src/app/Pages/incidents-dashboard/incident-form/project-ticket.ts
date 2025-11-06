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
  private incidentService = inject(TicketService);
  private commonService = inject(Auth);
  private projectService = inject(Project);
  private snackBar = inject(MatSnackBar);
  private route = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private location = inject(Location);
  private destroy$ = new Subject<void>();
  form!: FormGroup;
  submitting = false;
  projectsLoading = true;
  user: any;
  organization: any;
  projectNames: any[] = [];
  getCategory: any;
  getSubCategory: any;
  projectId: any;
  userDetails: any;
  subCategoryPageSize = 10;
  hasMoreSubCategories = false;
  showSubCategoryDropdown = false;
  loadingSubcategories = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['LOW', Validators.required], // ← Default "LOW"
      dueDate: [''],
      projectId: [this.projectId],
      category: [0, Validators.required],
      subCategory: [0, Validators.required],
      impact: ['LOW', Validators.required],
      urgency: ['LOW', Validators.required],
    });
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const projectId = params.get('projectId');
      if (projectId) {
        this.form.patchValue({ projectId: +projectId });
        this.form.get('projectId')?.disable();
        this.projectId = projectId;
      }
    });

    this.commonService.user$
      .pipe(
        filter((user) => !!user),
        take(1)
      )
      .subscribe({
        next: (user) => {
          if (user.organization) {
            this.organization = user.organization.id;
          } 
            this.user = user.id;
            this.userDetails = user;
            this.loadProjects();
            this.getAllTicketCategory();
        },
        error: () => {
          this.showError('Failed to load user. Please try again.');
          this.projectsLoading = false;
        },
      });

      this.form.get('category')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((categoryId) => {
        if (categoryId) {
          this.subCategoryPageSize = 10; // reset pagination
          this.getAllTicketSubCategory(categoryId, this.subCategoryPageSize);
        } else {
           this.showSubCategoryDropdown = false;
          this.getSubCategory = [];
          this.form.patchValue({ subCategory: null });
        }
      });
  }

  loadProjects(): void {
    const userDetails = this.userDetails;
    if (userDetails.assignmentRoles && userDetails.assignmentRoles.length > 0) {
      this.projectService.getMyProjects().subscribe({
        next: (response: ProjectResponse) => {
          this.projectNames = response?.data?.content || [];
          this.projectsLoading = false;

          if (this.projectNames.length > 0) {
            const firstProject = this.projectNames[0];
            this.projectId = firstProject.id;
          }
        },
        error: () => {
          this.showError('Error loading projects. Please try again.');
          this.projectsLoading = false;
        },
      });
    } else {
      if (!this.organization) {
        this.showError('Organization not found.');
        this.projectsLoading = true;
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
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting || this.projectsLoading) return;

    this.submitting = true;

    const selectedProjectId = this.form.value.projectId;
    const selectedPriority = this.projectId;
    const formValue = this.form.getRawValue();
    console.log(this.form.value.subCategory, this.form.value.subCategory);

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
      categoryId: formValue.category,
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
      },
    });
  }

  onCancel(): void {
    this.route.navigate([`/layout/incidents-dashboard/${this.projectId}`]);
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['bg-red-500', 'text-white'],
    });
  }

  getAllTicketCategory() {
    this.incidentService.getTicketsCategory(this.projectId).subscribe({
      next: (res) => {
        this.getCategory = res.data.content || [];
      },
    });
  }

   getAllTicketSubCategory(categoryId: number, pageSize: number) {
    this.loadingSubcategories = true;
    this.incidentService.getTicketsSubCategory(categoryId, 0, pageSize).subscribe({
      next: (res) => {
        this.getSubCategory = res.data.content || [];
        this.hasMoreSubCategories = (res.data.totalElements || 0) > this.getSubCategory.length;
        this.loadingSubcategories = false;
      },
      error: () => {
        this.loadingSubcategories = false;
      },
    });
  }

   loadMoreSubCategories() {
    const categoryId = this.form.get('category')?.value;
    if (!categoryId) return;
    this.subCategoryPageSize += 10;
    this.getAllTicketSubCategory(categoryId, this.subCategoryPageSize);
  }

   ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
