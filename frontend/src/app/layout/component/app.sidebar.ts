import { Component, computed, effect, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppMenu } from './app.menu';
import { LayoutService } from '@/app/layout/service/layout.service';
import { AuthService } from '@/app/core/services/auth.service';
import { CentreActifService } from '@/app/core/services/centre-actif.service';
import { Centre } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu, RouterModule, CommonModule],
    template: `
        <div class="layout-sidebar flex flex-col justify-between h-full bg-white border-r border-slate-100 py-6 px-4">
            <div class="flex flex-col gap-6">
                <!-- Branding Container -->
                <div class="flex flex-col items-center gap-1 px-2 pb-4 border-b border-slate-100">
                    @if (!auth.isAdmin() && !auth.isGerant()) {
                        <!-- Client branding: logos grands + CMT-SONABEL -->
                        <div class="flex items-center gap-3 justify-center">
                            <img src="/logo_cmt.jpg" alt="Logo CMT" class="h-14 w-14 rounded-full object-cover shadow-sm border border-slate-100" />
                            <img src="/logo_sonabel.jpg" alt="Logo SONABEL" class="h-12 w-auto object-contain" />
                        </div>
                        <div class="text-center mt-1">
                            <p class="text-[#00529B] text-sm font-extrabold tracking-wide">CMT-SONABEL</p>
                            <p class="text-slate-400 text-[10px] font-semibold">Centres d'Hébergement</p>
                        </div>
                    } @else {
                        <!-- Admin/Gérant branding -->
                        <div class="flex items-center gap-3">
                            <img src="/logo_cmt.jpg" alt="Logo CMT" class="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-100 shrink-0" />
                            <img src="/logo_sonabel.jpg" alt="Logo SONABEL" class="h-8 w-auto object-contain shrink-0" />
                            <div class="text-[#00529B] text-[9px] font-extrabold leading-tight tracking-wider uppercase border-l border-slate-200 pl-2">
                                Société Nationale<br>d'Électricité du Burkina
                            </div>
                        </div>
                    }
                </div>

                <!-- Menu Component -->
                <app-menu></app-menu>
            </div>

            <!-- Bottom Role-based Card -->
            <div class="px-2 mt-auto">
                @if (auth.isAdmin()) {
                    <!-- Rien en bas pour l'admin -->
                } @else if (auth.isGerant()) {
                    <!-- Centre actuel + sélecteur -->
                    <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex flex-col gap-2">
                        <div class="flex items-start gap-2.5">
                            <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <i class="pi pi-building text-sm"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Centre actuel</span>
                                <h4 class="font-extrabold text-slate-800 text-xs truncate">{{ centreActif.centreActif()?.nom || 'Aucun centre' }}</h4>
                                <p class="text-[10px] text-slate-500 leading-normal">{{ centreActif.centreActif()?.ville || '' }}</p>
                            </div>
                        </div>

                        <!-- Bouton changer de centre -->
                        <button (click)="showSelector = !showSelector"
                            class="text-[10px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-1 mt-1 bg-transparent border-0">
                            Changer de centre
                        </button>

                        <!-- Liste des centres -->
                        @if (showSelector && centreActif.centres().length > 1) {
                            <div class="mt-1 flex flex-col gap-1">
                                @for (c of centreActif.centres(); track c.id) {
                                    <button
                                        (click)="changerCentre(c)"
                                        class="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border"
                                        [class.bg-primary]="centreActif.centreActif()?.id === c.id"
                                        [class.text-white]="centreActif.centreActif()?.id === c.id"
                                        [class.border-primary]="centreActif.centreActif()?.id === c.id"
                                        [class.bg-white]="centreActif.centreActif()?.id !== c.id"
                                        [class.text-slate-700]="centreActif.centreActif()?.id !== c.id"
                                        [class.border-slate-200]="centreActif.centreActif()?.id !== c.id"
                                        [class.hover:bg-slate-50]="centreActif.centreActif()?.id !== c.id"
                                    >
                                        <span class="block font-bold">{{ c.nom }}</span>
                                        <span class="text-[10px] opacity-70">{{ c.ville }}</span>
                                    </button>
                                }
                            </div>
                        } @else if (showSelector && centreActif.centres().length <= 1) {
                            <p class="text-[10px] text-slate-400 italic mt-1">Vous n'êtes assigné qu'à un seul centre.</p>
                        }
                    </div>
                } @else {
                    <!-- Client: Besoin d'aide -->
                    <a routerLink="/cmt/aide" class="block bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col gap-2 hover:bg-blue-100/50 transition-colors cursor-pointer">
                        <div class="flex items-center gap-2.5">
                            <div class="w-9 h-9 rounded-xl bg-[#00529B] flex items-center justify-center text-white shrink-0">
                                <i class="pi pi-headphones text-sm"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800 text-xs">Besoin d'aide ?</h4>
                                <p class="text-[10px] text-slate-500">Contactez le support CMT</p>
                            </div>
                        </div>
                        <span class="text-sm font-extrabold text-[#00529B]">+226 70 28 78 25</span>
                    </a>
                }
            </div>
        </div>
    `
})
export class AppSidebar implements OnInit, OnDestroy {
    layoutService = inject(LayoutService);
    auth = inject(AuthService);
    centreActif = inject(CentreActifService);
    router = inject(Router);
    el = inject(ElementRef);
    showSelector = false;
    private outsideClickListener: ((event: MouseEvent) => void) | null = null;

    private destroy$ = new Subject<void>();

    constructor() {
        effect(() => {
            const state = this.layoutService.layoutState();

            if (this.layoutService.isDesktop()) {
                if (state.overlayMenuActive) {
                    this.bindOutsideClickListener();
                } else {
                    this.unbindOutsideClickListener();
                }
            } else {
                if (state.mobileMenuActive) {
                    this.bindOutsideClickListener();
                } else {
                    this.unbindOutsideClickListener();
                }
            }
        });
    }

    ngOnInit() {
        if (this.auth.isGerant()) {
            this.centreActif.loadCentres();
        }
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this.destroy$)
            )
            .subscribe((event) => {
                const navEvent = event as NavigationEnd;
                this.onRouteChange(navEvent.urlAfterRedirects);
            });

        this.onRouteChange(this.router.url);
    }

    changerCentre(c: Centre) {
        this.centreActif.setCentre(c);
        this.showSelector = false;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.unbindOutsideClickListener();
    }

    private onRouteChange(path: string) {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            activePath: path,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            mobileMenuActive: false,
            menuHoverActive: false
        }));
    }

    private bindOutsideClickListener() {
        if (!this.outsideClickListener) {
            this.outsideClickListener = (event: MouseEvent) => {
                if (this.isOutsideClicked(event)) {
                    this.layoutService.layoutState.update((val) => ({
                        ...val,
                        overlayMenuActive: false,
                        staticMenuMobileActive: false,
                        mobileMenuActive: false,
                        menuHoverActive: false
                    }));
                }
            };

            document.addEventListener('click', this.outsideClickListener);
        }
    }

    private unbindOutsideClickListener() {
        if (this.outsideClickListener) {
            document.removeEventListener('click', this.outsideClickListener);
            this.outsideClickListener = null;
        }
    }

    private isOutsideClicked(event: MouseEvent): boolean {
        const topbarButtonEl = document.querySelector('.topbar-start > button');
        const sidebarEl = this.el.nativeElement;

        return !(
            sidebarEl?.isSameNode(event.target as Node) ||
            sidebarEl?.contains(event.target as Node) ||
            topbarButtonEl?.isSameNode(event.target as Node) ||
            topbarButtonEl?.contains(event.target as Node)
        );
    }
}
