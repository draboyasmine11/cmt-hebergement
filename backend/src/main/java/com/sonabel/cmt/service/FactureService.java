package com.sonabel.cmt.service;

import com.sonabel.cmt.entity.Paiement;
import com.sonabel.cmt.entity.Reservation;
import com.sonabel.cmt.exception.BusinessException;
import com.sonabel.cmt.exception.ResourceNotFoundException;
import com.sonabel.cmt.repository.PaiementRepository;
import com.sonabel.cmt.repository.ReservationRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class FactureService {

    private final PaiementRepository paiementRepository;
    private final ReservationRepository reservationRepository;

    private static final Color NAVY        = new Color(13, 36, 79);
    private static final Color GOLD        = new Color(218, 165, 32);
    private static final Color LIGHT_BLUE  = new Color(232, 240, 254);
    private static final Color WHITE       = Color.WHITE;
    private static final Color DARK_TEXT   = new Color(30, 30, 30);
    private static final Color GREEN_PAY   = new Color(34, 139, 34);
    private static final Color BORDER_GRAY = new Color(200, 200, 200);

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Transactional(readOnly = true)
    public byte[] genererFacture(Long reservationId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation introuvable"));

        Paiement p = paiementRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new BusinessException("Aucun paiement enregistré pour cette réservation"));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter writer = PdfWriter.getInstance(doc, baos);
            doc.open();

            // ── FONTS ──────────────────────────────────────────────────────
            Font fTitleBig  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, NAVY);
            Font fSubTitle  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, GOLD);
            Font fSmall     = FontFactory.getFont(FontFactory.HELVETICA, 8, DARK_TEXT);
            Font fSmallB    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, DARK_TEXT);
            Font fWhiteB    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, WHITE);
            Font fNavyB     = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, NAVY);
            Font fLabel     = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, DARK_TEXT);
            Font fValue     = FontFactory.getFont(FontFactory.HELVETICA, 8, DARK_TEXT);
            Font fFacture   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, WHITE);
            Font fNumFac    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, GOLD);
            Font fTotalTTC  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, WHITE);
            Font fGreen     = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, GREEN_PAY);
            Font fArrete    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, NAVY);
            Font fMontantL  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, DARK_TEXT);
            Font fFooterI   = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, WHITE);

            // ── EN-TÊTE ────────────────────────────────────────────────────
            PdfPTable header = new PdfPTable(3);
            header.setWidthPercentage(100);
            header.setWidths(new float[]{22f, 56f, 22f});
            header.setSpacingAfter(6);

            // Logo CMT (image)
            PdfPCell cellLogo = new PdfPCell();
            cellLogo.setBorder(Rectangle.NO_BORDER);
            cellLogo.setPadding(2);
            try (InputStream is = getClass().getResourceAsStream("/static/images/logo_cmt.jpg")) {
                if (is != null) {
                    byte[] imgBytes = is.readAllBytes();
                    Image cmtImg = Image.getInstance(imgBytes);
                    cmtImg.scaleToFit(120, 70);
                    cmtImg.setAlignment(Element.ALIGN_LEFT);
                    cellLogo.addElement(cmtImg);
                }
            }
            header.addCell(cellLogo);

            // Centre
            PdfPCell cellCentre = new PdfPCell();
            cellCentre.setBorder(Rectangle.NO_BORDER);
            cellCentre.setHorizontalAlignment(Element.ALIGN_CENTER);
            cellCentre.setPaddingTop(6);
            Paragraph centre = new Paragraph();
            centre.setAlignment(Element.ALIGN_CENTER);
            centre.add(new Chunk("CAISSE MUTUELLE DES TRAVAILLEURS\n", fTitleBig));
            centre.add(new Chunk("Centre d'Hébergement CMT\n", fSubTitle));
            centre.add(new Chunk("01 BP 1234 Ouagadougou 01 - BURKINA FASO\n", fSmall));
            centre.add(new Chunk("+226 25 30 61 00  |  contact@cmt.bf  |  www.cmt.bf", fSmall));
            cellCentre.addElement(centre);
            header.addCell(cellCentre);

            // Logo SONABEL (image)
            PdfPCell cellSonabel = new PdfPCell();
            cellSonabel.setBorder(Rectangle.NO_BORDER);
            cellSonabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            cellSonabel.setPadding(2);
            try (InputStream is = getClass().getResourceAsStream("/static/images/logo_sonabel.jpg")) {
                if (is != null) {
                    byte[] imgBytes = is.readAllBytes();
                    Image sonabelImg = Image.getInstance(imgBytes);
                    sonabelImg.scaleToFit(120, 70);
                    sonabelImg.setAlignment(Element.ALIGN_RIGHT);
                    cellSonabel.addElement(sonabelImg);
                }
            }
            header.addCell(cellSonabel);

            doc.add(header);

            // Ligne séparatrice navy
            PdfPTable sep = new PdfPTable(1);
            sep.setWidthPercentage(100);
            sep.setSpacingAfter(8);
            PdfPCell sepCell = new PdfPCell(new Phrase(" "));
            sepCell.setBackgroundColor(NAVY);
            sepCell.setFixedHeight(3f);
            sepCell.setBorder(Rectangle.NO_BORDER);
            sep.addCell(sepCell);
            doc.add(sep);

            // ── FACTURE + dates ────────────────────────────────────────────
            PdfPTable facRow = new PdfPTable(2);
            facRow.setWidthPercentage(100);
            facRow.setWidths(new float[]{50f, 50f});
            facRow.setSpacingAfter(8);

            // Bloc gauche : FACTURE + numéro
            PdfPCell cellFacLeft = new PdfPCell();
            cellFacLeft.setBorder(Rectangle.NO_BORDER);
            cellFacLeft.setPadding(0);

            PdfPTable facLabel = new PdfPTable(1);
            facLabel.setWidthPercentage(55);
            PdfPCell fl = new PdfPCell(new Phrase("FACTURE", fFacture));
            fl.setBackgroundColor(NAVY);
            fl.setPadding(8);
            fl.setBorder(Rectangle.NO_BORDER);
            facLabel.addCell(fl);
            cellFacLeft.addElement(facLabel);

            String annee = String.valueOf(r.getDateReservation().getYear());
            String mois  = String.format("%02d", r.getDateReservation().getMonthValue());
            String numFac = String.format("FAC-%s-%s-%04d", annee, mois, r.getId());
            Paragraph numP = new Paragraph("N° " + numFac,
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, GOLD));
            numP.setSpacingBefore(4);
            cellFacLeft.addElement(numP);
            facRow.addCell(cellFacLeft);

            // Bloc droit : dates
            PdfPCell cellDates = new PdfPCell();
            cellDates.setBorder(Rectangle.NO_BORDER);
            cellDates.setHorizontalAlignment(Element.ALIGN_RIGHT);
            PdfPTable datesT = new PdfPTable(2);
            datesT.setWidthPercentage(100);
            datesT.setWidths(new float[]{55f, 45f});
            addDateRow(datesT, "Date d'émission :", r.getDateReservation().format(FMT), fSmallB, fSmall);
            addDateRow(datesT, "Date d'arrivée :", r.getDateArrivee().format(FMT), fSmallB, fSmall);
            addDateRow(datesT, "Départ prévu :", r.getDateDepart().format(FMT), fSmallB, fSmall);
            if (r.getDateSortieReelle() != null) {
                addDateRow(datesT, "Sortie réelle :", r.getDateSortieReelle().format(FMT), fSmallB, fSmall);
            }
            cellDates.addElement(datesT);
            facRow.addCell(cellDates);
            doc.add(facRow);

            // ── INFO CLIENT + RÉSERVATION ──────────────────────────────────
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{50f, 50f});
            infoTable.setSpacingAfter(10);

            // Client
            PdfPCell clientHeader = sectionHeader("INFORMATIONS CLIENT", fWhiteB);
            infoTable.addCell(clientHeader);
            PdfPCell resHeader = sectionHeader("INFORMATIONS RÉSERVATION", fWhiteB);
            infoTable.addCell(resHeader);

            String clientNom = r.getUtilisateur().getPrenom() + " " + r.getUtilisateur().getNom();
            String matricule = r.getUtilisateur().getMatricule() != null ? r.getUtilisateur().getMatricule() : "-";
            String telephone = r.getUtilisateur().getTelephone() != null ? r.getUtilisateur().getTelephone() : "-";
            String email     = r.getUtilisateur().getEmail();

            PdfPCell clientBody = new PdfPCell();
            clientBody.setBorder(Rectangle.BOX);
            clientBody.setBorderColor(BORDER_GRAY);
            clientBody.setPadding(8);
            clientBody.addElement(infoLine("Nom & Prénom :", clientNom, fLabel, fValue));
            clientBody.addElement(infoLine("Matricule SONABEL :", matricule, fLabel, fValue));
            clientBody.addElement(infoLine("Téléphone :", telephone, fLabel, fValue));
            clientBody.addElement(infoLine("Email :", email, fLabel, fValue));
            infoTable.addCell(clientBody);

            String numRes = String.format("RES-%s-%s-%04d", annee, mois, r.getId());
            String chambre = r.getChambre().getNumero() + " (" + r.getChambre().getType() + ")";

            PdfPCell resBody = new PdfPCell();
            resBody.setBorder(Rectangle.BOX);
            resBody.setBorderColor(BORDER_GRAY);
            resBody.setPadding(8);
            resBody.addElement(infoLine("N° Réservation :", numRes, fLabel, fValue));
            resBody.addElement(infoLine("Chambre :", chambre, fLabel, fValue));
            resBody.addElement(infoLine("Capacité :", r.getChambre().getCapacite() + " personne(s)", fLabel, fValue));
            resBody.addElement(infoLine("Centre :", r.getChambre().getCentre().getNom(), fLabel, fValue));
            if (p.getReference() != null && !p.getReference().isBlank()) {
                resBody.addElement(infoLine("Référence :", p.getReference(), fLabel, fValue));
            }
            infoTable.addCell(resBody);
            doc.add(infoTable);

            // ── TABLEAU DÉSIGNATION ────────────────────────────────────────
            PdfPTable designTable = new PdfPTable(4);
            designTable.setWidthPercentage(100);
            designTable.setWidths(new float[]{50f, 12f, 20f, 18f});
            designTable.setSpacingAfter(6);

            // En-têtes colonnes
            for (String col : new String[]{"DÉSIGNATION", "QTÉ", "PRIX UNIT. (FCFA)", "MONTANT (FCFA)"}) {
                PdfPCell ch = new PdfPCell(new Phrase(col, fWhiteB));
                ch.setBackgroundColor(NAVY);
                ch.setPadding(6);
                ch.setHorizontalAlignment(Element.ALIGN_CENTER);
                ch.setBorderColor(BORDER_GRAY);
                designTable.addCell(ch);
            }

            // Hébergement
            LocalDate dateFin = r.getDateSortieReelle() != null ? r.getDateSortieReelle() : r.getDateDepart();
            long nuitsReelles = ChronoUnit.DAYS.between(r.getDateArrivee(), dateFin);
            if (nuitsReelles < 1) nuitsReelles = 1;
            BigDecimal prixNuit = p.getMontant().divide(BigDecimal.valueOf(nuitsReelles), RoundingMode.HALF_UP);
            BigDecimal montantHeberg = p.getMontant();
            String periodeLabel = "Hébergement (Nuitée) du " + r.getDateArrivee().format(FMT) + " au " + dateFin.format(FMT);
            addDesignRow(designTable, periodeLabel, nuitsReelles, prixNuit, montantHeberg, fSmall, fSmallB);

            // Total — utilise le montant réellement payé (qui tient compte de dateSortieReelle si applicable)
            BigDecimal total = p.getMontant();

            // Lignes récapitulatives (droite)
            PdfPTable totaux = new PdfPTable(2);
            totaux.setWidthPercentage(55);
            totaux.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totaux.setWidths(new float[]{55f, 45f});
            totaux.setSpacingAfter(10);

            addTotalRow(totaux, "SOUS-TOTAL", formatMontant(total), false, fSmallB, fSmallB);
            addTotalRow(totaux, "RÉDUCTION", "0", false, fSmall, fSmall);
            addTotalRow(totaux, "TOTAL HT", formatMontant(total), false, fSmallB, fSmallB);
            addTotalRow(totaux, "TVA (0%)", "0", false, fSmall, fSmall);

            // Ligne TOTAL TTC navy
            PdfPCell ttcLabel = new PdfPCell(new Phrase("TOTAL TTC", fTotalTTC));
            ttcLabel.setBackgroundColor(NAVY);
            ttcLabel.setPadding(7);
            ttcLabel.setBorderColor(BORDER_GRAY);
            totaux.addCell(ttcLabel);
            PdfPCell ttcVal = new PdfPCell(new Phrase(formatMontant(total) + " FCFA", fTotalTTC));
            ttcVal.setBackgroundColor(NAVY);
            ttcVal.setPadding(7);
            ttcVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            ttcVal.setBorderColor(BORDER_GRAY);
            totaux.addCell(ttcVal);

            doc.add(designTable);
            doc.add(totaux);

            // ── PAIEMENT + ARRÊTÉ ──────────────────────────────────────────
            PdfPTable payRow = new PdfPTable(2);
            payRow.setWidthPercentage(100);
            payRow.setWidths(new float[]{45f, 55f});
            payRow.setSpacingAfter(14);

            // Informations paiement
            PdfPCell payCell = new PdfPCell();
            payCell.setBorder(Rectangle.BOX);
            payCell.setBorderColor(BORDER_GRAY);
            payCell.setPadding(0);

            PdfPTable payInner = new PdfPTable(1);
            payInner.setWidthPercentage(100);
            PdfPCell payH = new PdfPCell(new Phrase("INFORMATIONS PAIEMENT", fWhiteB));
            payH.setBackgroundColor(NAVY);
            payH.setPadding(6);
            payH.setHorizontalAlignment(Element.ALIGN_CENTER);
            payH.setBorder(Rectangle.NO_BORDER);
            payInner.addCell(payH);
            payCell.addElement(payInner);

            payCell.addElement(infoLine("Mode de paiement :", modeLabel(p.getModePaiement().name()), fLabel, fValue));
            Paragraph statutP = new Paragraph();
            statutP.add(new Chunk("Statut du paiement :    ", fLabel));
            statutP.add(new Chunk("Payé", fGreen));
            payCell.addElement(statutP);
            payCell.addElement(infoLine("Date de paiement :", p.getDatePaiement().format(FMT), fLabel, fValue));
            String refPay = String.format("PAY-%s-%s-%04d", annee, mois, p.getId());
            payCell.addElement(infoLine("Référence paiement :", refPay, fLabel, fValue));
            if (p.getReference() != null && !p.getReference().isBlank()) {
                payCell.addElement(infoLine("Réf. transaction :", p.getReference(), fLabel, fValue));
            }
            payRow.addCell(payCell);

            // Arrêté
            PdfPCell arreteCell = new PdfPCell();
            arreteCell.setBorder(Rectangle.NO_BORDER);
            arreteCell.setPaddingLeft(16);
            Paragraph arreteTitle = new Paragraph("ARRÊTÉ LA PRÉSENTE FACTURE À LA SOMME DE :", fArrete);
            arreteTitle.setSpacingAfter(6);
            arreteCell.addElement(arreteTitle);
            Paragraph montantLettre = new Paragraph(montantEnLettres(total) + " (" + formatMontant(total) + ") FCFA", fMontantL);
            montantLettre.setSpacingAfter(10);
            arreteCell.addElement(montantLettre);
            Paragraph servir = new Paragraph("Pour servir et valoir ce que de droit.", fSmall);
            arreteCell.addElement(servir);
            payRow.addCell(arreteCell);
            doc.add(payRow);

            // ── SIGNATURES ────────────────────────────────────────────────
            PdfPTable sigTable = new PdfPTable(2);
            sigTable.setWidthPercentage(100);
            sigTable.setSpacingAfter(10);

            PdfPCell sigClient = new PdfPCell();
            sigClient.setBorder(Rectangle.NO_BORDER);
            sigClient.addElement(new Paragraph("Le Client", fSmallB));
            sigClient.addElement(new Paragraph("\n\n_______________", fSmall));
            sigClient.addElement(new Paragraph("(Signature)", fSmall));
            sigTable.addCell(sigClient);

            PdfPCell sigGerant = new PdfPCell();
            sigGerant.setBorder(Rectangle.NO_BORDER);
            sigGerant.setHorizontalAlignment(Element.ALIGN_RIGHT);
            sigGerant.addElement(new Paragraph("Le Responsable du Centre", fSmallB));
            sigGerant.addElement(new Paragraph("\n\n_______________", fSmall));
            sigGerant.addElement(new Paragraph("(Signature et cachet)", fSmall));
            sigTable.addCell(sigGerant);
            doc.add(sigTable);

            // ── PIED DE PAGE ───────────────────────────────────────────────
            PdfPTable footer = new PdfPTable(1);
            footer.setWidthPercentage(100);
            PdfPCell fc = new PdfPCell();
            fc.setBackgroundColor(NAVY);
            fc.setBorder(Rectangle.NO_BORDER);
            fc.setPadding(8);
            Paragraph fp = new Paragraph(
                "01 BP 1234 Ouagadougou 01 - BURKINA FASO  |  +226 25 30 61 00  |  contact@cmt.bf  |  www.cmt.bf\n",
                fFooterI);
            fp.setAlignment(Element.ALIGN_CENTER);
            Paragraph fm = new Paragraph("Merci de votre confiance. CMT, la confort à votre service !", fFooterI);
            fm.setAlignment(Element.ALIGN_CENTER);
            fc.addElement(fp);
            fc.addElement(fm);
            footer.addCell(fc);
            doc.add(footer);

            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new BusinessException("Erreur lors de la génération de la facture : " + e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private PdfPCell sectionHeader(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(NAVY);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBorderColor(BORDER_GRAY);
        return cell;
    }

    private Paragraph infoLine(String label, String value, Font fL, Font fV) {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + "  ", fL));
        p.add(new Chunk(value, fV));
        p.setSpacingAfter(2);
        return p;
    }

    private void addDateRow(PdfPTable t, String label, String val, Font fL, Font fV) {
        PdfPCell l = new PdfPCell(new Phrase(label, fL));
        l.setBorder(Rectangle.NO_BORDER);
        l.setHorizontalAlignment(Element.ALIGN_RIGHT);
        t.addCell(l);
        PdfPCell v = new PdfPCell(new Phrase(val, fV));
        v.setBorder(Rectangle.NO_BORDER);
        v.setHorizontalAlignment(Element.ALIGN_RIGHT);
        t.addCell(v);
    }

    private void addDesignRow(PdfPTable t, String desc, long qty, BigDecimal pu, BigDecimal total, Font fN, Font fB) {
        PdfPCell d = new PdfPCell(new Phrase(desc, fN)); d.setPadding(5); d.setBorderColor(BORDER_GRAY); t.addCell(d);
        PdfPCell q = new PdfPCell(new Phrase(String.valueOf(qty), fN)); q.setPadding(5); q.setHorizontalAlignment(Element.ALIGN_CENTER); q.setBorderColor(BORDER_GRAY); t.addCell(q);
        PdfPCell p = new PdfPCell(new Phrase(formatMontant(pu), fN)); p.setPadding(5); p.setHorizontalAlignment(Element.ALIGN_RIGHT); p.setBorderColor(BORDER_GRAY); t.addCell(p);
        PdfPCell m = new PdfPCell(new Phrase(formatMontant(total), fB)); m.setPadding(5); m.setHorizontalAlignment(Element.ALIGN_RIGHT); m.setBorderColor(BORDER_GRAY); t.addCell(m);
    }

    private void addTotalRow(PdfPTable t, String label, String val, boolean bold, Font fL, Font fV) {
        PdfPCell l = new PdfPCell(new Phrase(label, fL)); l.setPadding(5); l.setBorderColor(BORDER_GRAY); t.addCell(l);
        PdfPCell v = new PdfPCell(new Phrase(val, fV)); v.setPadding(5); v.setHorizontalAlignment(Element.ALIGN_RIGHT); v.setBorderColor(BORDER_GRAY); t.addCell(v);
    }

    private String formatMontant(BigDecimal m) {
        if (m == null) return "0";
        return String.format("%,.0f", m.doubleValue()).replace(",", " ");
    }

    private String modeLabel(String mode) {
        return switch (mode) {
            case "ESPECES"       -> "Espèces";
            case "CHEQUE"        -> "Chèque";
            case "MOBILE_MONEY"  -> "Mobile Money";
            case "ORANGE_MONEY"  -> "Orange Money";
            case "MOOV_MONEY"    -> "Moov Money";
            case "TELECEL_MONEY" -> "Telecel Money";
            case "WAVE"          -> "Wave";
            default -> mode;
        };
    }

    private String montantEnLettres(BigDecimal montant) {
        if (montant == null) return "ZÉRO";
        long m = montant.longValue();
        if (m == 0) return "ZÉRO";
        String[] u = {"", "UN", "DEUX", "TROIS", "QUATRE", "CINQ", "SIX", "SEPT", "HUIT", "NEUF",
                       "DIX", "ONZE", "DOUZE", "TREIZE", "QUATORZE", "QUINZE", "SEIZE",
                       "DIX-SEPT", "DIX-HUIT", "DIX-NEUF"};
        String[] d = {"", "", "VINGT", "TRENTE", "QUARANTE", "CINQUANTE", "SOIXANTE",
                       "SOIXANTE", "QUATRE-VINGT", "QUATRE-VINGT"};
        if (m < 20) return u[(int) m];
        if (m < 100) {
            int di = (int)(m / 10), un = (int)(m % 10);
            if (di == 7 || di == 9) return d[di] + "-" + u[10 + un];
            return d[di] + (un > 0 ? "-" + u[un] : "");
        }
        if (m < 1000) {
            int c = (int)(m / 100), reste = (int)(m % 100);
            return (c == 1 ? "CENT" : u[c] + " CENT") + (reste > 0 ? " " + montantEnLettres(BigDecimal.valueOf(reste)) : "");
        }
        if (m < 1_000_000) {
            int mill = (int)(m / 1000), reste = (int)(m % 1000);
            return (mill == 1 ? "MILLE" : montantEnLettres(BigDecimal.valueOf(mill)) + " MILLE")
                    + (reste > 0 ? " " + montantEnLettres(BigDecimal.valueOf(reste)) : "");
        }
        return String.valueOf(m);
    }
}
