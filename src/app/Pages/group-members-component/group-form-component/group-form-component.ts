import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupService } from '../../services/group-service';

@Component({
  selector: 'app-group-form-component',
  standalone: false,
  templateUrl: './group-form-component.html',
  styleUrl: './group-form-component.scss',
})
export class GroupFormComponent {
  form: FormGroup;
  loading = false;

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
