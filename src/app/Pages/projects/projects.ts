import { Component, OnInit } from '@angular/core';
import { Project, ProjectModel } from '../services/project';
import { filter, take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Auth } from '../../auth/Services/auth';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects implements OnInit {
  projects: ProjectModel[] = [];
  currentPage = 0;
  pageSize = 9;
  organizationId!: number;
  totalElements!: number;
  hasMore = true;
  isLoading = false;
  user: any;
  

  constructor(
    private projectService: Project,
    private router: Router,
    private snackBar: MatSnackBar,
    private commonService: Auth
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
  if (this.isLoading || !this.organizationId) return;

  this.isLoading = true;

  this.projectService.getProjects(this.currentPage, this.pageSize, this.organizationId)
    .subscribe({
      next: (response: any) => {
        const newProjects = response?.data?.content || [];

        if (this.currentPage === 0) {
          this.projects = newProjects; // first page
        } else {
          this.projects = [...this.projects, ...newProjects]; // append
        }

        this.totalElements = response?.data?.totalElements || this.projects.length;

        // ✅ Determine if more projects exist
        this.hasMore = this.projects.length < this.totalElements;

        this.currentPage++; // move to next page
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.showError('Error loading projects. Please try again.');
      }
    });
}


selectedStatus = 'All Status';

onStatusChange(status: string): void {
  if (status === 'All Status') {
    this.currentPage = 0;
    this.hasMore = true;
    this.projects = [];
    this.loadProjects();
  } else {
    this.isLoading = true;
    this.projectService.getProjectsByStatus(status,this.organizationId).subscribe({
      next: (response: any) => {
        this.projects = response?.data?.content || [];
        this.totalElements = response?.data?.totalElements || 0;
        this.hasMore = false;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching filtered projects:', error);
      }
    });
  }
}

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  loadMore(): void {
    this.loadProjects();
  }

  onProjectClick(id: number): void {
    this.router.navigate([`layout/incidents-dashboard/${id}`]);
  }
}
