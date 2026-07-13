import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ModePaiement, Paiement } from '../models/cmt.models';

@Injectable({ providedIn: 'root' })
export class PaiementService {
    private api = inject(ApiService);

    getAll() {
        return this.api.get<Paiement[]>('/paiements');
    }

    getMesPaiements() {
        return this.api.get<Paiement[]>('/paiements/mes-paiements');
    }

    getByCentre(centreId: number) {
        return this.api.get<Paiement[]>(`/paiements/centre/${centreId}`);
    }

    enregistrer(data: { montant: number; modePaiement: ModePaiement; reference?: string; reservationId: number; dateSortieReelle?: string }) {
        return this.api.post<Paiement>('/paiements', data);
    }

    telechargerFacture(reservationId: number) {
        return this.api.download(`/paiements/facture/${reservationId}`);
    }
}
