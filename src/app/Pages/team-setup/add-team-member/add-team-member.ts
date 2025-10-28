import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TeamService } from '../../services/team-service';
import { CommonService } from '../../../Common/services/common-service';

@Component({
  selector: 'app-add-team-member',
  standalone: false,
  templateUrl: './add-team-member.html',
  styleUrl: './add-team-member.scss'
})
export class AddTeamMember {
  addUserForm: FormGroup;
  user: any;
  isEdit: boolean = false;
  isClient: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddTeamMember>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private userManagementService: TeamService,
    private CommonService: CommonService
  ) {
    this.CommonService.user$.subscribe((data) => {
      this.user = data?.organization;
    });

    // Determine if this is for a client or team member
    this.isClient = data?.isClient || false;
    this.isEdit = !!data?.userId;

    // Initialize form, conditionally applying validators
    this.addUserForm = this.fb.group({
      employeeName: ['', [Validators.required]],
      employeeEmail: ['', [Validators.required, Validators.email]],
      role: [this.isClient ? 'CLIENT_ADMIN' : '', this.isClient ? [] : [Validators.required]],
      employeeContact: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]],
      password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(8)]]
    });

    if (this.isEdit && this.data) {
      this.addUserForm.patchValue({
        employeeName: this.data.fullName,
        employeeEmail: this.data.username,
        role: this.data.role,
        employeeContact: this.data.primaryContact,
        password: this.data.password
      });
    }
  }

  onSubmit(): void {
    if (this.addUserForm.valid) {
      let payload: any = {
        userId: this.isEdit ? this.data?.userId : null,
        targetType: 'ORGANIZATION',
        targetId: this.user.id,
        role: this.isClient ? 'CLIENT_ADMIN' : this.addUserForm.value.role,
        active: this.isEdit ? this.data?.active : true,
        username: this.addUserForm.value.employeeEmail,
        fullName: this.addUserForm.value.employeeName,
        primaryContact: this.addUserForm.value.employeeContact
      };

      const password = this.addUserForm.value.password;
      if (password) {
        payload.password = password;
      }

      if (this.isEdit && this.data) {
        this.userManagementService.updateAssignment(this.data.id, payload).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error updating team member:', error);
          }
        });
      } else {
        this.userManagementService.addAssignment(payload).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error adding team member:', error);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
