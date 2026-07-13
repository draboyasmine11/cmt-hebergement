import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    providers: [MessageService],
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, ToastModule],
    template: `
        <p-toast position="top-right" />
        <div class="min-h-screen font-sans flex flex-col lg:flex-row bg-[#f8fafc]">
            <!-- Panneau gauche -->
            <div
                class="hidden lg:flex lg:w-1/2 relative bg-cover bg-center overflow-hidden"
                style="background-image: linear-gradient(135deg, rgba(0, 82, 155, 0.92) 0%, rgba(0, 42, 82, 0.96) 100%), url('/immeuble_sonabel.jpg')"
            >
                <div class="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full h-full">
                    <div class="flex items-center gap-4">
                        <img src="/logo_cmt.jpg" alt="Logo CMT" class="h-16 w-16 rounded-full border border-white/20 shadow-lg object-cover bg-white" />
                        <div class="flex items-center gap-3 border-l border-white/20 pl-4">
                            <img src="/logo_sonabel.jpg" alt="Logo SONABEL" class="h-12 w-auto object-contain brightness-110" />
                            <div class="text-white text-[10px] xl:text-[11px] font-bold leading-tight tracking-wider uppercase">
                                Société Nationale<br>d'Électricité<br>du Burkina
                            </div>
                        </div>
                    </div>

                    <div class="my-auto py-12 flex flex-col gap-6">
                        <div class="flex flex-col gap-3">
                            <h1 class="text-4xl xl:text-5xl font-extrabold tracking-tight">Bienvenue !</h1>
                            <p class="text-base xl:text-lg text-blue-100/90 leading-relaxed max-w-xl">
                                Connectez-vous à votre espace pour gérer vos réservations dans les centres d'hébergement de la SONABEL.
                            </p>
                            <div class="w-16 h-1 bg-amber-400 rounded-full mt-2"></div>
                        </div>
                        <div class="flex flex-col gap-6 mt-4">
                            <div class="flex items-start gap-4">
                                <div class="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/10">
                                    <i class="pi pi-calendar text-base"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-white text-base xl:text-lg">Réservez facilement</h3>
                                    <p class="text-sm text-blue-100/80 leading-relaxed">Trouvez et réservez votre chambre en quelques clics.</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/10">
                                    <i class="pi pi-shield text-base"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-white text-base xl:text-lg">Sécurisé</h3>
                                    <p class="text-sm text-blue-100/80 leading-relaxed">Vos données sont protégées et confidentielles.</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/10">
                                    <i class="pi pi-map-marker text-base"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-white text-base xl:text-lg">Proche de vous</h3>
                                    <p class="text-sm text-blue-100/80 leading-relaxed">Accédez aux meilleurs centres partout au Burkina Faso.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div></div>
                </div>
            </div>

            <!-- Panneau droit -->
            <div class="flex-1 flex flex-col justify-between bg-[#f4f6f9] px-6 py-8 sm:py-12 min-h-screen">
                <div class="flex-grow flex items-center justify-center">
                    <div class="w-full max-w-[460px] bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100">
                        <div class="text-center mb-8">
                            <div class="flex items-center justify-center gap-3 mb-4">
                                <img src="/logo_cmt.jpg" alt="Logo CMT" class="h-14 w-14 rounded-full border border-slate-200 shadow-sm object-cover bg-white" />
                                <div class="flex items-center gap-2 border-l border-slate-200 pl-3">
                                    <img src="/logo_sonabel.jpg" alt="Logo SONABEL" class="h-10 w-auto object-contain" />
                                </div>
                            </div>
                            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-800">Connexion</h2>
                            <div class="w-10 h-0.5 bg-[#00529B] mx-auto mt-2.5"></div>
                        </div>

                        <form (ngSubmit)="login()" class="flex flex-col gap-5">
                            <div class="flex flex-col gap-1.5">
                                <label for="email" class="text-sm font-semibold text-slate-700">Adresse e-mail</label>
                                <div class="relative">
                                    <i class="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                    <input
                                        id="email" type="email" placeholder="Entrez votre e-mail"
                                        class="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#00529B]/20 focus:border-[#00529B] text-slate-800 text-sm transition-all"
                                        [(ngModel)]="email" name="email" autocomplete="email" required
                                    />
                                </div>
                            </div>

                            <div class="flex flex-col gap-1.5">
                                <label for="password" class="text-sm font-semibold text-slate-700">Mot de passe</label>
                                <div class="relative">
                                    <i class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                    <input
                                        [type]="showPassword ? 'text' : 'password'" id="password"
                                        placeholder="Entrez votre mot de passe"
                                        class="w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#00529B]/20 focus:border-[#00529B] text-slate-800 text-sm transition-all"
                                        [(ngModel)]="password" name="password" autocomplete="current-password" required
                                    />
                                    <i [class]="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
                                        class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
                                        (click)="showPassword = !showPassword"></i>
                                </div>
                            </div>

                            <div class="flex items-center justify-between mt-1">
                                <div class="flex items-center gap-2">
                                    <p-checkbox [(ngModel)]="checked" id="remember" name="remember" binary />
                                    <label for="remember" class="text-sm text-slate-600 cursor-pointer select-none">Se souvenir de moi</label>
                                </div>
                                <a (click)="onForgotPassword()" class="text-sm font-semibold text-[#00529B] hover:underline cursor-pointer">
                                    Mot de passe oublié ?
                                </a>
                            </div>

                            <button type="submit"
                                class="w-full bg-[#00529B] hover:bg-[#00407a] text-white py-3.5 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#00529B]/10 cursor-pointer"
                                [disabled]="loading">
                                @if (loading) { <i class="pi pi-spin pi-spinner"></i> }
                                Se connecter
                            </button>
                        </form>

                        <div class="relative flex py-4 items-center">
                            <div class="flex-grow border-t border-slate-100"></div>
                            <span class="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">ou</span>
                            <div class="flex-grow border-t border-slate-100"></div>
                        </div>

                        <button type="button" (click)="onRequestAccount()"
                            class="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                            <i class="pi pi-user-plus text-slate-500"></i>
                            Créer un compte
                        </button>

                        <div class="text-center mt-4">
                            <a routerLink="/accueil" class="text-xs text-slate-400 hover:text-[#00529B] cursor-pointer flex items-center justify-center gap-1">
                                <i class="pi pi-arrow-left text-xs"></i> Retour à l'accueil
                            </a>
                        </div>
                    </div>
                </div>

                <div class="text-center text-xs text-slate-400 mt-8">
                    © 2026 CMT-SONABEL. Tous droits réservés.
                </div>
            </div>
        </div>
    `
})
export class Login {
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private messageService = inject(MessageService);

