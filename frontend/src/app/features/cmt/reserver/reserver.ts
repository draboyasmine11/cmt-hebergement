import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { CentreService } from '@/app/core/services/centre.service';
import { ChambreService } from '@/app/core/services/chambre.service';
import { ReservationService } from '@/app/core/services/reservation.service';
import { TarifService } from '@/app/core/services/tarif.service';
import { AuthService } from '@/app/core/services/auth.service';
import { Centre, Chambre, Tarif } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-reserver',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, SelectModule, DatePickerModule, ToastModule, TooltipModule],
    template: `
        <p-toast />
        <div class="grid grid-cols-12 gap-6">
            <!-- Panneau de recherche -->
            <div class="col-span-12 lg:col-span-4">
                <div class="card">
                    <h2 class="text-xl font-semibold mb-4">Nouvelle réservation</h2>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block mb-2 font-medium">Centre</label>
                            <p-select
                                [options]="centres()"
                                [ngModel]="centreId()"
                                (ngModelChange)="onCentreChange($event)"
                                optionLabel="nom"
                                optionValue="id"
                                placeholder="Choisir un centre"
                                class="w-full" />
                        </div>
                        <div>
                            <label class="block mb-2 font-medium">Date d'arrivée</label>
                            <p-datepicker
                                [(ngModel)]="dateArrivee"
                                dateFormat="yy-mm-dd"
                                [showIcon]="true"
                                class="w-full"
                                [minDate]="today" />
                        </div>
                        <div>
                            <label class="block mb-2 font-medium">Date de départ</label>
                            <p-datepicker
                                [(ngModel)]="dateDepart"
                                dateFormat="yy-mm-dd"
                                [showIcon]="true"
                                class="w-full"
                                [minDate]="dateArrivee || today" />
                        </div>
                        <p-button
                            label="Rechercher les chambres"
                            icon="pi pi-search"
                            class="w-full"
                            (onClick)="search()"
                            pTooltip="Rechercher les chambres disponibles"
                            tooltipPosition="top" />
                    </div>
                </div>

                <!-- Bouton actualiser (discret) -->
                @if (searchActive()) {
                    <div class="mt-4">
                        <p-button
                            icon="pi pi-refresh"
                            label="Actualiser"
                            severity="secondary"
                            size="small"
                            [loading]="refreshing()"
                            (onClick)="refreshNow()"
                            class="w-full"
                            pTooltip="Vérifier les disponibilités maintenant"
                            tooltipPosition="top" />
                    </div>
                }
            </div>

            <!-- Liste des chambres disponibles -->
            <div class="col-span-12 lg:col-span-8">
                <!-- En-tête de la liste -->
                @if (searchActive()) {
                    <div class="flex items-center gap-3 mb-4 px-1">
                        <h3 class="text-lg font-semibold text-slate-800 m-0">
                            Chambres disponibles
                        </h3>
                        @if (chambres().length > 0) {
                            <span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full px-2.5 py-0.5">
                                {{ chambres().length }}
                            </span>
                        }
                    </div>
                }

                <div class="grid grid-cols-12 gap-4">
                    @for (ch of chambres(); track ch.id) {
                        <div class="col-span-12 md:col-span-6">
                            <p-card styleClass="h-full hover:shadow-lg transition-shadow duration-200">
                                <ng-template #header>
                                    <div class="h-32 bg-gradient-to-br from-[#1e3a8a] to-[#00529B] flex flex-col items-center justify-center text-white rounded-t-xl relative overflow-hidden">
                                        <span class="text-2xl font-extrabold drop-shadow">Chambre {{ ch.numero }}</span>
                                        @if (ch.centreNom) {
                                            <span class="text-xs text-blue-200 mt-1">{{ ch.centreNom }}</span>
                                        }
                                    </div>
                                </ng-template>
                                <ng-template #title></ng-template>
                                <div class="flex flex-col gap-3">
                                    <p class="text-2xl font-bold text-primary mb-0">
                                        {{ tarifPrixParNuit() | number }} FCFA
                                        <span class="text-sm font-normal text-muted-color">/ nuit</span>
                                    </p>
                                    <div class="flex gap-2">
                                        <p-button
                                            label="Détails"
                                            icon="pi pi-info-circle"
                                            severity="secondary"
                                            size="small"
                                            class="flex-1"
                                            (onClick)="voirDetails(ch)"
                                            pTooltip="Afficher les détails"
                                            tooltipPosition="top" />
                                        <p-button
                                            label="Réserver"
                                            icon="pi pi-calendar-plus"
                                            size="small"
                                            class="flex-1"
                                            (onClick)="reserver(ch)"
                                            pTooltip="Réserver cette chambre"
                                            tooltipPosition="top" />
                                    </div>
                                </div>
                            </p-card>
                        </div>
                    } @empty {
                        @if (searchActive()) {
                            <!-- Aucune chambre après recherche -->
                            <div class="col-span-12">
                                <div class="card text-center py-12 border border-amber-100 bg-amber-50">
                                    <i class="pi pi-inbox text-5xl text-amber-300 mb-4 block"></i>
                                    <p class="text-slate-600 font-semibold">Aucune chambre disponible pour ces dates</p>
                                    <p class="text-xs text-slate-400 mt-2">
                                        La liste se met à jour automatiquement toutes les 30 secondes.<br>
                                        Dès qu'une chambre se libère, elle apparaîtra ici.
                                    </p>
                                    @if (derniereMAJ()) {
                                        <p class="text-xs text-slate-400 mt-2 font-mono">Dernière vérification : {{ derniereMAJ() }}</p>
                                    }
                                </div>
                            </div>
                        } @else {
                            <!-- Avant toute recherche -->
                            <div class="col-span-12 text-center py-16">
                                <i class="pi pi-search text-5xl text-slate-200 mb-4 block"></i>
                                <p class="text-muted-color">Sélectionnez un centre et des dates<br>puis cliquez sur <strong>"Rechercher"</strong>.</p>
                            </div>
                        }
                    }
                </div>
            </div>
        </div>

        <!-- Dialog détails chambre -->
        @if (selectedChambre()) {
            <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" (click)="selectedChambre.set(null)">
                <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" (click)="$event.stopPropagation()">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold text-slate-800">Chambre {{ selectedChambre()!.numero }}</h3>
                        <button class="text-slate-400 hover:text-slate-600 cursor-pointer" (click)="selectedChambre.set(null)">
                            <i class="pi pi-times text-lg"></i>
                        </button>
                    </div>
                    <div class="flex flex-col gap-3 text-sm text-slate-700">
                        <div class="flex justify-between">
                            <span class="font-semibold">Prix / nuit</span>
                            <span class="text-[#00529B] font-bold">{{ tarifPrixParNuit() | number }} FCFA</span>
                        </div>
                        @if (selectedChambre()!.centreNom) {
                            <div class="flex justify-between">
                                <span class="font-semibold">Centre</span>
                                <span>{{ selectedChambre()!.centreNom }}</span>
                            </div>
                        }
                        @if (selectedChambre()!.centreVille) {
                            <div class="flex justify-between">
                                <span class="font-semibold">Ville</span>
                                <span>{{ selectedChambre()!.centreVille }}</span>
                            </div>
                        }
                        <div class="flex justify-between">
                            <span class="font-semibold">Statut</span>
                            <span class="text-emerald-600 font-bold flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                                Disponible
                            </span>
                        </div>
                    </div>
                    <p-button
                        label="Réserver cette chambre"
                        icon="pi pi-calendar-plus"
                        class="w-full mt-5"
                        (onClick)="reserver(selectedChambre()!); selectedChambre.set(null)"
                        pTooltip="Confirmer la réservation"
                        tooltipPosition="top" />
                </div>
            </div>
        }
    `
})
export class Reserver implements OnInit, OnDestroy {
    private centreService = inject(CentreService);
    private chambreService = inject(ChambreService);
    private reservationService = inject(ReservationService);
    private tarifService = inject(TarifService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);
    private router = inject(Router);

