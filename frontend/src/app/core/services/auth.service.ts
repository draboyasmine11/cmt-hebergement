import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpContext } from '@angular/common/http';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { SKIP_AUTH } from '../interceptors/auth.interceptor';
import { AuthResponse, RoleType } from '../models/cmt.models';
import { environment } from '@/environments/environment';

const TOKEN_KEY = 'cmt_token';
const USER_KEY = 'cmt_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private api = inject(ApiService);
    private http = inject(HttpClient);
    private router = inject(Router);

    private currentUser = signal<AuthResponse | null>(this.loadUser());

    user = computed(() => this.currentUser());
    isAuthenticated = computed(() => !!this.currentUser() && !this.isTokenExpired());
    isAdmin = computed(() => this.hasRole('ADMIN'));
    isGerant = computed(() => this.hasRole('GERANT'));
    isClient = computed(() => this.hasRole('CLIENT'));

    login(email: string, motDePasse: string) {
        return this.http.post<AuthResponse>(
            `${environment.apiUrl}/auth/login`,
            { email, motDePasse },
            { context: new HttpContext().set(SKIP_AUTH, true) }
        ).pipe(
            tap((response) => {
                // Effacer le centre actif mémorisé pour forcer le rechargement depuis le JWT
                localStorage.removeItem('cmt_centre_actif');
                localStorage.setItem(TOKEN_KEY, response.token);
                localStorage.setItem(USER_KEY, JSON.stringify(response));
                this.currentUser.set(response);
            })
        );
    }

    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('cmt_centre_actif');
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return null;
        if (this.isTokenExpired()) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            this.currentUser.set(null);
            return null;
        }
        return token;
    }

    hasRole(role: RoleType): boolean {
        const user = this.currentUser();
        return user?.roles?.includes(role) ?? false;
    }

    hasAnyRole(...roles: RoleType[]): boolean {
        return roles.some((r) => this.hasRole(r));
    }

    isTokenExpired(): boolean {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    }

    private loadUser(): AuthResponse | null {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 < Date.now()) {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                return null;
            }
            return JSON.parse(raw) as AuthResponse;
        } catch {
            return null;
        }
    }
}
