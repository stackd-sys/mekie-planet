/* /llms-full.txt: a versão completa do /llms.txt, com todas as peças, as perguntas frequentes e as respostas por categoria. */
import type { APIRoute } from 'astro';
import { llmsSummary } from '../data/llms';

export const GET: APIRoute = () =>
  new Response(llmsSummary(true), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
