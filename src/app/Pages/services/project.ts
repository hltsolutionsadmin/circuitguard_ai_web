import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Auth } from '../../auth/Services/auth';
import { ProjectResponse } from '../projects/project-model';

export interface ProjectModel {
  id?: any,
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  targetEndDate: string;
  dueDate: string;
  status: string;
  type: string;
  ownerOrganizationId: number;
  clientOrganizationId: number;
  progressPercentage: number;
  expectedTeamSize: string;
  archived: boolean;
  clientId: number;
  projectManagerId: number;
}

@Injectable({
  providedIn: 'root'
})
export class Project {
  private apiUrl = '/api/usermanagement/projects';

  constructor(
    private http: HttpClient,
  ) {}

  createProject(project: ProjectModel): Observable<Project> {

    return this.http.post<any>(this.apiUrl, project).pipe(
      catchError(this.handleError)
    );
  }

   getProjects(page: number, size: number, clientId: number, managerId: number, status: string): Observable<ProjectResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('clientId', clientId.toString())
      .set('managerId', managerId.toString())
      .set('status', status);

    return this.http.get<ProjectResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

   getProjectById(id: number): Observable<{ message: string, status: string, data: Project }> {
    return this.http.get<{ message: string, status: string, data: Project }>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
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
