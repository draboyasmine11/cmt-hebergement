import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SignalementService } from '@/app/core/services/signalement.service';

@Component({
    selector: 'app-aide',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, FormsModule, ToastModule],
    template: `
        <p-toast />
        <div class="flex flex-col gap-6 max-w-3xl mx-auto">

            <div>
                <h1 class="text-2xl font-bold text-slate-800">Centre d'aide</h1>
                <p class="text-slate-500 mt-1">Trouvez des réponses à vos questions ou contactez notre assistance.</p>
            </div>

            <div class="bg-[#00529B] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <p class="text-lg font-bold">Besoin d'aide immédiate ?</p>
                    <p class="text-blue-100 text-sm mt-1">Notre équipe est disponible du lundi au vendredi, 07h30 – 17h00</p>
                </div>
                <div class="flex flex-col sm:flex-row gap-3 shrink-0">
                    <a href="tel:+22670287825"
                       class="flex items-center gap-2 bg-white text-[#00529B] font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors">
                        <i class="pi pi-phone"></i> +226 70 28 78 25
                    </a>
                    <a href="mailto:assistance@cmt.bf"
                       class="flex items-center gap-2 bg-white/15 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-white/25 transition-colors border border-white/30">
                        <i class="pi pi-envelope"></i> assistance&#64;cmt.bf
                    </a>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 class="text-lg font-bold text-slate-800 mb-4">Guide d'utilisation</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    @for (step of steps; track step.num) {
                        <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div class="w-8 h-8 rounded-full bg-[#00529B] text-white flex items-center justify-center text-sm font-bold shrink-0">{{ step.num }}</div>
                            <div>
                                <p class="font-semibold text-slate-700 text-sm">{{ step.titre }}</p>
                                <p class="text-slate-500 text-xs mt-0.5">{{ step.desc }}</p>
                            </div>
                        </div>
                    }
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 class="text-lg font-bold text-slate-800 mb-4">Questions fréquentes</h2>
                <div class="flex flex-col gap-2">
                    @for (faq of faqs; track faq.q) {
                        <div class="border border-slate-100 rounded-xl overflow-hidden">
                            <button
                                class="w-full flex justify-between items-center p-4 text-left font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-sm cursor-pointer"
                                (click)="faq.open = !faq.open">
                                <span>{{ faq.q }}</span>
                                <i [class]="faq.open ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-slate-400 text-xs shrink-0 ml-2"></i>
                            </button>
                            @if (faq.open) {
                                <div class="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{{ faq.r }}</div>
                            }
                        </div>
                    }
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 class="text-lg font-bold text-slate-800 mb-4">Signaler un problème</h2>
                @if (envoye()) {
                    <div class="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold">
                        <i class="pi pi-check-circle text-lg"></i>
                        Votre message a bien été envoyé. Nous vous répondrons sous 24h.
                    </div>
                } @else {
                    <form (ngSubmit)="envoyer()" class="flex flex-col gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-sm font-semibold text-slate-700">Objet</label>
                            <select [(ngModel)]="objet" name="objet" required
                                class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#00529B]/20 focus:border-[#00529B]">
                                <option value="">-- Choisissez un objet --</option>
                                <option>Je n'arrive pas à me connecter</option>
                                <option>Ma réservation n'apparaît pas</option>
                                <option>J'ai oublié mon mot de passe</option>
                                <option>Problème de paiement</option>
                                <option>Autre</option>
                            </select>
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label class="text-sm font-semibold text-slate-700">Description du problème</label>
                            <textarea [(ngModel)]="description" name="description" rows="4" required
                                placeholder="Décrivez votre problème en détail..."
                                class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#00529B]/20 focus:border-[#00529B] resize-none"></textarea>
                        </div>
                        <button type="submit" [disabled]="loading()"
                            title="Envoyer votre signalement à l'assistance CMT"
                            class="self-start flex items-center gap-2 bg-[#00529B] hover:bg-[#00407a] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                            <i class="pi pi-send"></i> {{ loading() ? 'Envoi en cours…' : 'Envoyer' }}
                        </button>
                    </form>
                }
            </div>

        </div>
    `
})
export class Aide {
    private signalementService = inject(SignalementService);
    private messageService = inject(MessageService);

    objet = '';
    description = '';
    envoye = signal(false);
    loading = signal(false);

    steps = [
        { num: 1, titre: 'Cliquez sur "Faire une réservation"', desc: 'Dans le menu à gauche.' },
        { num: 2, titre: 'Choisissez vos dates', desc: 'Date d\'arrivée et date de départ.' },
        { num: 3, titre: 'Sélectionnez une chambre', desc: 'Cliquez sur "Réserver" sur la chambre de votre choix.' },
        { num: 4, titre: 'Attendez la validation', desc: 'Le gérant validera votre réservation rapidement.' },
    ];

    faqs = [
        { q: 'Comment faire une réservation ?', r: 'Allez dans "Faire une réservation", choisissez votre centre, vos dates, puis cliquez sur "Réserver" sur la chambre souhaitée.', open: false },
        { q: 'Comment annuler une réservation ?', r: 'Allez dans "Mes réservations", trouvez la réservation concernée et cliquez sur "Annuler".', open: false },
        { q: 'Comment consulter mes réservations ?', r: 'Cliquez sur "Mes réservations" dans le menu à gauche pour voir toutes vos réservations.', open: false },
        { q: 'Comment modifier mon profil ?', r: 'Cliquez sur "Mon profil" dans le menu, puis modifiez vos informations et enregistrez.', open: false },
        { q: 'J\'ai oublié mon mot de passe, que faire ?', r: 'Sur la page de connexion, cliquez sur "Mot de passe oublié ?" et suivez les instructions, ou contactez directement le secrétariat CMT.', open: false },
    ];

    envoyer() {
        if (!this.objet || !this.description) return;
        this.loading.set(true);
        this.signalementService.creer({ sujet: this.objet, description: this.description }).subscribe({
            next: () => {
                this.envoye.set(true);
                this.loading.set(false);
            },
            error: (e) => {
                this.loading.set(false);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message || 'Impossible d\'envoyer le signalement.' });
            }
        });
    }
}
