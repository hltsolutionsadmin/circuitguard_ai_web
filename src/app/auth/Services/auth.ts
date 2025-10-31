import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { CommonService } from '../../Common/services/common-service';
import { Router } from '@angular/router';

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

interface LoginResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: number;
  email: string;
  roles: string[];
  primaryContact: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  apiConfig = inject(CommonService)
  router = inject(Router)
  private apiUrl = 'https://fanfun.in/api/usermanagement/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const AuthApiUrl = this.apiConfig.getEndpoint('authEndPoints');
    const body = { username: email, password };
    return this.http
      .post<LoginResponse>(`${AuthApiUrl}login/username`, body)
      .pipe(
        tap((response) => {
          if (response.token && response.refreshToken) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
          }
        }),
        catchError(this.handleError)
      );
  }

  refreshAccessToken(): Observable<any> {
    const AuthApiUrl = this.apiConfig.getEndpoint('authEndPoints');
    const refreshTokenUrl = `${AuthApiUrl}/refreshToken`;
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Refresh token not available.');
    }

    const payload = { refreshToken: refreshToken };
    return this.http.post<any>(refreshTokenUrl, payload);
  }

  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login'])
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  
  private userSubject = new BehaviorSubject<UserDetails | null>(null);
  user$ = this.userSubject.asObservable();


  fetchUserDetails(): Observable<UserDetails> {
   const userDetailsUrl = this.apiConfig.getEndpoint('userEndPoints');
    return this.http.get<UserDetails>(`${userDetailsUrl}userDetails`).pipe(
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
  

    private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again later.';
    if (error.status === 401) {
      errorMessage = 'Invalid email or password.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    }
    return throwError(() => new Error(errorMessage));
  }
}
