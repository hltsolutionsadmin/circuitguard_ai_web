import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';

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
  private apiUrl = '/api/usermanagement/auth/login/username';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const body = { username: email, password };
    return this.http
      .post<LoginResponse>(this.apiUrl, body, {
        headers: { 'Content-Type': 'application/json' },
      })
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

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again later.';
    if (error.status === 401) {
      errorMessage = 'Invalid email or password.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    }
    return throwError(() => new Error(errorMessage));
  }

  refreshAccessToken(): Observable<any> {
    const refreshTokenUrl = '/api/usermanagement/auth/refreshToken';
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
}
