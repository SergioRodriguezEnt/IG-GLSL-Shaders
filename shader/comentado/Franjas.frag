precision highp float;
uniform vec2  u_resolution;
uniform float u_time;

const float ROWS        = 50.;   // número de filas en pantalla
const int   SEGMENTS    = 10;    // segmentos por bloque
const float MIN_WIDTH   = .02;   // anchura mínima de un segmento
const float CYCLE_SPEED = .1;    // velocidad del oscilador global
const float MAX_SPEED   = 2.5;   // velocidad máxima de scroll de una fila

// Hash pseudoaleatorio en [0,1)
float rand(vec2 v) {
    return fract(sin(dot(v, vec2(13, 7.9))) * 4e4);
}

// Anchura del segmento i del bloque (más desiguales cuanto mayor es activity)
float segmentWidth(float blockId, int i, float activity) {
    return MIN_WIDTH + pow(rand(vec2(blockId, i)), 5. * activity);
}

void main() {
    vec2 uv = ROWS * gl_FragCoord.xy / u_resolution.y;

    float row      = floor(uv.y);
    float activity = abs(sin(u_time * CYCLE_SPEED));                    // oscilador lento 0..1
    float rowSpeed = (rand(vec2(row)) * 2. - 1.) * MAX_SPEED;           // velocidad propia de la fila
    float blockX   = uv.x * .1 - u_time * rowSpeed;                     // bloques de 10 unidades
    float blockId  = floor(blockX) + row * 1e3;

    // Anchura total del bloque
    float totalWidth = 0.;
    for (int i = 0; i < SEGMENTS; i++)
        totalWidth += segmentWidth(blockId, i, activity);

    // Posición del píxel dentro del bloque
    float pixelPos = totalWidth * fract(blockX);

    // Segmento que contiene al píxel: encendido aleatorio según activity, con perfil en pulso
    float segStart  = 0.;
    float intensity = 0.;
    for (int i = 0; i < SEGMENTS; i++) {
        float width = segmentWidth(blockId, i, activity);
        if (segStart <= pixelPos) {
            float isOn = step(rand(vec2(i, blockId)), activity);
            intensity  = isOn * sin(3. * (pixelPos - segStart) / width);
        }
        segStart += width;
    }

    // Paleta arcoíris por fila × perfil vertical, con gamma aproximada
    vec3  rowColor   = .5 + .5 * cos(row * .2 + u_time + vec3(0, 2, 4));
    float rowProfile = sin(3. * fract(uv.y));
    gl_FragColor = vec4(sqrt(intensity * rowColor * rowProfile), 1);
}