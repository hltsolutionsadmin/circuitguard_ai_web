import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = '/api/usermanagement/api/assignments';

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
}
