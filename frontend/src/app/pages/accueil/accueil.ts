import { Component, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CentreService } from '@/app/core/services/centre.service';
import { Centre } from '@/app/core/models/cmt.models';


@Component({
    selector: 'app-accueil',
    standalone: true,
    imports: [RouterModule, ButtonModule, FormsModule],
    template: `
        <div class="min-h-screen bg-white font-sans">
            <header class="bg-white shadow-sm sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3 shrink-0">
                        <img src="/logo_cmt.jpg" alt="Logo CMT" class="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover" />
                        <img src="/logo_sonabel.jpg" alt="Logo SONABEL" class="h-8 sm:h-10 w-auto hidden sm:block object-contain" />
                    </div>
                    <nav class="hidden xl:flex items-center gap-7 font-semibold text-slate-600 text-sm">
                        <a (click)="scrollToTop()" [class]="activeSection === 'home' ? 'text-primary border-b-2 border-primary pb-0.5 cursor-pointer' : 'hover:text-primary transition-colors cursor-pointer'">Accueil</a>
                        <a (click)="scrollToCentres()" [class]="activeSection === 'centres' ? 'text-primary border-b-2 border-primary pb-0.5 cursor-pointer' : 'hover:text-primary transition-colors cursor-pointer'">Centres d'hébergement</a>
                        <a routerLink="/auth/login" (click)="activeSection = 'ext'" class="hover:text-primary transition-colors cursor-pointer">Chambres</a>
                        <a routerLink="/auth/login" (click)="activeSection = 'ext'" class="hover:text-primary transition-colors cursor-pointer">Réservations</a>
                        <a (click)="scrollToFeatures()" [class]="activeSection === 'features' ? 'text-primary border-b-2 border-primary pb-0.5 cursor-pointer' : 'hover:text-primary transition-colors cursor-pointer'">À propos</a>
                        <a (click)="scrollToFooter()" [class]="activeSection === 'footer' ? 'text-primary border-b-2 border-primary pb-0.5 cursor-pointer' : 'hover:text-primary transition-colors cursor-pointer'">Contact</a>
                    </nav>
                    <button type="button" (click)="toggleDark()"
                        class="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                        [title]="dark ? 'Mode clair' : 'Mode sombre'">
                        <i [class]="dark ? 'pi pi-sun' : 'pi pi-moon'"></i>
                    </button>
                </div>
            </header>

            <section
                class="relative min-h-[480px] sm:min-h-[520px] flex items-center bg-cover bg-center bg-no-repeat"
                [style.background-image]="'linear-gradient(to right, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.55) 45%, rgba(15,23,42,0.25) 100%), url(' + heroImage + ')'"
            >
                <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 w-full">
                    <div class="max-w-2xl flex flex-col gap-5 text-white">
                        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                            Bienvenue à la <span class="text-[#60a5fa]">CMT/SONABEL</span>
                        </h1>
                        <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold leading-snug text-slate-100">
                            Système de gestion des centres d'hébergement de la SONABEL
                        </h2>
                        <p class="text-slate-200 text-base sm:text-lg leading-relaxed">
                            Trouvez facilement un centre d'hébergement, consultez les chambres disponibles et réservez en toute simplicité.
                        </p>
                        <div class="flex flex-wrap gap-4 mt-2">
                            <button routerLink="/auth/login"
                                class="bg-primary hover:bg-[#00407a] text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg cursor-pointer">
                                <i class="pi pi-calendar"></i> Faire une réservation
                            </button>
                            <button (click)="scrollToFeatures()"
                                class="bg-white/10 hover:bg-white/20 text-white border border-white/40 px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm">
                                <i class="pi pi-info-circle"></i> En savoir plus
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div class="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-12 relative z-20 mb-4">
                <div class="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100">
                    <div class="grid grid-cols-12 gap-4 items-end">
                        <div class="col-span-12 md:col-span-4 flex flex-col gap-1.5">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Destination</label>
                            <div class="relative">
                                <i class="pi pi-map-marker absolute left-3 top-1/2 -translate-y-1/2 text-primary"></i>
                                <select class="w-full pl-9 pr-8 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 text-sm appearance-none" [(ngModel)]="searchCentreId">
                                    <option value="">Choisir un centre</option>
                                    @for (centre of centres(); track centre.id) {
                                        <option [value]="centre.id">{{ centre.nom }} — {{ centre.ville }}</option>
                                    }
                                </select>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-4 flex flex-col gap-1.5">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Date d'arrivée</label>
                            <div class="relative">
                                <i class="pi pi-calendar absolute left-3 top-1/2 -translate-y-1/2 text-primary"></i>
                                <input type="date" class="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 text-sm" [(ngModel)]="dateArrivee" />
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-3 flex flex-col gap-1.5">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Date de départ</label>
                            <div class="relative">
                                <i class="pi pi-calendar absolute left-3 top-1/2 -translate-y-1/2 text-primary"></i>
                                <input type="date" class="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 text-sm" [(ngModel)]="dateDepart" />
                            </div>
                        </div>
                        <div class="col-span-12 lg:col-span-1">
                            <button class="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white py-3 rounded-xl font-bold flex items-center justify-center transition-colors shadow-lg cursor-pointer" (click)="rechercher()">
                                <i class="pi pi-search"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <section id="features" class="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12">
                <div class="grid grid-cols-12 gap-6">
                    @for (feature of features; track feature.title) {
                        <div class="col-span-12 md:col-span-6 lg:col-span-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                            <div class="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                                <i [class]="feature.icon + ' text-xl'"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-800 text-lg mb-1">{{ feature.title }}</h3>
                                <p class="text-sm text-slate-500 leading-relaxed">{{ feature.description }}</p>
                            </div>
                        </div>
                    }
                </div>
            </section>

            <section class="bg-[#1e3a8a] text-white py-10 px-4 sm:px-6">
                <div class="max-w-7xl mx-auto grid grid-cols-12 gap-8 text-center">
                    @for (stat of dynamicStats(); track stat.label) {
                        <div class="col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col items-center gap-2">
                            <div class="flex items-center gap-3">
                                <i [class]="stat.icon + ' text-2xl opacity-80'"></i>
                                <span class="text-3xl font-extrabold">{{ stat.value }}</span>
                            </div>
                            <span class="text-sm opacity-80 font-medium">{{ stat.label }}</span>
                        </div>
                    }
                </div>
            </section>

            <section id="centres-section" class="max-w-7xl mx-auto px-4 sm:px-6 py-20 bg-slate-50">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-extrabold text-slate-900 mb-3">Nos centres d'hébergement</h2>
                    <p class="text-slate-500 max-w-2xl mx-auto">Des centres modernes et équipés pour le confort de tous les collaborateurs de la SONABEL.</p>
                </div>
                <div class="grid grid-cols-12 gap-6">
                    @for (centre of centres(); track centre.id) {
                        <div class="col-span-12 md:col-span-6 lg:col-span-4">
                            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col h-full group">
                                <div class="h-36 bg-gradient-to-br from-[#1e3a8a] to-[#00529B] flex flex-col items-center justify-center text-white p-4">
                                    <h4 class="text-xl font-extrabold text-center leading-tight">{{ centre.nom }}</h4>
                                    <p class="text-sm text-blue-200 mt-1"><i class="pi pi-map-marker mr-1"></i>{{ centre.ville }}</p>
                                    @if (centre.gerantTelephone) {
                                        <p class="text-xs text-blue-300 mt-2 flex items-center gap-1">
                                            <i class="pi pi-phone text-[10px]"></i> Gérant : {{ centre.gerantTelephone }}
                                        </p>
                                    }
                                </div>
                                <div class="p-5 flex flex-col gap-2 flex-grow">
                                    <div class="flex items-start justify-between gap-2">
                                    <h3 class="text-lg font-bold text-slate-800 leading-tight">{{ centre.nom }}</h3>
                                    <span class="text-primary font-bold text-sm shrink-0 whitespace-nowrap">{{ centre.ville }}</span>
                                </div>
                                    <div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <button routerLink="/auth/login" class="text-primary font-bold text-sm cursor-pointer hover:underline flex items-center gap-1">
                                            Réserver <i class="pi pi-arrow-right text-xs"></i>
                                        </button>
                                        <a [href]="'https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=' + (centre.latitude ?? 12.3714) + ',' + (centre.longitude ?? -1.5197)" target="_blank" class="text-primary text-xs font-bold cursor-pointer hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-primary/20">
                                            <i class="pi pi-map-marker text-[10px]"></i> Me localiser
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    } @empty {
                        <div class="col-span-12 text-center text-slate-400 py-8">
                            <i class="pi pi-spin pi-spinner text-2xl"></i>
                            <p class="mt-2">Chargement des centres...</p>
                        </div>
                    }
                </div>
            </section>

            <footer id="footer-section" class="bg-[#0f172a] text-slate-300 pt-14 pb-6 px-4 sm:px-6">
                <div class="max-w-7xl mx-auto grid grid-cols-12 gap-8 mb-10">
                    <div class="col-span-12 md:col-span-4 flex flex-col gap-4">
                        <div class="flex items-center gap-3">
                            <img src="/logo_cmt.jpg" alt="CMT" class="h-14 w-14 rounded-full object-cover border-2 border-white/20" />
                            <div>
                                <h4 class="font-bold text-white text-lg">CMT</h4>
                                <p class="text-xs text-slate-400">Caisse Mutuelle des Travailleurs</p>
                            </div>
                        </div>
                        <p class="text-sm text-slate-400">Votre confort, notre priorité.</p>
                    </div>
                    <div class="col-span-12 sm:col-span-6 md:col-span-2 flex flex-col gap-3">
                        <h5 class="text-white font-bold text-sm uppercase tracking-wider">Liens rapides</h5>
                        <ul class="flex flex-col gap-2 text-sm text-slate-400">
                            <li><a (click)="scrollToTop()" class="hover:text-white cursor-pointer">Accueil</a></li>
                            <li><a (click)="scrollToCentres()" class="hover:text-white cursor-pointer">Centres d'hébergement</a></li>
                            <li><a routerLink="/auth/login" class="hover:text-white cursor-pointer">Réservations</a></li>
                            <li><a (click)="scrollToFeatures()" class="hover:text-white cursor-pointer">À propos</a></li>
                            <li><a (click)="scrollToFooter()" class="hover:text-white cursor-pointer">Contact</a></li>
                        </ul>
                    </div>
                    <div class="col-span-12 sm:col-span-6 md:col-span-3 flex flex-col gap-3">
                        <h5 class="text-white font-bold text-sm uppercase tracking-wider">Contactez-nous</h5>
                        <ul class="flex flex-col gap-2 text-sm text-slate-400">
                            <li class="flex items-center gap-2"><i class="pi pi-phone text-primary"></i>+226 70 28 78 25</li>
                            <li class="flex items-center gap-2"><i class="pi pi-envelope text-primary"></i>cmt&#64;sonabel.bf</li>
                        </ul>
                    </div>
                </div>
                <div class="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
                    <p>© 2026 SONABEL - Tous droits réservés | CMT - Système de gestion des centres d'hébergement</p>
                </div>
            </footer>
        </div>
    `
})
export class Accueil implements OnInit, OnDestroy {
    private centreService = inject(CentreService);

