import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonService } from '../../Common/services/common-service';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  apiConfig = inject(CommonService)

  constructor(private http: HttpClient) {}
  createUserGroup(payload: { groupName: string; description: string; project: { id: number };}): Observable<any> {
    const createGroupEndPointUrl = this.apiConfig.getEndpoint('createGroupEndPoint');
    return this.http.post(`${createGroupEndPointUrl}/usergroups`, payload);
  }

    getClientMembers(projectId: number, page: number = 0, size: number = 100): Observable<any> {
      const createGroupEndPointUrl = this.apiConfig.getEndpoint('createGroupEndPoint');
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${createGroupEndPointUrl}/assignments/target/PROJECT/${projectId}?roles=CLIENT_ADMIN&page=${page}&size=${size}`, { params });
  }
  
}
