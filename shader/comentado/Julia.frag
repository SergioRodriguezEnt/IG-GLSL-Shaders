precision highp float;
uniform vec2  u_resolution;
uniform float u_time;

const int   MAX_ITER = 99;
const float BAILOUT2 = 81.;          // radio de escape al cuadrado (9²)
const vec3  PHASE    = vec3(0, .6, 1); // desfase RGB de la paleta

void main() {
    float t     = u_time;
    float iter  = 0.;
    float trap  = 9.;                // orbit trap: mínima |z|² de la órbita

    // Coordenadas de pantalla centradas, con la altura de -1 a 1
    vec2 res = u_resolution;
    vec2 uv  = (2. * gl_FragCoord.xy - res) / res.y;

    // Zoom oscilante (1.5..2.5) y rotación.
    // cos(a + (0,33,11,0)) ≈ (cos a, -sin a, sin a, cos a), porque 33 ≈ π/2 y 11 ≈ 3π/2 (mod 2π)
    float zoom = .5 * cos(t * .05) + 2.;
    vec2  z    = uv * zoom * mat2(cos(t * .1 + vec4(0, 33, 11, 0)));

    // Parámetro de Julia: gira en círculo con radio que oscila entre .45 y .65
    // (sin(x + (1.57,0)) ≈ (cos x, sin x))
    vec2 c = (.55 + .1 * sin(t * .3)) * sin(t * .2 + vec2(1.57, 0));

    // Iteración z = z³ + c
    for (int k = 0; k < MAX_ITER; k++) {
        mat2 mulZ = mat2(z, -z.y, z.x);   // multiplicación compleja por z
        z = mulZ * mulZ * z + c;          // z³ + c
        trap = min(trap, dot(z, z));
        if (dot(z, z) > BAILOUT2) break;
        iter++;
    }

    vec3 color;
    if (iter < float(MAX_ITER)) {
        // Exterior: conteo suavizado (para z³: log(log|z|² / 2log9) / log3)
        float smoothIter = iter - log(log(dot(z, z)) / 4.4) * .91;
        color = .5 + .5 * cos(3.4 + t * .3 + smoothIter * .4 + PHASE);
    } else {
        // Interior: color según el orbit trap, con brillo sqrt(trap)
        color = sqrt(trap) * (.5 + .5 * cos(log(trap) + t + PHASE));
    }

    // Viñeta
    color *= 1. - .2 * dot(uv, uv);

    gl_FragColor = vec4(color, 1);
}