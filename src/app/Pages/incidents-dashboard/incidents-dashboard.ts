import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../services/project';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Content } from '../projects/project-model';
import { MatDialog } from '@angular/material/dialog';
import { AddTeamMember } from '../team-setup/add-team-member/add-team-member';
import { GroupFormComponent } from '../groups-component/group-form-component/group-form-component';
import { ProjectTicket } from './incident-form/project-ticket';
import { TicketService } from '../services/ticket-service';

interface IncidentDisplay {
  id: number;
  title: string;
  priority: string;
  status: string;
  assignedToId: string; // Display text
  createdById: string; // Display text
  dueDate: string | null;
  dueOverdue: boolean;
  completed: boolean;
}

@Component({
  selector: 'app-incidents-dashboard',
  standalone: false,
  templateUrl: './incidents-dashboard.html',
  styleUrls: ['./incidents-dashboard.scss'],
})
export class IncidentsDashboard implements OnInit {
  project: any | null = null;
  isLoading = false;
  projectNam: string = '';
  projectDesc: string = '';
  groups: Content[] = [];
  pageNumber = 0;
  pageSize = 10;
  totalElements = 0;
  incidents: IncidentDisplay[] = []; // Dynamic incidents
  incidentsLoading = false;
  incidentsError: string | null = null;
  projectId: any;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(Project);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private incidentService = inject(TicketService);

  constructor() {
     this.projectId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.loadProject();
    this.loadIncidents(); 
  }

  loadProject(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectService.getProjectById(+id).subscribe({
        next: (response) => {
          this.project = response.data;
          this.projectNam = this.project.name || '';
          this.projectDesc = this.project.description || '';
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.showSnack(error.message || 'Error loading project details.');
        }
      });
    }
  }

  loadIncidents(): void {
    if (!this.projectId) return;

    this.incidentsLoading = true;
    this.incidentsError = null;

    this.incidentService.getProjectIncidents(this.projectId, this.pageNumber, this.pageSize).subscribe({
      next: (response) => {
        this.incidents = this.mapApiTicketsToDisplay(response.data.content);
        this.totalElements = response.data.totalElements;
        this.pageNumber = response.data.number;
        this.incidentsLoading = false;
      },
      error: (error) => {
        console.error('Failed to load incidents:', error);
        this.incidentsError = 'Failed to load incidents. Please try again.';
        this.incidents = [];
        this.incidentsLoading = false;
        this.showSnack(this.incidentsError);
      }
    });
  }

  private mapApiTicketsToDisplay(tickets: any[]): IncidentDisplay[] {
    const today = new Date('2025-10-28'); // Current date (hardcoded as per context; make dynamic in prod)
    return tickets.map(ticket => {
      const dueDate = ticket.dueDate ? new Date(ticket.dueDate) : null;
      const dueOverdue = dueDate ? dueDate < today : false;
      const completed = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'; // Adjust based on your statuses

      return {
        id: ticket.id,
        title: ticket.title,
        priority: ticket.priority,
        status: ticket.status,
        assignedToId: ticket.assignedToId ? `User ${ticket.assignedToId}` : 'Not Assigned', // TODO: Fetch real name if needed
        createdById: ticket.createdById ? `User ${ticket.createdById}` : 'Unknown',
        dueDate: ticket.dueDate ? this.formatDate(ticket.dueDate) : 'No due date',
        dueOverdue,
        completed
      };
    });
  }

  // Pagination
  onPageChange(page: number): void {
    this.pageNumber = page;
    this.loadIncidents();
  }

  openAddClientDialog(): void {
    const dialogRef = this.dialog.open(AddTeamMember, {
      width: '600px',
      data: { isClient: true }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProject();
        this.showSnack('Client added successfully');
      }
    });
  }

  openCreateIncidentDialog(): void {
    const dialogRef = this.dialog.open(ProjectTicket, {
      width: '700px',
      maxHeight: '90vh',
      data: { projectId: this.project.id }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.showSnack('Incident created successfully!');
        this.loadIncidents(); // Refresh list
      }
    });
  }

  priorityClass(priority: string): string {
    switch (priority) {
      case 'HIGH':
      case 'Critical':
        return 'bg-red-100 text-red-600';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-600';
      case 'LOW':
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'OPEN': 'bg-blue-100 text-blue-600',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-600',
      'RESOLVED': 'bg-green-100 text-green-600',
      'CLOSED': 'bg-gray-100 text-gray-600'
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  showSnack(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  openGroups() {
    this.router.navigate(['/layout/project-groups', this.projectId])
  }

   openClient() {
    this.router.navigate(['/layout/project-client'])
  }

  get totalPages(): number {
  return Math.ceil(this.totalElements / this.pageSize);
}


}
