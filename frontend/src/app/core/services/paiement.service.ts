import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ModePaiement, Paiement } from '../models/cmt.models';
import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class PaiementService {
    private api = inject(ApiService);
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

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

    telechargerFacture(reservationId: number): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/paiements/facture/${reservationId}`, {
            responseType: 'blob'
        }).pipe(
            catchError((err) => {
                // Décoder le blob d'erreur en texte JSON pour obtenir le vrai message
                const blobErr: Blob = err.error;
                if (blobErr instanceof Blob) {
                    return new Observable<Blob>(obs => {
                        blobErr.text().then(text => {
                            try {
                                const json = JSON.parse(text);
                                obs.error({ error: { message: json.message || json.error || text } });
                            } catch {
                                obs.error({ error: { message: text || 'Erreur lors du téléchargement.' } });
                            }
                        });
                    });
                }
                return throwError(() => err);
            })
        );
    }

    exporterExcel(centreId: number) {
        return this.api.download(`/paiements/excel/${centreId}`);
    }
}
