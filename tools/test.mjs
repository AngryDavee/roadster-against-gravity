// Run the browser acceptance suite against this checkout on an isolated port.
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const port=process.env.ROADSTER_TEST_PORT||'4187';
const url=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['tools/serve.mjs'],{env:{...process.env,ROADSTER_PORT:port},stdio:'inherit'});
let startupError;
server.on('error',error=>startupError=error);
try {
  let ready=false;
  for(let i=0;i<100;i++){
    if(startupError)throw startupError;
    if(server.exitCode!==null)throw new Error('Test server exited. Choose a free ROADSTER_TEST_PORT.');
    try {ready=(await fetch(url)).ok;}catch{}
    if(ready)break;
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  if(!ready)throw new Error('Test server did not become ready.');
  const check=spawn(process.execPath,['tools/check.mjs'],{env:{...process.env,ROADSTER_URL:url},stdio:'inherit'});
  const [code]=await once(check,'exit');
  process.exitCode=code??1;
}finally{server.kill();}
