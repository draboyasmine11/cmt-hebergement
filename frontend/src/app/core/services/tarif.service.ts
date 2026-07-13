import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Tarif, TypeClient } from '../models/cmt.models';

@Injectable({ providedIn: 'root' })
export class TarifService {
    private api = inject(ApiService);

    getByCentre(centreId: number) {
        return this.api.get<Tarif[]>(`/tarifs/centre/${centreId}`);
    }

    getByCentreAndTypeClient(centreId: number, typeClient: TypeClient) {
        return this.api.get<Tarif>(`/tarifs/centre/${centreId}/client/${typeClient}`);
    }

    save(data: { centreId: number; typeClient: TypeClient; prixParNuit: number }) {
        return this.api.post<Tarif>('/tarifs', data);
    }
}
