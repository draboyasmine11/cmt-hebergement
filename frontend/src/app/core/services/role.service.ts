import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Role, RoleForm } from '../models/cmt.models';

@Injectable({ providedIn: 'root' })
export class RoleService {
    private api = inject(ApiService);

    getAll() {
        return this.api.get<Role[]>('/roles');
    }

    getById(id: number) {
        return this.api.get<Role>(`/roles/${id}`);
    }

    create(role: RoleForm) {
        return this.api.post<Role>('/roles', role);
    }

    update(id: number, role: RoleForm) {
        return this.api.put<Role>(`/roles/${id}`, role);
    }

    delete(id: number) {
        return this.api.delete<void>(`/roles/${id}`);
    }
}
