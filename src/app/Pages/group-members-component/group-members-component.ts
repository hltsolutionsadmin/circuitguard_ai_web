import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-group-members-component',
  standalone: false,
  templateUrl: './group-members-component.html',
  styleUrl: './group-members-component.scss'
})
export class GroupMembersComponent {

  groupId: number | null = null;
  groupName: string = '';
  groupDesc: string = '';
  projectId: any;

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.groupId = Number(this.route.snapshot.paramMap.get('groupId'));
    this.groupName = this.route.snapshot.paramMap.get('groupName') ?? '';
    this.groupDesc = this.route.snapshot.paramMap.get('description') ?? '';
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));

    console.log('Route Params →', {
      projectId: this.projectId,
      groupId: this.groupId,
      groupName: this.groupName,
      groupDesc: this.groupDesc
    });
  }

  navigateToTeamSetup(): void {
    this.router.navigate(['/layout/team-setUp'], {
      queryParams: { groupId: this.groupId,projectId: this.projectId }
    });
  }
}
