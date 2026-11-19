#define r(v) fract(sin(dot(v,vec2(13,7.9)))*4e4)
#define W .02+pow(r(vec2(b,i)),5.*t)
#define L for(int i=0;i<10;i++)
precision highp float;uniform vec2 u_resolution;uniform float u_time;void main(){vec2 p=50.*gl_FragCoord.xy/u_resolution.y;float y=floor(p.y),t=abs(sin(u_time*.1)),x=p.x*.1-u_time*(r(vec2(y))*5.-2.5),b=floor(x)+y*1e3,T=0.,a=T,f;L T+=W;T*=fract(x);L f=a>T?f:step(r(vec2(i,b)),t)*sin(3.*(T-a)/(W)),a+=W;gl_FragColor=vec4(sqrt(f*(.5+.5*cos(y*.2+u_time+vec3(0,2,4)))*sin(3.*(p.y-y))),1);}