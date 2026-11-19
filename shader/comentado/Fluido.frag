precision highp float;
uniform vec2  u_resolution;
uniform float u_time;

// Advección de dos puntos a la vez, guardados en un vec4: (píxel.xy, vecino.xy).
// Campo de flujo = 6 ondas senoidales; cada una empuja en perpendicular
// a su dirección, así que el flujo es incompresible.
//  - cos(l+vec2(0,11))  ≈ (cos l, sin l): dirección de la onda
//  - cos(l+vec2(11,22)) ≈ (sin l,-cos l): perpendicular, dirección del empuje
//  - vec2 * mat2(q) da los productos escalares con los dos puntos de golpe
vec4 advect(vec4 q, float dt) {
    for (float i = 0.; i < 24.; i++)
        for (float l = 1.; l < 7.; l++)
            q -= cos(l + vec2(11, 22)).xyxy
               * cos(cos(l + vec2(0, 11)) * mat2(q) * (l + l) + u_time + l).xxyy
               / l * dt;
    return q;
}

void main() {
    vec4  q;            // (píxel.xy, vecino.xy)
    vec2  value = vec2(0);   // x: píxel, y: vecino
    float phase, dt;

    // Dos capas desfasadas medio ciclo. En cada una, dt crece y se reinicia;
    // el peso triangular min(dt, .125-dt) oculta el reinicio con un fundido.
    for (float layer = 0.; layer < 1.; layer += .5) {
        phase = u_time / 3. + layer;
        dt    = fract(phase) / 8.;

        // Coordenadas del píxel y de su vecino derecho (para el relieve)
        q = (gl_FragCoord.xyxy + vec4(0, 0, 1, 0)) / u_resolution.y * 2.;

        q = advect(q, dt);

        // Rayas senoidales (4 octavas) muestreadas en los puntos advectados
        for (float o = 1.; o < 5.; o++)
            value += min(dt, .125 - dt) * sin(q.xz * o * o + q.yw * o + phase) / o;
    }

    phase = abs(value.x);   // se reutiliza como |valor|
    gl_FragColor = vec4(
        smoothstep(.03, .05, vec3(value.x, phase * .5, -value.x))  // rojo (+), azul (−), verde en los extremos
        + (abs(value.y) - phase) * 30.,                            // derivada horizontal → relieve
        1);
}