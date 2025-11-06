import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../services/project';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Content } from '../projects/project-model';
import { TicketService } from '../services/ticket-service';
import { Subject, takeUntil } from 'rxjs';
import { Auth } from '../../auth/Services/auth';

export interface IncidentDisplay {
  id: number;
  ticketId?: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedToId: string | null;
  assignedToName: string | null;
  createdById: string | null;
  createdByName: string | null;
  dueDate: string | null;
  dueOverdue: boolean;
  completed: boolean;
  categoryName?: string;
  subCategoryName?: string;
  comments: any;
}
export interface ProjectMembers {
  userIds: number[]
  targetType: string
  roles: string[]
  targetId: number
  groupIds: number[]
  active: boolean
  username: string
  fullName: string
  primaryContact: string
  password: any
  email: any
}

type PriorityFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

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
  incidents: IncidentDisplay[] = [];
  incidentsLoading = false;
  incidentsError: string | null = null;
  projectId: any;

  selectedPriority: PriorityFilter = 'ALL';
  private destroy$ = new Subject<void>();

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(Project);
  private snackBar = inject(MatSnackBar);
  private incidentService = inject(TicketService);
  authService = inject(Auth)

  constructor() {
     this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id'); // or whatever your route param name is
        if (id) {
          this.projectId = id;
          this.loadAllIncidents();
        }
      });
  }
   ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  detailFullPageOpen = false;
  selectedIncident: IncidentDisplay | null = null;
  projectAssignedMembers: any;

  ngOnInit(): void {
    this.loadProject();
    this.loadIncidents(); // Defaults to ALL
  }

  loadIncidents(priority?: PriorityFilter): void {
    if (!this.projectId) return;

    this.incidentsLoading = true;
    this.incidentsError = null;

    const targetPriority = priority ?? this.selectedPriority;

    if (targetPriority === 'ALL') {
      this.loadAllIncidents();
    } else if (!this.authService.devloper) {
      this.loadFilteredIncidents(targetPriority);
    }
  }

  private loadAllIncidents(): void {
    if(this.authService.isBusinessAdmin || this.authService.isClientAdmin) {
       this.incidentService
      .getProjectIncidents(this.projectId, this.pageNumber, this.pageSize)
      .subscribe({
        next: (response) => {
          this.incidents = this.mapApiTicketsToDisplay(response.data.content);
          this.totalElements = response.data.totalElements;
          this.pageNumber = response.data.number;
          this.incidentsLoading = false;
        },
        error: (error) => {
          this.incidentsLoading = false;
          this.handleLoadError('Failed to load incidents. Please try again.');
        },
      });
    } else if (this.authService.devloper) {
      this.incidentService.getUserIncidents(this.projectId).subscribe({
        next: (response) => {
          this.incidents = this.mapApiTicketsToDisplay(response.data.content);
          this.totalElements = response.data.totalElements;
          this.pageNumber = response.data.number;
          this.incidentsLoading = false;
        },
        error: (error) => {
          this.incidentsLoading = false;
          this.handleLoadError('Failed to load incidents. Please try again.');
        }
      });
    }
  }

  private loadFilteredIncidents(priority: Exclude<PriorityFilter, 'ALL'>): void {
    this.incidentService
      .getTicketsByPriority(this.projectId, priority)
      .subscribe({
        next: (response) => {
          const content = response.data.content || [];
          this.incidents = this.mapApiTicketsToDisplay(content);
          this.totalElements = response.data.totalElements || content.length;
          this.pageNumber = 0; // Reset to first page on filter
          this.incidentsLoading = false;
        },
        error: (error) => {
          this.handleLoadError('Failed to load filtered incidents. Please try again.');
        },
      });
  }

  private handleLoadError(message: string): void {
    console.error(message);
    this.incidentsError = message;
    this.incidents = [];
    this.incidentsLoading = false;
    this.showSnack(this.incidentsError);
  }

  // Filter button click handlers
  setPriorityFilter(filter: PriorityFilter): void {
    if (this.selectedPriority === filter) return;

    this.selectedPriority = filter;
    this.pageNumber = 0; // Reset pagination
    this.loadIncidents(filter);
  }

  // Pagination
  onPageChange(page: number): void {
    if (page < 0 || (this.totalPages > 0 && page >= this.totalPages)) return;

    this.pageNumber = page;
    this.loadIncidents(); // Respects current filter
  }

 openIncidentDetailsFullPage(incident: IncidentDisplay): void {
    this.selectedIncident = incident;
    this.detailFullPageOpen = true;
    // No sidenav calls
  }

  closeIncidentDetails(): void {
    this.detailFullPageOpen = false;
    setTimeout(() => {
      this.selectedIncident = null;
      // No sidenav calls
    }, 100);  // Reduced timeout (no animation needed)
  }

  loadProject(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectService.getProjectById(+id).subscribe({
        next: (response) => {
          this.project = response.data;
          this.projectAssignedMembers = response.data.projectMembers;
          this.projectNam = this.project.name || '';
          this.projectDesc = this.project.description || '';
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.showSnack(error.message || 'Error loading project details.');
        },
      });
    }
  }

  private mapApiTicketsToDisplay(tickets: any[]): IncidentDisplay[] {
    const today = new Date();
    return tickets.map((ticket) => {
      const dueDate = ticket.dueDate ? new Date(ticket.dueDate) : null;
      const dueOverdue = dueDate ? dueDate < today && !['RESOLVED', 'CLOSED'].includes(ticket.status) : false;
      const completed = ['RESOLVED', 'CLOSED'].includes(ticket.status);

      return {
        id: ticket.id,
        ticketId: ticket.ticketId,
        title: ticket.title,
        categoryName: ticket.categoryName,
        subCategoryName: ticket.subCategoryName,
        description: ticket.description || 'No description',
        priority: ticket.priority,
        status: ticket.status,
        comments: ticket.comments,
        assignedToId: ticket.assignedToId ? `User ${ticket.assignedToId}` : 'Not Assigned',
        assignedToName: ticket.assignedToName || (ticket.assignedToId ? `User ${ticket.assignedToId}` : 'Not Assigned'),
        createdById: ticket.createdById ? `User ${ticket.createdById}` : 'Unknown',
        createdByName: ticket.createdByName || (ticket.createdById ? `User ${ticket.createdById}` : 'Unknown'),
        dueDate: ticket.dueDate ? this.formatDate(ticket.dueDate) : 'No due date',
        dueOverdue,
        completed,
      };
    });
  }

