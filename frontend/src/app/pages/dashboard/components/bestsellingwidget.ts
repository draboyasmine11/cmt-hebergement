import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { StatistiquesService } from '@/app/core/services/statistiques.service';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ChartModule],
    template: `
        @if (auth.isAdmin()) {
            <div class="card mb-0">
                <div class="font-semibold text-xl mb-4">Réservations par mois</div>
                <p-chart type="line" [data]="chartData()" [options]="chartOptions" class="h-72" />
            </div>
        }
    `
})
export class BestSellingWidget implements OnInit {
    auth = inject(AuthService);
    private statistiquesService = inject(StatistiquesService);
    chartData = signal({ labels: [] as string[], datasets: [{ label: 'Réservations', data: [] as number[], borderColor: '#00529B', fill: false, tension: 0.4 }] });
    chartOptions = { maintainAspectRatio: false, plugins: { legend: { display: false } } };

    ngOnInit() {
        if (!this.auth.isAdmin()) return;
        this.statistiquesService.getStatistiques().subscribe((s) => {
            const labels = s.reservationsParMois.map((r) => `${r.mois}/${r.annee}`);
            const data = s.reservationsParMois.map((r) => r.total);
            this.chartData.set({ labels, datasets: [{ label: 'Réservations', data, borderColor: '#00529B', fill: false, tension: 0.4 }] });
        });
    }
}
