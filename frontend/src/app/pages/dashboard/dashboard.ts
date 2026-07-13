import { Component, OnInit, OnDestroy, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '@/app/core/services/auth.service';
import { CentreActifService } from '@/app/core/services/centre-actif.service';
import { ReservationService } from '@/app/core/services/reservation.service';
import { ChambreService } from '@/app/core/services/chambre.service';
import { CentreService } from '@/app/core/services/centre.service';
import { UtilisateurService } from '@/app/core/services/utilisateur.service';
import { StatistiquesService } from '@/app/core/services/statistiques.service';
import { PaiementService } from '@/app/core/services/paiement.service';
import { Statistiques, Utilisateur } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, RouterModule, ChartModule, ToastModule],
    template: `
        <p-toast position="top-right" />

        @if (auth.isAdmin()) {
            <div class="flex flex-col gap-6 font-sans text-slate-800">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-800">Tableau de bord Administrateur</h1>
                        <p class="text-sm text-slate-500 mt-1">Vue d'ensemble du système CMT-SONABEL.</p>
                    </div>
                    <div class="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm self-start md:self-auto">
                        <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <i class="pi pi-calendar-plus"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date actuelle</span>
                            <span class="text-xs font-extrabold text-slate-700">{{ currentDate }}</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-10 gap-5">
                    <div class="col-span-10 sm:col-span-5 lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <i class="pi pi-users text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Utilisateurs</span>
                            <span class="text-xl font-extrabold text-slate-800 mt-0.5">{{ totalUtilisateurs() }}</span>
                        </div>
                    </div>
                    <div class="col-span-10 sm:col-span-5 lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                            <i class="pi pi-user text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clients</span>
                            <span class="text-xl font-extrabold text-slate-800 mt-0.5">{{ totalClients() }}</span>
                        </div>
                    </div>
                    <div class="col-span-10 sm:col-span-5 lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                            <i class="pi pi-user-edit text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gérants</span>
                            <span class="text-xl font-extrabold text-slate-800 mt-0.5">{{ totalGerants() }}</span>
                        </div>
                    </div>
                    <div class="col-span-10 sm:col-span-5 lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                            <i class="pi pi-building text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Centres</span>
                            <span class="text-xl font-extrabold text-slate-800 mt-0.5">{{ stats()?.totalCentres ?? 0 }}</span>
                        </div>
                    </div>
                    <div class="col-span-10 sm:col-span-5 lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#00529B] shrink-0">
                            <i class="pi pi-calendar text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Réservations (Total)</span>
                            <span class="text-xl font-extrabold text-slate-800 mt-0.5">{{ totalReservations() }}</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-12 xl:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 class="font-extrabold text-slate-800 text-lg mb-6">Évolution des réservations</h3>
                        @if (reservationsParMois.length > 0) {
                            <div class="h-80"><p-chart type="line" [data]="adminLineData" [options]="lineOptions"></p-chart></div>
                        } @else {
                            <div class="h-80 flex items-center justify-center text-slate-400 text-sm">Aucune donnée de réservation pour le moment.</div>
                        }
                    </div>
                    <div class="col-span-12 xl:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <h3 class="font-extrabold text-slate-800 text-lg mb-4">Statistiques des centres</h3>
                        @if ((stats()?.reservationsParCentre?.length ?? 0) > 0) {
                            <div class="h-48 flex items-center justify-center">
                                <p-chart type="doughnut" [data]="adminDonutData" [options]="donutOptions" class="w-full max-w-[200px]"></p-chart>
                            </div>
                            <div class="text-[10px] text-center text-slate-400 font-semibold border-t border-slate-50 pt-4 mt-2">
                                Répartition par centre.
                            </div>
                        } @else {
                            <div class="h-48 flex items-center justify-center text-slate-400 text-sm">Aucun centre configuré.</div>
                            <div class="text-[10px] text-center text-slate-400 font-semibold border-t border-slate-50 pt-4 mt-2">
                                Ajoutez des centres pour voir les statistiques.
                            </div>
                        }
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-12 md:col-span-6 xl:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <h3 class="font-extrabold text-slate-800 text-base mb-4">Taux d'occupation moyen</h3>
                        <div class="flex flex-col items-center justify-center pt-2">
                            <div class="relative w-48 h-24 overflow-hidden">
                                <svg class="w-full h-full" viewBox="0 0 100 50">
                                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f1f5f9" stroke-width="8" stroke-linecap="round"/>
                                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#00529B" stroke-width="8" stroke-linecap="round"
                                          stroke-dasharray="125.6"                                           [attr.stroke-dashoffset]="125.6 - (125.6 * (stats()?.tauxOccupation ?? 0) / 100)"/>
                                </svg>
                                <div class="absolute bottom-0 inset-x-0 flex flex-col items-center justify-center">
                                    <span class="text-3xl font-extrabold text-slate-800">{{ (stats()?.tauxOccupation ?? 0) | number:'1.0-0' }}%</span>
                                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Taux d'occupation</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-[10px] text-center text-slate-400 font-semibold border-t border-slate-50 pt-4 mt-2">
                            @if ((stats()?.totalCentres ?? 0) > 0) {
                                Mesuré sur l'ensemble des {{ stats()?.totalCentres }} centres du réseau.
                            } @else {
                                Aucune donnée d'occupation disponible.
                            }
                        </div>
                    </div>

                    <div class="col-span-12 md:col-span-6 xl:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <h3 class="font-extrabold text-slate-800 text-base mb-4">Revenus</h3>
                        <div class="flex flex-col items-center justify-center pt-1">
                            <span class="text-4xl font-extrabold text-slate-800">{{ (stats()?.revenusGeneres ?? 0) | number }} FCFA</span>
                            <span class="text-sm text-slate-500 mt-1">Total cumulé</span>
                        </div>
                        @if ((stats()?.revenusParCentre?.length ?? 0) > 0) {
                            <div class="mt-4 flex flex-col gap-1.5 text-xs">
                                <span class="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Par centre</span>
                                @for (r of stats()?.revenusParCentre; track $index) {
                                    <div class="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-50">
                                        <span class="font-semibold text-slate-700">{{ r.nom }}</span>
                                        <span class="font-extrabold text-slate-800">{{ r.montant | number }} FCFA</span>
                                    </div>
                                }
                            </div>
                        }
                        <div class="text-[10px] text-center text-slate-400 font-semibold border-t border-slate-50 pt-3 mt-3">
                            @if ((stats()?.revenusGeneres ?? 0) > 0) {
                                Revenus générés par l'ensemble des réservations.
                            } @else {
                                Aucun revenu enregistré pour le moment.
                            }
                        </div>
                    </div>

                    <div class="col-span-12 xl:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 class="font-extrabold text-slate-800 text-base mb-4">Actions rapides</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <a routerLink="/cmt/utilisateurs" class="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all shadow-sm hover:shadow-md bg-white">
                                <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <i class="pi pi-user-plus text-base"></i>
                                </div>
                                <span class="text-xs font-bold text-slate-700 text-center">Gérer les<br>utilisateurs</span>
                            </a>
                            <a routerLink="/cmt/centres" class="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all shadow-sm hover:shadow-md bg-white">
                                <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <i class="pi pi-building text-base"></i>
                                </div>
                                <span class="text-xs font-bold text-slate-700 text-center">Gérer les<br>centres</span>
                            </a>
                            <a routerLink="/cmt/chambres" class="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-slate-100 hover:border-purple-100 hover:bg-purple-50/20 transition-all shadow-sm hover:shadow-md bg-white">
                                <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                    <i class="pi pi-home text-base"></i>
                                </div>
                                <span class="text-xs font-bold text-slate-700 text-center">Gérer les<br>chambres</span>
                            </a>
                            <a routerLink="/cmt/rapports" class="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-slate-100 hover:border-amber-100 hover:bg-amber-50/20 transition-all shadow-sm hover:shadow-md bg-white">
                                <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                    <i class="pi pi-file-pdf text-base"></i>
                                </div>
                                <span class="text-xs font-bold text-slate-700 text-center">Générer un<br>rapport</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        }

        @else if (auth.isGerant()) {
            <div class="flex flex-col gap-6 font-sans text-slate-800">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
                            Bonjour {{ auth.user()?.prenom || '' }} {{ auth.user()?.nom || '' }}
                        </h1>
                        <p class="text-sm text-slate-500 mt-1">Centre : <span class="font-bold text-[#00529B]">{{ nomCentre() }}</span></p>
                    </div>
                    <div class="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm self-start md:self-auto">
                        <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <i class="pi pi-calendar-plus"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date actuelle</span>
                            <span class="text-xs font-extrabold text-slate-700">{{ currentDate }}</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-10 gap-5">
                    <div class="col-span-10 sm:col-span-5 lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <i class="pi pi-home text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total chambres</span>
                            <span class="text-xl font-extrabold text-slate-800 mt-0.5">{{ totalChambres() }}</span>
                        </div>
                    </div>
                    <div class="col-span-10 sm:col-span-5 lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                            <i class="pi pi-check-circle text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chambres dispo.</span>
                            <span class="text-xl font-extrabold text-slate-800 mt-0.5">{{ chambresDisponibles() }}</span>
                            <span class="text-[10px] font-bold text-emerald-600 mt-0.5">{{ totalChambres() > 0 ? ((chambresDisponibles() / totalChambres()) * 100 | number:'1.0-0') + '% disponibles' : '-' }}</span>
                        </div>
                    </div>
                    <div class="col-span-10 sm:col-span-5 lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                            <i class="pi pi-home text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chambres occupées</span>
                            <span class="text-xl font-extrabold text-slate-800 mt-0.5">{{ chambresOccupees() }}</span>
                            <span class="text-[10px] font-bold text-amber-600 mt-0.5">{{ totalChambres() > 0 ? ((chambresOccupees() / totalChambres()) * 100 | number:'1.0-0') + '% occupées' : '-' }}</span>
                        </div>
                    </div>
                    <div class="col-span-10 sm:col-span-5 lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                            <i class="pi pi-calendar text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Réservations aujourd'hui</span>
                            <span class="text-xl font-extrabold text-slate-800 mt-0.5">{{ reservationsAujourdhui() }}</span>
                            <span class="text-[10px] font-bold text-slate-400 mt-0.5">Arrivées du jour</span>
                        </div>
                    </div>
                    <div class="col-span-10 sm:col-span-5 lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                            <i class="pi pi-clock text-xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">En attente</span>
                            <span class="text-xl font-extrabold text-slate-800 mt-0.5">{{ reservationsEnAttente() }}</span>
                            <span class="text-[10px] font-bold text-red-600 mt-0.5">{{ reservationsEnAttente() > 0 ? 'À traiter' : 'Aucune en attente' }}</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-12 xl:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 class="font-extrabold text-slate-800 text-lg mb-4">Réservations en attente de validation</h3>
                        @if (reservationsEnAttenteListe().length > 0) {
                            <div class="overflow-x-auto">
                                <table class="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr class="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                                            <th class="py-3 px-2">Réf.</th>
                                            <th class="py-3 px-2">Client</th>
                                            <th class="py-3 px-2">Chambre</th>
                                            <th class="py-3 px-2">Arrivée</th>
                                            <th class="py-3 px-2">Départ</th>
                                            <th class="py-3 px-2 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="text-slate-600 font-semibold divide-y divide-slate-50">
                                        @for (r of reservationsEnAttenteListe(); track r.id) {
                                            <tr>
                                                <td class="py-3 px-2 text-primary font-bold">#{{ r.id }}</td>
                                                <td class="py-3 px-2 text-slate-800">{{ r.utilisateurNom || '' }}</td>
                                                <td class="py-3 px-2">{{ r.chambreNumero || '-' }}</td>
                                                <td class="py-3 px-2">{{ r.dateArrivee | date:'dd/MM/yyyy' }}</td>
                                                <td class="py-3 px-2">{{ r.dateDepart | date:'dd/MM/yyyy' }}</td>
                                                <td class="py-3 px-2">
                                                    <div class="flex items-center justify-center gap-1.5">
                                                        <button class="w-6 h-6 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-100/50 cursor-pointer" title="Valider"><i class="pi pi-check text-[10px]"></i></button>
                                                        <button class="w-6 h-6 rounded-md bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center border border-red-100/50 cursor-pointer" title="Refuser"><i class="pi pi-times text-[10px]"></i></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                            <a routerLink="/cmt/reservations" class="block w-full text-center text-xs font-bold text-[#00529B] bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors py-2.5 rounded-xl mt-4 cursor-pointer">
                                Voir toutes les réservations en attente
                            </a>
                        } @else {
                            <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                                <i class="pi pi-check-circle text-4xl text-emerald-300 mb-3"></i>
                                <p class="text-sm font-semibold">Aucune réservation en attente</p>
                                <p class="text-xs mt-1">Toutes les réservations sont traitées.</p>
                            </div>
                        }
                    </div>

                    <div class="col-span-12 xl:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <h3 class="font-extrabold text-slate-800 text-base mb-4">Taux d'occupation</h3>
                        @if (totalChambres() > 0) {
                            <div class="h-56"><p-chart type="line" [data]="gerantLineData" [options]="gerantLineOptions"></p-chart></div>
                            <div class="text-[10px] text-slate-400 font-semibold text-center border-t border-slate-50 pt-3 mt-2">
                                Taux d'occupation : <span class="text-slate-700 font-extrabold">{{ totalChambres() > 0 ? ((chambresOccupees() / totalChambres()) * 100 | number:'1.0-0') : 0 }}%</span>
                            </div>
                        } @else {
                            <div class="h-56 flex items-center justify-center text-slate-400 text-sm">Aucune chambre configurée.</div>
                            <div class="text-[10px] text-slate-400 font-semibold text-center border-t border-slate-50 pt-3 mt-2">
                                Aucune donnée d'occupation disponible.
                            </div>
                        }
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-12 md:col-span-6 xl:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <h3 class="font-extrabold text-slate-800 text-base mb-4">État des chambres</h3>
                        @if (totalChambres() > 0) {
                            <div class="h-44 flex items-center justify-center">
                                <p-chart type="doughnut" [data]="gerantRoomStatusData" [options]="donutOptions" class="w-full max-w-[170px]"></p-chart>
                            </div>
                            <div class="flex flex-col gap-2 mt-4 text-[10px] font-semibold text-slate-600 border-t border-slate-50 pt-4">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>Disponible</div>
                                    <span class="font-extrabold text-slate-800">{{ chambresDisponibles() }} ({{ totalChambres() > 0 ? ((chambresDisponibles() / totalChambres()) * 100 | number:'1.0-0') : 0 }}%)</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>Occupée</div>
                                    <span class="font-extrabold text-slate-800">{{ chambresOccupees() }} ({{ totalChambres() > 0 ? ((chambresOccupees() / totalChambres()) * 100 | number:'1.0-0') : 0 }}%)</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>Maintenance</div>
                                    <span class="font-extrabold text-slate-800">{{ chambresMaintenance() }} ({{ totalChambres() > 0 ? ((chambresMaintenance() / totalChambres()) * 100 | number:'1.0-0') : 0 }}%)</span>
                                </div>
                            </div>
                        } @else {
                            <div class="h-44 flex items-center justify-center text-slate-400 text-sm">Aucune chambre.</div>
                            <div class="flex flex-col gap-2 mt-4 text-[10px] font-semibold text-slate-600 border-t border-slate-50 pt-4">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-[#e5e7eb]"></div>Disponible</div>
                                    <span class="font-extrabold text-slate-400">0</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-[#e5e7eb]"></div>Occupée</div>
                                    <span class="font-extrabold text-slate-400">0</span>
                                </div>
                            </div>
                        }
                    </div>

                    <div class="col-span-12 md:col-span-6 xl:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <h3 class="font-extrabold text-slate-800 text-base mb-4">Répartition par type de chambre</h3>
                        @if (totalChambres() > 0) {
                            <div class="h-44 flex items-center justify-center">
                                <p-chart type="doughnut" [data]="gerantRoomTypeData" [options]="donutOptions" class="w-full max-w-[170px]"></p-chart>
                            </div>
                            <div class="text-[10px] text-center text-slate-400 font-semibold border-t border-slate-50 pt-4 mt-2">
                                Répartition des {{ totalChambres() }} chambres par type.
                            </div>
                        } @else {
                            <div class="h-44 flex items-center justify-center text-slate-400 text-sm">Aucune chambre configurée.</div>
                            <div class="text-[10px] text-center text-slate-400 font-semibold border-t border-slate-50 pt-4 mt-2">
                                Ajoutez des chambres pour voir la répartition.
                            </div>
                        }
                    </div>

                    <div class="col-span-12 xl:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <h3 class="font-extrabold text-slate-800 text-base mb-4">Derniers paiements enregistrés</h3>
                        @if (derniersPaiements().length > 0) {
                            <div class="flex flex-col divide-y divide-slate-50 text-xs text-slate-600">
                                @for (p of derniersPaiements(); track p.id) {
                                    <div class="py-3 flex items-center justify-between gap-3">
                                        <div class="flex flex-col">
                                            <span class="font-bold text-slate-800">#{{ p.id }}</span>
                                            <span class="text-[10px] text-slate-400">{{ p.modePaiement }}</span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <span class="font-extrabold text-slate-800">{{ p.montant | number }} FCFA</span>
                                        </div>
                                    </div>
                                }
                            </div>
                        } @else {
                            <div class="flex flex-col items-center justify-center py-8 text-slate-400">
                                <i class="pi pi-wallet text-3xl text-slate-300 mb-2"></i>
                                <p class="text-sm font-semibold">Aucun paiement enregistré</p>
                                <p class="text-xs mt-1">Les paiements apparaîtront ici.</p>
                            </div>
                        }
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 class="font-extrabold text-slate-800 text-base mb-4">Actions rapides</h3>
                    <div class="flex flex-wrap gap-3">
                        <a routerLink="/cmt/reservations" class="flex-grow flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-100 hover:bg-emerald-50/20 text-emerald-700 font-bold text-xs transition-all bg-white">
                            <i class="pi pi-check-circle"></i>
                            Valider une réservation
                        </a>
                        <a routerLink="/cmt/occupation" class="flex-grow flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-blue-100 hover:bg-blue-50/20 text-blue-700 font-bold text-xs transition-all bg-white">
                            <i class="pi pi-building"></i>
                            Voir l'occupation
                        </a>
                        <a routerLink="/cmt/encaissements" class="flex-grow flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-100 hover:bg-emerald-50/20 text-emerald-700 font-bold text-xs transition-all bg-white">
                            <i class="pi pi-wallet"></i>
                            Enregistrer un paiement
                        </a>
                        <a routerLink="/cmt/sejours" class="flex-grow flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-purple-100 hover:bg-purple-50/20 text-purple-700 font-bold text-xs transition-all bg-white">
                            <i class="pi pi-clock"></i>
                            Gérer les séjours
                        </a>
                    </div>
                </div>
            </div>
        }

        @else {
            <div class="flex flex-col gap-6 font-sans text-slate-800">
                @if (auth.user()?.statutCompte === 'EN_ATTENTE') {
                    <div class="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold">
                        <i class="pi pi-info-circle text-amber-600 text-lg shrink-0"></i>
                        <span>Votre compte est en attente de validation par un gérant. Certaines fonctionnalités sont temporairement limitées.</span>
                    </div>
                }
                @if (auth.user()?.statutCompte === 'REJETE') {
                    <div class="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">
                        <i class="pi pi-exclamation-triangle text-red-600 text-lg shrink-0"></i>
                        <span>Votre compte a été rejeté. Motif : {{ auth.user()?.motifRejet || 'Non spécifié' }}</span>
                    </div>
                }

                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
                            Bonjour {{ auth.user()?.prenom }} {{ auth.user()?.nom }}
                        </h1>
                        <p class="text-sm text-slate-500 mt-1">Bienvenue sur votre espace client CMT-SONABEL.</p>
                    </div>
                    <div class="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm self-start">
                        <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <i class="pi pi-calendar"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs font-extrabold text-slate-700">{{ currentDate }}</span>
                            <span class="text-[10px] text-slate-400">{{ currentTime }}</span>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 class="font-extrabold text-slate-800 text-base mb-4">Actions rapides</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <a routerLink="/cmt/reserver" class="flex items-center gap-4 p-4 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 transition-colors">
                            <div class="w-14 h-14 rounded-xl bg-[#00529B] flex items-center justify-center text-white shrink-0">
                                <i class="pi pi-calendar-plus text-2xl"></i>
                            </div>
                            <div class="flex flex-col">
                                <span class="font-extrabold text-slate-800 text-sm">Faire une réservation</span>
                                <span class="text-xs text-slate-500 mt-0.5">Réservez une chambre dans un centre.</span>
                                <i class="pi pi-arrow-right text-[#00529B] text-xs mt-1"></i>
                            </div>
                        </a>
                        <a routerLink="/cmt/reservations" class="flex items-center gap-4 p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 transition-colors">
                            <div class="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                                <i class="pi pi-list text-2xl"></i>
                            </div>
                            <div class="flex flex-col">
                                <span class="font-extrabold text-slate-800 text-sm">Mes réservations</span>
                                <span class="text-xs text-slate-500 mt-0.5">Consultez vos réservations.</span>
                                <i class="pi pi-arrow-right text-emerald-600 text-xs mt-1"></i>
                            </div>
                        </a>
                        <a routerLink="/cmt/mes-sejours" class="flex items-center gap-4 p-4 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50 transition-colors">
                            <div class="w-14 h-14 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
                                <i class="pi pi-clock text-2xl"></i>
                            </div>
                            <div class="flex flex-col">
                                <span class="font-extrabold text-slate-800 text-sm">Mes séjours</span>
                                <span class="text-xs text-slate-500 mt-0.5">Consultez l'historique de vos séjours.</span>
                                <i class="pi pi-arrow-right text-amber-600 text-xs mt-1"></i>
                            </div>
                        </a>
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-12 xl:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="font-extrabold text-slate-800 text-base">Mes réservations</h2>
                            <a routerLink="/cmt/reservations" class="text-xs font-bold text-[#00529B] hover:underline flex items-center gap-1">Voir toutes <i class="pi pi-arrow-right text-[10px]"></i></a>
                        </div>
                        @if (mesReservations().length > 0) {
                            <div class="flex flex-col gap-4">
                                @for (r of mesReservations(); track r.id) {
                                    <div class="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                        <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" [class]="r.statut === 'VALIDEE' ? 'bg-emerald-50 text-emerald-600' : r.statut === 'EN_ATTENTE' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'">
                                            <i class="pi pi-home text-lg"></i>
                                        </div>
                                        <div class="flex-grow">
                                            <div class="flex items-center justify-between">
                                                <span class="font-extrabold text-[#00529B] text-sm">#{{ r.id }}</span>
                                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border" [class]="r.statut === 'VALIDEE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : r.statut === 'EN_ATTENTE' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'">{{ statutLabel(r.statut) }}</span>
                                            </div>
                                            <div class="grid grid-cols-3 gap-2 mt-2 text-xs text-slate-600">
                                                <div><span class="text-[10px] text-slate-400 block font-bold">ARRIVÉE</span><span class="font-semibold">{{ r.dateArrivee | date:'dd MMM yyyy' }}</span></div>
                                                <div><span class="text-[10px] text-slate-400 block font-bold">DÉPART</span><span class="font-semibold">{{ r.dateDepart | date:'dd MMM yyyy' }}</span></div>
                                                <div><span class="text-[10px] text-slate-400 block font-bold">CHAMBRE</span><span class="font-extrabold text-slate-800">{{ r.chambre?.numero || '-' }}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        } @else {
                            <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                                <i class="pi pi-calendar text-4xl text-slate-300 mb-3"></i>
                                <p class="text-sm font-semibold">Aucune réservation</p>
                                <p class="text-xs mt-1">Vous n'avez pas encore de réservation.</p>
                                <a routerLink="/cmt/reserver" class="mt-4 px-4 py-2 bg-[#00529B] text-white rounded-xl text-xs font-bold hover:bg-[#00407a]">Réserver une chambre</a>
                            </div>
                        }
                    </div>

                    <div class="col-span-12 xl:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 class="font-extrabold text-slate-800 text-base mb-4">Informations du compte</h2>
                        <div class="flex flex-col gap-3 text-sm">
                            <div class="flex justify-between py-2 border-b border-slate-50">
                                <span class="text-slate-500">Type de client</span>
                                <span class="font-bold text-slate-800">{{ typeClientLabel(auth.user()?.typeClient) }}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b border-slate-50">
                                <span class="text-slate-500">Statut du compte</span>
                                <span class="font-bold" [class.text-emerald-600]="auth.user()?.statutCompte === 'ACTIF'" [class.text-amber-600]="auth.user()?.statutCompte === 'EN_ATTENTE'" [class.text-red-600]="auth.user()?.statutCompte === 'REJETE'">{{ statutCompteLabel(auth.user()?.statutCompte) }}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b border-slate-50">
                                <span class="text-slate-500">Email</span>
                                <span class="font-bold text-slate-800">{{ auth.user()?.email }}</span>
                            </div>
                            <div class="flex justify-between py-2">
                                <span class="text-slate-500">Matricule</span>
                                <span class="font-bold text-slate-800">{{ auth.user()?.matricule || '-' }}</span>
                            </div>
                        </div>
                        <a routerLink="/cmt/profil" class="mt-4 block w-full text-center text-xs font-bold text-[#00529B] bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors py-2.5 rounded-xl">Modifier mon profil</a>
                    </div>
                </div>

                <div class="text-center text-xs text-slate-400 pb-2">
                    © 2026 CMT-SONABEL - Tous droits réservés.
                </div>
            </div>
        }
    `
})
export class Dashboard implements OnInit, OnDestroy {
    auth = inject(AuthService);
    centreActif = inject(CentreActifService);
    private reservationService = inject(ReservationService);
    private chambreService = inject(ChambreService);
    private centreService = inject(CentreService);
    private utilisateurService = inject(UtilisateurService);
    private statistiquesService = inject(StatistiquesService);
    private paiementService = inject(PaiementService);
    private messageService = inject(MessageService);
    private router = inject(Router);
    private routerSub?: Subscription;

