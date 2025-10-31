import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { CommonService } from '../../Common/services/common-service';

export interface Assignment {
  id: number;
  userId: number | null; // Updated to allow null
  userIds: number[]; // Added to match API response
  targetType: string;
  targetId: number;
  roles: string[] | null; 
  groupIds: number[] | null; // Added for completeness
  active: boolean;
  username: string | null;
  fullName: string | null;
  primaryContact: string | null;
  password: string | null;
  email: string | null;
}

export interface AssignProjectRequest {
  userIds: number[];
  targetType: string;
  roles : string[];
  targetId: number;
  groupIds: number[];
  active: boolean;
}

export interface GetAssignmentsResponse {
  message: string;
  status: string;
  data: {
    content: Assignment[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: Array<{
        direction: string;
        property: string;
        ignoreCase: boolean;
        nullHandling: string;
        ascending: boolean;
        descending: boolean;
      }>;
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: Array<{
      direction: string;
      property: string;
      ignoreCase: boolean;
      nullHandling: string;
      ascending: boolean;
      descending: boolean;
    }>;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
}

export interface User {
  id: number;
  fullName: string;
  username: string;
  primaryContact: string;
  recentActivityDate: string;
  roles: string[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiResponse {
  message: string;
  status: string;
  data: Page<User>;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  apiConfig = inject(CommonService)
  private apiUrl = 'https://fanfun.in/api/usermanagement/api/assignments';
  private readonly baseUrl = 'https://fanfun.in/api/'
  private readonly baseUrls = 'https://fanfun.in/api/usermanagement/api/assignments';

  constructor(private http: HttpClient) {}

  getAssignments(targetType: string, targetId: number, page: number, size: number): Observable<any> {
     const teamMemDetailsUrl = this.apiConfig.getEndpoint('teamMemberEndPoint');
    return this.http.get(`${teamMemDetailsUrl}/target?targetType=${targetType}&targetId=${targetId}&page=${page}&size=${size}&includeClientDetails=false`);
  }

  getProjectAssignmentsByRole( ORGANIZATION: number, role: string, page: number, size: number ): Observable<any> {
    const params = new HttpParams()
      .set('roles', role)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any> (
      `${this.apiUrl}/target/ORGANIZATION/${ORGANIZATION}`,
      { params }
    );
  }

  addAssignment(payload: any): Observable<any> {
    const teamMemDetailsUrl = this.apiConfig.getEndpoint('teamMemberEndPoint');
    return this.http.post(teamMemDetailsUrl, payload);
  }

    addClientAssignment(payload: any): Observable<any> {
    const url = 'https://fanfun.in/api/usermanagement/api/assignments/project/client';
    return this.http.post(url, payload);
  }

  updateAssignment(id: number, payload: any): Observable<any> {
    const teamMemDetailsUrl = this.apiConfig.getEndpoint('teamMemberEndPoint');
    return this.http.put(`${teamMemDetailsUrl}/${id}`, payload);
  }

  deleteAssignment(id: number): Observable<void> {
    const teamMemDetailsUrl = this.apiConfig.getEndpoint('teamMemberEndPoint');
    return this.http.delete<void>(`${teamMemDetailsUrl}/${id}`);
  }

  assignToProject(request: AssignProjectRequest): Observable<void> {
    const teamMemDetailsUrl = this.apiConfig.getEndpoint('teamMemberEndPoint');
      const url = `${teamMemDetailsUrl}`;
      return this.http.post<void>(url, request).pipe(
        catchError(this.handleError)
      );
    }

    createUserGroup(payload: { groupName: string; description: string; project: { id: number };}): Observable<any> {
      const groupDetailsUrl = this.apiConfig.getEndpoint('createGroupEndPoint');
    return this.http.post(`${groupDetailsUrl}/usergroups`, payload);
  }

      getUserGroups(id: any, page: number = 0, size: number = 10): Observable<any> {
         const groupDetailsUrl = this.apiConfig.getEndpoint('createGroupEndPoint');
    const url = `${groupDetailsUrl}/usergroups/project/${id}?page=${page}&size=${size}`;
    return this.http.get<any>(url);
  } 

    getGroupMembers(groupId: number, page: number = 0, size: number = 10): Observable<ApiResponse> {
      const teamMemDetailsUrl = this.apiConfig.getEndpoint('teamMemberEndPoint');
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse>(`${teamMemDetailsUrl}/${groupId}/users`, { params });
  }

    private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

}
