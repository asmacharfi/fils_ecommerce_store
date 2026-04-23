"use client";

import { Package, Search, Sparkles } from "lucide-react";

type SendPayload = { text: string };

interface WelcomeScreenProps {
  onSuggestionClick: (message: SendPayload) => void;
}

const productSuggestions = [
  "Montre-moi des produits pas chers",
  "Qu’est-ce que tu me recommandes ?",
  "Les meilleurs articles de cette catégorie",
];

/** Accueil de l’assistant — catalogue, reco perso, commandes si connecté. */
export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
        <Sparkles className="h-8 w-8 text-amber-500" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        Comment puis-je vous aider ?
      </h3>
      <p className="mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        Parcourez le catalogue, obtenez des suggestions selon votre historique et votre panier, et consultez
        vos commandes une fois connecté·e.
      </p>

      <div className="mt-6 w-full max-w-sm">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <Search className="h-3 w-3" />
          Idées rapides
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {productSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionClick({ text: suggestion })}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:border-amber-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-amber-600 dark:hover:bg-zinc-700"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        <Package className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Connectez-vous depuis l’en-tête pour lier vos achats à votre compte et demander le suivi des
          commandes à l’assistant.
        </span>
      </div>
    </div>
  );
}
