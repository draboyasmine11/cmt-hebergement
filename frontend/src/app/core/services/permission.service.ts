import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Permission } from '../models/cmt.models';

@Injectable({ providedIn: 'root' })
export class PermissionService {
    private api = inject(ApiService);

    getAll() {
        return this.api.get<Permission[]>('/permissions');
    }

    getById(id: number) {
        return this.api.get<Permission>(`/permissions/${id}`);
    }
}
