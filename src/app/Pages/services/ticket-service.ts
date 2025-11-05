import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CreateTicketDto {
  id?: any;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED' ;
  projectId: number;
  createdById: number;
  dueDate?: string; // ISO string
  archived: boolean;
  assignedToId?: number;
}
    

export interface Ticket {
  id: number;
  ticketId: string | null;
  title: string;
  description: string;
  priority: string;
  status: string;
  projectId: number;
  createdById: number | null;
  assignedToId: number | null;
  resolvedAt: string | null;
  dueDate: string | null;
  archived: boolean;
  comments: any[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface TicketResponse {
  // Define if backend returns data
  id?: number;
  message?: string;
}

export interface GetTicketsResponse {
  message: string;
  status: string;
  data: Page<Ticket>;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly apiUrl = 'https://fanfun.in/api/usermanagement/tickets';
  constructor(private http: HttpClient) {}

  createIncident(payload: CreateTicketDto): Observable<TicketResponse> {
    return this.http.post<TicketResponse>(this.apiUrl, payload);
  }

  getProjectIncidents(projectId: number, page: number = 0, size: number = 10): Observable<GetTicketsResponse> {
    const params = new HttpParams()
      .set('projectId', projectId.toString())
      .set('page', page.toString())
      .set('size', size.toString())

    return this.http.get<GetTicketsResponse>(this.apiUrl, { params });
  }

    getOpenProjectIncidents(projectId: number, page: number = 0, size: number = 10, status?: any): Observable<GetTicketsResponse> {
    const params = new HttpParams()
      .set('projectId', projectId.toString())
      .set('page', page.toString())
      .set('size', size.toString())
      .set('status',status)

    return this.http.get<GetTicketsResponse>(this.apiUrl, { params });
  }

  getTicketsByPriority(projectId: number, priority: string): Observable<any> {
  return this.http.get<any>(`https://fanfun.in/api/usermanagement/tickets?projectId=${projectId}&priority=${priority}`);
}

getTicketsCategory(organizationId: number, page: number = 0, size: number = 10 ): Observable<any> {
  return this.http.get<any>(`https://fanfun.in/api/usermanagement/api/categories/org/${organizationId}?page=${page}&size=${size}`);
}

getTicketsSubCategory(categoryId: number, page: number = 0, size: number = 10 ): Observable<any> {
  return this.http.get<any>(`https://fanfun.in/api/usermanagement/api/subcategories/category/${categoryId}?page=${page}&size=${size}`);
}

postComment(ticketId: number, comment: string): Observable<any> {
  return this.http.post<any>(
    `https://fanfun.in/api/usermanagement/tickets/${ticketId}/comments`,
    { comment }  // backend expects this shape
  );
}
}