    email = '';
    password = '';
    checked = false;
    loading = false;
    showPassword = false;

    login() {
        if (!this.email || !this.password) {
            this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Veuillez saisir votre adresse e-mail et votre mot de passe.' });
            return;
        }
        this.loading = true;
        this.authService.login(this.email, this.password).subscribe({
            next: () => {
                this.loading = false;
                const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
                this.router.navigateByUrl(returnUrl);
            },
            error: (err) => {
                this.loading = false;
                const detail = this.resolveErrorMessage(err);
                this.messageService.add({ severity: 'error', summary: 'Échec de connexion', detail, life: 8000 });
            }
        });
    }

    onForgotPassword() {
        this.messageService.add({
            severity: 'info',
            summary: 'Mot de passe oublié',
            detail: 'Veuillez contacter l\'administration de la SONABEL ou le service informatique pour réinitialiser votre mot de passe.',
            life: 8000
        });
    }

    onRequestAccount() {
        this.router.navigate(['/auth/inscription']);
    }

    private resolveErrorMessage(err: { status?: number; error?: { message?: string }; message?: string }): string {
        if (err.status === 0) {
            return 'Le service est momentanément indisponible. Vérifiez que le système est bien démarré ou contactez le support.';
        }
        if (err.status === 401 || err.status === 403) {
            const msg = (err.error?.message || '').toLowerCase();
            if (msg.includes('disabled') || msg.includes('locked') || msg.includes('désactiv')) {
                return 'Votre compte est désactivé ou bloqué. Veuillez contacter l\'administration CMT.';
            }
            if (msg.includes('attente') || msg.includes('en_attente')) {
                return 'Votre compte est en attente de validation. Veuillez patienter ou contacter le gérant de votre centre.';
            }
            if (msg.includes('rejet')) {
                return 'Votre compte a été rejeté. Veuillez contacter l\'administration CMT pour plus d\'informations.';
            }
            return 'Adresse e-mail ou mot de passe incorrect. Vérifiez vos informations et réessayez.';
        }
        if (err.status === 400) {
            const msg = err.error?.message || '';
            if (msg.toLowerCase().includes('credentials') || msg.toLowerCase().includes('bad')) {
                return 'Adresse e-mail ou mot de passe incorrect. Vérifiez vos informations et réessayez.';
            }
            return msg || 'Les informations saisies sont incorrectes. Veuillez vérifier et réessayer.';
        }
        if (err.status === 404) {
            return 'Aucun compte trouvé avec cette adresse e-mail. Vérifiez l\'adresse saisie ou créez un compte.';
        }
        if (err.status && err.status >= 500) {
            return 'Une erreur technique est survenue sur le serveur. Veuillez réessayer dans quelques instants.';
        }
        const backendMsg = err.error?.message || '';
        if (backendMsg.toLowerCase().includes('credentials') || backendMsg.toLowerCase().includes('bad')) {
            return 'Adresse e-mail ou mot de passe incorrect. Vérifiez vos informations et réessayez.';
        }
        return backendMsg || 'Une erreur est survenue. Veuillez réessayer ou contacter le support au 25 49 77 77.';
    }
}
