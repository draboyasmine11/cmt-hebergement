import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Subject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Notification } from '../models/cmt.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private api = inject(ApiService);

    private refresh$ = new BehaviorSubject<void>(undefined);
    refreshNeeded$ = this.refresh$.asObservable();

    private reservationChanged$ = new Subject<void>();
    reservationUpdated$ = this.reservationChanged$.asObservable();

    // Signals "page visitée" → badge disparaît immédiatement
    private reservationPageVisited$ = new Subject<void>();
    reservationPageVisited = this.reservationPageVisited$.asObservable();

    private demandesPageVisited$ = new Subject<void>();
    demandesPageVisited = this.demandesPageVisited$.asObservable();

    private notificationsPageVisited$ = new Subject<void>();
    notificationsPageVisited = this.notificationsPageVisited$.asObservable();

    triggerRefresh() { this.refresh$.next(); }
    triggerReservationRefresh() { this.reservationChanged$.next(); }
    markReservationPageVisited() { this.reservationPageVisited$.next(); }
    markDemandesPageVisited() { this.demandesPageVisited$.next(); }
    markNotificationsPageVisited() { this.notificationsPageVisited$.next(); }

    getAll() { return this.api.get<Notification[]>('/notifications'); }
    countNonLues() { return this.api.silentGet<{ count: number }>('/notifications/non-lues/count'); }

    marquerLue(id: number) {
        return this.api.patch<void>(`/notifications/${id}/lue`).pipe(tap(() => this.triggerRefresh()));
    }

    marquerToutesLues() {
        return this.api.patch<void>('/notifications/toutes-lues').pipe(tap(() => this.triggerRefresh()));
    }
}
