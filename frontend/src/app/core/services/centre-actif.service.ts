import { Injectable, signal, inject } from '@angular/core';
import { Centre } from '../models/cmt.models';
import { CentreService } from './centre.service';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'cmt_centre_actif';

@Injectable({ providedIn: 'root' })
export class CentreActifService {
    private centreService = inject(CentreService);
    private auth = inject(AuthService);

    private _centreActif = signal<Centre | null>(this.loadFromStorage());
    private _centres = signal<Centre[]>([]);

    centreActif = this._centreActif.asReadonly();
    centres = this._centres.asReadonly();

    loadCentres() {
        const userCentreId = this.auth.user()?.centreId;
        this.centreService.getAll().subscribe((list) => {
            this._centres.set(list);
            if (userCentreId) {
                // Toujours forcer le centre du gérant connecté, ignorer le localStorage
                const centreDuGerant = list.find(c => c.id === userCentreId);
                if (centreDuGerant) {
                    // Mettre à jour silencieusement sans déclencher l'effect si déjà correct
                    if (this._centreActif()?.id !== userCentreId) {
                        this._centreActif.set(centreDuGerant);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(centreDuGerant));
                    }
                }
                return;
            }
            if (!this._centreActif() && list.length > 0) {
                this.setCentre(list[0]);
            }
        });
    }

    setCentre(centre: Centre) {
        this._centreActif.set(centre);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(centre));
    }

    private loadFromStorage(): Centre | null {
        try {
            // Si l'utilisateur a un centreId dans le JWT, ne pas charger depuis localStorage
            // (sera écrasé lors de loadCentres)
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }
}
