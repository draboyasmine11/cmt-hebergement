import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InscriptionService } from '@/app/core/services/inscription.service';

@Component({
    selector: 'app-inscription-externe',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, FormsModule, RouterModule, ToastModule],
    template: `
        <p-toast position="top-right" />
        <div class="min-h-screen font-sans bg-slate-50 py-6 sm:py-10 px-4">
            <div class="max-w-3xl mx-auto">
                <div class="flex items-center gap-3 mb-6">
                    <a routerLink="/auth/inscription" class="text-slate-400 hover:text-[#00529B] cursor-pointer"><i class="pi pi-arrow-left text-lg"></i></a>
                    <div>
                        <h1 class="text-2xl font-extrabold text-slate-800">Inscription Client Externe</h1>
                        <p class="text-sm text-slate-500">Remplissez tous les champs obligatoires pour créer votre compte</p>
                    </div>
                </div>

                <form (ngSubmit)="soumettre()" class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-8">
                    <div>
                        <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4"><i class="pi pi-user text-green-600"></i>Informations personnelles</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1">Nom <span class="text-red-500">*</span></label>
                                <input type="text" [(ngModel)]="nom" name="nom" required placeholder="Votre nom" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm" />
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1">Prénom <span class="text-red-500">*</span></label>
                                <input type="text" [(ngModel)]="prenom" name="prenom" required placeholder="Votre prénom" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm" />
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1">Sexe <span class="text-red-500">*</span></label>
                                <select [(ngModel)]="sexe" name="sexe" required class="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm">
                                    <option value="" disabled selected>-- Sélectionner --</option>
                                    <option value="M">Masculin</option>
                                    <option value="F">Féminin</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1">Téléphone <span class="text-red-500">*</span></label>
                                <input type="tel" [(ngModel)]="telephone" name="telephone" required placeholder="+226 XX XX XX XX" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm" />
                            </div>
                            <div class="sm:col-span-2">
                                <label class="block text-sm font-semibold text-slate-700 mb-1">Adresse <span class="text-red-500">*</span></label>
                                <input type="text" [(ngModel)]="adresse" name="adresse" required placeholder="Votre adresse complète" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm" />
                            </div>
                            <div class="sm:col-span-2">
                                <label class="block text-sm font-semibold text-slate-700 mb-1">Email <span class="text-red-500">*</span></label>
                                <input type="email" [(ngModel)]="email" name="email" required placeholder="Votre adresse email" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4"><i class="pi pi-credit-card text-green-600"></i>Identification</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1">Type de pièce <span class="text-red-500">*</span></label>
                                <select [(ngModel)]="typePiece" name="typePiece" required class="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm">
                                    <option value="" disabled selected>-- Sélectionner --</option>
                                    <option value="CNI">CNIB</option>
                                    <option value="PASSEPORT">Passeport</option>
                                    <option value="CARTE_CONSULAIRE">Carte Consulaire</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1">Numéro de pièce <span class="text-red-500">*</span></label>
                                <input type="text" [(ngModel)]="numeroPiece" name="numeroPiece" required placeholder="Numéro du document" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm" />
                            </div>
                            @if (typePiece === 'CNI') {
                                <div class="sm:col-span-2">
                                    <label class="block text-sm font-semibold text-slate-700 mb-1">Date d'émission de la CNIB <span class="text-red-500">*</span></label>
                                    <input type="date" [(ngModel)]="dateEmissionCnib" name="dateEmissionCnib" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm" />
                                </div>
                            }
                        </div>
                    </div>

                    <div>
                        <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4"><i class="pi pi-lock text-green-600"></i>Informations de connexion</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1">Mot de passe <span class="text-red-500">*</span></label>
                                <div class="relative">
                                    <input [type]="showPwd ? 'text' : 'password'" [(ngModel)]="motDePasse" name="motDePasse" required minlength="6" placeholder="Minimum 6 caractères" class="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm" />
                                    <i [class]="showPwd ? 'pi pi-eye-slash' : 'pi pi-eye'" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" (click)="showPwd = !showPwd"></i>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1">Confirmation <span class="text-red-500">*</span></label>
                                <div class="relative">
                                    <input [type]="showConfirm ? 'text' : 'password'" [(ngModel)]="confirmation" name="confirmation" required placeholder="Confirmez le mot de passe" class="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm" />
                                    <i [class]="showConfirm ? 'pi pi-eye-slash' : 'pi pi-eye'" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" (click)="showConfirm = !showConfirm"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4"><i class="pi pi-file text-green-600"></i>Pièce justificative</h2>
                        <p class="text-sm text-slate-500 mb-3">Veuillez fournir votre CNIB, passeport ou carte consulaire (PDF, Word, image).</p>
                        <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" (change)="onFileChange($event)"
                            class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" />
                        @if (fichierUpload) {
                            <p class="text-xs text-green-600 mt-1"><i class="pi pi-check-circle mr-1"></i>{{ fichierUpload.name }}</p>
                        }
                    </div>

                    <button type="submit" [disabled]="loading" class="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg cursor-pointer">
                        @if (loading) { <i class="pi pi-spin pi-spinner"></i> }
                        Créer mon compte
                    </button>

                    <div class="text-center text-xs text-slate-400">
                        Déjà un compte ? <a routerLink="/auth/login" class="text-green-600 font-semibold hover:underline cursor-pointer">Connectez-vous</a>
                    </div>
                </form>
            </div>
        </div>
    `
})
export class InscriptionExterne {
    private inscriptionService = inject(InscriptionService);
    private messageService = inject(MessageService);
    private router = inject(Router);

