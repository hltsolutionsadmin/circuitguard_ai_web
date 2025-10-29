import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { filter, take } from 'rxjs';
import { Router } from '@angular/router';
import { UserModel } from '../../../Interface/user-details';
import { Project, ProjectModel } from '../../services/project';
import { CommonService } from '../../../Common/services/common-service';

@Component({
  selector: 'app-project-details-form',
  standalone: false,
  templateUrl: './project-details-form.html',
  styleUrl: './project-details-form.scss'
})
export class ProjectDetailsForm {
  @Output() nextStep = new EventEmitter<void>();
  @ViewChild('stepper') stepper!: MatStepper;

  projectOnboardingWizard = true;
  isLoading = false;
  user!: UserModel;

  projectDetailsForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private projectService: Project,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
    private route : Router
  ) {}

  ngOnInit(): void {
    // Initialize the form
    this.projectDetailsForm = this.fb.group({
      projectName: ['', Validators.required],
      projectDescription: ['', Validators.required],
      projectCategory: ['', Validators.required],
      startDate: [null, Validators.required],
      targetEndDate: [null, Validators.required],
    });

    // Wait for valid user data before enabling submission
    this.commonService.user$
      .pipe(
        filter((user: UserModel | null) => !!user?.organization?.id),
        take(1)
      )
      .subscribe({
  next: (user: UserModel | null) => {
    if (user && user.organization?.id) {
      this.user = user;
      console.log('User loaded in project form:', this.user);
    } else {
      console.warn('User data not available yet.');
    }
  },
  error: (err) => {
    console.error('Error fetching user:', err);
    this.snackBar.open('Unable to fetch user information.', 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
});
  }

  get technologyStackControls() {
    return (this.projectDetailsForm.get('technologyStack') as FormArray).controls;
  }

  onTechStackChange(event: any, index: number) {
    const techStackArray = this.projectDetailsForm.get('technologyStack') as FormArray;
    techStackArray.controls[index].setValue(event.checked);
  }

  onStartDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.projectDetailsForm.get('startDate')?.setValue(event.value);
  }

  onTargetEndDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.projectDetailsForm.get('targetEndDate')?.setValue(event.value);
  }

 onSubmit(): void {
    if (this.projectDetailsForm.invalid) {
      this.projectDetailsForm.markAllAsTouched();
      return;
    }

    if (!this.user?.organization?.id) {
      this.snackBar.open('User information not loaded yet. Please wait.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    const formValue = this.projectDetailsForm.value;

    const project: ProjectModel = {
      name: formValue.projectName,
      description: formValue.projectDescription,
      startDate: formValue.startDate ? new Date(formValue.startDate).toISOString().split('T')[0] : '',
      endDate: formValue.targetEndDate ? new Date(formValue.targetEndDate).toISOString().split('T')[0] : '',
      status: 'PLANNED',
      type: 'INTERNAL',
      ownerOrganizationId: this.user.organization.id, // ✅ now safe
      archived: false,
    };

    this.isLoading = true;

    this.projectService.createProject(project).subscribe({
      next: (res: any) => {
        if(res) {
          const responseId = res.data.id
          this.route.navigate([`/layout/incidents-dashboard/${responseId}`])
           this.isLoading = false;
        this.snackBar.open('Project created successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.nextStep.emit();
        this.stepper.next();
        this.projectOnboardingWizard = false;
        }
       
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.message || 'Error creating project. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }


  onBack(): void {
    console.log('Back button clicked');
    this.route.navigate(['/layout/project'])
  }

  onFinish(): void {
    console.log('Team Setup Completed');
  }
}
