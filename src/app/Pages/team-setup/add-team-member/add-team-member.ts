import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TeamService } from '../../services/team-service';
import { CommonService } from '../../../Common/services/common-service';
import { Auth } from '../../../auth/Services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-team-member',
  standalone: false,
  templateUrl: './add-team-member.html',
  styleUrl: './add-team-member.scss',
})
export class AddTeamMember implements OnInit {
  addUserForm: FormGroup;
  user: any;
  isEdit: boolean = false;
  isClient: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddTeamMember>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private userManagementService: TeamService,
    private CommonService: Auth,
    private snackBar: MatSnackBar
  ) {
    this.CommonService.user$.subscribe((data) => {
      this.user = data?.organization;
    });

    const userData = data?.user;

    this.isClient = data?.isClient || false;
    this.isEdit = !!userData;

    this.addUserForm = this.fb.group({
      employeeName: ['', [Validators.required]],
      employeeEmail: ['', [Validators.required, Validators.email]],
      role: [this.isClient ? 'CLIENT_ADMIN' : '', this.isClient ? [] : [Validators.required]],
      //employeeContact: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]],
      password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(2)]],
    });

    if (this.isEdit && userData) {
      debugger;
      this.addUserForm.patchValue({
        employeeName: userData.fullName,
        employeeEmail: userData.username,
        role: userData.roles?.[0],
        employeeContact: userData.username,
        password: userData.password,
      });
    }
  }

  ngOnInit() {
    console.log(this.user);
  }

  onSubmit(): void {
    if (this.addUserForm.valid) {
      const formValues = this.addUserForm.value;

      const payload: any = {
        username: formValues.employeeEmail,
        fullName: formValues.employeeName,
        active: this.isEdit ? this.data?.active : true,
        primaryContact: formValues.employeeEmail,
      };

      if (formValues.password) {
        payload.password = formValues.password;
      }

      if (this.isClient) {
        payload.roles = ['CLIENT_ADMIN'];
        payload.targetType = 'PROJECT';
        payload.targetId = this.data?.projectId;
      } else {
        // Normal organization team member
        payload.roles = Array.isArray(formValues.role) ? formValues.role : [formValues.role];
        payload.targetType = 'ORGANIZATION';
        payload.targetId = this.user.id;
      }

      // ✅ Create or update API call
      if (this.isEdit && this.data) {
        this.userManagementService.updateAssignment(this.data.id, payload).subscribe({
          next: (response) => this.dialogRef.close(response),
          error: (error) => console.error('Error updating team member:', error),
        });
      } else {
        if (this.isClient) {
          // ✅ Call new client-specific API
          this.userManagementService.addClientAssignment(payload).subscribe({
            next: (response) => this.dialogRef.close(response),
            error: (error) => {console.error('Error adding client:', error),  this.snackBar.open('Email Already Registered.', 'Close', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });}
          });
        } else {
          // Existing team member API
          this.userManagementService.addAssignment(payload).subscribe({
            next: (response) => this.dialogRef.close(response),
            error: (error) => {console.error('Error adding team member:', error),   this.snackBar.open('Email Already Registered', 'Close', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });}
          });
        }
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
