import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project, ProjectModel } from '../../services/project';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddTeamMember } from '../../team-setup/add-team-member/add-team-member';
import { MatDialog } from '@angular/material/dialog';
import { Content } from '../project-model';

@Component({
  selector: 'app-project-by-id',
  standalone: false,
  templateUrl: './project-by-id.html',
  styleUrl: './project-by-id.scss'
})
export class ProjectById {
   project: any | null = null;
  isLoading = false;

  // new
  groups: Content[] = [];
  pageNumber = 0;
  pageSize = 10;
  totalElements = 0;

  constructor(
    private route: ActivatedRoute,
    private projectService: Project,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProject();
    this.loadGroups();
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
          this.showSnack(error.message || 'Error loading project details.');
        }
      });
    }
  }

  loadGroups(): void {
    this.projectService.getUserGroups(this.pageNumber, this.pageSize).subscribe({
      next: (res) => {
        this.groups = res.data.content;
        this.totalElements = res.data.totalElements;
      },
      error: () => {
        this.showSnack('Error fetching user groups.');
      }
    });
  }

  showSnack(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  calculateDaysRemaining(dueDate: string | undefined): number {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  openAddClientDialog(): void {
    const dialogRef = this.dialog.open(AddTeamMember, {
      width: '600px',
      data: { isClient: true }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProject();
        this.showSnack('Client added successfully');
      }
    });
  }

  openAddTeamMemberDialog(): void {
    this.router.navigate(['layout/incidents-dashboard', this.project.description, this.project.name]);
  }

  showMembers(group: Content): void {
    this.router.navigate(['/layout/members-list', group.id,group.groupName,group.description]);
  }
}
