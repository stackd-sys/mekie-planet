export const prerender = false;
import type { APIRoute } from 'astro';
import { logout } from '../../../lib/server/auth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  await logout(cookies);
  return redirect('/admin/entrar/');
};
