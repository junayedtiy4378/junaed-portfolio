'use strict';
const {configReady,json,authed,passwordCorrect,signedToken,cookieHeader,sameOrigin}=require('../lib/server');
module.exports=async function handler(req,res) {
  res.setHeader('Allow','GET, POST');
  if(req.method==='GET')return json(res,200,{authenticated:authed(req),configured:configReady()});
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed.'});
  if(!sameOrigin(req))return json(res,403,{error:'Invalid request origin.'});
  if(req.body?.action==='logout'){
    res.setHeader('Set-Cookie',cookieHeader('',0));return json(res,200,{ok:true});
  }
  if(!configReady())return json(res,503,{error:'Admin backend is not configured. See ADMIN_SETUP.md.'});
  if(typeof req.body?.password!=='string' || req.body.password.length>500 || !passwordCorrect(req.body.password))return json(res,401,{error:'Incorrect password.'});
  res.setHeader('Set-Cookie',cookieHeader(signedToken(),12*60*60));
  return json(res,200,{ok:true});
};
