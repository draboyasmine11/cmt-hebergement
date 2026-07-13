import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { SignalementService, Signalement } from '@/app/core/services/signalement.service';

@Component({
    selector: 'app-signalements',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule, InputTextModule, TooltipModule],
    template: `
        <p-toast />
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-xl font-semibold">Signalements</h2>
                    <p class="text-sm text-muted-color">Problèmes signalés par les utilisateurs</p>
                </div>
                <p-button label="Actualiser" icon="pi pi-refresh" severity="secondary" (onClick)="charger()" pTooltip="Actualiser la liste des signalements" tooltipPosition="left" />
            </div>

            <p-table [value]="filteredSignalements()" [paginator]="true" [rows]="10" dataKey="id" styleClass="p-datatable-striped">
                <ng-template #caption>
                    <div class="flex items-center justify-between gap-3">
                        <input pInputText type="text" placeholder="Rechercher..." class="w-full max-w-xs"
                            [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
                        <p-tag [value]="nouveaux() + ' nouveau(x)'" severity="warn" [hidden]="nouveaux() === 0" />
                    </div>
                </ng-template>
                <ng-template #header>
                    <tr>
                        <th>Date</th>
                        <th>Sujet</th>
                        <th>Description</th>
                        <th>Utilisateur</th>
                        <th>Contact</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-s>
                    <tr>
                        <td class="whitespace-nowrap">{{ s.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                        <td class="font-medium">{{ s.sujet }}</td>
                        <td class="max-w-xs truncate text-sm text-slate-500" [title]="s.description">{{ s.description }}</td>
                        <td>{{ s.utilisateurNom || 'Anonyme' }}</td>
                        <td class="text-sm">
                            @if (s.emailContact) {
                                <a [href]="'mailto:' + s.emailContact" class="text-primary hover:underline block text-xs">{{ s.emailContact }}</a>
                            }
                            @if (s.telephoneContact) {
                                <span class="text-xs text-slate-500">{{ s.telephoneContact }}</span>
                            }
                        </td>
                        <td>
                            <p-tag [value]="statutLabel(s.statut)" [severity]="statutSeverity(s.statut)" />
                        </td>
                        <td>
                            @if (s.statut === 'EN_ATTENTE') {
                                <p-button label="Traiter" icon="pi pi-check" size="small" (onClick)="traiter(s)" pTooltip="Marquer ce signalement comme traité" tooltipPosition="top" />
                            } @else {
                                <span class="text-xs text-slate-400 italic">Traité</span>
                            }
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr><td colspan="7" class="text-center py-8 text-slate-400">Aucun signalement</td></tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class Signalements implements OnInit {
    private signalementService = inject(SignalementService);
    private messageService = inject(MessageService);

    signalements = signal<Signalement[]>([]);
    searchQuery = signal('');

    filteredSignalements = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return this.signalements();
        return this.signalements().filter(s =>
            (s.sujet || '').toLowerCase().includes(q) ||
            (s.utilisateurNom || '').toLowerCase().includes(q) ||
            (s.emailContact || '').toLowerCase().includes(q) ||
            (s.statut || '').toLowerCase().includes(q)
        );
    });

    nouveaux = () => this.signalements().filter(s => s.statut === 'EN_ATTENTE').length;

    ngOnInit() {
        this.charger();
    }

    charger() {
        this.signalementService.getAll().subscribe(s => this.signalements.set(s));
    }

    traiter(s: Signalement) {
        this.signalementService.traiter(s.id).subscribe({
            next: () => {
                this.charger();
                this.messageService.add({ severity: 'success', summary: 'Signalement traité', detail: 'Le signalement a été marqué comme traité.' });
            },
            error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message })
        });
    }

    statutLabel(s: string): string {
        return s === 'EN_ATTENTE' ? 'En attente' : 'Traité';
    }

    statutSeverity(s: string): 'warn' | 'success' {
        return s === 'EN_ATTENTE' ? 'warn' : 'success';
    }
}