    heroImage = '/immeuble_sonabel.jpg';
    dark = false;
    activeSection = 'home';
    private observer?: IntersectionObserver;

    centres = signal<Centre[]>([]);
    searchCentreId = '';
    dateArrivee = '';
    dateDepart = '';

    dynamicStats = signal<{ icon: string; value: string; label: string }[]>([
        { icon: 'pi pi-building', value: '0', label: 'Centres disponibles' },
        { icon: 'pi pi-th-large', value: '0', label: 'Chambres confortables' },
        { icon: 'pi pi-users', value: '+100', label: 'Clients satisfaits' },
        { icon: 'pi pi-clock', value: '24/7', label: 'Service disponible' }
    ]);

    private _ = effect(() => {
        const c = this.centres();
        this.dynamicStats.set([
            { icon: 'pi pi-building', value: String(c.length), label: 'Centres disponibles' },
            { icon: 'pi pi-th-large', value: String(c.reduce((s, x) => s + (x.nombreChambres ?? 0), 0)), label: 'Chambres confortables' },
            { icon: 'pi pi-users', value: '+100', label: 'Clients satisfaits' },
            { icon: 'pi pi-clock', value: '24/7', label: 'Service disponible' }
        ]);
    });

    readonly features = [
        { icon: 'pi pi-building', title: "Centres d'hébergement", description: 'Consultez la liste de tous nos centres disponibles' },
        { icon: 'pi pi-th-large', title: 'Chambres confortables', description: 'Chambres simples, doubles et suites adaptées à vos besoins' },
        { icon: 'pi pi-calendar-plus', title: 'Réservation en ligne', description: 'Réservez votre chambre rapidement et en toute sécurité' },
        { icon: 'pi pi-map-marker', title: 'Localisation GPS', description: 'Trouvez le centre le plus proche de votre localisation' },
        { icon: 'pi pi-shield', title: 'Paiement sécurisé', description: 'Payez vos réservations en ligne en toute sécurité' },
        { icon: 'pi pi-headphones', title: 'Support disponible', description: 'Notre équipe est disponible pour vous accompagner' }
    ];

