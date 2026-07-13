import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Chambre } from '../models/cmt.models';

@Injectable({ providedIn: 'root' })
export class ChambreService {
    private api = inject(ApiService);

    getAll() {
        return this.api.get<Chambre[]>('/chambres');
    }

    getByCentre(centreId: number) {
        return this.api.get<Chambre[]>(`/chambres/centre/${centreId}`);
    }

    getDisponibles(centreId: number, arrivee: string, depart: string) {
        return this.api.get<Chambre[]>(`/chambres/disponibles/${centreId}`, { arrivee, depart });
    }

    create(chambre: Partial<Chambre> & { centreId: number }) {
        return this.api.post<Chambre>('/chambres', chambre);
    }

    update(id: number, chambre: Partial<Chambre> & { centreId: number }) {
        return this.api.put<Chambre>(`/chambres/${id}`, chambre);
    }

    delete(id: number) {
        return this.api.delete<void>(`/chambres/${id}`);
    }
}
