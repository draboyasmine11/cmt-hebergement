/** Date du jour à minuit (heure locale). */
export function todayAtMidnight(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

export function parseDateOnly(value: string): Date {
    const d = new Date(value);
    d.setHours(0, 0, 0, 0);
    return d;
}

/** Séjour validé dont la date d'arrivée est passée ou aujourd'hui (en cours ou terminé). */
export function isSejourEnregistre(statut: string, dateArrivee: string): boolean {
    if (statut !== 'VALIDEE') return false;
    return parseDateOnly(dateArrivee) <= todayAtMidnight();
}
