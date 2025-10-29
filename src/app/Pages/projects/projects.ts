import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Project, ProjectModel } from '../services/project';
import { ProjectResponse } from './project-model';
import { filter, take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonService } from '../../Common/services/common-service';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects implements OnInit {
  projects: ProjectModel[] = [];
  currentPage = 0;
  pageSize = 10;
  organizationId!: number;
  hasMore = true;
  isLoading = false;
  user: any;

  constructor(
    private projectService: Project,
    private router: Router,
    private snackBar: MatSnackBar,
    private commonService: CommonService
  ) {}


  ngOnInit(): void {
    this.commonService.user$
      .pipe(
        filter(user => !!user?.organization.id),
        take(1) 
      )
      .subscribe({
        next: (user) => {
          this.user = user?.organization;
          this.organizationId = this.user.id;
          this.loadProjects();
        },
        error: (err) => {
          console.error('Error fetching user data:', err);
          this.snackBar.open('Unable to fetch user information.', 'Close', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
  }

 loadProjects(): void {
  if (this.isLoading || !this.hasMore) return;
  if (!this.organizationId) {
    console.warn('Organization ID not available yet.');
    return;
  }

  this.isLoading = true;

  this.projectService.getProjects(this.currentPage, this.pageSize, this.organizationId).subscribe({
    next: (response: ProjectResponse) => {
      if (response?.data) {
        this.projects = response.data.content;
      }
      this.hasMore = false;
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
    this.router.navigate([`layout/incidents-dashboard/${id}`]);
  }
}
