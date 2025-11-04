import { Component, EventEmitter, HostListener, inject, input, Input, Output, SimpleChanges } from '@angular/core';
import { IncidentDisplay, ProjectMembers } from '../incidents-dashboard';
import { catchError, of, Subject, takeUntil, tap } from 'rxjs';
import { TeamService } from '../../services/team-service';
import { CreateTicketDto, TicketService } from '../../services/ticket-service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-incident-detail-panel-component',
  standalone: false,
  templateUrl: './incident-detail-panel-component.html',
  styleUrl: './incident-detail-panel-component.scss'
})
export class IncidentDetailPanelComponent {
 @Input() incident!: IncidentDisplay;
  @Input() MembersList: any;

  @Output() closed = new EventEmitter<void>();

  private ticketService = inject(TicketService);
  private snackBar = inject(MatSnackBar);

  statusOptions = [
    'OPEN',
    'NEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
    'REOPENED',
  ];
  priorityOptions = ['HIGH', 'MEDIUM', 'LOW'];

  isEditingDescription = false;
  editedDescription = '';
  addComments = '';
  showAssigneeDropdown = false;
  showReporterDropdown = false;

  currentPageSize = 10;
  isLoadingMembers = false;
  hasMoreMembers = false;

  private destroy$ = new Subject<void>();

  private oldStatus: string | null = null;
  private oldPriority: string | null = null;
  private oldDescription: string | null = null;
  private oldAssignedToId: string | null = null;
  private oldAssignedToName: string | null = null;

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['incident'] && this.incident) {
      this.editedDescription = this.incident.description ?? '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.w-2/3.relative')) {
      this.showAssigneeDropdown = false;
      this.showReporterDropdown = false;
    }
  }

  startEditDescription(): void {
    this.oldDescription = this.incident.description ?? '';
    this.editedDescription = this.oldDescription;
    this.isEditingDescription = true;
    setTimeout(() => {
      const el = document.querySelector('.description-textarea') as HTMLTextAreaElement;
      el?.focus();
      el?.select();
    });
  }

  saveDescription(): void {
    const newDesc = this.editedDescription.trim();
    if (newDesc === (this.incident.description ?? '')) {
      this.isEditingDescription = false;
      return;
    }

    this.patch({ description: newDesc });
    this.isEditingDescription = false;
  }

  cancelDescriptionEdit(): void {
    this.isEditingDescription = false;
  }

  toggleAssigneeDropdown(event: Event): void {
    event.stopPropagation();
    this.showAssigneeDropdown = !this.showAssigneeDropdown;
    this.showReporterDropdown = false;
  }

  updateStatus(status: any): void {
    this.oldStatus = this.incident.status;
    this.patch({ status });
  }

  updatePriority(priority: any): void {
    this.oldPriority = this.incident.priority;
    this.patch({ priority });
  }

  updateAssignee(member: any): void {
    this.oldAssignedToId = this.incident.assignedToId;
    this.oldAssignedToName = this.incident.assignedToName;

    const newName = member.fullName;
    const newId = member.userIds?.[0] ?? null;
    // optimistic UI
    this.incident.assignedToName = newName;
    this.incident.assignedToId = newId;
    this.showAssigneeDropdown = false;

    const payload: Partial<CreateTicketDto> = { id: this.incident.id };
    payload.assignedToId = newId;

    this.patch(payload);
  }

  private patch(partial: Partial<any>): void {
    const payload: any = { id: this.incident.id, ...partial };

    // optimistic update already applied
    this.ticketService
      .createIncident(payload)
      .pipe(
        tap(() => {
          this.snackBar.open('Ticket Details Updated', 'OK', { duration: 2000 });
        }),
        catchError((err) => {
          this.snackBar.open(
            err?.error?.message ?? 'Update failed',
            'Dismiss',
            { duration: 4000, panelClass: ['snackbar-error'] }
          );
          this.revert(partial);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private revert(partial: Partial<CreateTicketDto>): void {
    if ('status' in partial && this.oldStatus !== null) this.incident.status = this.oldStatus;
    if ('priority' in partial && this.oldPriority !== null) this.incident.priority = this.oldPriority;
    if ('description' in partial && this.oldDescription !== null) this.incident.description = this.oldDescription;
    if ('assignedToId' in partial) {
      this.incident.assignedToId = this.oldAssignedToId;
      this.incident.assignedToName = this.oldAssignedToName;
    }
  }

  formatDueDate(iso: string | null): string {
    if (!iso) return 'No due date';
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getInitials(name: string | null): string {
    if (!name) return 'NA';
    const words = name.trim().split(' ');
    return words.length > 1
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'LOW':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-700',
      NEW: 'bg-purple-100 text-purple-700',
      ASSIGNED: 'bg-indigo-100 text-indigo-700',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
      RESOLVED: 'bg-green-100 text-green-700',
      CLOSED: 'bg-gray-100 text-gray-700',
      REOPENED: 'bg-orange-100 text-orange-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }

  loadMoreMembers(): void {
    this.currentPageSize += 10;
  }

  postComments() {
    
  }
}
