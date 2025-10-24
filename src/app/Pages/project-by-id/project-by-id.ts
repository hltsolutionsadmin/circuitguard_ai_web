import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project, ProjectModel } from '../services/project';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-project-by-id',
  standalone: false,
  templateUrl: './project-by-id.html',
  styleUrl: './project-by-id.scss'
})
export class ProjectById {
 project: any | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private projectService: Project,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProject();
  }

  loadProject(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectService.getProjectById(+id).subscribe({
        next: (response) => {
          this.project = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.message || 'Error loading project details. Please try again.';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  calculateDaysRemaining(dueDate: string | undefined): number {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
}
