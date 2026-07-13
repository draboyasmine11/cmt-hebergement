import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InscriptionService } from '@/app/core/services/inscription.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, ButtonModule, InputTextModule, PasswordModule, FormsModule, RouterModule, ToastModule],
    template: `
        <p-toast position="top-right" />
        <div class="min-h-screen font-sans flex flex-col lg:flex-row bg-[#f8fafc]">
            <!-- Panneau gauche : branding -->
            <div
                class="hidden lg:flex lg:w-1/2 relative bg-cover bg-center overflow-hidden"
                style="background-image: linear-gradient(135deg, rgba(0, 82, 155, 0.92) 0%, rgba(0, 42, 82, 0.96) 100%), url('/immeuble_sonabel.jpg')"
            >
                <div class="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full h-full">
                    <!-- Logos -->
                    <div class="flex items-center gap-4">
                        <img src="/logo_cmt.jpg" alt="Logo CMT" class="h-16 w-16 rounded-full border border-white/20 shadow-lg object-cover bg-white" />
                        <div class="flex items-center gap-3 border-l border-white/20 pl-4">
                            <img src="/logo_sonabel.jpg" alt="Logo SONABEL" class="h-12 w-auto object-contain brightness-110" />
                            <div class="text-white text-[10px] xl:text-[11px] font-bold leading-tight tracking-wider uppercase">
                                Société Nationale<br>d'Électricité<br>du Burkina
                            </div>
                        </div>
                    </div>

                    <!-- Welcome Text -->
                    <div class="my-auto py-12 flex flex-col gap-6">
                        <div class="flex flex-col gap-3">
                            <h1 class="text-4xl xl:text-5xl font-extrabold tracking-tight">
                                Rejoignez-nous !
                            </h1>
                            <p class="text-base xl:text-lg text-blue-100/90 leading-relaxed max-w-xl">
                                Créez votre compte en quelques secondes pour accéder aux services d'hébergement du CMT SONABEL.
                            </p>
                            <div class="w-16 h-1 bg-amber-400 rounded-full mt-2"></div>
                        </div>

                        <!-- Info Rôles -->
                        <div class="bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm max-w-lg mt-4">
                            <h4 class="font-bold text-white text-sm uppercase tracking-wider mb-2">Informations importantes :</h4>
                            <ul class="text-xs text-blue-100/90 list-disc pl-4 space-y-2 leading-relaxed">
                                <li><strong>Client simple</strong> : Inscription immédiate sans matricule. Accès direct aux réservations.</li>
                                <li><strong>Agent SONABEL (travailleurs)</strong> : Indiquez votre matricule pour bénéficier de tarifs préférentiels. L'accès sera opérationnel après confirmation par le gérant.</li>
                                <li>Le matricule doit comporter au maximum 5 chiffres suivis d'une lettre à la fin (ex: 12345A).</li>
                            </ul>
                        </div>
                    </div>

                    <div></div>
                </div>
            </div>

            <!-- Panneau droit : formulaire -->
            <div class="flex-1 flex flex-col justify-between bg-[#f4f6f9] px-6 py-8 sm:py-12 min-h-screen">
                <!-- Logos -->
                <div class="flex items-center justify-center gap-4 mb-6">
                    <img src="/logo_cmt.jpg" alt="Logo CMT" class="h-14 w-14 rounded-full border border-slate-200 shadow-sm object-cover bg-white" />
                    <div class="flex items-center gap-3 border-l border-slate-200 pl-4">
                        <img src="/logo_sonabel.jpg" alt="Logo SONABEL" class="h-10 w-auto object-contain" />
                        <div class="text-slate-700 text-[10px] font-bold leading-tight tracking-wider uppercase">Société Nationale<br>d'Électricité<br>du Burkina</div>
                    </div>
                </div>

                <div class="flex-grow flex items-center justify-center">
                    <div class="w-full max-w-[500px] bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100">
                        <div class="text-center mb-6">
                            <div class="w-14 h-14 rounded-2xl bg-[#00529B]/10 flex items-center justify-center text-[#00529B] mx-auto mb-3">
                                <i class="pi pi-user-plus text-2xl"></i>
                            </div>
                            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-800">Inscription</h2>
                            <p class="text-xs text-slate-500 mt-1">Créez votre compte client ou agent SONABEL</p>
                            <div class="w-10 h-0.5 bg-[#00529B] mx-auto mt-2"></div>
                        </div>

                        <form (ngSubmit)="register()" class="flex flex-col gap-4">
                            <div class="grid grid-cols-2 gap-4">
                                <!-- Prénom -->
                                <div class="flex flex-col gap-1.5">
                                    <label class="text-xs font-semibold text-slate-700">Prénom <span class="text-red-500">*</span></label>
                                    <input pInputText placeholder="Prénom" [(ngModel)]="prenom" name="prenom" required class="w-full py-2.5 text-sm rounded-xl" />
                                </div>
                                <!-- Nom -->
                                <div class="flex flex-col gap-1.5">
                                    <label class="text-xs font-semibold text-slate-700">Nom <span class="text-red-500">*</span></label>
                                    <input pInputText placeholder="Nom" [(ngModel)]="nom" name="nom" required class="w-full py-2.5 text-sm rounded-xl" />
                                </div>
                            </div>

                            <!-- Email -->
                            <div class="flex flex-col gap-1.5">
                                <label class="text-xs font-semibold text-slate-700">Adresse e-mail <span class="text-red-500">*</span></label>
                                <input pInputText type="email" placeholder="Entrez votre e-mail" [(ngModel)]="email" name="email" required class="w-full py-2.5 text-sm rounded-xl" />
                            </div>

                            <!-- Téléphone -->
                            <div class="flex flex-col gap-1.5">
                                <label class="text-xs font-semibold text-slate-700">Numéro de téléphone <span class="text-red-500">*</span></label>
                                <input pInputText type="tel" placeholder="Ex: +226 70 00 00 00" [(ngModel)]="telephone" name="telephone" required class="w-full py-2.5 text-sm rounded-xl" />
                            </div>

                            <!-- Matricule -->
                            <div class="flex flex-col gap-1.5">
                                <div class="flex justify-between items-center">
                                    <label class="text-xs font-semibold text-slate-700">Matricule SONABEL <span class="text-slate-400 font-normal">(optionnel)</span></label>
                                    <span class="text-[10px] text-slate-400 font-semibold uppercase">Pour les agents</span>
                                </div>
                                <input pInputText placeholder="Ex: 12345A" [(ngModel)]="matricule" name="matricule" class="w-full py-2.5 text-sm rounded-xl" />
                                <p class="text-[10px] text-slate-400 leading-normal">5 chiffres maximum suivis d'une lettre à la fin.</p>
                            </div>

                            <!-- Password -->
                            <div class="flex flex-col gap-1.5">
                                <label class="text-xs font-semibold text-slate-700">Mot de passe <span class="text-red-500">*</span></label>
                                <div class="relative">
                                    <input pInputText [type]="showPassword ? 'text' : 'password'" placeholder="Créez votre mot de passe" [(ngModel)]="password" name="password" required class="w-full py-2.5 pr-10 text-sm rounded-xl" />
                                    <i [class]="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600" (click)="showPassword = !showPassword"></i>
                                </div>
                            </div>

                            <!-- Submit button -->
                            <button
                                type="submit"
                                class="w-full bg-[#00529B] hover:bg-[#00407a] text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg cursor-pointer mt-2"
                                [disabled]="loading"
                            >
                                @if (loading) {
                                    <i class="pi pi-spin pi-spinner"></i>
                                }
                                S'inscrire
                            </button>
                        </form>

                        <div class="relative flex py-4 items-center">
                            <div class="flex-grow border-t border-slate-100"></div>
                            <span class="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">ou</span>
                            <div class="flex-grow border-t border-slate-100"></div>
                        </div>

                        <!-- Back to Login -->
                        <button
                            type="button"
                            routerLink="/auth/login"
                            class="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                            Déjà un compte ? Connectez-vous
                        </button>
                    </div>
                </div>

                <!-- Footer rights -->
                <div class="text-center text-xs text-slate-400 mt-8">
                    © 2026 CMT-SONABEL. Tous droits réservés.
                </div>
            </div>
        </div>
    `
})
export class Register {
    private inscriptionService = inject(InscriptionService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    nom = '';
    prenom = '';
    email = '';
    telephone = '';
    matricule = '';
    password = '';
    loading = false;
    showPassword = false;

    register() {
        if (!this.nom.trim() || !this.prenom.trim() || !this.email.trim() || !this.telephone.trim() || !this.password.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Veuillez remplir tous les champs obligatoires.' });
            return;
        }

        const trimmedMatricule = this.matricule.trim();
        if (trimmedMatricule) {
            // Validate matricule regex in frontend: max 5 digits + a letter at the end
            if (!/^\d{1,5}[A-Za-z]$/.test(trimmedMatricule)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Format invalide',
                    detail: 'Le matricule doit comporter au maximum 5 chiffres suivis d\'une lettre (ex: 12345A).'
                });
                return;
            }
        }

