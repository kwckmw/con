# 같은 폴더의 조각 파일을 합쳐 index.html 하나로 만든다: python3 build.py
import os
D=os.path.dirname(os.path.abspath(__file__))+'/src/'
r=lambda n:open(D+n,encoding='utf-8').read()
f=r('factory.js')
for k,fn in [('LOWER','lower2.js'),('UPPER','upper.js'),('WORK','work2.js')]:
    f=f.replace('/*@@%s@@*/'%k,r(fn))
f=f.replace("api.lampMat=lampMat;","lampMat.userData.lamp=true;api.lampMat=lampMat;")
t=r('tpl.html')
parts={'UTIL':r('util.js'),'HXD':r('hxd.js'),'FACTORY':f}
for k in ['CORE','TRUCK','WORLD','CRANE','EXCAV','TRAFFIC','MAIN']:
    parts[k]=r(k.lower()+'.js')
for k,v in parts.items():
    t=t.replace('/*@@%s@@*/'%k,v)
open(os.path.dirname(os.path.abspath(__file__))+'/index.html','w',encoding='utf-8').write(t)
print('index.html',len(t))
