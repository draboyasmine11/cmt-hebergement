import { RoleType } from '../models/cmt.models';

/** Normalise le champ roles (tableau ou Set sérialisé) renvoyé par l'API. */
export function normalizeRoles(roles: unknown): RoleType[] {
    if (Array.isArray(roles)) {
        return roles as RoleType[];
    }
    if (roles && typeof roles === 'object') {
        return Object.values(roles) as RoleType[];
    }
    return [];
}

export function primaryRole(roles: unknown, fallback?: RoleType): RoleType | undefined {
    return normalizeRoles(roles)[0] ?? fallback;
}
