import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../Common/services/common-service';

export interface CreateTicketDto {
  id?: any;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED' ;
  projectId: number;
  createdById: number;
  dueDate?: string; 
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
  apiConfig = inject(CommonService)
  constructor(private http: HttpClient) {}

  createIncident(payload: CreateTicketDto): Observable<TicketResponse> {
    const ticketsEndPointUrl = this.apiConfig.getEndpoint('ticketsEndPoint');
    return this.http.post<TicketResponse>(ticketsEndPointUrl, payload);
  }

  getProjectIncidents(projectId: number, page: number = 0, size: number = 10): Observable<GetTicketsResponse> {
    const ticketsEndPointUrl = this.apiConfig.getEndpoint('ticketsEndPoint');
    const params = new HttpParams()
      .set('projectId', projectId.toString())
      .set('page', page.toString())
      .set('size', size.toString())

    return this.http.get<GetTicketsResponse>(ticketsEndPointUrl, { params });
  }

   getUserIncidents(projectId: number): Observable<GetTicketsResponse> {
    const ticketsEndPointUrl = this.apiConfig.getEndpoint('ticketsEndPoint');
    const params = new HttpParams()
      .set('projectId', projectId.toString())

    return this.http.get<GetTicketsResponse>(`${ticketsEndPointUrl}/by-user`, { params });
  }


    getOpenProjectIncidents(projectId: number, page: number = 0, size: number = 10, status?: any): Observable<GetTicketsResponse> {
      const ticketsEndPointUrl = this.apiConfig.getEndpoint('ticketsEndPoint');
    const params = new HttpParams()
      .set('projectId', projectId.toString())
      .set('page', page.toString())
      .set('size', size.toString())
      .set('status',status)

    return this.http.get<GetTicketsResponse>(ticketsEndPointUrl, { params });
  }

  getTicketsByPriority(projectId: number, priority: string): Observable<any> {
    const ticketsEndPointUrl = this.apiConfig.getEndpoint('ticketsEndPoint');
  return this.http.get<any>(`${ticketsEndPointUrl}?projectId=${projectId}&priority=${priority}`);
}

getTicketsCategory(projectId: number ): Observable<any> {
  const createGroupEndPointUrl = this.apiConfig.getEndpoint('createGroupEndPoint');
  return this.http.get<any>(`${createGroupEndPointUrl}/categories/project/${projectId}`);
}

getTicketsSubCategory(categoryId: number, page: number = 0, size: number = 10 ): Observable<any> {
  const createGroupEndPointUrl = this.apiConfig.getEndpoint('createGroupEndPoint');
  return this.http.get<any>(`${createGroupEndPointUrl}/subcategories/category/${categoryId}?page=${page}&size=${size}`);
}

postComment(ticketId: number, comment: string): Observable<any> {
  const ticketsEndPointUrl = this.apiConfig.getEndpoint('ticketsEndPoint');
  return this.http.post<any>(`${ticketsEndPointUrl}/${ticketId}/comments`,
    { comment } 
  );
}
}
