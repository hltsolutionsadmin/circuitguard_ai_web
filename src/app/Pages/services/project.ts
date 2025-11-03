import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { projectGroupResponse, ProjectResponse } from '../projects/project-model';
import { CommonService } from '../../Common/services/common-service';

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
  clientId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class Project {
  private apiUrl = 'https://fanfun.in/api/usermanagement/projects';
  private baseUrl = 'https://fanfun.in/api/usermanagement/api/usergroups'
  apiConfig = inject(CommonService)

  constructor(
    private http: HttpClient,
  ) {}

  createProject(project: ProjectModel): Observable<Project> {
    const projectDetailsUrl = this.apiConfig.getEndpoint('projectsEndPoint');
    return this.http.post<any>(projectDetailsUrl, project).pipe(
      catchError(this.handleError)
    );
  }

   getProjects(page: number, size: number, organizationId: any): Observable<ProjectResponse> {
    const projectDetailsUrl = this.apiConfig.getEndpoint('projectsEndPoint');
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())

    return this.http.get<ProjectResponse>(`${projectDetailsUrl}/organization/${organizationId}`, { params }).pipe(
      catchError(this.handleError)
    );
  }

   getProjectsByStatus(status: string,organisationId: number): Observable<ProjectResponse> {
    const url = `${this.apiUrl}?status=${status}&organisationId=${organisationId}`;
    return this.http.get<ProjectResponse>(url);
  }

   getProjectById(id: number): Observable<{ message: string, status: string, data: any }> {
     const projectDetailsUrl = this.apiConfig.getEndpoint('projectsEndPoint');
    return this.http.get<{ message: string, status: string, data: any }>(`${projectDetailsUrl}/${id}`).pipe(
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
