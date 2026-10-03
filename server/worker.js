import { database } from './db.js';
import { validProfile } from './validation.js';
const json = (body,status=200) => new Response(JSON.stringify(body), { status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'} });
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (url.pathname !== '/api/archive') return json({error:'找不到这个入口'},404);
    // Sites sets this identity after the platform sign-in and access gate.
    const userId = request.headers.get('oai-authenticated-user-id');
    if (!userId) return json({error:'请登录后使用个人档案',signin:'/signin-with-chatgpt?return_to=%2F%23archive'},401);
    try {
      const db = database(env);
      if (request.method === 'GET') {
        const row = await db.prepare('SELECT payload, revision, updated_at FROM exploration_profiles WHERE user_id = ?').bind(userId).first();
        return json({profile:row?JSON.parse(row.payload):null,revision:row?.revision||0,updatedAt:row?.updated_at||null});
      }
      if (request.method !== 'PUT') return json({error:'不支持这个操作'},405);
      if (request.headers.get('Origin') && request.headers.get('Origin') !== url.origin) return json({error:'请从本站保存档案'},403);
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({error:'请使用JSON格式'},415);
      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > 65536) return json({error:'档案超过大小限制'},413);
      let body;try { body=JSON.parse(raw); } catch { return json({error:'档案格式无法读取'},400); }
      if (!Number.isSafeInteger(body.revision) || body.revision<0 || !validProfile(body.profile)) return json({error:'档案内容或输入范围无效'},400);
      const now = new Date().toISOString();
      const row=await db.prepare(`INSERT INTO exploration_profiles (user_id, payload, revision, updated_at)
        VALUES (?, ?, 1, ?)
        ON CONFLICT(user_id) DO UPDATE SET payload=excluded.payload, revision=exploration_profiles.revision+1, updated_at=excluded.updated_at
        WHERE exploration_profiles.revision = ? RETURNING revision, updated_at`).bind(userId,JSON.stringify(body.profile),now,body.revision).first();
      if (!row) return json({error:'另一台设备已更新档案。请先读取云端版本，再决定如何保存。',conflict:true},409);
      return json({revision:row.revision,updatedAt:row.updated_at});
    } catch (error) {
      console.error('Archive request failed',error.message);
      return json({error:'档案服务暂时不可用。当前输入仍保留，请稍后重试。'},503);
    }
  }
};
