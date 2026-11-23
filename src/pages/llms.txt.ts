/* /llms.txt: resumo da Mekie para assistentes de IA (ChatGPT, Claude, Perplexity, Gemini), no formato llms.txt.
   Gerado em cada deploy com os dados da loja, por isso os preços, as peças e as condições estão sempre atualizados. */
import type { APIRoute } from 'astro';
import { llmsSummary } from '../data/llms';

export const GET: APIRoute = () =>
  new Response(llmsSummary(false), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