    currentDate = '';
    currentTime = '';

    nomCentre = signal('...');
    totalChambres = signal(0);
    chambresDisponibles = signal(0);
    chambresOccupees = signal(0);
    chambresMaintenance = signal(0);
    reservationsEnAttente = signal(0);
    reservationsAujourdhui = signal(0);

    totalUtilisateurs = signal(0);
    totalClients = signal(0);
    totalGerants = signal(0);
    totalReservations = signal(0);

    stats = signal<Statistiques | null>(null);
    reservationsEnAttenteListe = signal<any[]>([]);
    mesReservations = signal<any[]>([]);
    derniersPaiements = signal<any[]>([]);
    reservationsParMois: { mois: number; annee: number; total: number }[] = [];

    adminLineData: any;
    adminDonutData: any;
    gerantLineData: any;
    gerantRoomStatusData: any;
    gerantRoomTypeData: any;
    lineOptions: any;
    gerantLineOptions: any;
    donutOptions: any;

    private _centreChargeId: number | null = null;

    constructor() {
        // Déclencher uniquement lors d'un changement MANUEL de centre (pas au chargement initial)
        effect(() => {
            const centre = this.centreActif.centreActif();
            if (centre && this.auth.isGerant() && this._centreChargeId !== null && centre.id !== this._centreChargeId) {
                this._centreChargeId = centre.id;
                this.nomCentre.set(centre.nom);
                this.chargerDonnees(centre.id);
            }
        });
    }

