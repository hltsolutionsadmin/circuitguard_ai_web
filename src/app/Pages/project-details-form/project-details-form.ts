import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { Project, ProjectModel } from '../services/project';

interface ProjectPriority {
  value: 'low' | 'medium' | 'high';
  label: string;
  class: string;
}

interface ExpectedTeamSize {
  value: '1-5' | '6-15' | '16-30' | '30+';
  label: string;
  description: string;
}

interface TechnologyStack {
  value: string;
  label: string;
}

@Component({
  selector: 'app-project-details-form',
  standalone: false,
  templateUrl: './project-details-form.html',
  styleUrl: './project-details-form.scss'
})
export class ProjectDetailsForm {
 @Output() nextStep = new EventEmitter<void>();
  @ViewChild('stepper') stepper!: MatStepper;
  projectOnboardingWizard: boolean = true;
  isLoading: boolean = false;

  projectDetailsForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private projectService: Project,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.projectDetailsForm = this.fb.group({
      projectName: ['', Validators.required],
      projectDescription: ['', Validators.required],
      projectCategory: ['', Validators.required],
      projectPriority: ['medium'], // Default to medium
      budgetRange: [''],
      expectedTeamSize: ['6-15'], // Default to medium
      technologyStack: [''], // Checkboxes
      startDate: [null, Validators.required],
      targetEndDate: [null, Validators.required],
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

    const formValue = this.projectDetailsForm.value;

    const project: ProjectModel = {
      name: formValue.projectName,
      description: formValue.projectDescription,
      startDate: formValue.startDate ? new Date(formValue.startDate).toISOString().split('T')[0] : '',
      endDate: '2025-12-31',
      targetEndDate: formValue.targetEndDate ? new Date(formValue.targetEndDate).toISOString().split('T')[0] : '',
      dueDate: '2025-12-30',
      status: 'PLANNED',
      type: 'INTERNAL',
      ownerOrganizationId: 1,
      clientOrganizationId: 1,
      progressPercentage: 0,
      expectedTeamSize: formValue.expectedTeamSize || '5-10',
      archived: false,
      clientId: 1,
      projectManagerId: 1
    };

    this.isLoading = true;

    this.projectService.createProject(project).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Project created successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.nextStep.emit();
        this.stepper.next();
        this.projectOnboardingWizard = false;
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
  }

  onFinish(): void {
    console.log('Team Setup Completed');
  }
}
