import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService, User } from '../../services/team-service';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-group-members-component',
  standalone: false,
  templateUrl: './group-members-component.html',
  styleUrl: './group-members-component.scss'
})
export class GroupMembersComponent {
groupId: number | null = null;
  groupName = '';
  groupDesc = '';
  projectId: any;

  users: User[] = [];
  totalElements = 0;
  currentPage = 0;
  pageSize = 10;
  loading = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupService = inject(TeamService);
  private Location = inject(Location);
  private snackBar = inject(MatSnackBar)
  ngOnInit(): void {
    this.groupId = Number(this.route.snapshot.paramMap.get('groupId'));
    this.groupName = this.route.snapshot.paramMap.get('groupName') ?? '';
    this.groupDesc = this.route.snapshot.paramMap.get('description') ?? '';
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));

    this.loadPage();
  }

  loadPage(page: number = 0): void {
    if (this.groupId === null) return;

    this.loading = true;
    this.currentPage = page;

    this.groupService.getGroupMembers(this.groupId, page, this.pageSize)
      .subscribe({
        next: (res) => {
          this.users = res.data.content;
          this.totalElements = res.data.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load members:', err);
          this.users = [];
          this.loading = false;
        }
      });
  }

  navigateToTeamSetup(): void {
    this.router.navigate(['/layout/team-setUp'], {
      queryParams: { groupId: this.groupId, projectId: this.projectId }
    });
  }

  removeMember(userId: number): void {
    console.log('Remove user ID:', userId);
    this.groupService.deleteGroupMembers(userId).subscribe({
      next:() => { this.showSnack('Incident created successfully!'), this.loadPage()}
    })
    this.loadPage(this.currentPage);
  }

  // Pagination helpers
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.loadPage(page);
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  showSnack(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  backToProj() {
   this.Location.back()
  }
}

