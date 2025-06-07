// routes/chat.js

import { Router } from "express";
import middleware from "../middleware/auth.js";
import { OpenAI } from "openai";
import stringSimilarity from "string-similarity";

const router = Router();

// Initialise OpenRouter avec le bon modèle
// (vérifiez que la variable d’environnement OPENROUTER_API_KEY est bien définie)
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

// Liste des questions « complètes » autorisées (pour stringSimilarity)
const questionsAutorisees = [
  "Comment calculer le montant total des transactions pour un client sur une période donnée ?",
  "Quelles sont les meilleures pratiques pour suivre l’historique de paiement d’un client ?",
  "Comment gérer les factures impayées d’un client ?",
  "Quelles informations sont nécessaires pour établir un historique de paiement client ?",
  "Comment identifier les clients les plus rentables pour une entreprise ?",
  "Quelles stratégies peuvent encourager les clients à payer à temps ?",
  "Comment optimiser les paiements aux fournisseurs pour améliorer la trésorerie ?",
  "Quels sont les avantages de négocier des délais de paiement avec un fournisseur ?",
  "Comment suivre les paiements en attente pour plusieurs fournisseurs ?",
  "Quelles clauses inclure dans un contrat fournisseur pour protéger l’entreprise ?",
  "Comment évaluer la fiabilité financière d’un nouveau fournisseur ?",
  "Quels indicateurs clés suivre pour analyser le volume des transactions ?",
  "Comment automatiser le suivi des transactions dans une entreprise ?",
  "Quelles sont les erreurs courantes dans la gestion des transactions financières ?",
  "Comment détecter les transactions frauduleuses dans un système comptable ?",
  "Quels outils logiciels recommander pour gérer les transactions quotidiennes ?",
  "Comment préparer un rapport de flux de trésorerie pour une petite entreprise ?",
  "Quels éléments inclure dans un résumé financier mensuel ?",
  "Comment analyser les tendances des dépenses pour réduire les coûts ?",
  "Quelles métriques utiliser pour évaluer la performance des transactions ?",
  "Comment présenter un rapport financier clair à des investisseurs ?"
];

// Ensemble de mots-clés financiers (pour vérification complémentaire)
const motsCles = [
  "transaction", "client", "fournisseur", "paiement", 
  "rapport", "trésorerie", "budget", "dépense", 
  "revenu", "facture", "financier", "analyse"
];

/**
 * Retourne true si le message est jugé suffisamment proche d’une question autorisée
 * OU contient au moins un mot-clé financier.
 */
function estQuestionPertinente(message) {
  const msgLower = message.toLowerCase();

  // 1) Test de similarité (string-similarity) avec seuil abaissé
  const { bestMatch } = stringSimilarity.findBestMatch(
    msgLower,
    questionsAutorisees.map(q => q.toLowerCase())
  );
  if (bestMatch.rating >= 0.5) {
    return true;
  }

  // 2) Vérification de présence d’un mot-clé financier
  for (const mot of motsCles) {
    if (msgLower.includes(mot)) {
      return true;
    }
  }

  // Si ni similarité suffisante, ni mot-clé, on rejette
  return false;
}

// POST /api/chat
router.post(
  "/",
  middleware.auth,            // 1) Vérifie que l’utilisateur est authentifié
  async (req, res, next) => { 
    // 2) Exemple de vérification de rôle (facultative)
    // if (req.user.role !== "owner" && req.user.role !== "employee") {
    //   return res.status(403).json({ success: false, message: "Accès refusé." });
    // }
    next();
  },
  async (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, message: "Message invalide." });
    }

    // 3) NLP : si hors sujet, on refuse
    if (!estQuestionPertinente(message)) {
      return res.status(403).json({
        success: false,
        reply: "Je ne peux répondre qu'aux questions liées à l'application financière. Veuillez reformuler."
      });
    }

    try {
      // 4) Appel à OpenRouter / Mistral-7B-Instruct
      const completion = await openai.chat.completions.create({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant financier intelligent pour une application de gestion de transactions."
          },
          { role: "user", content: message }
        ]
      });

      const botReply = completion.choices?.[0]?.message?.content 
                       ?? "Je n'ai pas compris votre demande.";
      return res.status(200).json({ success: true, reply: botReply });
    } catch (err) {
      console.error("Erreur OpenRouter :", err);
      return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    }
  }
);

export default router;