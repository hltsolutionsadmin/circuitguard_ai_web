import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project, ProjectModel } from '../../services/project';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddTeamMember } from '../../team-setup/add-team-member/add-team-member';
import { MatDialog } from '@angular/material/dialog';

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
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
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
          console.log(this.project)
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

  openAddClientDialog(): void {
    const dialogRef = this.dialog.open(AddTeamMember, {
      width: '600px',
      data: { isClient: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProject(); // Refresh project data after adding client
        this.snackBar.open('Client added successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  openAddTeamMemberDialog(): void {
   this.router.navigate(['layout/incidents-dashboard', this.project.description, this.project.name])
  }
}
