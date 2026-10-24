"""Atlas streamable-HTTP MCP client. Credentials stay in process memory.

Usage: python3 tools/atlas_mcp.py list
       python3 tools/atlas_mcp.py call TOOL arguments.json
No keys or Authorization headers are printed or persisted.
"""
import json, os, subprocess, sys, shutil, urllib.request, urllib.error

ENDPOINT='https://mcp.prod-market.atlas.design/mcp'

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs): return None

class Atlas:
    def __init__(self):
        self.key=os.environ.get('ATLAS_API_KEY','').strip()
        if not self.key and shutil.which('launchctl'):
            self.key=subprocess.run(['launchctl','getenv','ATLAS_API_KEY'],capture_output=True,text=True).stdout.strip()
        if not self.key: raise RuntimeError('Atlas key is not loaded; no request sent.')
        self.session=None;self.counter=0;self.version='2025-03-26';self.opener=urllib.request.build_opener(NoRedirect)
        init=self.request('initialize',{'protocolVersion':self.version,'capabilities':{},'clientInfo':{'name':'404-roadster-local','version':'0.1.0'}})
        self.version=init.get('protocolVersion',self.version)
        self.request('notifications/initialized',{},notification=True)

    def request(self,method,params,notification=False):
        self.counter+=1
        payload={'jsonrpc':'2.0','method':method,'params':params}
        if not notification:payload['id']=self.counter
        headers={'Authorization':'Bearer '+self.key,'Content-Type':'application/json','Accept':'application/json, text/event-stream','MCP-Protocol-Version':self.version}
        if self.session:headers['Mcp-Session-Id']=self.session
        req=urllib.request.Request(ENDPOINT,data=json.dumps(payload).encode(),headers=headers,method='POST')
        try:
            with self.opener.open(req,timeout=300) as response:
                self.session=response.headers.get('Mcp-Session-Id',self.session)
                if notification:return {}
                ctype=response.headers.get('Content-Type','')
                if 'text/event-stream' in ctype:
                    data=[]
                    for raw in response:
                        line=raw.decode().rstrip('\r\n')
                        if line.startswith('data:'):data.append(line[5:].lstrip())
                        elif not line and data:
                            msg=json.loads('\n'.join(data));data=[]
                            if msg.get('id')==self.counter:break
                    else:raise RuntimeError('Atlas MCP stream ended without response.')
                else:msg=json.load(response)
        except urllib.error.HTTPError as e:
            raise RuntimeError('Atlas MCP returned HTTP '+str(e.code)) from None
        if 'error' in msg:raise RuntimeError('Atlas MCP error: '+json.dumps(msg['error']))
        return msg.get('result',{})

if __name__=='__main__':
    try:
        a=Atlas()
        if sys.argv[1]=='list':r=a.request('tools/list',{})
        elif sys.argv[1]=='call':
            with open(sys.argv[3]) as f:args=json.load(f)
            r=a.request('tools/call',{'name':sys.argv[2],'arguments':args})
        else:raise RuntimeError('Use list or call TOOL args.json')
        print(json.dumps(r,indent=2))
    except Exception as e:
        print(str(e),file=sys.stderr);sys.exit(1)
