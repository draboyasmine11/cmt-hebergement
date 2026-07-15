package com.sonabel.cmt.dto;

public record EmailData(
        String chambre,
        String centre,
        String arrivee,
        String depart,
        double montant,
        String motif,
        String modePaiement,
        String reference
) {
    public static EmailData of(String chambre, String centre, String arrivee, String depart, double montant) {
        return new EmailData(chambre, centre, arrivee, depart, montant, null, null, null);
    }

    public static EmailData ofRefus(String chambre, String centre, String arrivee, String depart, double montant, String motif) {
        return new EmailData(chambre, centre, arrivee, depart, montant, motif, null, null);
    }

    public static EmailData ofPaiement(String chambre, String centre, double montant, String modePaiement, String reference) {
        return new EmailData(chambre, centre, "", "", montant, null, modePaiement, reference);
    }
}
