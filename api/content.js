'use strict';
const {json,authed,sameOrigin,github,readContent,validateContent,contentPath,configReady}=require('../lib/server');
module.exports=async function handler(req,res){
  if(!configReady())return json(res,503,{error:'Backend is not configured.'});
  if(!authed(req))return json(res,401,{error:'Please log in.'});
  if(req.method!=='GET' && req.method!=='PUT')return json(res,405,{error:'Method not allowed.'});
  if(req.method==='PUT' && !sameOrigin(req))return json(res,403,{error:'Invalid request origin.'});
  try{
    if(req.method==='GET')return json(res,200,await readContent());
    const {content,sha}=req.body||{};
    const invalid=validateContent(content);
    if(invalid)return json(res,400,{error:invalid});
    if(typeof sha!=='string'|| !/^[a-f0-9]{40}$/.test(sha))return json(res,400,{error:'Missing revision ID. Reload the dashboard.'});
    const result=await github('PUT',contentPath,{message:'Update portfolio content via admin dashboard',content:Buffer.from(JSON.stringify(content,null,2)+'\n').toString('base64'),sha});
    return json(res,200,{ok:true,sha:result.content?.sha,commit:result.commit?.sha});
  }catch(e){console.error('Portfolio API failed:',e.message);return json(res,e.status===409?409:502,{error:e.message||'Unable to save content.'});}
};
