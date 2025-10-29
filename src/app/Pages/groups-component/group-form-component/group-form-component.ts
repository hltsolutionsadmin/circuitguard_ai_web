import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupService } from '../../services/group-service';
import { filter, take } from 'rxjs';
import { CommonService } from '../../../Common/services/common-service';
import { Assignment, TeamService } from '../../services/team-service';

@Component({
  selector: 'app-group-form-component',
  standalone: false,
  templateUrl: './group-form-component.html',
  styleUrl: './group-form-component.scss',
})
export class GroupFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  private commonService = inject(CommonService);
  private userManagementService = inject(TeamService);
  user: any;
  organizationId!: number;
  users: Assignment[] = [];
  pageNumber: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  constructor(
    private fb: FormBuilder,
    private projectService: GroupService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<GroupFormComponent>,
    @Inject(MAT_DIALOG_DATA) public projectId: number
  ) {
    this.form = this.fb.group({
      groupName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      user: [Validators.required],
    });
  }

  ngOnInit(): void {
    this.commonService.user$
      .pipe(
        filter((user) => !!user?.organization.id),
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
            verticalPosition: 'top',
          });
        },
      });
  }

  fetchAssignments(): void {
    this.userManagementService
      .getAssignments('ORGANIZATION', this.organizationId, this.pageNumber, this.pageSize)
      .subscribe({
        next: (res) => {
          this.users = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
          console.log('members', this.users);
        },
        error: (error) => {
          console.error('Error fetching assignments:', error);
          this.snackBar.open('Failed to fetch assignments.', 'Close', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const payload = {
      groupName: this.form.value.groupName,
      description: this.form.value.description,
      project: { id: this.projectId },
      groupLead: { id: this.form.value.user },
    };

    this.projectService.createUserGroup(payload).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Group created successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Error creating group', 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }

  close() {
    this.dialogRef.close(false);
  }
}
