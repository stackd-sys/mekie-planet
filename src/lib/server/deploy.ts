/* Volta a construir o site na Vercel (para o stock e os preços novos aparecerem nas páginas).
   Precisa de VERCEL_DEPLOY_HOOK: Vercel > Settings > Git > Deploy Hooks. */
export const hasDeployHook = () => Boolean(process.env.VERCEL_DEPLOY_HOOK);

export async function rebuildSite(reason: string) {
  const hook = process.env.VERCEL_DEPLOY_HOOK;
  if (!hook) {
    console.warn(`[Mekie] Site não reconstruído (falta VERCEL_DEPLOY_HOOK): ${reason}`);
    return false;
  }
  try {
    const res = await fetch(hook, { method: 'POST' });
    return res.ok;
  } catch (e) {
    console.error('[Mekie] Deploy hook falhou:', (e as Error).message);
    return false;
  }
}
