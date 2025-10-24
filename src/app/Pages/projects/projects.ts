import { Component } from '@angular/core';
import { Project, ProjectModel } from '../services/project';
import { ProjectResponse } from './project-model';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects {
  projects: ProjectModel[] = [];
  currentPage = 0;
  pageSize = 10;
  hasMore = true;
  isLoading = false;

  constructor(
    private projectService: Project,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    this.projectService.getProjects(this.currentPage, this.pageSize, 1, 1, 'PLANNED').subscribe({
      next: (response: ProjectResponse) => {
        this.projects.push(...response.data.content);
        this.hasMore = !response.data.last;
        this.currentPage++;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.message || 'Error loading projects. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  loadMore(): void {
    this.loadProjects();
  }

  onProjectClick(id: number): void {
    this.router.navigate([`/layout/project-details/${id}`]);
  }
}
