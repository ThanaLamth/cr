# Worldline local demo

Run `npm install` then `npm run dev -- --port 4173`.
Open http://127.0.0.1:4173 and scroll to play the 3D scene.

Uses the supplied compiled Worldline hero module (375029), with a small React runtime adapter. The original module is unchanged. Two public preview CSS files were downloaded from jiro.build to reproduce its styling. This is the hero/navigation/3D sequence, not the full paid template or original TSX project. Tour/sign-in links are original placeholder anchors and do not implement booking or authentication.

Google Fonts and Three.js load from external CDNs as specified in the original code. WebGL is required for the 3D scene. No Jiro account, payment API, or backend is used.
