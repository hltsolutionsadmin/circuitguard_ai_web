import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private baseUrl = 'https://fanfun.in/api/usermanagement/api';

  constructor(private http: HttpClient) {}
  createUserGroup(payload: { groupName: string; description: string; project: { id: number };}): Observable<any> {
    return this.http.post(`${this.baseUrl}/usergroups`, payload);
  }

    getClientMembers(projectId: number, page: number = 0, size: number = 100): Observable<any> {
      const teamMemDetailsUrl = `https://fanfun.in/api/usermanagement/api/assignments/target/PROJECT/`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${teamMemDetailsUrl}${projectId}?roles=CLIENT_ADMIN&page=${page}&size=${size}`, { params });
  }
  
}
