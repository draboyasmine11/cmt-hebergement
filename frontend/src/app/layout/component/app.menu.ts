import { Component, effect, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '@/app/core/services/auth.service';
import { InscriptionService } from '@/app/core/services/inscription.service';
import { ReservationService } from '@/app/core/services/reservation.service';
import { CentreActifService } from '@/app/core/services/centre-actif.service';
import { NotificationService } from '@/app/core/services/notification.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model(); track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu implements OnInit {
    private auth = inject(AuthService);
    private inscriptionService = inject(InscriptionService);
    private reservationService = inject(ReservationService);
    private centreActif = inject(CentreActifService);
    private notificationService = inject(NotificationService);
    model = signal<any[]>([]);
    demandesCount = signal(0);
    reservationsEnAttente = signal(0);
    private _initialized = false;

    constructor() {
        effect(() => {
            this.centreActif.centreActif();
            if (this._initialized) {
                this.chargerCompteurReservations();
            }
            this._initialized = true;
        });
    }

    ngOnInit() {
        this.construireMenu();
        this.inscriptionService.getDemandesSilent().subscribe({
            next: (d) => {
                this.demandesCount.set(d.length);
                this.construireMenu();
            }
        });
        this.chargerCompteurReservations();
        this.notificationService.reservationUpdated$.subscribe(() => this.chargerCompteurReservations());
        this.notificationService.reservationPageVisited.subscribe(() => {
            this.reservationsEnAttente.set(0);
            this.construireMenu();
        });
        this.notificationService.demandesPageVisited.subscribe(() => {
            this.demandesCount.set(0);
            this.construireMenu();
        });
    }

    private chargerCompteurReservations() {
        if (this.auth.isGerant()) {
            const rawId = this.auth.user()?.centreId ?? this.centreActif.centreActif()?.id;
            const centreId = rawId !== undefined && rawId !== null ? Number(rawId) : NaN;
            if (Number.isInteger(centreId) && centreId > 0) {
                this.reservationService.getByCentreSilent(centreId).subscribe(r => {
                    this.reservationsEnAttente.set(r.filter((x: any) => x.statut === 'EN_ATTENTE').length);
                    this.construireMenu();
                });
            }
        } else if (this.auth.isAdmin()) {
            this.reservationService.getAllSilent().subscribe(r => {
                this.reservationsEnAttente.set(r.filter((x: any) => x.statut === 'EN_ATTENTE').length);
                this.construireMenu();
            });
        }
    }

    private construireMenu() {
        const items: any[] = [];

        if (this.auth.isAdmin()) {
            items.push({
                items: [
                    { label: 'Tableau de bord', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] },
                    { label: 'Utilisateurs', icon: 'pi pi-fw pi-users', routerLink: ['/cmt/utilisateurs'] },
                    { label: 'Rôles & Permissions', icon: 'pi pi-fw pi-shield', routerLink: ['/cmt/roles'] },
                    { label: 'Centres d\'hébergement', icon: 'pi pi-fw pi-building', routerLink: ['/cmt/centres'] },
                    { label: 'Chambres', icon: 'pi pi-fw pi-home', routerLink: ['/cmt/chambres'] },
                    { label: 'Tarifs', icon: 'pi pi-fw pi-tag', routerLink: ['/cmt/tarifs'] },
                    { label: 'Demandes d\'inscription', icon: 'pi pi-fw pi-user-plus', routerLink: ['/cmt/demandes-inscription'], badge: this.demandesCount() > 0 ? String(this.demandesCount()) : undefined },
                    { label: 'Réservations', icon: 'pi pi-fw pi-calendar', routerLink: ['/cmt/reservations'], badge: this.reservationsEnAttente() > 0 ? String(this.reservationsEnAttente()) : undefined },
                    { label: 'Paiements', icon: 'pi pi-fw pi-wallet', routerLink: ['/cmt/paiements'] },
                    { label: 'Rapports', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/cmt/rapports'] },
                    { label: 'Signalements', icon: 'pi pi-fw pi-flag', routerLink: ['/cmt/signalements'] },
                    { label: 'À propos', icon: 'pi pi-fw pi-info-circle', routerLink: ['/cmt/a-propos'] },
                    { label: 'Aide', icon: 'pi pi-fw pi-question-circle', routerLink: ['/cmt/aide'] }
                ]
            });
        } else if (this.auth.isGerant()) {
            items.push({
                items: [
                    { label: 'Tableau de bord', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] },
                    { label: 'Réservations', icon: 'pi pi-fw pi-calendar', routerLink: ['/cmt/reservations'], badge: this.reservationsEnAttente() > 0 ? String(this.reservationsEnAttente()) : undefined },
                    { label: 'Occupation des chambres', icon: 'pi pi-fw pi-building', routerLink: ['/cmt/occupation'] },
                    { label: 'Séjours', icon: 'pi pi-fw pi-clock', routerLink: ['/cmt/sejours'] },
                    { label: 'Encaissements', icon: 'pi pi-fw pi-wallet', routerLink: ['/cmt/encaissements'] },
                    { label: 'Factures', icon: 'pi pi-fw pi-file-pdf', routerLink: ['/cmt/factures'] },
                    { label: 'Chambres', icon: 'pi pi-fw pi-home', routerLink: ['/cmt/chambres'] },
                    { label: 'Rapports', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/cmt/rapports'] },
                    { label: 'Aide', icon: 'pi pi-fw pi-question-circle', routerLink: ['/cmt/aide'] }
                ]
            });
        } else {
            items.push({
                items: [
                    { label: 'Tableau de bord', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] },
                    { label: 'Réserver une chambre', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/cmt/reserver'] },
                    { label: 'Mes réservations', icon: 'pi pi-fw pi-list', routerLink: ['/cmt/reservations'] },
                    { label: 'Mes séjours', icon: 'pi pi-fw pi-clock', routerLink: ['/cmt/mes-sejours'] },
                    { label: 'Mes factures', icon: 'pi pi-fw pi-file-pdf', routerLink: ['/cmt/mes-factures'] },
                    { label: 'Mon profil', icon: 'pi pi-fw pi-user', routerLink: ['/cmt/profil'] },
                    { label: 'Aide', icon: 'pi pi-fw pi-question-circle', routerLink: ['/cmt/aide'] }
                ]
            });
        }

        this.model.set(items);
    }
}
