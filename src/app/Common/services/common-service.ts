import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, tap } from 'rxjs';

export interface ApiConfig {
  baseUrl: string;
  endpoints: { [key: string]: string };
}

export interface UserDetails {
  id: number;
  fullName: string;
  username: string;
  email: string;
  roles: { name: string; id: number }[];
  primaryContact: string;
  version: number;
  media: any[];
  password: string;
  registered: boolean;
  organization: any;
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  
  private config: ApiConfig | null = null;

  constructor(private http: HttpClient) {}

  async loadConfig(): Promise<void> {
    try {
      const config = await firstValueFrom(this.http.get<ApiConfig>('assets/api-config.json'));
      this.config = config;
    } catch (error) {
      throw new Error('Failed to load API configuration. Please check assets/api-config.json');
    }
  }

  getEndpoint(key: string): string {
    if (!this.config) {
      throw new Error('API config not loaded. Call loadConfig() first.');
    }
    const relativePath = this.config.endpoints[key];
    if (!relativePath) {
      throw new Error(`Endpoint '${key}' not found in API configuration.`);
    }
    return `${this.config.baseUrl}${relativePath}`;
  }

   private userDetailsUrl = '/api/usermanagement/user/userDetails';
  private userSubject = new BehaviorSubject<UserDetails | null>(null);
  user$ = this.userSubject.asObservable();


  fetchUserDetails(): Observable<UserDetails> {
    return this.http.get<UserDetails>(this.userDetailsUrl).pipe(
      tap((user) => {
        this.userSubject.next(user);
      })
    );
  }

  getUser(): UserDetails | null {
    return this.userSubject.value;
  }

  hasRole(roleName: string): boolean {
    const user = this.userSubject.value;
    return !!user?.roles.some((r) => r.name === roleName);
  }

  clearUser() {
    this.userSubject.next(null);
  }
  
}
