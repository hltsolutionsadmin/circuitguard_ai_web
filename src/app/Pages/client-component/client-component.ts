import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTeamMember } from '../team-setup/add-team-member/add-team-member';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-client-component',
  standalone: false,
  templateUrl: './client-component.html',
  styleUrl: './client-component.scss'
})
export class ClientComponent {

  private dialog = inject(MatDialog);
   private snackBar = inject(MatSnackBar);
   
   openAddClientDialog(): void {
      const dialogRef = this.dialog.open(AddTeamMember, {
        width: '600px',
        data: { isClient: true }
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.showSnack('Client added successfully');
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
}
