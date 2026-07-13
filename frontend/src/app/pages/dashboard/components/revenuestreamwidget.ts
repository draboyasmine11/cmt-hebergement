import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { StatistiquesService } from '@/app/core/services/statistiques.service';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [CommonModule, ChartModule],
    template: `
        @if (auth.isAdmin()) {
            <div class="card mb-0">
                <div class="font-semibold text-xl mb-4">Revenus mensuels</div>
                <p-chart type="bar" [data]="chartData()" [options]="chartOptions" class="h-80" />
            </div>
        }
    `
})
export class RevenueStreamWidget implements OnInit {
    auth = inject(AuthService);
    private statistiquesService = inject(StatistiquesService);
    chartData = signal({ labels: [] as string[], datasets: [{ label: 'FCFA', data: [] as number[], backgroundColor: '#00529B' }] });
    chartOptions = { maintainAspectRatio: false, plugins: { legend: { display: false } } };

    ngOnInit() {
        if (!this.auth.isAdmin()) return;
        this.statistiquesService.getStatistiques().subscribe((s) => {
            const labels = s.revenusMensuels.map((r) => `${r.mois}/${r.annee}`);
            const data = s.revenusMensuels.map((r) => Number(r.montant));
            this.chartData.set({ labels, datasets: [{ label: 'FCFA', data, backgroundColor: '#00529B' }] });
        });
    }
}
