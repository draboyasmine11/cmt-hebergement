import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Reservation } from '../models/cmt.models';

@Injectable({ providedIn: 'root' })
export class ReservationService {
    private api = inject(ApiService);

    getAll() {
        return this.api.get<Reservation[]>('/reservations');
    }

    getAllSilent() {
        return this.api.silentGet<Reservation[]>('/reservations');
    }

    getMesReservations() {
        return this.api.get<Reservation[]>('/reservations/mes-reservations');
    }

    getByCentre(centreId: number) {
        const id = Number(centreId);
        if (!Number.isInteger(id) || id <= 0) {
            console.error(`[ReservationService] centreId invalide : "${centreId}". L'appel API est annulé.`);
            throw new Error(`centreId invalide : "${centreId}"`);
        }
        return this.api.get<Reservation[]>(`/reservations/centre/${id}`);
    }

    getByCentreSilent(centreId: number) {
        const id = Number(centreId);
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error(`centreId invalide : "${centreId}"`);
        }
        return this.api.silentGet<Reservation[]>(`/reservations/centre/${id}`);
    }

    create(reservation: { dateArrivee: string; dateDepart: string; chambreId: number }) {
        return this.api.post<Reservation>('/reservations', reservation);
    }

    valider(id: number) {
        return this.api.patch<Reservation>(`/reservations/${id}/valider`);
    }

    refuser(id: number, motifRejet: string) {
        return this.api.patch<Reservation>(`/reservations/${id}/refuser`, { motifRejet });
    }

    annuler(id: number) {
        return this.api.patch<Reservation>(`/reservations/${id}/annuler`);
    }
}
