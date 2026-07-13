import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '@/app/core/services/auth.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-profil',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, FormsModule, ToastModule, TooltipModule],
    template: `
        <p-toast />
        <div class="flex flex-col gap-6 max-w-2xl">
            <div>
                <h1 class="text-2xl font-extrabold text-slate-800">Mon profil</h1>
                <p class="text-sm text-slate-500 mt-1">Gérez vos informations personnelles et votre mot de passe.</p>
            </div>

            <!-- Avatar + photo upload -->
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5">
                <div class="relative shrink-0">
                    @if (photoUrl) {
                        <img [src]="photoUrl" alt="Photo de profil" class="w-20 h-20 rounded-full object-cover border-2 border-[#00529B]/20" />
                    } @else {
                        <div class="w-20 h-20 rounded-full bg-[#00529B]/10 text-[#00529B] font-extrabold flex items-center justify-center text-2xl border-2 border-[#00529B]/20">
                            {{ auth.user()?.prenom?.charAt(0) || 'U' }}{{ auth.user()?.nom?.charAt(0) || '' }}
                        </div>
                    }
                    <label class="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#00529B] text-white flex items-center justify-center cursor-pointer hover:bg-[#00407a] shadow-md border-2 border-white" title="Changer la photo">
                        <i class="pi pi-camera text-[11px]"></i>
                        <input type="file" accept="image/*" class="hidden" (change)="onPhotoChange($event)" />
                    </label>
                </div>
                <div>
                    <p class="text-lg font-extrabold text-slate-800">{{ auth.user()?.prenom }} {{ auth.user()?.nom }}</p>
                    <p class="text-sm text-slate-500">{{ auth.user()?.email }}</p>
                    <span class="mt-1 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                        @if (auth.isAdmin()) { Super administrateur }
                        @else if (auth.isGerant()) { Gérant de centre }
                        @else { Collaborateur }
                    </span>
                    @if (photoUrl) {
                        <button (click)="removePhoto()" pTooltip="Supprimer la photo de profil" tooltipPosition="right" class="mt-2 flex items-center gap-1 text-[10px] text-red-500 hover:underline cursor-pointer bg-transparent border-0">
                            <i class="pi pi-trash text-[10px]"></i> Supprimer la photo
                        </button>
                    }
                </div>
            </div>

            <!-- Informations personnelles -->
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
                <h2 class="font-extrabold text-slate-800 flex items-center gap-2"><i class="pi pi-user text-[#00529B]"></i> Informations personnelles</h2>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-slate-500">Prénom</label>
                        <input [(ngModel)]="form.prenom" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-slate-500">Nom</label>
                        <input [(ngModel)]="form.nom" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20" />
                    </div>
                    <div class="col-span-2 flex flex-col gap-1">
                        <label class="text-xs font-bold text-slate-500">Adresse e-mail</label>
                        <input [(ngModel)]="form.email" type="email" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-slate-500">Téléphone</label>
                        <input [(ngModel)]="form.telephone" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20" />
                    </div>
                </div>
                <div class="flex justify-end">
                    <button (click)="saveProfil()" pTooltip="Enregistrer vos informations personnelles" tooltipPosition="left" class="px-5 py-2.5 rounded-xl bg-[#00529B] hover:bg-[#00407a] text-white text-sm font-bold cursor-pointer">
                        Enregistrer les modifications
                    </button>
                </div>
            </div>

            <!-- Changer mot de passe -->
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
                <h2 class="font-extrabold text-slate-800 flex items-center gap-2"><i class="pi pi-lock text-[#00529B]"></i> Changer le mot de passe</h2>
                <div class="flex flex-col gap-3">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-slate-500">Mot de passe actuel</label>
                        <input [(ngModel)]="pwd.actuel" type="password" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-slate-500">Nouveau mot de passe</label>
                        <input [(ngModel)]="pwd.nouveau" type="password" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-slate-500">Confirmer le nouveau mot de passe</label>
                        <input [(ngModel)]="pwd.confirm" type="password" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20" />
                    </div>
                </div>
                <div class="flex justify-end">
                    <button (click)="changePwd()" pTooltip="Mettre à jour votre mot de passe" tooltipPosition="left" class="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-sm font-bold cursor-pointer">
                        Mettre à jour le mot de passe
                    </button>
                </div>
            </div>

            <!-- Déconnexion -->
            <div class="flex justify-end">
                <button (click)="auth.logout()" pTooltip="Vous déconnecter de l'application" tooltipPosition="left" class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold cursor-pointer bg-white">
                    <i class="pi pi-sign-out"></i> Se déconnecter
                </button>
            </div>
        </div>
    `
})
export class Profil {
    auth = inject(AuthService);
    private messageService = inject(MessageService);

    photoUrl: string | null = null;

    constructor() {
        const id = this.auth.user()?.id ?? '';
        this.photoUrl = localStorage.getItem('cmt_photo_' + id);
    }

    form = {
        prenom: this.auth.user()?.prenom || '',
        nom: this.auth.user()?.nom || '',
        email: this.auth.user()?.email || '',
        telephone: ''
    };

    pwd = { actuel: '', nouveau: '', confirm: '' };

    onPhotoChange(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.photoUrl = e.target?.result as string;
            localStorage.setItem('cmt_photo_' + this.auth.user()?.id, this.photoUrl);
            this.messageService.add({ severity: 'success', summary: 'Photo mise à jour', life: 3000 });
        };
        reader.readAsDataURL(file);
    }

    removePhoto() {
        this.photoUrl = null;
        localStorage.removeItem('cmt_photo_' + this.auth.user()?.id);
    }

    saveProfil() {
        this.messageService.add({ severity: 'success', summary: 'Profil mis à jour', detail: 'Vos informations ont été enregistrées.', life: 3000 });
    }

    changePwd() {
        if (!this.pwd.actuel || !this.pwd.nouveau) {
            this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Veuillez remplir tous les champs.', life: 3000 });
            return;
        }
        if (this.pwd.nouveau !== this.pwd.confirm) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Les mots de passe ne correspondent pas.', life: 3000 });
            return;
        }
        this.messageService.add({ severity: 'success', summary: 'Mot de passe modifié', detail: 'Votre mot de passe a été mis à jour.', life: 3000 });
        this.pwd = { actuel: '', nouveau: '', confirm: '' };
    }
}
