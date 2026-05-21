# RSKech

Site React/Vite en JavaScript/JSX pour RSKech.

## Installation

```bash
npm install
npm run dev
```

Puis ouvre l'URL affichée dans le terminal, généralement :

```bash
http://localhost:5173
```

## Structure

```txt
RSKech/
├── index.html
├── package.json
├── public/
│   ├── images/
│   └── videos/
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## Vidéo scroll-driven (hero)

La hero utilise une vidéo dont la lecture est pilotée par le scroll (pattern Apple/AirPods).
Pour que le scrubbing soit fluide, la vidéo source doit être réencodée avec **un keyframe sur chaque frame** (sinon le navigateur doit décoder des GOP entiers à chaque seek → saccades).

Commande recommandée :

```bash
ffmpeg -i input.mp4 -an -vf "fps=60,scale=1920:-2" \
  -c:v libx264 -preset veryfast -crf 18 \
  -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart \
  output-scroll.mp4
```

Puis remplacer le fichier dans `public/videos/` et mettre à jour la `<source>` dans `Hero` (src/App.jsx).

Notes :
- `-g 1 -keyint_min 1 -sc_threshold 0` → chaque frame est un I-frame, seek instantané.
- `-an` → piste audio supprimée (vidéo muette).
- `-movflags +faststart` → metadata en début de fichier, lecture immédiate.
- Cible ≈ 5-10 Mo pour une vidéo de 5-8 s. Sinon descendre `crf` ou `scale`.