    centres = signal<Centre[]>([]);
    chambres = signal<Chambre[]>([]);
    selectedChambre = signal<Chambre | null>(null);
    tarifs = signal<Tarif[]>([]);
    centreId = signal<number | undefined>(undefined);
    dateArrivee?: Date;
    dateDepart?: Date;
    readonly today = new Date();

    // État du rafraîchissement automatique
    searchActive = signal(false);
    refreshing = signal(false);
    derniereMAJ = signal<string>('');

    private autoRefreshInterval: ReturnType<typeof setInterval> | null = null;
    private readonly REFRESH_INTERVAL_MS = 30_000; // 30 secondes

    tarifPrixParNuit = computed(() => {
        const typeClient = this.authService.user()?.typeClient;
        if (!typeClient || !this.centreId()) return 0;
        const t = this.tarifs().find(t => t.typeClient === typeClient);
        return t?.prixParNuit ?? 0;
    });

    ngOnInit() {
        this.centreService.getAll().subscribe((c) => this.centres.set(c));
    }

    ngOnDestroy() {
        this.stopAutoRefresh();
    }

    onCentreChange(id: number | undefined) {
        this.centreId.set(id);
        if (id) {
            this.tarifService.getByCentre(id).subscribe((t) => this.tarifs.set(t));
        }
        if (this.searchActive()) {
            this.stopAutoRefresh();
            this.chambres.set([]);
            this.searchActive.set(false);
            this.derniereMAJ.set('');
        }
    }

