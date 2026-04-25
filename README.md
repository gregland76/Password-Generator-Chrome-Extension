# Password Generator Chrome/Edge Extension

Générateur de mots de passe personnalisable pour Chrome et Edge, inspiré de l’identité visuelle de [gregland.net](https://gregland.net) et [ti.gregland.net](https://ti.gregland.net).

## Fonctionnalités

- Génération de mots de passe robustes selon vos critères :
  - Longueur paramétrable (6 à 64 caractères)
  - Lettres minuscules, majuscules, chiffres, caractères spéciaux
  - Option pour exclure les caractères ambigus (0, O, l, I, 1)
- Jauge de robustesse dynamique
- Copie rapide du mot de passe généré
- Sauvegarde automatique des préférences (chrome.storage.sync)
- Interface moderne, thème brique #9c3024, adaptée à l’univers GregLand
- Footer crédit : Grégory HARGOUS, [gregland.net](https://gregland.net)

## Installation (développement)

1. Téléchargez ou clonez ce dossier
2. Ouvrez `chrome://extensions` (ou `edge://extensions`)
3. Activez le mode développeur
4. Cliquez sur « Charger l’extension non empaquetée » et sélectionnez ce dossier
5. L’icône apparaît dans la barre d’outils, cliquez pour ouvrir le popup

## Personnalisation

- Les couleurs principales sont définies dans `popup.css` (variables CSS en haut du fichier)
- Les icônes sont dans le dossier `assets/`
- Le footer et le lien sont modifiables dans `popup.html`

## Publication

- Manifest V3 compatible Chrome et Edge
- Prêt à être empaqueté pour le Chrome Web Store ou Edge Add-ons

---

Développé par Grégory HARGOUS — [gregland.net](https://gregland.net)
