import { Injectable, signal } from '@angular/core';
import { Observable, finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    loading = signal(false);
    private timer: any = null;
    private pendingCount = 0;

    isLoading(): boolean {
        return this.loading();
    }

    show() {
        this.pendingCount++;
        if (!this.timer) {
            this.timer = setTimeout(() => {
                if (this.pendingCount > 0) {
                    this.loading.set(true);
                }
            }, 300);
        }
    }

    hide() {
        this.pendingCount = Math.max(0, this.pendingCount - 1);
        if (this.pendingCount === 0) {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            this.loading.set(false);
        }
    }

    run<T>(obs: Observable<T>): Observable<T> {
        this.show();
        return obs.pipe(finalize(() => this.hide()));
    }
}
