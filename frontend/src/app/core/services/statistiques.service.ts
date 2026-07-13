import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Statistiques } from '../models/cmt.models';

@Injectable({ providedIn: 'root' })
export class StatistiquesService {
    private api = inject(ApiService);

    getStatistiques() {
        return this.api.get<Statistiques>('/statistiques');
    }
}
