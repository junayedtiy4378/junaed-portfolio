'use strict';
const crypto=require('node:crypto');
const {json,authed,sameOrigin,github,configReady}=require('../lib/server');
module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed.'});
  if(!configReady()||!authed(req))return json(res,401,{error:'Please log in.'});
  if(!sameOrigin(req))return json(res,403,{error:'Invalid request origin.'});
  try{
    const {name='',data='',type=''}=req.body||{};
    const allowed={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'};
    const ext=allowed[type];
    if(!ext || typeof data!=='string' || data.length>2400000 || !/^[a-zA-Z0-9+/]+={0,2}$/.test(data))return json(res,400,{error:'Upload a JPG, PNG, WEBP, or GIF smaller than 1.5 MB.'});
    const bytes=Buffer.from(data,'base64');
    if(!bytes.length || bytes.length>1500000)return json(res,400,{error:'Maximum file size is 1.5 MB.'});
    const magic=ext==='png'?bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')):ext==='jpg'?bytes[0]===255 && bytes[1]===216 && bytes[2]===255:ext==='gif'?['GIF87a','GIF89a'].includes(bytes.toString('ascii',0,6)):bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WEBP';
    if(!magic)return json(res,400,{error:'The image file does not match its format.'});
    const stem=String(name).replace(/\.[^.]+$/,'').toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').slice(0,40)||'photo';
    const path=`assets/uploads/${stem}-${crypto.randomUUID().slice(0,8)}.${ext}`;
    await github('PUT',path,{message:`Upload portfolio image: ${stem}`,content:bytes.toString('base64')});
    return json(res,200,{ok:true,path:'/'+path});
  }catch(e){console.error('Portfolio media failed:',e.message);return json(res,502,{error:e.message||'Upload failed.'});}
};
