import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
        let httpParams = new HttpParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    httpParams = httpParams.set(key, String(value));
                }
            });
        }
        return this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams });
    }

    /** Appel GET silencieux : n'affiche pas le spinner de chargement */
    silentGet<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
        let httpParams = new HttpParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    httpParams = httpParams.set(key, String(value));
                }
            });
        }
        return this.http.get<T>(`${this.baseUrl}${path}`, {
            params: httpParams,
            context: new HttpContext().set(SKIP_LOADING, true)
        });
    }

    post<T>(path: string, body: unknown): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}${path}`, body);
    }

    put<T>(path: string, body: unknown): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}${path}`, body);
    }

    patch<T>(path: string, body?: unknown): Observable<T> {
        return this.http.patch<T>(`${this.baseUrl}${path}`, body ?? {});
    }

    delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}${path}`);
    }

    download(path: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}${path}`, { responseType: 'blob' });
    }
}
