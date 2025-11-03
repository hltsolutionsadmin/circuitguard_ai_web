import { Component, EventEmitter, inject, input, Input, Output, SimpleChanges } from '@angular/core';
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
  @Input() MembersList:any;

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
  showAssigneeDropdown = false;
  showReporterDropdown = false;

  currentPageSize = 10;
  isLoadingMembers = false;
  hasMoreMembers = false;

  private destroy$ = new Subject<void>();

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

  close(): void {
    this.closed.emit();
  }

  startEditDescription(): void {
    this.editedDescription = this.incident.description ?? '';
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
    debugger
    // if (status === this.incident.status) return;
    this.patch({ status });
  }

  updatePriority(priority: any): void {
    // if (priority === this.incident.priority) return;
    this.patch({ priority });
  }

  updateAssignee(member: any): void {
    const newName = member.fullName;
    const newId = member.userIds?.[0] ?? null;
    // optimistic UI
    this.incident.assignedToName = newName;
    this.incident.assignedToId = newId;
    this.showAssigneeDropdown = false;

    const payload: Partial<CreateTicketDto> = { id: this.incident.id };
    // if (newName !== this.incident.assignedToName) payload.assignedToName = newName;
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

  /** Revert optimistic UI on server error */
  private revert(partial: Partial<CreateTicketDto>): void {
    if ('status' in partial) this.incident.status = this.incident.status;
    if ('priority' in partial) this.incident.priority = this.incident.priority;
    if ('description' in partial) this.incident.description = this.incident.description ?? '';
    if ('assignedToId' in partial || 'assignedToName' in partial) {
      // If you keep previous values, revert them here.
      // For simplicity, you could reload the incident from parent if critical.
    }
  }

  /* --------------------------------------------------------------------- */
  /* UTILITIES                                                             */
  /* --------------------------------------------------------------------- */
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

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.w-2/3.relative')) {
      this.showAssigneeDropdown = false;
      this.showReporterDropdown = false;
    }
  }

  // Pagination (optional)
  loadMoreMembers(): void {
    this.currentPageSize += 10;
    // call your service if needed
  }
}
