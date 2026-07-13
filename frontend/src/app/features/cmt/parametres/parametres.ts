import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-parametres',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="flex flex-col gap-6">
            <div>
                <h1 class="text-2xl font-extrabold text-slate-800">À propos</h1>
                <p class="text-sm text-slate-500 mt-1">Informations générales sur l'application et la structure.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Informations sur l'application -->
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
                    <h2 class="font-extrabold text-slate-800 flex items-center gap-2">
                        <i class="pi pi-info-circle text-[#00529B]"></i> Informations sur l'application
                    </h2>
                    <div class="flex flex-col gap-4">
                        <div class="flex flex-col gap-0.5">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Nom de l'application</span>
                            <p class="text-sm font-bold text-slate-800">Système de gestion des centres d'hébergement de la CMT</p>
                        </div>
                        <div class="flex flex-col gap-0.5">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Version</span>
                            <p class="text-sm font-bold text-slate-800">1.0.0</p>
                        </div>
                        <div class="flex flex-col gap-0.5">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Date de mise en service</span>
                            <p class="text-sm font-bold text-slate-800">30/06/2026</p>
                        </div>
                        <div class="flex flex-col gap-0.5">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</span>
                            <p class="text-sm text-slate-600 leading-relaxed">Application web de gestion des réservations, paiements et centres d'hébergement de la Caisse Mutuelle des Travailleurs de la SONABEL.</p>
                        </div>
                    </div>
                </div>

                <!-- Informations sur la structure -->
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
                    <h2 class="font-extrabold text-slate-800 flex items-center gap-2">
                        <i class="pi pi-building text-[#00529B]"></i> Informations sur la structure
                    </h2>
                    <div class="flex flex-col gap-4">
                        <div class="flex flex-col gap-0.5">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Organisme</span>
                            <p class="text-sm font-bold text-slate-800">SONABEL — Société Nationale d'Électricité du Burkina</p>
                        </div>
                        <div class="flex flex-col gap-0.5">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Structure bénéficiaire</span>
                            <p class="text-sm font-bold text-slate-800">CMT — Caisse Mutuelle des Travailleurs</p>
                        </div>
                        <div class="flex flex-col gap-0.5">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</span>
                            <div class="flex flex-col gap-1 mt-0.5">
                                <a href="mailto:cmt@sonabel.bf" class="text-sm font-bold text-[#00529B] flex items-center gap-1.5 hover:underline">
                                    <i class="pi pi-envelope text-xs"></i> cmt&#64;sonabel.bf
                                </a>
                                <a href="tel:+22670287825" class="text-sm font-bold text-[#00529B] flex items-center gap-1.5 hover:underline">
                                    <i class="pi pi-phone text-xs"></i> +226 70 28 78 25
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Parametres {}
