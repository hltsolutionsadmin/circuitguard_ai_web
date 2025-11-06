import { Component, EventEmitter, HostListener, inject, input, Input, Output, SimpleChanges } from '@angular/core';
import { IncidentDisplay } from '../incidents-dashboard';
import { catchError, of, Subject, takeUntil, tap } from 'rxjs';
import { CreateTicketDto, TicketService } from '../../services/ticket-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Auth } from '../../../auth/Services/auth';


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

  // --- new category/subcategory state ---
  categoryOptions = ['Frontend', 'Backend', 'Testing'];
  subcategoryMap: Record<string, string[]> = {
    Frontend: ['UI Developer', 'UX', 'Accessibility', 'CSS / Styling'],
    Backend: ['API Developer', 'Database', 'Integration'],
    Testing: ['Automation', 'Manual', 'Performance'],
  };
  @Output() commentsUpdated = new EventEmitter<number>();
  selectedCategory : any;
  selectedSubcategory : any;
  get currentSubcategories(): string[] {
    return this.subcategoryMap[this.selectedCategory] ?? [];
  }
  // --- end new state ---

  isEditingDescription = false;
  editedDescription = '';
  addComments = '';
  showAssigneeDropdown = false;
  showReporterDropdown = false;

  currentPageSize = 10;
  isLoadingMembers = false;
  hasMoreMembers = false;
  authService = inject(Auth)

  private destroy$ = new Subject<void>();

  private oldStatus: string | null = null;
  private oldPriority: string | null = null;
  private oldDescription: string | null = null;
  private oldAssignedToId: string | null = null;
  private oldAssignedToName: string | null = null;

  ngOnInit(): void {
    // if incident already has category/subcategory (optional), initialize
    if ((this.incident as any)?.category) {
      this.selectedCategory = (this.incident as any).category;
      if ((this.incident as any).subcategory) {
        this.selectedSubcategory = (this.incident as any).subcategory;
      } else {
        this.selectedSubcategory = this.subcategoryMap[this.selectedCategory]?.[0] ?? '';
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['incident'] && this.incident) {
      this.editedDescription = this.incident.description ?? '';
      // optional: if incident has category/subcategory keep it in UI
      if ((this.incident as any)?.category) {
        this.selectedCategory = (this.incident as any).category;
        this.selectedSubcategory = (this.incident as any).subcategory ?? this.subcategoryMap[this.selectedCategory]?.[0];
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.incident-panel')) {
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

  // handlers for category/subcategory changes (UI-only - static for now)
  onCategoryChange(newCat: string) {
    this.selectedCategory = newCat;
    this.selectedSubcategory = this.subcategoryMap[newCat]?.[0] ?? '';
    // optionally persist category on incident (not changing core behavior)
    // this.patch({ category: this.selectedCategory });
  }

  onSubcategoryChange(newSub: string) {
    this.selectedSubcategory = newSub;
    // optionally persist subcategory on incident
    // this.patch({ subcategory: this.selectedSubcategory });
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
  if (this.incident.id && this.addComments?.trim()) {
    this.ticketService.postComment(this.incident.id, this.addComments).subscribe({
      next: () => {
        this.snackBar.open('Comment saved successfully!', 'OK', { duration: 1500 });
        this.addComments = ''; // clear after saving
        this.commentsUpdated.emit(this.incident.id); // emit event to parent
      },
      error: (err) => {
        this.snackBar.open('Failed to save comment', 'Close', { duration: 2000 });
        console.error(err);
      }
    });
  }
}
}
