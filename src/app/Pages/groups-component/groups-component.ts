import { Component, inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupFormComponent } from './group-form-component/group-form-component';
import { MatDialog } from '@angular/material/dialog';
import { Content } from '../projects/project-model';
import { TeamService } from '../services/team-service';
import { Location } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-groups-component',
  standalone: false,
  templateUrl: './groups-component.html',
  styleUrl: './groups-component.scss',
})
export class GroupsComponent implements OnInit {
  groups: Content[] = [];
  pageNumber = 0;
  pageSize = 10;
  totalElements = 0;
  projectId: any;
  private snackBar = inject(MatSnackBar);
  private projectService = inject(TeamService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private Location = inject(Location);
  private destroy$ = new Subject<void>();
  
  constructor() {
     this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectId = id;
        this.loadGroups();
      }
    });
  }

  
  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.projectService.getUserGroups(this.projectId, this.pageNumber, this.pageSize).subscribe({
      next: (res) => {
         console.log(this.projectId)
        this.groups = res.data.content;
        this.totalElements = res.data.totalElements;
      },
      error: () => {
        this.showSnack('Error fetching user groups.');
      },
    });
  }

  showSnack(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  openCreateGroupDialog(): void {
      const dialogRef = this.dialog.open(GroupFormComponent, {
        width: '600px',
        data: this.projectId
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.loadGroups();
          this.showSnack('Group created successfully');
        }
      });
    }

   showMembers(group: Content): void {
    this.router.navigate(['/layout/members-list', group.id, group.groupName, group.description,this.projectId]);
  }

    backToProj() {
    this.Location.back();
  }
}
