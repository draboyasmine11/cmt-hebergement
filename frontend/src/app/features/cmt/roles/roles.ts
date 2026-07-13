import { Component, OnInit, inject, signal, computed, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RoleService } from '@/app/core/services/role.service';
import { PermissionService } from '@/app/core/services/permission.service';
import { LoadingService } from '@/app/core/services/loading.service';
import { Role, Permission, RoleForm } from '@/app/core/models/cmt.models';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-roles',
    standalone: true,
    providers: [MessageService, ConfirmationService],
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, TextareaModule, TagModule, ToastModule,
        ConfirmDialogModule, SelectModule, TabsModule, CheckboxModule, TooltipModule
    ],
    template: `
        <p-toast />
        <p-confirmdialog />

        <div class="flex flex-col gap-6">
            <div>
                <h1 class="text-2xl font-extrabold text-slate-800">Rôles & Permissions</h1>
                <p class="text-sm text-slate-500 mt-1">Gestion des rôles et des droits d'accès dans le système CMT-SONABEL.</p>
            </div>

            <p-tabs value="0">
                    <p-tablist>
                        <p-tab value="0"><i class="pi pi-shield mr-2"></i>Gestion des rôles</p-tab>
                        <p-tab value="1"><i class="pi pi-lock mr-2"></i>Gestion des permissions</p-tab>
                    </p-tablist>
                    <p-tabpanels>
                    <p-tabpanel value="0">
                        <div class="pt-4">
                            <div class="flex justify-end mb-4">
                                <p-button label="Nouveau rôle" icon="pi pi-plus" (onClick)="openCreateRole()" [disabled]="loading.isLoading()" pTooltip="Créer un nouveau rôle" tooltipPosition="left" />
                            </div>
                            <p-table [value]="roles()" [paginator]="true" [rows]="10" [rowHover]="true" styleClass="w-full">
                                <ng-template #header>
                                    <tr>
                                        <th>Nom du rôle</th>
                                        <th>Description</th>
                                        <th>Utilisateurs</th>
                                        <th>Date création</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </ng-template>
                                <ng-template #body let-r>
                                    <tr>
                                        <td class="font-semibold">{{ r.nom }}</td>
                                        <td>{{ r.description || '—' }}</td>
                                        <td><p-tag [value]="r.nombreUtilisateurs + ''" severity="info" /></td>
                                        <td>{{ r.createdAt ? (r.createdAt | date:'dd/MM/yyyy') : '—' }}</td>
                                        <td>
                                            <p-tag [value]="r.actif ? 'Actif' : 'Inactif'" [severity]="r.actif ? 'success' : 'danger'" />
                                        </td>
                                        <td>
                                            <div class="flex gap-1">
                                                <p-button icon="pi pi-eye" [rounded]="true" [text]="true" (onClick)="viewRole(r)" pTooltip="Voir le détail du rôle" tooltipPosition="top" />
                                                <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="openEditRole(r)" pTooltip="Modifier le rôle" tooltipPosition="top" />
                                                @if (r.nom !== 'ADMIN') {
                                                    <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [text]="true" (onClick)="confirmDeleteRole(r)" pTooltip="Supprimer le rôle" tooltipPosition="top" />
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                </ng-template>
                                <ng-template #emptymessage>
                                    <tr><td colspan="6" class="text-center py-8 text-slate-400">Aucun rôle défini</td></tr>
                                </ng-template>
                            </p-table>
                        </div>
                    </p-tabpanel>
                    <p-tabpanel value="1">
                        <div class="pt-4">
                            <div class="mb-4">
                                <label class="block mb-2 font-semibold">Sélectionner un rôle</label>
                                <p-select [options]="roles()" [(ngModel)]="selectedRoleId" optionLabel="nom" optionValue="id"
                                    class="w-full md:w-96" placeholder="Choisir un rôle..." appendTo="body" (onChange)="loadPermissionsForRole()" />
                            </div>
                            @if (selectedRoleId != null) {
                                @if (rolePermissions().length > 0) {
                                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                        <div class="flex items-center justify-between mb-4">
                                            <h3 class="text-lg font-bold text-slate-800">Permissions du rôle : <span class="text-[#00529B]">{{ selectedRoleNom() }}</span></h3>
                                            <p-button label="Enregistrer" icon="pi pi-check" (onClick)="savePermissions()" [loading]="loading.isLoading()" [disabled]="loading.isLoading()" pTooltip="Sauvegarder les permissions du rôle" tooltipPosition="left" />
                                        </div>
                                        @for (module of modules(); track module) {
                                            <div class="mb-6 last:mb-0">
                                                <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">{{ module }}</h4>
                                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    @for (perm of groupedPermissions()[module]; track perm.id) {
                                                        <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                            <p-checkbox [inputId]="'perm-' + perm.id" [binary]="true"
                                                                [(ngModel)]="perm.checked" />
                                                            <label [for]="'perm-' + perm.id" class="text-sm font-medium text-slate-700 cursor-pointer">{{ perm.libelle }}</label>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        }
                                    </div>
                                }
                            } @else {
                                <div class="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100">
                                    <i class="pi pi-lock text-4xl mb-3 block"></i>
                                    <p>Sélectionnez un rôle pour gérer ses permissions</p>
                                </div>
                            }
                            @if (errorPermissionMessage) {
                                <div class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm mt-4">
                                    <i class="pi pi-exclamation-triangle shrink-0"></i> {{ errorPermissionMessage }}
                                </div>
                            }
                        </div>
                    </p-tabpanel>
                    </p-tabpanels>
            </p-tabs>
        </div>

        <!-- Dialog Création / Modification Rôle -->
        <p-dialog [(visible)]="roleDialogVisible" [header]="editRoleMode ? 'Modifier le rôle' : 'Nouveau rôle'"
            [modal]="true" [style]="{ width: '500px', maxWidth: '95vw' }" [appendTo]="'body'">
            <div class="flex flex-col gap-4 pt-2">
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-bold text-slate-700">Nom du rôle <span class="text-red-500">*</span></label>
                    <input pInputText class="w-full" [(ngModel)]="roleForm.nom" placeholder="Ex: COMPTABLE" [disabled]="editRoleMode" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-bold text-slate-700">Description</label>
                    <textarea pTextarea class="w-full" [(ngModel)]="roleForm.description" rows="3" placeholder="Description du rôle..."></textarea>
                </div>
                <div class="flex items-center gap-3">
                    <p-checkbox [binary]="true" [(ngModel)]="roleActif" inputId="role-actif" />
                    <label for="role-actif" class="font-semibold">Rôle actif</label>
                </div>
                @if (errorRoleMessage) {
                    <div class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                        <i class="pi pi-exclamation-triangle shrink-0"></i> {{ errorRoleMessage }}
                    </div>
                }
            </div>
            <ng-template #footer>
                <p-button label="Annuler" [text]="true" (onClick)="roleDialogVisible = false" pTooltip="Fermer sans enregistrer" tooltipPosition="top" />
                <p-button label="Enregistrer" icon="pi pi-check" (onClick)="saveRole()" [loading]="loading.isLoading()" [disabled]="loading.isLoading()" pTooltip="Enregistrer le rôle" tooltipPosition="top" />
            </ng-template>
        </p-dialog>

        <!-- Dialog Détail Rôle -->
        <p-dialog [(visible)]="viewRoleDialogVisible" header="Détail du rôle" [modal]="true" [style]="{ width: '520px' }" [appendTo]="'body'">
            @if (selectedRole(); as r) {
                <div class="flex flex-col gap-3 text-sm">
                    <p><strong>Nom :</strong> {{ r.nom }}</p>
                    <p><strong>Description :</strong> {{ r.description || '—' }}</p>
                    <p><strong>Statut :</strong> {{ r.actif ? 'Actif' : 'Inactif' }}</p>
                    <p><strong>Utilisateurs :</strong> {{ r.nombreUtilisateurs }}</p>
                    <p><strong>Créé le :</strong> {{ r.createdAt ? (r.createdAt | date:'dd/MM/yyyy') : '—' }}</p>
                    @if (r.permissions.length) {
                        <div class="border-t border-slate-100 pt-3 mt-1">
                            <p class="font-bold mb-2">Permissions ({{ r.permissions.length }}) :</p>
                            <div class="flex flex-wrap gap-2">
                                @for (p of r.permissions; track p.id) {
                                    <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">{{ p.libelle }}</span>
                                }
                            </div>
                        </div>
                    }
                </div>
            }
        </p-dialog>
    `
})
export class Roles implements OnInit {
    loading = inject(LoadingService);
    private roleService = inject(RoleService);
    private permissionService = inject(PermissionService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    roles = signal<Role[]>([]);
    allPermissions = signal<Permission[]>([]);
    selectedRole = signal<Role | null>(null);
    selectedRoleId: number | null = null;
    roleDialogVisible = false;
    viewRoleDialogVisible = false;
    editRoleMode = false;
    editingRoleId?: number;
    errorRoleMessage = '';
    errorPermissionMessage = '';

    roleForm: RoleForm = { nom: '', description: '', actif: true };
    roleActif = true;
    rolePermissions = signal<Permission[]>([]);

    selectedRoleNom = computed(() => {
        const r = this.roles().find(x => x.id === this.selectedRoleId);
        return r?.nom || '';
    });

    modules = computed(() => {
        const perms = this.allPermissions();
        return [...new Set(perms.map(p => p.module))].sort();
    });

    groupedPermissions = computed(() => {
        const perms = this.allPermissions();
        const grouped: Record<string, (Permission & { checked: boolean })[]> = {};
        const checkedIds = new Set(this.rolePermissions().map(p => p.id));
        for (const perm of perms) {
            if (!grouped[perm.module]) grouped[perm.module] = [];
            grouped[perm.module].push({ ...perm, checked: checkedIds.has(perm.id) });
        }
        return grouped;
    });

    ngOnInit() {
        this.loadRoles();
        this.loadPermissions();
        this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
            this.loadRoles();
            this.loadPermissions();
        });
    }

    loadRoles() {
        this.loading.run(this.roleService.getAll()).subscribe({
            next: (data) => { this.roles.set(data); this.cdr.markForCheck(); },
            error: (e) => { this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message || 'Chargement impossible' }); this.cdr.markForCheck(); }
        });
    }

    loadPermissions() {
        this.permissionService.getAll().subscribe({
            next: (data) => { this.allPermissions.set(data); this.cdr.markForCheck(); },
            error: () => {}
        });
    }

    loadPermissionsForRole() {
        if (this.selectedRoleId == null) {
            this.rolePermissions.set([]);
            this.cdr.markForCheck();
            return;
        }
        this.errorPermissionMessage = '';
        const role = this.roles().find(r => r.id === this.selectedRoleId);
        if (role) {
            this.rolePermissions.set(role.permissions ?? []);
            this.cdr.markForCheck();
        } else {
            this.loading.run(this.roleService.getById(this.selectedRoleId)).subscribe({
                next: (r) => { this.rolePermissions.set(r.permissions || []); this.cdr.markForCheck(); },
                error: () => { this.rolePermissions.set([]); this.cdr.markForCheck(); }
            });
        }
    }

    openCreateRole() {
        this.editRoleMode = false;
        this.editingRoleId = undefined;
        this.roleForm = { nom: '', description: '', actif: true };
        this.roleActif = true;
        this.errorRoleMessage = '';
        this.roleDialogVisible = true;
    }

    openEditRole(r: Role) {
        this.editRoleMode = true;
        this.editingRoleId = r.id;
        this.roleForm = { nom: r.nom, description: r.description || '', actif: r.actif };
        this.roleActif = r.actif;
        this.errorRoleMessage = '';
        this.roleDialogVisible = true;
    }

    viewRole(r: Role) {
        this.selectedRole.set(r);
        this.viewRoleDialogVisible = true;
    }

    saveRole() {
        this.errorRoleMessage = '';
        if (!this.roleForm.nom?.trim()) {
            this.errorRoleMessage = 'Le nom du rôle est obligatoire.';
            return;
        }
        this.roleForm.actif = this.roleActif;
        const obs = this.editRoleMode && this.editingRoleId
            ? this.roleService.update(this.editingRoleId, this.roleForm)
            : this.roleService.create(this.roleForm);
        this.loading.run(obs).subscribe({
            next: () => {
                this.roleDialogVisible = false;
                this.loadRoles();
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Rôle enregistré avec succès.' });
            },
            error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message })
        });
    }

    confirmDeleteRole(r: Role) {
        this.confirmationService.confirm({
            message: `Supprimer le rôle "${r.nom}" ? Cette action est irréversible.`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.loading.run(this.roleService.delete(r.id)).subscribe({
                    next: () => {
                        this.loadRoles();
                        this.messageService.add({ severity: 'success', summary: 'Supprimé', detail: 'Rôle supprimé avec succès.' });
                    },
                    error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message })
                });
            }
        });
    }

    savePermissions() {
        if (this.selectedRoleId == null) return;
        this.errorPermissionMessage = '';
        const checkedIds: number[] = [];
        for (const perms of Object.values(this.groupedPermissions())) {
            for (const p of perms) {
                if (p.checked) checkedIds.push(p.id);
            }
        }
        const form: RoleForm = { permissionIds: checkedIds };
        this.loading.run(this.roleService.update(this.selectedRoleId, form)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Permissions mises à jour', detail: 'Les permissions ont été enregistrées.' });
                this.loadRoles();
                this.loadPermissionsForRole();
            },
            error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message })
        });
    }
}