    ngOnInit() {
        this.reload();
        this.routerSub = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.reload());
    }

    ngOnDestroy() {
        this.routerSub?.unsubscribe();
    }

    private reload() {
        this.setupCurrentDate();
        this.initializeCharts();
        if (this.auth.isAdmin()) {
            this.loadAdminStats();
        } else if (this.auth.isGerant()) {
            // Utiliser centreId du JWT en priorité absolue — pas de dépendance à centreActif
            const centreId = this.auth.user()?.centreId;
            if (centreId) {
                this._centreChargeId = centreId;
                this.chargerDonnees(centreId);
                this.centreService.getById(centreId).subscribe(c => this.nomCentre.set(c.nom));
            }
            // Charger les centres pour le sélecteur (sidebar) APRES avoir chargé les données
            this.centreActif.loadCentres();
        } else {
            this.loadMesReservations();
        }
    }

    private loadAdminStats() {
        this.statistiquesService.getStatistiques().subscribe((s) => {
            this.stats.set(s);
            this.totalReservations.set(s.totalReservations ?? 0);
            // Utiliser directement totalUtilisateurs de la réponse API (pas de race condition)
            this.totalUtilisateurs.set(s.totalUtilisateurs ?? 0);
            this.reservationsParMois = s.reservationsParMois || [];
            this.buildAdminCharts();
        });
        this.utilisateurService.getAll().subscribe((users) => {
            const list = users || [];
            this.totalClients.set(list.filter((u: Utilisateur) => u.roles?.includes('CLIENT')).length);
            this.totalGerants.set(list.filter((u: Utilisateur) => u.roles?.includes('GERANT')).length);
        });
    }

    private chargerDonnees(centreId: number) {
        this.chambreService.getByCentre(centreId).subscribe({
            next: (chambres) => {
                this.totalChambres.set(chambres.length);
                this.chambresDisponibles.set(chambres.filter(c => c.statut === 'DISPONIBLE').length);
                this.chambresOccupees.set(chambres.filter(c => c.statut === 'OCCUPEE').length);
                this.chambresMaintenance.set(chambres.filter(c => c.statut === 'MAINTENANCE').length);
                this.updateGerantCharts();
            }
        });
        this.reservationService.getByCentre(centreId).subscribe({
            next: (res) => {
                const today = new Date().toISOString().split('T')[0];
                const attente = res.filter(r => r.statut === 'EN_ATTENTE');
                this.reservationsEnAttente.set(attente.length);
                this.reservationsEnAttenteListe.set(attente);
                this.reservationsAujourdhui.set(res.filter(r => r.dateArrivee === today).length);
            }
        });
        this.paiementService.getByCentre(centreId).subscribe({
            next: (paiements) => this.derniersPaiements.set((paiements || []).slice(0, 5))
        });
    }

    private loadMesReservations() {
        this.reservationService.getMesReservations().subscribe((res) => {
            this.mesReservations.set(res || []);
        });
    }

    private buildAdminCharts() {
        if (this.reservationsParMois.length > 0) {
            const labels = this.reservationsParMois.map(r => {
                const d = new Date(r.annee, r.mois - 1);
                return d.toLocaleDateString('fr-FR', { month: 'short' });
            });
            const data = this.reservationsParMois.map(r => r.total);
            this.adminLineData = {
                labels,
                datasets: [{
                    label: 'Réservations',
                    data,
                    fill: true,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#3b82f6'
                }]
            };
        }
        const s = this.stats();
        if (s?.reservationsParCentre && s.reservationsParCentre.length > 0) {
            const colors = ['#00529B', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
            this.adminDonutData = {
                labels: s.reservationsParCentre.map((c: { nom: string; total: number }) => c.nom),
                datasets: [{
                    data: s.reservationsParCentre.map((c: { nom: string; total: number }) => c.total),
                    backgroundColor: s.reservationsParCentre.map((_: unknown, i: number) => colors[i % colors.length]),
                    borderWidth: 0
                }]
            };
        }
    }

    setupCurrentDate() {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        const formatted = today.toLocaleDateString('fr-FR', options);
        this.currentDate = formatted.charAt(0).toUpperCase() + formatted.slice(1);
        this.currentTime = today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    initializeCharts() {
        this.lineOptions = {
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top', labels: { usePointStyle: true, pointStyleWidth: 8, boxWidth: 8, font: { family: 'Lato', size: 10, weight: 'bold' }, color: '#64748b' } }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { family: 'Lato', size: 10, weight: 'bold' }, color: '#64748b' } },
                y: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Lato', size: 10, weight: 'bold' }, color: '#64748b' }, border: { dash: [4, 4] } }
            }
        };
        this.gerantLineOptions = { ...this.lineOptions, plugins: { legend: { display: false } } };
        this.donutOptions = { maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } };

        this.adminLineData = { labels: [], datasets: [{
            label: 'Réservations', data: [], fill: true, borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.05)', tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#3b82f6'
        }]};
        this.adminDonutData = { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }] };
        this.gerantLineData = { labels: [], datasets: [{
            label: 'Taux d\'occupation', data: [], fill: true, borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.05)', tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#3b82f6'
        }]};
        this.gerantRoomStatusData = { labels: ['Disponible', 'Occupée', 'Maintenance'], datasets: [{ data: [0, 0, 0], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], borderWidth: 0 }] };
        this.gerantRoomTypeData = { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }] };
    }

    updateGerantCharts() {
        this.gerantRoomStatusData = {
            labels: ['Disponible', 'Occupée', 'Maintenance'],
            datasets: [{ data: [this.chambresDisponibles(), this.chambresOccupees(), this.chambresMaintenance()], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], borderWidth: 0 }]
        };
    }

    statutLabel(s: string): string {
        const m: Record<string, string> = { VALIDEE: 'Validée', EN_ATTENTE: 'En attente', REFUSEE: 'Refusée', ANNULEE: 'Annulée' };
        return m[s] || s;
    }

    typeClientLabel(t?: string): string {
        const m: Record<string, string> = { AGENT_SONABEL: 'Agent SONABEL', RETRAITE_SONABEL: 'Retraité SONABEL', CLIENT_EXTERNE: 'Client externe' };
        return t ? (m[t] || t) : '-';
    }

    statutCompteLabel(s?: string): string {
        const m: Record<string, string> = { ACTIF: 'Actif', EN_ATTENTE: 'En attente', REJETE: 'Rejeté' };
        return s ? (m[s] || s) : 'Actif';
    }
}
