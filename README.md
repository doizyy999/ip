# IPIntel

Educational cybersecurity tool untuk analisis IP address & network intelligence.

## Stack

- Next.js 16.3.5
- React 19.3.0
- TypeScript
- Tailwind CSS 3
- Recharts 3.10.1
- React Leaflet 5

## Development

```bash
npm install
npm run dev -- --webpack
```

Buka `http://localhost:3000`.

Next.js 16 menggunakan Turbopack sebagai bundler default. Untuk lingkungan yang membutuhkan Webpack, gunakan flag `--webpack` pada `next dev` atau `next build`.

## Termux Android

Simpan source yang diedit di `/storage/emulated/0/nextfw/ipintel`, lalu sync ke filesystem internal Termux sebelum menjalankan npm agar `node_modules` dapat menggunakan symlink:

```bash
rsync -av --delete \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.git/' \
  --exclude='*.log' \
  /storage/emulated/0/nextfw/ipintel/ \
  ~/nextfw/ipintel/
```

Kemudian:

```bash
cd ~/nextfw/ipintel
npm install
npm run dev -- --webpack
```
