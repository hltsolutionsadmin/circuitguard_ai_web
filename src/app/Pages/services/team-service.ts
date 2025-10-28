import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

export interface Assignment {
  id: number;
  userId: number | null; // Updated to allow null
  userIds: number[]; // Added to match API response
  targetType: string;
  targetId: number;
  role: string;
  roles: string[] | null; // Added for completeness
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

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = '/api/usermanagement/api/assignments';
  private readonly baseUrl = '/api/'

  constructor(private http: HttpClient) {}

  getAssignments(targetType: string, targetId: number, page: number, size: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/target?targetType=${targetType}&targetId=${targetId}&page=${page}&size=${size}`);
  }

  addAssignment(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  updateAssignment(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  deleteAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignToProject(request: AssignProjectRequest): Observable<void> {
      const url = `${this.baseUrl}usermanagement/projects`;
      return this.http.post<void>(url, request).pipe(
        catchError(this.handleError)
      );
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