refreshIncident(incidentId: number) {
  if (!this.projectId) return;

  this.incidentsLoading = true;

  this.incidentService.getProjectIncidents(this.projectId, this.pageNumber, this.pageSize).subscribe({
    next: (res) => {
      // map API response
      this.incidents = this.mapApiTicketsToDisplay(res.data.content);
      this.totalElements = res.data.totalElements;
      this.pageNumber = res.data.number;

      // update selectedIncident reference
      if (this.selectedIncident?.id === incidentId) {
        const updatedIncident = this.incidents.find(i => i.id === incidentId);
        if (updatedIncident) {
          this.selectedIncident = updatedIncident;
        }
      }

      this.incidentsLoading = false;
    },
    error: (err) => {
      this.showSnack('Failed to refresh incidents.');
      this.incidentsLoading = false;
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
      OPEN: 'bg-blue-100 text-blue-600',
      ASSIGNED: 'bg-blue-100 text-blue-600',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-600',
      RESOLVED: 'bg-green-100 text-green-600',
      CLOSED: 'bg-gray-100 text-gray-600',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  showSnack(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  private formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  openGroups() {
    this.router.navigate([`/layout/project-groups/${this.projectId}`]);
  }

  openClient() {
    this.router.navigate(['/layout/project-client', this.projectId]);
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  backToProj() {
    this.router.navigate(['/layout/project'])
  }
}
