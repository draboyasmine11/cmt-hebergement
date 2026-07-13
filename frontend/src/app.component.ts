import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoadingService } from './app/core/services/loading.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, ProgressSpinnerModule],
    template: `
        @if (loadingService.loading()) {
            <div class="fixed inset-0 bg-black/20 z-[9999] flex items-center justify-center pointer-events-auto">
                <div class="bg-white rounded-2xl p-6 flex items-center gap-3 shadow-xl border border-slate-100">
                    <p-progressSpinner strokeWidth="4" [style]="{width:'36px',height:'36px'}" />
                    <span class="text-sm font-semibold text-slate-600">Chargement...</span>
                </div>
            </div>
        }
        <router-outlet></router-outlet>
    `
})
export class AppComponent {
    loadingService = inject(LoadingService);
}
