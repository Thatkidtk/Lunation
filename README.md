<p align="center">
  <img src="public/favicon.svg" width="72" height="72" alt="Lunation">
</p>

# Lunation — Cycle tracking that respects your privacy

Stay in tune with your body. Lunation helps you log periods, track symptoms and medications, and see what’s coming next — privately, beautifully, and on your terms.

[▶ Try Lunation Now](https://thatkidtk.github.io/Lunation/) · No sign-up required

![Status](https://img.shields.io/badge/status-beta-yellow)
[![Deploy](https://github.com/Thatkidtk/Lunation/actions/workflows/deploy.yml/badge.svg)](https://github.com/Thatkidtk/Lunation/actions/workflows/deploy.yml)

## Why Lunation

- Personal, not extractive: your data stays on your device by default.
- Calm, modern design you’ll enjoy opening every day.
- Smart predictions that get better as you track.
- Built for real life: fast, offline-friendly, and mobile-first.

## What you can do

- Track your cycle: log start/end dates and flow intensity.
- Understand patterns: view insights and helpful trends.
- Log symptoms: cramps, moods, headaches, and more — with severity.
- Track medications and supplements — pause, resume, or delete with undo.
- See what’s next: next period, ovulation, and fertile window at a glance.

## Highlights

- 100% local by default: nothing leaves your browser unless you choose.
- Optional at‑rest encryption with a passphrase you control.
- Accessible feedback: toasts and screen‑reader announcements built‑in.
- Works great on phones (single‑column, large tap targets, safe areas).
- PWA‑style offline support; quick to load and use anywhere.

## Get started (it’s quick)

1) Open Lunation and complete the one‑minute welcome.
2) Add your most recent period or log symptoms for today.
3) Check your dashboard for predictions and upcoming days.

That’s it — keep tracking to make insights smarter over time.

## Privacy & safety

- Private by default: data is stored locally in your browser.
- Optional local encryption: enable a passphrase in Settings.
- Export anytime: your information stays under your control.
- Medical disclaimer: Lunation provides general insights only and is not a medical device. Always consult a clinician for health advice.

## Roadmap (what’s next)

- Deeper symptom correlations and trend visualizations.
- More flexible reminders and smart notifications.
- Richer data export options.

Have ideas? Open an issue — we’d love your feedback.

## FAQ

— Do I need an account?  
No. Lunation works entirely on‑device. A simple lock (local encryption) is available in Settings.

— Will it work offline?  
Yes. Once loaded, Lunation continues to work without a connection.

— Can I switch devices?  
Data is local to your browser. Use the Export tool to migrate.

## For developers

Lunation is a React + Vite app. You can run it locally for development:

```bash
npm install
npm run dev
```

Environment variables

- `VITE_SENTRY_DSN` (optional): enable browser crash reporting.
- `VITE_APP_VERSION` (optional): release tag; defaults to package.json version.

Build and preview

```bash
npm run build
npm run preview
```

E2E smoke tests (optional)

```bash
npx playwright install
npm run dev &
npx playwright test
```

## Support

- Found a bug or have a request? Please open a GitHub issue.
- Press/feedback: start an issue and we’ll get back quickly.

—

Made with care to support better reproductive health.

Live app: https://thatkidtk.github.io/Lunation/

