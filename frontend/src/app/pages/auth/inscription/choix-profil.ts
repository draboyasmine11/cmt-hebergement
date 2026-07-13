import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-choix-profil',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="min-h-screen font-sans bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 sm:p-8">
            <div class="w-full max-w-5xl">
                <div class="text-center mb-10">
                    <div class="flex items-center justify-center gap-4 mb-4">
                        <img src="/logo_cmt.jpg" alt="CMT" class="h-16 w-16 rounded-full border-2 border-white shadow object-cover bg-white" />
                        <img src="/logo_sonabel.jpg" alt="SONABEL" class="h-12 w-auto object-contain" />
                    </div>
                    <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-800">Créer un compte</h1>
                    <p class="text-slate-500 mt-2 max-w-xl mx-auto">Choisissez votre profil pour bénéficier de tarifs adaptés à votre situation</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div (click)="choisir('agent')" class="group cursor-pointer bg-white rounded-2xl border-2 border-slate-100 hover:border-[#00529B] hover:shadow-xl transition-all p-6 sm:p-8 flex flex-col items-center text-center gap-4">
                        <div class="w-20 h-20 rounded-2xl bg-blue-50 group-hover:bg-[#00529B]/10 flex items-center justify-center transition-colors">
                            <i class="pi pi-briefcase text-3xl text-[#00529B]"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800">Agent SONABEL</h3>
                        <p class="text-sm text-slate-500 leading-relaxed">Vous êtes un employé actif de la SONABEL. Bénéficiez de tarifs préférentiels réservés aux agents.</p>
                        <ul class="text-xs text-left text-slate-400 space-y-1.5 w-full mt-2">
                            <li class="flex items-start gap-2"><i class="pi pi-check-circle text-green-500 mt-0.5"></i>Réduction importante sur les séjours</li>
                            <li class="flex items-start gap-2"><i class="pi pi-id-card text-[#00529B] mt-0.5"></i>Matricule SONABEL requis</li>
                            <li class="flex items-start gap-2"><i class="pi pi-clock text-amber-500 mt-0.5"></i>Validation par un gérant nécessaire</li>
                        </ul>
                    </div>

                    <div (click)="choisir('retraite')" class="group cursor-pointer bg-white rounded-2xl border-2 border-slate-100 hover:border-[#00529B] hover:shadow-xl transition-all p-6 sm:p-8 flex flex-col items-center text-center gap-4">
                        <div class="w-20 h-20 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                            <i class="pi pi-star text-3xl text-amber-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800">Retraité SONABEL</h3>
                        <p class="text-sm text-slate-500 leading-relaxed">Vous êtes un ancien employé de la SONABEL à la retraite. Profitez d'avantages exclusifs.</p>
                        <ul class="text-xs text-left text-slate-400 space-y-1.5 w-full mt-2">
                            <li class="flex items-start gap-2"><i class="pi pi-check-circle text-green-500 mt-0.5"></i>Réduction spéciale retraité</li>
                            <li class="flex items-start gap-2"><i class="pi pi-id-card text-[#00529B] mt-0.5"></i>Matricule + date de retraite requis</li>
                            <li class="flex items-start gap-2"><i class="pi pi-clock text-amber-500 mt-0.5"></i>Validation par un gérant nécessaire</li>
                        </ul>
                    </div>

                    <div (click)="choisir('externe')" class="group cursor-pointer bg-white rounded-2xl border-2 border-slate-100 hover:border-[#00529B] hover:shadow-xl transition-all p-6 sm:p-8 flex flex-col items-center text-center gap-4">
                        <div class="w-20 h-20 rounded-2xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                            <i class="pi pi-globe text-3xl text-green-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800">Client Externe</h3>
                        <p class="text-sm text-slate-500 leading-relaxed">Vous n'êtes pas employé SONABEL. Accédez à nos services aux tarifs standards.</p>
                        <ul class="text-xs text-left text-slate-400 space-y-1.5 w-full mt-2">
                            <li class="flex items-start gap-2"><i class="pi pi-check-circle text-green-500 mt-0.5"></i>Inscription sans matricule</li>
                            <li class="flex items-start gap-2"><i class="pi pi-credit-card text-[#00529B] mt-0.5"></i>Pièce d'identité requise</li>
                            <li class="flex items-start gap-2"><i class="pi pi-clock text-amber-500 mt-0.5"></i>Validation par un gérant nécessaire</li>
                        </ul>
                    </div>
                </div>

                <div class="text-center mt-8">
                    <a routerLink="/auth/login" class="text-sm text-[#00529B] hover:underline font-semibold cursor-pointer">
                        <i class="pi pi-arrow-left mr-1"></i> Retour à la connexion
                    </a>
                </div>
            </div>
        </div>
    `
})
export class ChoixProfil {
    choisir(profil: string) {
        const routes: Record<string, string> = {
            agent: '/auth/inscription/agent',
            retraite: '/auth/inscription/retraite',
            externe: '/auth/inscription/externe'
        };
        window.location.href = routes[profil];
    }
}
