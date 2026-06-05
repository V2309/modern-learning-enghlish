export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateConnection } = await import('./lib/db');
    await validateConnection();
  }
}
