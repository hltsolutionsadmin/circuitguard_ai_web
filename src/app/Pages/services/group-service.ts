import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private baseUrl = '/api/usermanagement/api';

  constructor(private http: HttpClient) {}
  createUserGroup(payload: {
    groupName: string;
    description: string;
    project: { id: number };
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/usergroups`, payload);
  }

  
}
