export function database(env) {
  if (!env.DB) throw new Error('Archive database is unavailable');
  return env.DB;
}
