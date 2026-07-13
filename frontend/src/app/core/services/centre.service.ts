import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Centre } from '../models/cmt.models';

@Injectable({ providedIn: 'root' })
export class CentreService {
    private api = inject(ApiService);

    getAll(ville?: string) {
        return this.api.get<Centre[]>('/centres', ville ? { ville } : undefined);
    }

    getById(id: number) {
        return this.api.get<Centre>(`/centres/${id}`);
    }

    getProches(latitude: number, longitude: number) {
        return this.api.get<Centre[]>('/centres/proches', { latitude, longitude });
    }

    create(centre: Partial<Centre>) {
        return this.api.post<Centre>('/centres', centre);
    }

    update(id: number, centre: Partial<Centre>) {
        return this.api.put<Centre>(`/centres/${id}`, centre);
    }

    delete(id: number) {
        return this.api.delete<void>(`/centres/${id}`);
    }
}
