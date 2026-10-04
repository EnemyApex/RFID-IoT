// ============================================================
// FICHIER : tailwind.config.js
// RÔLE   : Indique à Tailwind quels fichiers scanner pour
//          générer uniquement les classes CSS utilisées.
// ============================================================
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: []
};
