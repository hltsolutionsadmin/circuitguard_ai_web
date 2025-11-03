import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTeamMember } from './add-team-member/add-team-member';
import { Assignment, AssignProjectRequest, TeamService } from '../services/team-service';
import { filter, take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../auth/Services/auth';
import { Location } from '@angular/common';

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
  user: any;
  organizationId!: number;
  groupId: number | null = null;
  projectId: number | null = null;
  showRolePopup: boolean = false;
  selectedUserId: number | null = null;
  roleForm: FormGroup;
  selectedUsers: Map<number, string> = new Map(); // userId -> role

  private dialog = inject(MatDialog);
  private userManagementService = inject(TeamService);
  private commonService = inject(Auth);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);
  roleFilter: string = '';

  constructor() {
    this.roleForm = this.fb.group({
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'] ? Number(params['groupId']) : null;
      this.projectId = params['projectId'] ? Number(params['projectId']) : null;
    });

    this.commonService.user$
      .pipe(
        filter(user => !!user?.organization.id),
        take(1)
      )
      .subscribe({
        next: (user) => {
          this.user = user?.organization;
          this.organizationId = this.user.id;
          this.fetchAssignments();
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

  fetchAssignments(): void {
    this.userManagementService.getAssignments('ORGANIZATION', this.organizationId, this.pageNumber, this.pageSize).subscribe({
      next: (res) => {
        this.users = res.data.content;
        this.totalElements = res.data.totalElements;
        this.totalPages = res.data.totalPages;
      },
      error: (error) => {
        console.error('Error fetching assignments:', error);
        this.snackBar.open('Failed to fetch assignments.', 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onRoleFilterChange(event: any): void {
  const selectedRole = event.target.value;
  this.roleFilter = selectedRole;

  if (!selectedRole) {
    // "All Roles" selected → fetch all
    this.fetchAssignments();
  } else {
    // Specific role selected → call new API
    this.userManagementService
      .getProjectAssignmentsByRole(this.organizationId , selectedRole, this.pageNumber, this.pageSize)
      .subscribe({
        next: (res) => {
          this.users = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
        },
        error: (error) => {
          console.error('Error fetching project assignments by role:', error);
          this.snackBar.open('Failed to fetch users by role.', 'Close', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
  }
}



  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddTeamMember, {
      width: '400px',
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: { groupId: this.groupId }
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
      data: {user} , 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchAssignments();
      }
    });
  }

  startAssignment(userId: number): void {
    this.selectedUserId = userId;
    this.roleForm.reset();
    this.showRolePopup = true;
  }

  confirmRoleSelection(): void {
    if (this.roleForm.valid && this.selectedUserId !== null) {
      const role = this.roleForm.get('role')?.value;
      this.selectedUsers.set(this.selectedUserId, role);
    }
    this.closeRolePopup();
  }

  cancelSelection(userId: number): void {
    this.selectedUsers.delete(userId);
  }

  isSelected(userId: number): boolean {
    return this.selectedUsers.has(userId);
  }

  closeRolePopup(): void {
    this.showRolePopup = false;
    this.roleForm.reset();
    this.selectedUserId = null;
  }

  assignTeamMembers(): void {
    if (this.selectedUsers.size === 0 || !this.groupId || !this.projectId) {
      return;
    }

    const userIds = Array.from(this.selectedUsers.keys());
    const roles = Array.from(this.selectedUsers.values());

    const body: AssignProjectRequest = {
      userIds : userIds,
      targetType: 'PROJECT',
      roles : roles,
      targetId: this.projectId,
      groupIds: [this.groupId],
      active: true
    };

    this.userManagementService.assignToProject(body).subscribe({
      next: () => {
        this.snackBar.open('Users assigned successfully.', 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.selectedUsers.clear();
        // this.router.navigate(['/layout/member-list']);
        this.location.back()
      },
      error: (error) => {
        console.error('Error assigning users:', error);
        this.snackBar.open('Failed to assign users.', 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this team member?')) {
      this.userManagementService.deleteAssignment(id).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully.', 'Close', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.fetchAssignments();
        },
        error: (error) => {
          console.error('Error deleting assignment:', error);
          this.snackBar.open('Failed to delete user.', 'Close', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  getInitials(fullName: string | null): string {
    if (!fullName) return '';
    const words = fullName.split(' ');
    return words.map(w => w[0]?.toUpperCase() || '').join('').slice(0, 2);
  }

 getDisplayRole(role?: string): string {
  if (!role) return 'N/A'; // or 'No Role' / '-'
  const roleMap: { [key: string]: string } = {
    'ROLE_ADMIN': 'System Admin',
    'PROJECT_MANAGER': 'Project Manager',
    'TECH_LEAD': 'Tech Lead',
    'DEVELOPER': 'Developer',
    'QA': 'QA',
    'DESIGNER': 'Designer',
    'BUSINESS_ANALYST': 'Business Analyst',
    'DEVOPS': 'DevOps',
    'CLIENT_ADMIN': 'Client Admin'
  };
  return roleMap[role] ||
    role.replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

getRoleColor(role?: string): string {
  if (!role) return 'bg-gray-100 text-gray-400'; // default for empty role
  const colorMap: { [key: string]: string } = {
    'ROLE_ADMIN': 'bg-blue-100 text-blue-700',
    'PROJECT_MANAGER': 'bg-purple-100 text-purple-700',
    'TECH_LEAD': 'bg-green-100 text-green-700',
    'DEVELOPER': 'bg-green-100 text-green-700',
    'QA': 'bg-yellow-100 text-yellow-700',
    'DESIGNER': 'bg-pink-100 text-pink-700',
    'BUSINESS_ANALYST': 'bg-orange-100 text-orange-700',
    'DEVOPS': 'bg-indigo-100 text-indigo-700',
    'CLIENT_ADMIN': 'bg-teal-100 text-teal-700'
  };
  return colorMap[role] || 'bg-gray-100 text-gray-700';
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
}