        this.loading = true;
        const payload = {
            nom: this.nom.trim(),
            prenom: this.prenom.trim(),
            email: this.email.trim(),
            telephone: this.telephone.trim(),
            matricule: trimmedMatricule ? trimmedMatricule : undefined,
            motDePasse: this.password.trim()
        };

        const obs = trimmedMatricule
            ? this.inscriptionService.inscrireAgent({
                nom: payload.nom, prenom: payload.prenom, sexe: 'M',
                telephone: payload.telephone, email: payload.email,
                matricule: trimmedMatricule,
                username: payload.email.split('@')[0], motDePasse: payload.motDePasse,
                fichierJustificatif: ''
              })
            : this.inscriptionService.inscrireExterne({
                nom: payload.nom, prenom: payload.prenom, sexe: 'M',
                dateNaissance: '', telephone: payload.telephone, email: payload.email,
                adresse: '', typePiece: 'CNI', numeroPiece: '',
                username: payload.email.split('@')[0], motDePasse: payload.motDePasse
              });

        obs.subscribe({
            next: () => {
                this.loading = false;
                if (trimmedMatricule) {
                    this.messageService.add({ severity: 'success', summary: 'Inscription réussie',
                        detail: 'Votre demande de compte agent SONABEL a été enregistrée. Elle sera active après validation par le gérant.', life: 10000 });
                } else {
                    this.messageService.add({ severity: 'success', summary: 'Inscription réussie',
                        detail: 'Votre compte client a été créé avec succès. Vous pouvez maintenant vous connecter.', life: 6000 });
                }
                setTimeout(() => this.router.navigate(['/auth/login']), trimmedMatricule ? 6000 : 3000);
            },
            error: (err: { error?: { message?: string } }) => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Échec de l\'inscription',
                    detail: err.error?.message || 'Une erreur est survenue lors de la création de votre compte.' });
            }
        });
    }
}
