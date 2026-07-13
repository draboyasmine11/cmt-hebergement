import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { ApiService } from './api.service';
import { SKIP_AUTH } from '../interceptors/auth.interceptor';
import { DemandeInscription, InscriptionAgentRequest, InscriptionRetraiteRequest, InscriptionExterneRequest } from '../models/cmt.models';
import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class InscriptionService {
    private api = inject(ApiService);
    private http = inject(HttpClient);

    uploadFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ filename: string }>(
            `${environment.apiUrl}/upload`,
            formData,
            { context: new HttpContext().set(SKIP_AUTH, true) }
        );
    }

    inscrireAgent(data: InscriptionAgentRequest) {
        return this.http.post<any>(`${environment.apiUrl}/inscription/agent`, data, { context: new HttpContext().set(SKIP_AUTH, true) });
    }

    inscrireRetraite(data: InscriptionRetraiteRequest) {
        return this.http.post<any>(`${environment.apiUrl}/inscription/retraite`, data, { context: new HttpContext().set(SKIP_AUTH, true) });
    }

    inscrireExterne(data: InscriptionExterneRequest) {
        return this.http.post<any>(`${environment.apiUrl}/inscription/externe`, data, { context: new HttpContext().set(SKIP_AUTH, true) });
    }

    getDemandes() {
        return this.api.get<DemandeInscription[]>('/inscriptions/demandes');
    }

    getDemandesSilent() {
        return this.api.silentGet<DemandeInscription[]>('/inscriptions/demandes');
    }

    consulterDossier(id: number) {
        return this.api.get<DemandeInscription>(`/inscriptions/demandes/${id}`);
    }

    approuver(id: number) {
        return this.api.post<DemandeInscription>(`/inscriptions/demandes/${id}/approuver`, {});
    }

    rejeter(id: number, motif: string) {
        return this.api.post<DemandeInscription>(`/inscriptions/demandes/${id}/rejeter`, { utilisateurId: id, action: 'REJETER', motif });
    }

}