    nom = '';
    prenom = '';
    sexe = '';
    telephone = '';
    email = '';
    adresse = '';
    typePiece = '';
    numeroPiece = '';
    dateEmissionCnib = '';
    motDePasse = '';
    confirmation = '';
    fichierUpload: File | null = null;
    loading = false;
    showPwd = false;
    showConfirm = false;

    onFileChange(event: any) {
        this.fichierUpload = event.target.files?.[0] ?? null;
    }

    soumettre() {
        const vides: string[] = [];
        if (!this.nom) vides.push('Nom');
        if (!this.prenom) vides.push('Prénom');
        if (!this.sexe) vides.push('Sexe');
        if (!this.telephone) vides.push('Téléphone');
        if (!this.email) vides.push('Email');
        if (!this.adresse) vides.push('Adresse');
        if (!this.typePiece) vides.push('Type de pièce');
        if (!this.numeroPiece) vides.push('Numéro de pièce');
        if (this.typePiece === 'CNI' && !this.dateEmissionCnib) vides.push("Date d'émission CNIB");
        if (!this.motDePasse) vides.push('Mot de passe');
        if (!this.confirmation) vides.push('Confirmation');
        if (vides.length > 0) {
            this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Manquant(s) : ' + vides.join(', '), life: 6000 });
            return;
        }
        if (this.motDePasse !== this.confirmation) {
            this.messageService.add({ severity: 'warn', summary: 'Mots de passe différents', detail: 'La confirmation ne correspond pas.' });
            return;
        }

        const doInscription = (filename: string) => {
            this.inscriptionService.inscrireExterne({
                nom: this.nom, prenom: this.prenom, sexe: this.sexe,
                telephone: this.telephone, email: this.email,
                adresse: this.adresse,
                typePiece: this.typePiece, numeroPiece: this.numeroPiece,
                dateEmissionCnib: this.typePiece === 'CNI' ? this.dateEmissionCnib : undefined,
                motDePasse: this.motDePasse, fichierJustificatif: filename
            }).subscribe({
                next: () => {
                    this.loading = false;
                    this.messageService.add({ severity: 'success', summary: 'Inscription réussie', detail: 'Votre compte sera actif après validation. Vous recevrez une notification.' });
                    setTimeout(() => this.router.navigate(['/auth/login']), 4000);
                },
                error: (err) => {
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: 'Échec', detail: err.error?.message || `Erreur ${err.status}` });
                }
            });
        };

        this.loading = true;
        if (this.fichierUpload) {
            this.inscriptionService.uploadFile(this.fichierUpload).subscribe({
                next: (res) => doInscription(res.filename),
                error: (err) => {
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: 'Échec upload', detail: `Erreur ${err.status} : ${err.error?.message || err.message || 'upload impossible'}` });
                }
            });
        } else {
            doInscription('');
        }
    }
}
