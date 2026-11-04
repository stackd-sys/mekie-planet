/* Fotografias para o catálogo da Meta (Facebook e Instagram): JPG em vez de WebP.
   Peças recortadas ficam num quadrado de 1080 px com fundo claro; fotos do lookbook ficam com 1080 px de largura;
   cada pack junta as duas peças numa só imagem. Correr depois de juntar fotografias novas:
   node scripts/meta-images.mjs   (o resultado vai para public/images/meta/ e entra no repositório) */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pub = (...p) => path.join(root, 'public', ...p);
const out = pub('images', 'meta');
const BG = { r: 242, g: 241, b: 238 };
fs.mkdirSync(path.join(out, 'products'), { recursive: true });
fs.mkdirSync(path.join(out, 'lookbook'), { recursive: true });
fs.mkdirSync(path.join(out, 'packs'), { recursive: true });

const list = (dir) => fs.readdirSync(pub('images', dir)).filter((f) => f.endsWith('.webp') && !f.endsWith('-sm.webp') && !f.startsWith('cartao-presente'));

/* peça recortada: centrada num quadrado claro, com margem */
async function cutout(src, size = 1080, pad = 0.07) {
  const inner = Math.round(size * (1 - pad * 2));
  const piece = await sharp(src).resize(inner, inner, { fit: 'contain', background: { ...BG, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 3, background: BG } }).composite([{ input: piece, gravity: 'center' }]);
}

let n = 0;
for (const f of list('products')) {
  const dest = path.join(out, 'products', f.replace(/\.webp$/, '.jpg'));
  const meta = await sharp(pub('images', 'products', f)).metadata();
  const img = meta.hasAlpha ? await cutout(pub('images', 'products', f)) : sharp(pub('images', 'products', f)).resize({ width: 1080, withoutEnlargement: true }).flatten({ background: BG });
  await img.jpeg({ quality: 84, mozjpeg: true }).toFile(dest);
  n++;
}
for (const f of list('lookbook')) {
  await sharp(pub('images', 'lookbook', f)).resize({ width: 1080, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(out, 'lookbook', f.replace(/\.webp$/, '.jpg')));
  n++;
}

/* packs: as duas peças lado a lado, a segunda um pouco mais abaixo */
const packs = {
  'hoodie-tshirt': ['hoodie-cogumelos-black-1', 'tshirt-black-mushrooms-1'],
  'crewneck-tshirt': ['sweat-mekie-black-1', 'tshirt-khaki-mushrooms-1'],
  'hoodie-cap': ['hoodie-cogumelos-yellow-1', 'cap-black-1'],
  'tshirt-cap': ['tshirt-black-mushrooms-1', 'cap-brown-1'],
};
for (const [id, [a, b]] of Object.entries(packs)) {
  const size = 1080, piece = 600;
  const [pa, pb] = await Promise.all([a, b].map((x) => sharp(pub('images', 'products', `${x}.webp`)).resize(piece, piece, { fit: 'contain', background: { ...BG, alpha: 0 } }).toBuffer()));
  await sharp({ create: { width: size, height: size, channels: 3, background: BG } })
    .composite([{ input: pa, left: 20, top: 150 }, { input: pb, left: size - piece - 20, top: 330 }])
    .jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(out, 'packs', `${id}.jpg`));
  n++;
}
console.log(`${n} imagens em public/images/meta/`);
