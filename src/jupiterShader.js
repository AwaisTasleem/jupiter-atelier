export const vertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  uniform float uTime;
  uniform vec3 uPal;      // weights: natural, infrared, ultraviolet
  uniform vec3 uLightDir;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main(){
    float lat = vUv.y;
    // bands: stretched noise, drifting slowly (spot is NOT affected)
    vec2 q = vec2(vUv.x * 6.0 + uTime * 0.01 * (sin(lat*30.0)), lat * 14.0);
    float turb = fbm(vec2(vUv.x * 14.0 + uTime * 0.02, lat * 40.0)) - 0.5;
    float bands = sin(lat * 60.0 + turb * 3.0) * 0.5 + 0.5;
    bands = mix(bands, fbm(q * 1.5), 0.35);

    vec3 cream = vec3(0.86, 0.78, 0.64);
    vec3 tan   = vec3(0.72, 0.52, 0.34);
    vec3 rust  = vec3(0.55, 0.28, 0.18);
    vec3 col = mix(tan, cream, bands);
    col = mix(col, rust, smoothstep(0.55, 0.9, fbm(vec2(vUv.x*8.0, lat*22.0))) * 0.5);

    // Great Red Spot, fixed at uv (0.25, 0.36)
    vec2 d = (vUv - vec2(0.25, 0.36)) * vec2(1.0, 2.2);
    float spot = smoothstep(0.075, 0.03, length(d));
    float swirl = fbm(d * 40.0 + 3.0);
    col = mix(col, vec3(0.70, 0.25, 0.16) * (0.8 + swirl * 0.4), spot);

    // palette treatments (stylised)
    vec3 infra = vec3(col.r * 1.1, col.g * 0.45, col.b * 0.3) + vec3(0.08, 0.0, 0.1) * bands;
    float lum = dot(col, vec3(0.3, 0.59, 0.11));
    vec3 uv = vec3(lum * 0.6, lum * 0.55, lum * 1.25) + vec3(0.06, 0.0, 0.12) * spot;
    vec3 tinted = col * uPal.x + infra * uPal.y + uv * uPal.z;

    // lighting + rim
    vec3 n = normalize(vNormalW);
    float diff = clamp(dot(n, normalize(uLightDir)), 0.0, 1.0);
    float light = 0.06 + diff * 1.1;
    float fres = pow(1.0 - clamp(dot(n, normalize(vViewDir)), 0.0, 1.0), 3.0);
    vec3 rim = vec3(0.9, 0.75, 0.55) * uPal.x + vec3(1.0, 0.45, 0.25) * uPal.y + vec3(0.55, 0.5, 1.0) * uPal.z;

    gl_FragColor = vec4(tinted * light + rim * fres * 0.35 * (0.3 + diff), 1.0);
  }
`;