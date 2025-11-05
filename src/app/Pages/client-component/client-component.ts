import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTeamMember } from '../team-setup/add-team-member/add-team-member';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from '../services/group-service';
import { Location } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-client-component',
  standalone: false,
  templateUrl: './client-component.html',
  styleUrl: './client-component.scss'
})
export class ClientComponent implements OnInit{

  private dialog = inject(MatDialog);
   private snackBar = inject(MatSnackBar);
   private paramRoute = inject(ActivatedRoute);
   private groupService = inject(GroupService);
   private Location = inject(Location);
   private destroy$ = new Subject<void>();
   
   projectId : any;
   clients: any;
   constructor() {
    this.paramRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectId = id;
        this.getProjectClients();
      }
    });
   }
   
   ngOnInit(): void {
     this.getProjectClients();
   }

   getProjectClients() {
    this.groupService.getClientMembers(this.projectId).subscribe({
      next:(res) => {
         this.clients = res.data.content
      }
    })
   }
   openAddClientDialog(): void {
      const dialogRef = this.dialog.open(AddTeamMember, {
        width: '600px',
        data: { isClient: true ,projectId: this.projectId }
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.getProjectClients();
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

    backToProj() {
    this.Location.back();
  }
}
