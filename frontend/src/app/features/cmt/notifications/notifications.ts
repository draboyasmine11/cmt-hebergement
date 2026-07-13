import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '@/app/core/services/notification.service';
import { Notification } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [CommonModule, ButtonModule, TooltipModule],
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-semibold">Notifications</h2>
                @if (notifications().length > 0) {
                    <button class="text-sm text-[#00529B] font-semibold hover:underline cursor-pointer" (click)="toutLire()" pTooltip="Marquer toutes les notifications comme lues" tooltipPosition="left">
                        Tout marquer comme lu
                    </button>
                }
            </div>

            @for (n of notifications(); track n.id) {
                <div class="p-4 mb-3 rounded-xl border transition-all"
                     [class]="n.lu ? 'border-slate-100 bg-white' : 'border-[#00529B]/20 bg-[#00529B]/5'">
                    <div class="flex justify-between items-start gap-3">
                        <div class="flex items-start gap-3 flex-1 min-w-0">
                            <!-- Icône selon le type -->
                            <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                 [class]="iconeBg(n.typeNotification)">
                                <i [class]="icone(n.typeNotification)" class="text-sm"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <p class="font-semibold text-slate-800 text-sm">{{ n.titre }}</p>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                          [class]="badgeClass(n.typeNotification)">
                                        {{ labelType(n.typeNotification) }}
                                    </span>
                                    @if (!n.lu) {
                                        <span class="w-2 h-2 rounded-full bg-[#00529B] inline-block"></span>
                                    }
                                </div>
                                <p class="text-slate-600 text-sm mt-1">{{ n.message }}</p>
                                <p class="text-xs text-slate-400 mt-1.5">{{ n.createdAt | date:'dd/MM/yyyy à HH:mm' }}</p>
                                @if (n.reservationId) {
                                    <button
                                        class="mt-2 text-xs font-bold text-[#00529B] hover:underline cursor-pointer flex items-center gap-1"
                                        (click)="voirReservation(n)"
                                        pTooltip="Accéder à ma réservation" tooltipPosition="right">
                                        <i class="pi pi-arrow-right text-[10px]"></i>
                                        Voir ma réservation
                                    </button>
                                }
                                @if (n.typeNotification === 'NOUVELLE_DEMANDE_INSCRIPTION') {
                                    <button
                                        class="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                                        (click)="voirDemandes(n)"
                                        pTooltip="Voir les demandes d'inscription" tooltipPosition="right">
                                        <i class="pi pi-arrow-right text-[10px]"></i>
                                        Voir les demandes
                                    </button>
                                }
                            </div>
                        </div>
                        @if (!n.lu) {
                            <button class="text-slate-400 hover:text-[#00529B] cursor-pointer shrink-0 mt-1" pTooltip="Marquer comme lue" tooltipPosition="left" (click)="marquerLue(n)">
                                <i class="pi pi-check text-sm"></i>
                            </button>
                        }
                    </div>
                </div>
            } @empty {
                <div class="text-center py-12">
                    <i class="pi pi-bell text-4xl text-slate-200 block mb-3"></i>
                    <p class="text-slate-400 font-medium">Aucune notification pour le moment</p>
                </div>
            }
        </div>
    `
})
export class Notifications implements OnInit {
    private notificationService = inject(NotificationService);
    private router = inject(Router);

    notifications = signal<Notification[]>([]);

    ngOnInit() { this.load(); }

    load() {
        this.notificationService.getAll().subscribe((notifications) => {
            this.notifications.set(notifications);
            const nonLues = notifications.filter(n => !n.lu);
            if (nonLues.length > 0) {
                this.notificationService.marquerToutesLues().subscribe();
            } else {
                this.notificationService.triggerRefresh();
            }
            // Effacer le badge topbar immédiatement
            this.notificationService.markNotificationsPageVisited();
        });
    }

    marquerLue(n: Notification) {
        this.notificationService.marquerLue(n.id).subscribe(() => this.load());
    }

    toutLire() {
        this.notificationService.marquerToutesLues().subscribe(() => this.load());
    }

    voirReservation(n: Notification) {
        if (!n.lu) this.notificationService.marquerLue(n.id).subscribe();
        this.router.navigate(['/cmt/reservations']);
    }

    voirDemandes(n: Notification) {
        if (!n.lu) this.notificationService.marquerLue(n.id).subscribe();
        this.router.navigate(['/cmt/demandes-inscription']);
    }

    labelType(type: string): string {
        const labels: Record<string, string> = {
            NOUVELLE_RESERVATION: 'Nouvelle réservation',
            RESERVATION_VALIDEE: 'Réservation validée',
            RESERVATION_REFUSEE: 'Réservation refusée',
            RESERVATION_ANNULEE: 'Réservation annulée',
            RAPPEL_SEJOUR: 'Rappel de séjour',
            COMPTE_APPROUVE: 'Compte approuvé',
            COMPTE_REJETE: 'Compte rejeté',
            NOUVELLE_DEMANDE_INSCRIPTION: 'Demande d\'inscription',
        };
        return labels[type] ?? type;
    }

    icone(type: string): string {
        const icons: Record<string, string> = {
            NOUVELLE_RESERVATION: 'pi pi-calendar-plus text-blue-600',
            RESERVATION_VALIDEE: 'pi pi-check text-green-600',
            RESERVATION_REFUSEE: 'pi pi-times text-red-500',
            RESERVATION_ANNULEE: 'pi pi-ban text-orange-500',
            RAPPEL_SEJOUR: 'pi pi-clock text-purple-600',
            COMPTE_APPROUVE: 'pi pi-user-check text-green-600',
            COMPTE_REJETE: 'pi pi-user-minus text-red-500',
            NOUVELLE_DEMANDE_INSCRIPTION: 'pi pi-user-plus text-indigo-600',
        };
        return icons[type] ?? 'pi pi-bell text-slate-500';
    }

    iconeBg(type: string): string {
        const bg: Record<string, string> = {
            NOUVELLE_RESERVATION: 'bg-blue-100',
            RESERVATION_VALIDEE: 'bg-green-100',
            RESERVATION_REFUSEE: 'bg-red-100',
            RESERVATION_ANNULEE: 'bg-orange-100',
            RAPPEL_SEJOUR: 'bg-purple-100',
            COMPTE_APPROUVE: 'bg-green-100',
            COMPTE_REJETE: 'bg-red-100',
            NOUVELLE_DEMANDE_INSCRIPTION: 'bg-indigo-100',
        };
        return bg[type] ?? 'bg-slate-100';
    }

    badgeClass(type: string): string {
        const cls: Record<string, string> = {
            NOUVELLE_RESERVATION: 'bg-blue-100 text-blue-700',
            RESERVATION_VALIDEE: 'bg-green-100 text-green-700',
            RESERVATION_REFUSEE: 'bg-red-100 text-red-700',
            RESERVATION_ANNULEE: 'bg-orange-100 text-orange-700',
            RAPPEL_SEJOUR: 'bg-purple-100 text-purple-700',
            COMPTE_APPROUVE: 'bg-green-100 text-green-700',
            COMPTE_REJETE: 'bg-red-100 text-red-700',
            NOUVELLE_DEMANDE_INSCRIPTION: 'bg-indigo-100 text-indigo-700',
        };
        return cls[type] ?? 'bg-slate-100 text-slate-600';
    }
}
