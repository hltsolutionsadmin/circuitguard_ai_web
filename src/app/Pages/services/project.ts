import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { projectGroupResponse, ProjectResponse } from '../projects/project-model';

export interface ProjectModel {
  id?: any,
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  type: string;
  ownerOrganizationId: number | undefined;
  archived: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class Project {
  private apiUrl = '/api/usermanagement/projects';
  private baseUrl = '/api/usermanagement/api/usergroups'

  constructor(
    private http: HttpClient,
  ) {}

  createProject(project: ProjectModel): Observable<Project> {

    return this.http.post<any>(this.apiUrl, project).pipe(
      catchError(this.handleError)
    );
  }

   getProjects(page: number, size: number, organizationId: any): Observable<ProjectResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())

    return this.http.get<ProjectResponse>(`${this.apiUrl}/organization/${organizationId}`, { params }).pipe(
      catchError(this.handleError)
    );
  }

   getProjectById(id: number): Observable<{ message: string, status: string, data: Project }> {
    return this.http.get<{ message: string, status: string, data: Project }>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

    getUserGroups(id: any, page: number = 0, size: number = 10): Observable<any> {
    const url = `${this.baseUrl}/project/${id}?page=${page}&size=${size}`;
    return this.http.get<any>(url);
  } 

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again later.';
    if (error.status === 401) {
      errorMessage = 'Unauthorized. Please log in again.';
    } else if (error.status === 400) {
      errorMessage = 'Invalid request. Please check your input.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }

 
}
