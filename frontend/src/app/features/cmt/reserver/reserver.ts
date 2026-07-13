import { Component, OnInit, inject, signal, computed } from '@angular/core';

const ROOM_PHOTOS = [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400&h=280&fit=crop',
];
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
import { Centre, Chambre, Tarif, TypeClient } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-reserver',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, SelectModule, DatePickerModule, ToastModule, TooltipModule],
    template: `
        <p-toast />
        <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 lg:col-span-4">
                <div class="card">
                    <h2 class="text-xl font-semibold mb-4">Nouvelle réservation</h2>
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block mb-2 font-medium">Centre</label>
                            <p-select [options]="centres()" [(ngModel)]="centreId" optionLabel="nom" optionValue="id" placeholder="Choisir un centre" class="w-full" (onChange)="onCentreChange()" />
                        </div>
                        <div>
                            <label class="block mb-2 font-medium">Date d'arrivée</label>
                            <p-datepicker [(ngModel)]="dateArrivee" dateFormat="yy-mm-dd" [showIcon]="true" class="w-full" [minDate]="today" />
                        </div>
                        <div>
                            <label class="block mb-2 font-medium">Date de départ</label>
                            <p-datepicker [(ngModel)]="dateDepart" dateFormat="yy-mm-dd" [showIcon]="true" class="w-full" [minDate]="dateArrivee || today" />
                        </div>
                        <p-button label="Rechercher les chambres" icon="pi pi-search" class="w-full" (onClick)="search()" pTooltip="Rechercher les chambres disponibles pour les dates et le centre sélectionnés" tooltipPosition="top" />
                    </div>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-8">
                <div class="grid grid-cols-12 gap-4">
                    @for (ch of chambres(); track ch.id) {
                        <div class="col-span-12 md:col-span-6">
                            <p-card>
                                <ng-template #header>
                                    <div class="h-36 overflow-hidden rounded-t-xl bg-slate-100">
                                        <img [src]="roomPhoto(ch.id)" alt="Chambre" class="w-full h-full object-cover" loading="lazy" onerror="this.style.display='none'" />
                                    </div>
                                </ng-template>
                                <ng-template #title>Chambre {{ ch.numero }}</ng-template>
                                <div class="flex flex-col gap-3">
                                    <p class="text-2xl font-bold text-primary mb-0">{{ tarifPrixParNuit() | number }} FCFA <span class="text-sm font-normal text-muted-color">/ nuit</span></p>
                                    @if (ch.centreNom) {
                                        <p class="text-sm text-muted-color"><i class="pi pi-building mr-1"></i>{{ ch.centreNom }}</p>
                                    }
                                    <div class="flex gap-2">
                                        <p-button label="Détails" icon="pi pi-info-circle" severity="secondary" size="small" class="flex-1" (onClick)="voirDetails(ch)" pTooltip="Afficher les détails de cette chambre" tooltipPosition="top" />
                                        <p-button label="Réserver" icon="pi pi-calendar-plus" size="small" class="flex-1" (onClick)="reserver(ch)" pTooltip="Réserver cette chambre" tooltipPosition="top" />
                                    </div>
                                </div>
                            </p-card>
                        </div>
                    } @empty {
                        <div class="col-span-12 text-center text-muted-color py-8">
                            Sélectionnez un centre et des dates puis cliquez sur "Rechercher".
                        </div>
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
                        <button class="text-slate-400 hover:text-slate-600 cursor-pointer" (click)="selectedChambre.set(null)"><i class="pi pi-times text-lg"></i></button>
                    </div>
                    @if (selectedChambre()!.image) {
                        <div class="mb-4 -mx-2"><img [src]="'/api/uploads/' + selectedChambre()!.image" alt="Photo" class="w-full h-40 object-cover rounded-xl border border-slate-200" /></div>
                    } @else {
                        <div class="mb-4 -mx-2"><img src="/logo_sonabel.jpg" alt="Photo" class="w-full h-40 object-cover rounded-xl border border-slate-200" /></div>
                    }
                    <div class="flex flex-col gap-3 text-sm text-slate-700">
                        <div class="flex justify-between"><span class="font-semibold">Prix / nuit</span><span class="text-[#00529B] font-bold">{{ tarifPrixParNuit() | number }} FCFA</span></div>
                        @if (selectedChambre()!.centreNom) {
                            <div class="flex justify-between"><span class="font-semibold">Centre</span><span>{{ selectedChambre()!.centreNom }}</span></div>
                        }
                        @if (selectedChambre()!.centreVille) {
                            <div class="flex justify-between"><span class="font-semibold">Ville</span><span>{{ selectedChambre()!.centreVille }}</span></div>
                        }
                        <div class="flex justify-between"><span class="font-semibold">Statut</span>
                            <span [class]="selectedChambre()!.statut === 'DISPONIBLE' ? 'text-green-600 font-bold' : 'text-red-500 font-bold'">{{ selectedChambre()!.statut }}</span>
                        </div>
                    </div>
                    <p-button label="Réserver cette chambre" icon="pi pi-calendar-plus" class="w-full mt-5" (onClick)="reserver(selectedChambre()!); selectedChambre.set(null)" pTooltip="Confirmer la réservation de cette chambre" tooltipPosition="top" />
                </div>
            </div>
        }
    `
})
export class Reserver implements OnInit {
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
    centreId?: number;
    dateArrivee?: Date;
    dateDepart?: Date;
    readonly today = new Date();

    tarifPrixParNuit = computed(() => {
        const typeClient = this.authService.user()?.typeClient;
        if (!typeClient || !this.centreId) return 0;
        const t = this.tarifs().find(t => t.typeClient === typeClient);
        return t?.prixParNuit ?? 0;
    });

    roomPhoto(id: number): string {
        return ROOM_PHOTOS[id % ROOM_PHOTOS.length];
    }

    ngOnInit() {
        this.centreService.getAll().subscribe((c) => this.centres.set(c));
    }

    onCentreChange() {
        if (this.centreId) {
            this.tarifService.getByCentre(this.centreId).subscribe((t) => this.tarifs.set(t));
        }
    }

    search() {
        if (!this.centreId || !this.dateArrivee || !this.dateDepart) {
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
        const arrivee = this.formatDate(this.dateArrivee);
        const depart = this.formatDate(this.dateDepart);
        this.chambreService.getDisponibles(this.centreId, arrivee, depart)
            .subscribe((ch) => this.chambres.set(ch));
    }

    reserver(ch: Chambre) {
        // Bloquer si compte non validé
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
