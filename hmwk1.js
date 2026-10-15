'use strict';

const P = 17, A = 0, B = 7;

function mod(n, p = P) {
    return ((n % p) + p) % p;
}

function inv(n, p = P) {
    n = mod(n, p);
    if (n === 0) return null;

    for (let i = 1; i < p; i++) {
        if (mod(n * i, p) === 1) return i;
    }

    return null;
}

function onCurve(pt) {
    return pt === null ||
        mod(pt.y * pt.y) === mod(pt.x * pt.x * pt.x + A * pt.x + B);
}

function pointAdd(P1, P2) {
    if (P1 === null) return P2;
    if (P2 === null) return P1;

    if (P1.x === P2.x && mod(P1.y + P2.y) === 0) {
        return null;
    }

    let slope;

    if (P1.x === P2.x && P1.y === P2.y) {
        if (mod(2 * P1.y) === 0) return null;

        const den = inv(2 * P1.y);
        slope = mod((3 * P1.x * P1.x + A) * den);
    } else {
        const den = inv(P2.x - P1.x);

        if (den === null) return null;

        slope = mod((P2.y - P1.y) * den);
    }

    const x3 = mod(slope * slope - P1.x - P2.x);
    const y3 = mod(slope * (P1.x - x3) - P1.y);

    return { x: x3, y: y3 };
}

function scalarMult(k, G) {
    let result = null;
    let addend = G;
    let n = k;

    while (n > 0) {
        if (n & 1) result = pointAdd(result, addend);

        addend = pointAdd(addend, addend);
        n = Math.floor(n / 2);
    }

    return result;
}

function pointStr(pt) {
    return pt === null
        ? 'O (point at infinity)'
        : `(${pt.x}, ${pt.y})`;
}

function enumerateCurve() {
    const pts = [];

    for (let x = 0; x < P; x++) {
        for (let y = 0; y < P; y++) {
            if (onCurve({ x, y })) {
                pts.push({ x, y });
            }
        }
    }

    return pts;
}

const allPoints = enumerateCurve();

function multiples(G, count) {
    const arr = [];
    let q = null;

    for (let k = 1; k <= count; k++) {
        q = pointAdd(q, G);
        arr.push({ k, point: q });
    }

    return arr;
}

