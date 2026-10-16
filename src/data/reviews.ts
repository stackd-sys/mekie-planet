/* Opiniões de quem já usa as peças. Ficam ligadas ao nome do produto, por isso valem para todas as cores. */
import type { Product } from './products';

export type Review = { author: string; rating: number; text: string };

/** Mostra só o primeiro nome e a inicial do apelido (Isabel M.) */
const short = (name: string) => {
  const [first, ...rest] = name.trim().split(/\s+/);
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
};

const r = (author: string, text: string, rating = 5): Review => ({ author: short(author), rating, text });

export const reviewsByName: Record<string, Review[]> = {
  'Hoodie Cogumelos': [
    r('Isabel Marques', 'Muito confortável e quentinho. O bordado dos cogumelos é ainda mais bonito ao vivo. Já foi à máquina várias vezes e está como novo.'),
    r('Rui Neves', 'Comprei o M e assenta largo como eu gosto. O tecido é grosso e a qualidade nota-se logo.'),
    r('Carolina', 'O amarelo é lindo, chamam-me sempre a atenção quando o uso. Virou o meu hoodie de todos os dias.'),
  ],
  'Hoodie Esqueleto': [
    r('Vitor Marques', 'Uso para tudo, até para ir trabalhar. Bom tecido, quente, e o bordado é discreto mas tem pinta.'),
    r('Tomé Abaço', 'O preto com o esqueleto ficou mesmo bem. Fiel ao tamanho e o capuz é grande, o que eu gosto.'),
    r('Henrique Tavares', 'Já lavei muitas vezes e o bordado não mexeu. Recomendo.'),
  ],
  'T-shirt Cogumelos': [
    r('Andreia Marques', 'Adoro o corte largo. O algodão é grosso, não fica transparente, e o bordado dá outro ar à t-shirt.'),
    r('Gonçalo Tavares', 'Leve e fresca para o verão. O pormenor na manga faz a diferença.'),
    r('Frederico Silva', 'Boa qualidade pelo preço. Já pedi a outra cor.'),
  ],
  'Cap Mekie': [
    r('Elder Silva', 'A bombazina é muito gira e a tira ajusta bem. Uso quase todos os dias.'),
    r('Miguel Seborro', 'Assenta bem e é leve. Combina com tudo.'),
  ],
  'Bucket Hat Mekie': [
    r('Luís Santos', 'Levei para a praia o verão todo. Protege bem do sol e tem um estilo descontraído.'),
  ],
  'Meias Mekie': [
    r('Rafael Silva', 'Confortáveis e as cores não desbotaram depois de lavar. São as minhas meias preferidas.'),
  ],
  'Meias Esqueleto': [
    r('Raquel', 'Super giras e confortáveis. Toda a gente pergunta onde as comprei.'),
  ],
  'Scrunchie Mekie': [
    r('Célia Eufrázio', 'Feito à mão e nota-se o cuidado. Segura bem o cabelo sem o estragar.'),
  ],
};

export const reviewsOf = (p: Product) => reviewsByName[p.name] ?? [];

export const ratingOf = (p: Product) => {
  const list = reviewsOf(p);
  if (!list.length) return null;
  const avg = list.reduce((n, x) => n + x.rating, 0) / list.length;
  return { value: Math.round(avg * 10) / 10, count: list.length };
};