    search() {
        if (!this.centreId() || !this.dateArrivee || !this.dateDepart) {
            this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Veuillez sélectionner un centre, une date d\'arrivée et une date de départ.' });
            return;
        }
        const aujourdHui = new Date();
        aujourdHui.setHours(0, 0, 0, 0);
        if (this.dateArrivee < aujourdHui) {
            this.messageService.add({ severity: 'warn', summary: 'Date invalide', detail: 'La date d\'arrivée ne peut pas être dans le passé.' });
            return;
        }
        if (this.dateDepart < aujourdHui) {
            this.messageService.add({ severity: 'warn', summary: 'Date invalide', detail: 'La date de départ ne peut pas être dans le passé.' });
            return;
        }
        if (this.dateDepart <= this.dateArrivee) {
            this.messageService.add({ severity: 'warn', summary: 'Dates invalides', detail: 'La date de départ doit être après la date d\'arrivée.' });
            return;
        }

        this.searchActive.set(true);
        this.loadChambresDisponibles(false);
        this.startAutoRefresh();
    }

    /** Rafraîchissement manuel déclenché par le bouton */
    refreshNow() {
        if (!this.searchActive()) return;
        this.loadChambresDisponibles(true);
    }

    /** Charge les chambres disponibles depuis l'API */
    private loadChambresDisponibles(showSpinner = false) {
        if (!this.centreId() || !this.dateArrivee || !this.dateDepart) return;
        const arrivee = this.formatDate(this.dateArrivee);
        const depart = this.formatDate(this.dateDepart);
        const ancienCount = this.chambres().length;
        if (showSpinner) this.refreshing.set(true);

        this.chambreService.getDisponibles(this.centreId()!, arrivee, depart).subscribe({
            next: (ch) => {
                this.chambres.set(ch);
                this.refreshing.set(false);
                // Horodatage de la dernière mise à jour
                const now = new Date();
                this.derniereMAJ.set(
                    `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
                );
                // Notifier si de nouvelles chambres sont apparues depuis la dernière vérification
                if (ch.length > ancienCount) {
                    const nouvelles = ch.length - ancienCount;
                    const msg = nouvelles === 1
                        ? `1 chambre vient de se libérer pour vos dates !`
                        : `${nouvelles} chambres viennent de se libérer pour vos dates !`;
                    this.messageService.add({
                        severity: 'success',
                        summary: '🏨 Nouvelle(s) disponibilité(s) !',
                        detail: msg,
                        life: 6000
                    });
                }
            },
            error: () => {
                this.refreshing.set(false);
            }
        });
    }

    private startAutoRefresh() {
        this.stopAutoRefresh();
        this.autoRefreshInterval = setInterval(() => {
            if (this.searchActive()) {
                this.loadChambresDisponibles(false);
            }
        }, this.REFRESH_INTERVAL_MS);
    }

    private stopAutoRefresh() {
        if (this.autoRefreshInterval !== null) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    reserver(ch: Chambre) {
        const statut = this.authService.user()?.statutCompte;
        if (statut === 'EN_ATTENTE') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Compte en attente',
                detail: 'Votre compte est en attente de validation par le gérant. Vous ne pouvez pas encore faire de réservation.',
                life: 6000
            });
            return;
        }
        if (statut === 'REJETE') {
            this.messageService.add({
                severity: 'error',
                summary: 'Compte rejeté',
                detail: 'Votre compte a été rejeté. Veuillez contacter l\'administration CMT.',
                life: 6000
            });
            return;
        }
        if (!this.dateArrivee || !this.dateDepart) {
            this.messageService.add({ severity: 'warn', summary: 'Dates manquantes', detail: 'Veuillez d\'abord choisir vos dates et rechercher les chambres.' });
            return;
        }
        this.reservationService.create({
            chambreId: ch.id,
            dateArrivee: this.formatDate(this.dateArrivee),
            dateDepart: this.formatDate(this.dateDepart)
        }).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Réservation créée', detail: 'En attente de validation par le gérant.' });
                this.stopAutoRefresh();
                this.router.navigate(['/cmt/reservations']);
            },
            error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message })
        });
    }

    voirDetails(ch: Chambre) {
        this.selectedChambre.set(ch);
    }

    private formatDate(d: Date): string {
        return d.toISOString().split('T')[0];
    }
}
