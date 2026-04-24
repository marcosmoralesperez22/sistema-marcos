// =============================================
// CHARTS — Lightweight canvas-based chart helpers
// =============================================

// Draw a bar chart
export function drawBarChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const { labels = [], values = [], colors = [], title = '' } = data;
    const {
        barColor = '#d4713a',
        bgColor = 'transparent',
        textColor = '#a09080',
        accentColor = '#d4713a',
        padding = 40,
        barGap = 8,
        animationDuration = 600,
    } = options;

    const w = canvas.width;
    const h = canvas.height;
    const chartH = h - padding * 2;
    const chartW = w - padding * 2;
    const maxVal = Math.max(...values, 1);
    const barW = (chartW - barGap * (values.length - 1)) / values.length;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(w - padding / 2, y);
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = '11px var(--font, "Styrene A")';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), padding - 8, y + 4);
    }

    // Bars
    values.forEach((val, i) => {
        const barH = (val / maxVal) * chartH;
        const x = padding + i * (barW + barGap);
        const y = padding + chartH - barH;

        // Bar gradient
        const grad = ctx.createLinearGradient(x, y, x, padding + chartH);
        const color = colors[i] || barColor;
        grad.addColorStop(0, color);
        grad.addColorStop(1, color + '60');
        ctx.fillStyle = grad;

        // Rounded bar
        const r = Math.min(4, barW / 4);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + barW - r, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
        ctx.lineTo(x + barW, padding + chartH);
        ctx.lineTo(x, padding + chartH);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.fill();

        // Label
        ctx.fillStyle = textColor;
        ctx.font = '11px var(--font, "Styrene A")';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i] || '', x + barW / 2, h - padding / 3);

        // Value on bar
        if (val > 0) {
            ctx.fillStyle = '#e8e0d4';
            ctx.font = '500 12px var(--font, "Styrene A")';
            ctx.fillText(val, x + barW / 2, y - 6);
        }
    });
}

// Draw a line chart
export function drawLineChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const { labels = [], values = [] } = data;
    const {
        lineColor = '#d4713a',
        textColor = '#a09080',
        padding = 40,
    } = options;

    const w = canvas.width;
    const h = canvas.height;
    const chartH = h - padding * 2;
    const chartW = w - padding * 2;
    const maxVal = Math.max(...values, 1);
    const step = chartW / Math.max(values.length - 1, 1);

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(w - padding / 2, y);
        ctx.stroke();
    }

    if (values.length === 0) return;

    // Fill area
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartH);
    values.forEach((val, i) => {
        const x = padding + i * step;
        const y = padding + chartH - (val / maxVal) * chartH;
        ctx.lineTo(x, y);
    });
    ctx.lineTo(padding + (values.length - 1) * step, padding + chartH);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, padding, 0, padding + chartH);
    grad.addColorStop(0, lineColor + '30');
    grad.addColorStop(1, lineColor + '05');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    values.forEach((val, i) => {
        const x = padding + i * step;
        const y = padding + chartH - (val / maxVal) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    values.forEach((val, i) => {
        const x = padding + i * step;
        const y = padding + chartH - (val / maxVal) * chartH;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
        ctx.strokeStyle = '#211e1a';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Labels
    ctx.fillStyle = textColor;
    ctx.font = '11px var(--font, "Styrene A")';
    ctx.textAlign = 'center';
    values.forEach((val, i) => {
        const x = padding + i * step;
        if (labels[i]) ctx.fillText(labels[i], x, h - padding / 3);
    });
}

// Draw a donut/pie chart
export function drawDonutChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const { labels = [], values = [], colors = [] } = data;
    const { textColor = '#e8e0d4' } = options;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - 30;
    const innerRadius = radius * 0.6;
    const total = values.reduce((sum, v) => sum + v, 0) || 1;

    ctx.clearRect(0, 0, w, h);

    let currentAngle = -Math.PI / 2;
    const defaultColors = ['#d4713a', '#e8884f', '#f0a070', '#a09080', '#5a5048'];

    values.forEach((val, i) => {
        const sliceAngle = (val / total) * Math.PI * 2;
        const color = colors[i] || defaultColors[i % defaultColors.length];

        ctx.beginPath();
        ctx.arc(cx, cy, radius, currentAngle, currentAngle + sliceAngle);
        ctx.arc(cx, cy, innerRadius, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Label
        if (val > 0) {
            const midAngle = currentAngle + sliceAngle / 2;
            const labelRadius = radius + 18;
            const lx = cx + Math.cos(midAngle) * labelRadius;
            const ly = cy + Math.sin(midAngle) * labelRadius;

            ctx.fillStyle = textColor;
            ctx.font = '11px var(--font, "Styrene A")';
            ctx.textAlign = 'center';
            ctx.fillText(labels[i] || '', lx, ly);
        }

        currentAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = textColor;
    ctx.font = '500 20px var(--font, "Styrene A")';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, cx, cy - 6);
    ctx.font = '11px var(--font, "Styrene A")';
    ctx.fillStyle = '#a09080';
    ctx.fillText('tareas', cx, cy + 12);
}