function drawCurve(G, arr) {
    const c = document.getElementById('curveCanvas');
    const ctx = c.getContext('2d');
    const w = c.width;
    const h = c.height;
    const pad = 43;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fbfcff';
    ctx.fillRect(0, 0, w, h);

    const X = x => pad + (x + 0.5) * (w - 2 * pad) / P;
    const Y = y => h - pad - (y + 0.5) * (h - 2 * pad) / P;

    ctx.strokeStyle = '#e8edf6';
    ctx.lineWidth = 1;

    for (let i = 0; i < P; i++) {
        ctx.beginPath();
        ctx.moveTo(X(i), pad / 2);
        ctx.lineTo(X(i), h - pad / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pad / 2, Y(i));
        ctx.lineTo(w - pad / 2, Y(i));
        ctx.stroke();
    }

    ctx.strokeStyle = '#98a4b8';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(pad / 2, h - pad / 2);
    ctx.lineTo(w - pad / 2, h - pad / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pad / 2, pad / 2);
    ctx.lineTo(pad / 2, h - pad / 2);
    ctx.stroke();

    ctx.font = '11px system-ui';
    ctx.fillStyle = '#647087';
    ctx.textAlign = 'center';

    for (let i = 0; i < P; i += 2) {
        ctx.fillText(i, X(i), h - pad / 2 + 17);
    }

    ctx.textAlign = 'right';

    for (let i = 0; i < P; i += 2) {
        ctx.fillText(i, pad / 2 - 7, Y(i) + 4);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#172033';
    ctx.font = 'bold 12px system-ui';
    ctx.fillText('y', 12, pad / 2);
    ctx.fillText('x', w - pad + 6, h - pad / 2 + 4);

    allPoints.forEach(pt => {
        ctx.beginPath();
        ctx.fillStyle = '#c8d1e2';
        ctx.arc(X(pt.x), Y(pt.y), 4.1, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.beginPath();
    ctx.strokeStyle = '#6558d3';
    ctx.lineWidth = 2;

    let started = false;

    arr.forEach(o => {
        if (o.point === null) {
            started = false;
            return;
        }

        if (!started) {
            ctx.moveTo(X(o.point.x), Y(o.point.y));
            started = true;
        } else {
            ctx.lineTo(X(o.point.x), Y(o.point.y));
        }
    });

    ctx.stroke();

    arr.forEach((o, i) => {
        if (o.point === null) return;

        const px = X(o.point.x);
        const py = Y(o.point.y);

        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);

        if (i === arr.length - 1) {
            ctx.fillStyle = '#dc2626';
        } else if (i === 0) {
            ctx.fillStyle = '#6558d3';
        } else {
            ctx.fillStyle = '#0f766e';
        }

        ctx.fill();

        const label = i === 0 ? 'G' : `${o.k}G`;

        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#1f2937';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(label, px + 8, py - 6);
    });

    if (G) {
        ctx.beginPath();
        ctx.strokeStyle = '#6558d3';
        ctx.lineWidth = 2;
        ctx.arc(X(G.x), Y(G.y), 10, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.font = '11px system-ui';
    ctx.fillStyle = '#647087';
    ctx.textAlign = 'left';

    ctx.fillText(
        'Curve points in grey · multiples in teal · final Q in red · base G in purple',
        pad / 2,
        h - 10
    );
}

let currentG = { x: 1, y: 5 };
let currentK = 6;
let currentMultiples = [];

function showError(msg) {
    const el = document.getElementById('error');
    el.style.display = 'block';
    el.textContent = msg;
}

function clearError() {
    const el = document.getElementById('error');
    el.style.display = 'none';
    el.textContent = '';
}

function calculate() {
    clearError();

    const gx = Number(document.getElementById('gx').value);
    const gy = Number(document.getElementById('gy').value);
    const k = Number(document.getElementById('k').value);

    if (
        !Number.isInteger(gx) ||
        !Number.isInteger(gy) ||
        gx < 0 || gx >= P ||
        gy < 0 || gy >= P
    ) {
        showError('Enter integer coordinates from 0 to 16.');
        return;
    }

    if (!Number.isInteger(k) || k < 1 || k > 100) {
        showError('Enter an integer private scalar k from 1 to 100.');
        return;
    }

    const G = { x: gx, y: gy };

    if (!onCurve(G)) {
        showError(
            `G = (${gx}, ${gy}) is not on y² ≡ x³ + 7 (mod 17). Choose a valid curve point.`
        );

        document.getElementById('steps').innerHTML = '';
        drawCurve(null, []);
        return;
    }

    currentG = G;
    currentK = k;
    currentMultiples = multiples(G, k);

    const steps = document.getElementById('steps');

    steps.innerHTML = currentMultiples.map((o, i) => `
        <div class="point-row ${
            i === currentMultiples.length - 1 ? 'final' : ''
        } ${o.point === null ? 'infinity' : ''}">
            <span>${o.k}G = ${pointStr(o.point)}</span>
            <span class="tag">${
                i === currentMultiples.length - 1
                    ? 'TOY PUBLIC KEY'
                    : ''
            }</span>
        </div>
    `).join('');

    drawCurve(G, currentMultiples);
    renderStats();
}

function renderStats() {
    const mode = document.getElementById('statMode').value;

    const valid = currentMultiples.filter(o => o.point !== null);
    const vals = valid.map(o => o.point[mode]);

    document.getElementById('frequencyTitle').textContent =
        `${mode}-coordinate frequency`;

    const freq = Array(P).fill(0);
    vals.forEach(v => freq[v]++);

    const max = Math.max(1, ...freq);

    document.getElementById('frequencyChart').innerHTML =
        freq.map(v => `
            <div
                class="bar"
                title="${v} occurrence${v === 1 ? '' : 's'}"
                style="height:${Math.max(v ? 3 : 1, (v / max) * 125)}px"
            >
                <span>${v || ''}</span>
            </div>
        `).join('');

    document.getElementById('frequencyLabels').innerHTML =
        freq.map((v, i) => `<span>${i}</span>`).join('');

    const bits = vals
        .map(v => v.toString(2).padStart(5, '0'))
        .join('');

    const ones = [...bits].filter(b => b === '1').length;
    const zeros = bits.length - ones;

    document.getElementById('bitStats').innerHTML = `
        <div class="metric">
            <span>Zero bits</span>
            <strong>${zeros}</strong>
        </div>
        <div class="metric">
            <span>One bits</span>
            <strong>${ones}</strong>
        </div>
    `;

    document.getElementById('bitGrid').innerHTML =
        bits.split('').map(b => `
            <span class="bit ${b === '1' ? 'one' : ''}">${b}</span>
        `).join('');
}

document.getElementById('compute').addEventListener('click', calculate);

document.getElementById('statMode').addEventListener('change', renderStats);

['gx', 'gy', 'k'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') calculate();
    });
});

calculate();