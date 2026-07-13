import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '@/app/layout/service/layout.service';
import { AuthService } from '@/app/core/services/auth.service';
import { CentreActifService } from '@/app/core/services/centre-actif.service';
import { NotificationService } from '@/app/core/services/notification.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, ButtonModule],
    template: ` <div class="layout-topbar bg-white border-b border-slate-100 px-6">
        <div class="layout-topbar-logo-container flex items-center gap-4">
            <button class="layout-menu-button layout-topbar-action hover:bg-slate-50 rounded-xl" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            
            @if (auth.isGerant()) {
                <div class="flex items-center gap-2 pl-3 border-l border-slate-200">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Centre</span>
                    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                        <i class="pi pi-building text-primary text-xs"></i>
                        <span class="text-xs font-extrabold text-slate-700">{{ centreActif.centreActif()?.nom || 'CMT' }}</span>
                    </div>
                </div>
            }
        </div>

        <div class="layout-topbar-actions flex items-center gap-4">
            <!-- Theme toggle button -->
            <button type="button" class="layout-topbar-action hover:bg-slate-50 rounded-xl" (click)="toggleDarkMode()">
                <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
            </button>

            <!-- Notifications & Profile -->
            <div class="flex items-center gap-4">
                <!-- Notifications -->
                <button type="button" class="relative w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer" routerLink="/cmt/notifications">
                    <i class="pi pi-bell text-lg"></i>
                    @if (nonLues() > 0) {
                        <span class="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">{{ nonLues() }}</span>
                    }
                </button>

                <!-- Profile Info -->
                <div class="flex items-center gap-3 pl-3 border-l border-slate-200">
                    @if (auth.isAdmin() || auth.isGerant()) {
                        <div class="w-9 h-9 rounded-full bg-primary/10 text-primary font-extrabold flex items-center justify-center text-sm border border-primary/20 shrink-0">
                            {{ auth.user()?.prenom?.charAt(0) || 'A' }}{{ auth.user()?.nom?.charAt(0) || 'U' }}
                        </div>
                        <div class="hidden md:flex flex-col text-left">
                            <span class="text-xs font-bold text-slate-800 leading-tight">
                                {{ auth.user()?.prenom }} {{ auth.user()?.nom }}
                            </span>
                            <span class="text-[10px] font-semibold text-slate-500 leading-normal">
                                @if (auth.isAdmin()) { Super administrateur }
                                @else if (auth.isGerant()) { Gérant de centre }
                            </span>
                        </div>
                    } @else {
                        <!-- Client: photo + nom + matricule + chevron -->
                        <div class="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 overflow-hidden">
                            <i class="pi pi-user text-lg"></i>
                        </div>
                        <div class="hidden md:flex flex-col text-left">
                            <span class="text-xs font-bold text-slate-800 leading-tight">{{ auth.user()?.prenom }} {{ auth.user()?.nom }}</span>
                            <span class="text-[10px] font-semibold text-slate-500">Matricule : {{ auth.user()?.matricule || 'Non renseigné' }}</span>
                        </div>
                    }
                    <!-- Logout Button -->
                    <button type="button"
                        class="ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors cursor-pointer border border-red-100"
                        (click)="auth.logout()" title="Déconnexion">
                        <i class="pi pi-sign-out"></i>
                        <span class="hidden sm:inline">Déconnexion</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar implements OnInit, OnDestroy {
    items!: MenuItem[];
    layoutService = inject(LayoutService);
    auth = inject(AuthService);
    centreActif = inject(CentreActifService);
    private notifService = inject(NotificationService);
    nonLues = signal(0);
    private refreshSubscription!: any;

    ngOnInit() {
        const charger = () => {
            if (this.auth.isAuthenticated()) {
                this.notifService.countNonLues().subscribe({
                    next: (r) => this.nonLues.set(r.count),
                    error: () => this.nonLues.set(0)
                });
            } else {
                this.nonLues.set(0);
            }
        };

        charger();
        this.refreshSubscription = this.notifService.refreshNeeded$.subscribe(() => charger());
        this.notifService.notificationsPageVisited.subscribe(() => this.nonLues.set(0));
    }

    ngOnDestroy() {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }
}
