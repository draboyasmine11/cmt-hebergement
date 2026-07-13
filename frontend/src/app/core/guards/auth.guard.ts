import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleType } from '../models/cmt.models';

export const authGuard: CanActivateFn = (
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isAuthenticated()) {
        return true;
    }
    // Sauvegarder l'URL demandée pour redirection après connexion
    return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
    });
};

export const roleGuard = (...roles: RoleType[]): CanActivateFn => {
    return (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        const auth = inject(AuthService);
        const router = inject(Router);

        if (!auth.isAuthenticated()) {
            return router.createUrlTree(['/auth/login'], {
                queryParams: { returnUrl: state.url }
            });
        }
        if (auth.hasAnyRole(...roles)) {
            return true;
        }
        return router.createUrlTree(['/dashboard']);
    };
};
