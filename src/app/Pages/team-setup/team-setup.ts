import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTeamMember } from './add-team-member/add-team-member';
import { TeamService } from '../services/team-service';

export interface Assignment {
  id: number;
  userId: number;
  targetType: string;
  targetId: number;
  role: string;
  active: boolean;
  username: string | null;
  fullName: string | null;
  primaryContact: string | null;
  password: string | null;
  email: string | null;
}

@Component({
  selector: 'app-team-setup',
  standalone: false,
  templateUrl: './team-setup.html',
  styleUrl: './team-setup.scss'
})
export class TeamSetup {
 users: Assignment[] = [];
  pageNumber: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  constructor(
    public dialog: MatDialog,
    private userManagementService: TeamService
  ) {}

  ngOnInit(): void {
    this.fetchAssignments();
  }

  fetchAssignments(): void {
    this.userManagementService.getAssignments('ORGANIZATION', 4, this.pageNumber, this.pageSize).subscribe({
      next: (res) => {
        this.users = res.data.content;
        this.totalElements = res.data.totalElements;
        this.totalPages = res.data.totalPages;
      },
      error: (error) => {
        console.error('Error fetching assignments:', error);
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddTeamMember, {
      width: '400px',
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchAssignments();
      }
    });
  }

  openEditDialog(user: Assignment): void {
    const dialogRef = this.dialog.open(AddTeamMember, {
      width: '400px',
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchAssignments();
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this team member?')) {
      this.userManagementService.deleteAssignment(id).subscribe({
        next: () => {
          this.fetchAssignments();
        },
        error: (error) => {
          console.error('Error deleting assignment:', error);
        }
      });
    }
  }

  getInitials(fullName: string | null): string {
    if (!fullName) return '';
    const words = fullName.split(' ');
    return words.map(w => w[0]?.toUpperCase() || '').join('').slice(0, 2);
  }

  getDisplayRole(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'System Admin';
      case 'PROJECT_MANAGER':
        return 'Project Manager';
      case 'TECH_LEAD':
        return 'Tech Lead';
      case 'DEVELOPER':
        return 'Developer';
      case 'QA':
        return 'QA';
      case 'DESIGNER':
        return 'Designer';
      case 'BUSINESS_ANALYST':
        return 'Business Analyst';
      case 'DEVOPS':
        return 'DevOps';
      default:
        return role.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'bg-blue-100 text-blue-700';
      case 'PROJECT_MANAGER':
        return 'bg-purple-100 text-purple-700';
      case 'TECH_LEAD':
      case 'DEVELOPER':
        return 'bg-green-100 text-green-700';
      case 'QA':
        return 'bg-yellow-100 text-yellow-700';
      case 'DESIGNER':
        return 'bg-pink-100 text-pink-700';
      case 'BUSINESS_ANALYST':
        return 'bg-orange-100 text-orange-700';
      case 'DEVOPS':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  isFirstPage(): boolean {
    return this.pageNumber === 0;
  }

  isLastPage(): boolean {
    return this.pageNumber === this.totalPages - 1;
  }

  previousPage(): void {
    if (!this.isFirstPage()) {
      this.pageNumber--;
      this.fetchAssignments();
    }
  }

  nextPage(): void {
    if (!this.isLastPage()) {
      this.pageNumber++;
      this.fetchAssignments();
    }
  }

  goToPage(page: number): void {
    this.pageNumber = page;
    this.fetchAssignments();
  }
}