    ngOnInit() {
        this.centreService.getAll().subscribe((c) => this.centres.set(c));
        this.observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    if (entry.target.id === 'features') this.activeSection = 'features';
                    else if (entry.target.id === 'centres-section') this.activeSection = 'centres';
                    else if (entry.target.id === 'footer-section') this.activeSection = 'footer';
                }
            }
        }, { threshold: 0.3 });
        ['features', 'centres-section', 'footer-section'].forEach(id => {
            const el = document.getElementById(id);
            if (el) this.observer!.observe(el);
        });
        window.addEventListener('scroll', this.onScroll);
    }

    private onScroll = () => {
        if (window.scrollY < 100) this.activeSection = 'home';
    };

    ngOnDestroy() {
        this.observer?.disconnect();
        window.removeEventListener('scroll', this.onScroll);
    }

    toggleDark() {
        this.dark = !this.dark;
        document.documentElement.classList.toggle('app-dark', this.dark);
    }

    rechercher() {
        const centre = this.centres().find((c) => String(c.id) === this.searchCentreId);
        this.centreService.getAll(centre?.ville || undefined).subscribe((c) => {
            this.centres.set(c);
            this.scrollToCentres();
        });
    }

    scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); this.activeSection = 'home'; }
    scrollToCentres() { document.getElementById('centres-section')?.scrollIntoView({ behavior: 'smooth' }); this.activeSection = 'centres'; }
    scrollToFeatures() { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); this.activeSection = 'features'; }
    scrollToFooter() { document.getElementById('footer-section')?.scrollIntoView({ behavior: 'smooth' }); this.activeSection = 'footer'; }
}
