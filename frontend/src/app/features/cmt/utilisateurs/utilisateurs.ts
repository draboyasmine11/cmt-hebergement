import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AvatarModule } from 'primeng/avatar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UtilisateurService } from '@/app/core/services/utilisateur.service';
import { CentreService } from '@/app/core/services/centre.service';
import { LoadingService } from '@/app/core/services/loading.service';
import {
    Centre,
    NiveauAcces,
    RoleType,
    Sexe,
    TypeClient,
    TypePieceIdentite,
    Utilisateur,
    UtilisateurForm
} from '@/app/core/models/cmt.models';
import { primaryRole } from '@/app/core/utils/role.util';

@Component({
    selector: 'app-utilisateurs',
    standalone: true,
    providers: [MessageService, ConfirmationService],
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, SelectModule, TagModule, ToastModule, ToolbarModule,
        ConfirmDialogModule, ToggleSwitchModule, AvatarModule, IconFieldModule, InputIconModule, TooltipModule
    ],
    template: `
        <p-toast />
        <p-confirmdialog />
        <div class="card min-h-full">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h2 class="text-2xl font-bold m-0">Gestion des utilisateurs</h2>
                    <p class="text-muted-color m-0 mt-1">Créer, modifier, activer ou désactiver les comptes</p>
                </div>
                <p-button label="Nouvel utilisateur" icon="pi pi-user-plus" (onClick)="openCreate()" [disabled]="loading.isLoading()" pTooltip="Créer un nouveau compte utilisateur" tooltipPosition="left" />
            </div>

            <div class="mb-4 flex flex-col sm:flex-row gap-3">
                <p-iconfield iconPosition="left" class="w-full md:w-96">
                    <p-inputicon class="pi pi-search" />
                    <input pInputText class="w-full" placeholder="Rechercher (nom, email, téléphone…)"
                        [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)"
                        (keyup.enter)="load()" />
                </p-iconfield>
                <p-button label="Rechercher" icon="pi pi-search" (onClick)="load()" [disabled]="loading.isLoading()" pTooltip="Lancer la recherche" tooltipPosition="top" />
            </div>

            <p-table [value]="filteredUtilisateurs()" [paginator]="true" [rows]="10" [rowHover]="true" styleClass="w-full">
                <ng-template #header>
                    <tr>
                        <th>Photo</th>
                        <th>Nom complet</th>
                        <th>Type</th>
                        <th>Téléphone</th>
                        <th>Email</th>
                        <th>Statut</th>
                        <th>Date création</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-u>
                    <tr>
                        <td>
                            @if (u.photoUrl) {
                                <img [src]="u.photoUrl" class="w-10 h-10 rounded-full object-cover" alt="" />
                            } @else {
                                <p-avatar [label]="initials(u)" shape="circle" />
                            }
                        </td>
                        <td class="font-medium">{{ u.prenom }} {{ u.nom }}</td>
                        <td><p-tag [value]="roleLabel(primaryRole(u.roles, u.typeUtilisateur))" /></td>
                        <td>{{ u.telephone || '—' }}</td>
                        <td>{{ u.email }}</td>
                        <td>
                            <p-tag [value]="u.actif ? 'Actif' : 'Inactif'" [severity]="u.actif ? 'success' : 'danger'" />
                        </td>
                        <td>{{ u.createdAt ? (u.createdAt | date:'dd/MM/yyyy') : '—' }}</td>
                        <td>
                            <div class="flex gap-1 flex-wrap">
                                <p-button icon="pi pi-eye" [rounded]="true" [text]="true" (onClick)="viewUser(u)" [disabled]="loading.isLoading()" pTooltip="Voir le détail" tooltipPosition="top" />
                                <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="openEdit(u)" [disabled]="loading.isLoading()" pTooltip="Modifier l'utilisateur" tooltipPosition="top" />
                                @if (u.actif) {
                                    <p-button icon="pi pi-ban" severity="warn" [rounded]="true" [text]="true" (onClick)="confirmDeactivate(u)" [disabled]="loading.isLoading()" pTooltip="Désactiver le compte" tooltipPosition="top" />
                                } @else {
                                    <p-button icon="pi pi-check" severity="success" [rounded]="true" [text]="true" (onClick)="activate(u)" [disabled]="loading.isLoading()" pTooltip="Activer le compte" tooltipPosition="top" />
                                }
                                <p-button icon="pi pi-key" [rounded]="true" [text]="true" (onClick)="confirmResetPassword(u)" [disabled]="loading.isLoading()" pTooltip="Réinitialiser le mot de passe" tooltipPosition="top" />
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Formulaire création / modification -->
        <p-dialog [(visible)]="formVisible" [header]="editMode ? 'Modifier utilisateur' : 'Nouvel utilisateur'"
            [modal]="true" [style]="{ width: '720px', maxWidth: '95vw' }" [appendTo]="'body'">
            <div class="flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-1">
                <section>
                    <h3 class="text-lg font-bold mb-3 text-primary">Informations générales</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <label class="block mb-2 font-semibold">Type utilisateur <span class="text-red-500">*</span></label>
                            <p-select [options]="typeOptions" [(ngModel)]="form.typeUtilisateur" optionLabel="label" optionValue="value"
                                class="w-full" appendTo="body" placeholder="Choisir…" (onChange)="onTypeChange()" />
                        </div>
                        <div>
                            <label class="block mb-2 font-semibold">Nom <span class="text-red-500">*</span></label>
                            <input pInputText class="w-full" [(ngModel)]="form.nom" />
                        </div>
                        <div>
                            <label class="block mb-2 font-semibold">Prénom <span class="text-red-500">*</span></label>
                            <input pInputText class="w-full" [(ngModel)]="form.prenom" />
                        </div>
                        <div>
                            <label class="block mb-2 font-semibold">Sexe <span class="text-red-500">*</span></label>
                            <p-select [options]="sexeOptions" [(ngModel)]="form.sexe" optionLabel="label" optionValue="value" class="w-full" appendTo="body" />
                        </div>
                        <div>
                            <label class="block mb-2 font-semibold">Téléphone <span class="text-red-500">*</span></label>
                            <input pInputText class="w-full" [(ngModel)]="form.telephone" />
                        </div>
                        <div class="md:col-span-2">
                            <label class="block mb-2 font-semibold">Email <span class="text-red-500">*</span></label>
                            <input pInputText type="email" class="w-full" [(ngModel)]="form.email" />
                        </div>
                        <div class="md:col-span-2">
                            <label class="block mb-2 font-semibold">Adresse</label>
                            <input pInputText class="w-full" [(ngModel)]="form.adresse" />
                        </div>
                        <div class="md:col-span-2">
                            <label class="block mb-2 font-semibold">Photo de profil <span class="text-slate-400 text-xs font-normal">(optionnel)</span></label>
                            <div class="flex items-center gap-3">
                                @if (photoPreview) {
                                    <img [src]="photoPreview" class="w-14 h-14 rounded-full object-cover border border-slate-200" alt="Aperçu" />
                                } @else if (form.photoUrl) {
                                    <img [src]="form.photoUrl" class="w-14 h-14 rounded-full object-cover border border-slate-200" alt="Photo" />
                                } @else {
                                    <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <i class="pi pi-user text-2xl"></i>
                                    </div>
                                }
                                <label class="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-sm font-semibold text-slate-600 transition-colors">
                                    <i class="pi pi-upload"></i> Choisir une photo
                                    <input type="file" accept="image/*" class="hidden" (change)="onPhotoChange($event)" />
                                </label>
                                @if (photoPreview || form.photoUrl) {
                                    <button type="button" (click)="removePhoto()" class="text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-0 text-xs">
                                        <i class="pi pi-trash"></i> Supprimer
                                    </button>
                                }
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 class="text-lg font-bold mb-3 text-primary">Mot de passe temporaire</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block mb-2 font-semibold">Mot de passe {{ editMode ? '(laisser vide pour ne pas changer)' : '*' }}</label>
                            <div class="relative">
                                <input [type]="showPwd ? 'text' : 'password'" pInputText class="w-full pr-10" [(ngModel)]="form.motDePasse" [placeholder]="editMode ? 'Laisser vide pour ne pas changer' : 'Min. 8 caractères'" />
                                <i [class]="showPwd ? 'pi pi-eye-slash' : 'pi pi-eye'" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600" (click)="showPwd = !showPwd"></i>
                            </div>
                        </div>
                        <div>
                            <label class="block mb-2 font-semibold">Confirmation</label>
                            <div class="relative">
                                <input [type]="showPwdConfirm ? 'text' : 'password'" pInputText class="w-full pr-10" [(ngModel)]="form.confirmationMotDePasse" />
                                <i [class]="showPwdConfirm ? 'pi pi-eye-slash' : 'pi pi-eye'" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600" (click)="showPwdConfirm = !showPwdConfirm"></i>
                            </div>
                        </div>
                        <div class="md:col-span-2">
                            <p-button label="Générer un mot de passe aléatoire" icon="pi pi-sync" [outlined]="true" (onClick)="genererMotDePasse()" pTooltip="Générer automatiquement un mot de passe sécurisé" tooltipPosition="top" />
                            <p class="text-xs text-slate-400 mt-2">Le mot de passe généré sera communiqué à l'utilisateur pour sa première connexion.</p>
                        </div>
                        <div class="md:col-span-2 flex items-center gap-3">
                            <label class="font-semibold">Compte actif</label>
                            <p-toggleswitch [(ngModel)]="form.actif" />
                        </div>
                    </div>
                </section>

                @if (isAdminType()) {
                    <section>
                        <h3 class="text-lg font-bold mb-3 text-primary">Champs administrateur</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label class="block mb-2 font-semibold">Matricule</label><input pInputText class="w-full" [(ngModel)]="form.matricule" /></div>
                            <div><label class="block mb-2 font-semibold">Fonction</label><input pInputText class="w-full" [(ngModel)]="form.fonction" /></div>
                            <div class="md:col-span-2">
                                <label class="block mb-2 font-semibold">Niveau d'accès</label>
                                <p-select [options]="niveauOptions" [(ngModel)]="form.niveauAcces" optionLabel="label" optionValue="value" class="w-full" appendTo="body" />
                            </div>
                        </div>
                    </section>
                }

                @if (isGerantType()) {
                    <section>
                        <h3 class="text-lg font-bold mb-3 text-primary">Champs gérant</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label class="block mb-2 font-semibold">Matricule</label><input pInputText class="w-full" [(ngModel)]="form.matricule" /></div>
                            <div><label class="block mb-2 font-semibold">Fonction</label><input pInputText class="w-full" [(ngModel)]="form.fonction" /></div>
                            <div class="md:col-span-2">
                                <label class="block mb-2 font-semibold">Centre géré <span class="text-red-500">*</span></label>
                                <p-select [options]="centres()" [(ngModel)]="form.centreId" optionLabel="nom" optionValue="id" class="w-full" appendTo="body" placeholder="Sélectionner un centre" />
                            </div>
                        </div>
                    </section>
                }

                @if (isClientType()) {
                    <section>
                        <h3 class="text-lg font-bold mb-3 text-primary">Champs client</h3>
                        <div class="mb-4">
                            <label class="block mb-2 font-semibold">Type client <span class="text-red-500">*</span></label>
                            <p-select [options]="typeClientOptions" [(ngModel)]="form.typeClient" optionLabel="label" optionValue="value" class="w-full" appendTo="body" />
                        </div>
                        @if (form.typeClient === 'AGENT_SONABEL') {
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label class="block mb-2 font-semibold">Matricule SONABEL <span class="text-red-500">*</span></label><input pInputText class="w-full" [(ngModel)]="form.matricule" placeholder="12345A" /></div>
                                <div><label class="block mb-2 font-semibold">Direction</label><input pInputText class="w-full" [(ngModel)]="form.direction" /></div>
                                <div><label class="block mb-2 font-semibold">Service</label><input pInputText class="w-full" [(ngModel)]="form.service" /></div>
                                <div><label class="block mb-2 font-semibold">Fonction</label><input pInputText class="w-full" [(ngModel)]="form.fonction" /></div>
                            </div>
                            <p class="text-sm text-orange-600 mt-2"><i class="pi pi-info-circle mr-1"></i> Un agent SONABEL reste inactif jusqu'à validation par le gérant.</p>
                        }
                        @if (form.typeClient === 'CLIENT_EXTERNE') {
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block mb-2 font-semibold">Type de pièce <span class="text-red-500">*</span></label>
                                    <p-select [options]="typePieceOptions" [(ngModel)]="form.typePiece" optionLabel="label" optionValue="value" class="w-full" appendTo="body" />
                                </div>
                                <div><label class="block mb-2 font-semibold">Numéro de pièce <span class="text-red-500">*</span></label><input pInputText class="w-full" [(ngModel)]="form.numeroPiece" /></div>
                                <div><label class="block mb-2 font-semibold">Nationalité</label><input pInputText class="w-full" [(ngModel)]="form.nationalite" /></div>
                                <div><label class="block mb-2 font-semibold">Profession</label><input pInputText class="w-full" [(ngModel)]="form.profession" /></div>
                            </div>
                        }
                    </section>
                }
            </div>
            <ng-template #footer>
                <p-button label="Annuler" [text]="true" (onClick)="formVisible = false" pTooltip="Fermer sans enregistrer" tooltipPosition="top" />
                <p-button label="Enregistrer" icon="pi pi-check" (onClick)="save()" [loading]="loading.isLoading()" [disabled]="loading.isLoading()" pTooltip="Enregistrer les informations" tooltipPosition="top" />
            </ng-template>
        </p-dialog>

        <!-- Détail utilisateur -->
        <p-dialog [(visible)]="viewVisible" header="Détail utilisateur" [modal]="true" [style]="{ width: '520px' }" [appendTo]="'body'">
            @if (selectedUser(); as u) {
                <div class="flex flex-col gap-3 text-sm">
                    <p><strong>Nom :</strong> {{ u.prenom }} {{ u.nom }}</p>
                    <p><strong>Type :</strong> {{ roleLabel(primaryRole(u.roles, u.typeUtilisateur)) }}</p>
                    <p><strong>Email :</strong> {{ u.email }}</p>
                    <p><strong>Username :</strong> {{ u.username || '—' }}</p>
                    <p><strong>Téléphone :</strong> {{ u.telephone || '—' }}</p>
                    <p><strong>Centre :</strong> {{ u.centreNom || '—' }}</p>
                    <p><strong>Statut :</strong> {{ u.actif ? 'Actif' : 'Inactif' }}</p>
                    @if (u.matricule) { <p><strong>Matricule :</strong> {{ u.matricule }}</p> }
                    @if (u.typeClient) { <p><strong>Type client :</strong> {{ u.typeClient === 'AGENT_SONABEL' ? 'Agent SONABEL' : 'Client externe' }}</p> }
                </div>
            }
        </p-dialog>
    `
})
export class Utilisateurs implements OnInit {
    loading = inject(LoadingService);
    private utilisateurService = inject(UtilisateurService);
    private centreService = inject(CentreService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private router = inject(Router);

    primaryRole = primaryRole;

    utilisateurs = signal<Utilisateur[]>([]);
    centres = signal<Centre[]>([]);
    selectedUser = signal<Utilisateur | null>(null);
    formVisible = false;
    viewVisible = false;
    editMode = false;
    selectedId?: number;
    searchQuery = signal('');
    form: UtilisateurForm = this.emptyForm();

    filteredUtilisateurs = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return this.utilisateurs();
        return this.utilisateurs().filter(u =>
            `${u.prenom} ${u.nom}`.toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.telephone || '').toLowerCase().includes(q) ||
            (u.username || '').toLowerCase().includes(q)
        );
    });

    typeOptions = [
        { label: 'Administrateur', value: 'ADMIN' as RoleType },
        { label: 'Gérant', value: 'GERANT' as RoleType },
        { label: 'Client', value: 'CLIENT' as RoleType }
    ];
    sexeOptions = [{ label: 'Masculin', value: 'M' as Sexe }, { label: 'Féminin', value: 'F' as Sexe }];
    typeClientOptions = [
        { label: 'Agent SONABEL', value: 'AGENT_SONABEL' as TypeClient },
        { label: 'Client externe', value: 'CLIENT_EXTERNE' as TypeClient }
    ];
    typePieceOptions = [
        { label: 'CNI', value: 'CNI' as TypePieceIdentite },
        { label: 'Passeport', value: 'PASSEPORT' as TypePieceIdentite },
        { label: 'Carte consulaire', value: 'CARTE_CONSULAIRE' as TypePieceIdentite },
        { label: 'Autre', value: 'AUTRE' as TypePieceIdentite }
    ];
    niveauOptions = [
        { label: 'Standard', value: 'STANDARD' as NiveauAcces },
        { label: 'Avancé', value: 'AVANCE' as NiveauAcces },
        { label: 'Complet', value: 'COMPLET' as NiveauAcces }
    ];

    isAdminType() { return this.form.typeUtilisateur === 'ADMIN'; }
    isGerantType() { return this.form.typeUtilisateur === 'GERANT'; }
    isClientType() { return this.form.typeUtilisateur === 'CLIENT'; }

    ngOnInit() {
        this.load();
        this.centreService.getAll().subscribe((c) => this.centres.set(c));
        this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.load());
    }

    load() {
        this.loading.run(this.utilisateurService.getAll(this.searchQuery() || undefined)).subscribe({
            next: (u) => this.utilisateurs.set(u),
            error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message || 'Chargement impossible' })
        });
    }

    roleLabel(r?: RoleType) {
        if (!r) return '—';
        if (r === 'ADMIN') return 'Administrateur';
        if (r === 'GERANT') return 'Gérant';
        return 'Client';
    }

    initials(u: Utilisateur) {
        return ((u.prenom?.[0] || '') + (u.nom?.[0] || '')).toUpperCase() || '?';
    }

    emptyForm(): UtilisateurForm {
        return { typeUtilisateur: 'CLIENT', sexe: 'M', actif: true, typeClient: 'CLIENT_EXTERNE', genererMotDePasse: false };
    }

    photoPreview: string | null = null;
    showPwd = false;
    showPwdConfirm = false;

    onPhotoChange(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.photoPreview = e.target?.result as string;
            this.form.photoUrl = this.photoPreview;
        };
        reader.readAsDataURL(file);
    }

    removePhoto() {
        this.photoPreview = null;
        this.form.photoUrl = undefined;
    }

    openCreate() {
        this.editMode = false;
        this.selectedId = undefined;
        this.form = this.emptyForm();
        this.photoPreview = null;
        this.formVisible = true;
    }

    openEdit(u: Utilisateur) {
        this.editMode = true;
        this.selectedId = u.id;
        this.form = {
            ...u,
            typeUtilisateur: u.typeUtilisateur || primaryRole(u.roles),
            motDePasse: '',
            confirmationMotDePasse: ''
        };
        this.photoPreview = null;
        this.formVisible = true;
    }

    viewUser(u: Utilisateur) {
        this.selectedUser.set(u);
        this.viewVisible = true;
    }

    onTypeChange() {
        if (this.form.typeUtilisateur !== 'GERANT') this.form.centreId = undefined;
        if (this.form.typeUtilisateur !== 'CLIENT') this.form.typeClient = undefined;
    }

    genererMotDePasse() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%';
        let pwd = '';
        for (let i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
        this.form.motDePasse = pwd;
        this.form.confirmationMotDePasse = pwd;
        this.form.genererMotDePasse = true;
        this.messageService.add({ severity: 'info', summary: 'Mot de passe généré', detail: 'Copiez-le avant d\'enregistrer.' });
    }

    save() {
        if (!this.validateForm()) return;
        const payload: UtilisateurForm = { ...this.form };
        if (this.editMode && !payload.motDePasse) {
            delete payload.motDePasse;
            delete payload.confirmationMotDePasse;
        }
        const obs = this.editMode && this.selectedId
            ? this.utilisateurService.update(this.selectedId, payload)
            : this.utilisateurService.create(payload);
        this.loading.run(obs).subscribe({
            next: (res) => {
                this.formVisible = false;
                this.load();
                const msg = res.motDePasseTemporaire
                    ? `Utilisateur enregistré. Mot de passe temporaire : ${res.motDePasseTemporaire}`
                    : 'Utilisateur enregistré avec succès.';
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: msg, life: 10000 });
            },
            error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message || e.error?.error || 'Enregistrement impossible' })
        });
    }

    validateForm(): boolean {
        const f = this.form;
        if (!f.typeUtilisateur || !f.nom?.trim() || !f.prenom?.trim() || !f.sexe || !f.telephone?.trim() || !f.email?.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Remplissez tous les champs obligatoires (type, nom, prénom, sexe, téléphone, email).' });
            return false;
        }
        // Auto-générer le username depuis l'email si absent
        if (!f.username?.trim()) {
            this.form.username = f.email!.split('@')[0];
        }
        if (!this.editMode && (!f.motDePasse || f.motDePasse.length < 8)) {
            this.messageService.add({ severity: 'warn', summary: 'Mot de passe', detail: 'Mot de passe obligatoire (min. 8 caractères) ou cliquez sur "Générer".' });
            return false;
        }
        if (f.motDePasse && f.motDePasse !== f.confirmationMotDePasse) {
            this.messageService.add({ severity: 'warn', summary: 'Mot de passe', detail: 'La confirmation ne correspond pas au mot de passe saisi.' });
            return false;
        }
        if (f.typeUtilisateur === 'GERANT' && !f.centreId) {
            this.messageService.add({ severity: 'warn', summary: 'Centre manquant', detail: 'Veuillez sélectionner le centre que ce gérant va administrer.' });
            return false;
        }
        if (f.typeUtilisateur === 'CLIENT' && !f.typeClient) {
            this.messageService.add({ severity: 'warn', summary: 'Type client', detail: 'Choisissez le type de client (Agent SONABEL ou Client externe).' });
            return false;
        }
        return true;
    }

    activate(u: Utilisateur) {
        this.loading.run(this.utilisateurService.activate(u.id)).subscribe({
            next: () => { this.load(); this.messageService.add({ severity: 'success', summary: 'Compte activé' }); },
            error: (e) => this.messageService.add({ severity: 'error', detail: e.error?.message })
        });
    }

    confirmDeactivate(u: Utilisateur) {
        this.confirmationService.confirm({
            message: `Désactiver le compte de ${u.prenom} ${u.nom} ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.loading.run(this.utilisateurService.deactivate(u.id)).subscribe({
                next: () => { this.load(); this.messageService.add({ severity: 'success', summary: 'Compte désactivé' }); },
                error: (e) => this.messageService.add({ severity: 'error', detail: e.error?.message })
            })
        });
    }

    confirmResetPassword(u: Utilisateur) {
        this.confirmationService.confirm({
            message: `Générer un nouveau mot de passe pour ${u.prenom} ${u.nom} ?`,
            header: 'Réinitialiser le mot de passe',
            icon: 'pi pi-key',
            accept: () => this.loading.run(this.utilisateurService.resetPassword(u.id, true)).subscribe({
                next: (res) => this.messageService.add({
                    severity: 'success', summary: 'Mot de passe réinitialisé',
                    detail: res.motDePasseTemporaire ? `Nouveau mot de passe : ${res.motDePasseTemporaire}` : 'Mot de passe mis à jour.',
                    life: 15000
                }),
                error: (e) => this.messageService.add({ severity: 'error', detail: e.error?.message })
            })
        });
    }
}
