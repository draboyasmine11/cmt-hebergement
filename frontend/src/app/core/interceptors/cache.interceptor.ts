import { HttpInterceptorFn } from '@angular/common/http';

/** Empêche la mise en cache navigateur des réponses API (évite le besoin de Ctrl+Shift+R). */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.method !== 'GET') {
        return next(req);
    }
    const now = Date.now();
    return next(req.clone({
        setHeaders: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
        },
        params: req.params.set('_t', now.toString())
    }));
};
