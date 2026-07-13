import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface Signalement {
    id: number;
    sujet: string;
    description: string;
    statut: string;
    emailContact?: string;
    telephoneContact?: string;
    utilisateurId?: number;
    utilisateurNom?: string;
    createdAt: string;
    traiteAt?: string;
}

@Injectable({ providedIn: 'root' })
export class SignalementService {
    private api = inject(ApiService);

    creer(data: { sujet: string; description: string }) {
        return this.api.post<Signalement>('/signalements', data);
    }

    getMine() {
        return this.api.get<Signalement[]>('/signalements/mes-signalements');
    }

    getAll() {
        return this.api.get<Signalement[]>('/signalements');
    }

    traiter(id: number) {
        return this.api.patch<Signalement>(`/signalements/${id}/traiter`);
    }
}
