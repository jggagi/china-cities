import worker from './worker.js';
// Local preview only. This file is never included in the production Worker bundle.
export default {fetch(request,env,ctx){
  const headers=new Headers(request.headers);
  if (!headers.has('oai-authenticated-user-id') && !headers.has('x-preview-anonymous')) headers.set('oai-authenticated-user-id','local-preview-owner');
  return worker.fetch(new Request(request,{headers}),env,ctx);
}};
