// Skala kolorów jak w kamerze termowizyjnej: od chłodnego granatu do białego żaru.
const STOPS = ['#1b1046', '#4b1683', '#9b1f7a', '#d93a4a', '#f2702a', '#ffb627', '#fff3b0'];

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Kolor dla t ∈ [0, 1]. */
export function thermal(t) {
	const x = Math.min(Math.max(t, 0), 1) * (STOPS.length - 1);
	const i = Math.min(Math.floor(x), STOPS.length - 2);
	const f = x - i;
	const [a, b] = [hex(STOPS[i]), hex(STOPS[i + 1])];
	return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(' ')})`;
}

export const THERMAL_GRADIENT = `linear-gradient(90deg, ${STOPS.join(', ')})`;

/** Współczynnik U [W/m²K] → t. Skala logarytmiczna: 0,1 (dom pasywny) … 2,6 (stare okno). */
export const uToT = (u) => Math.log(u / 0.1) / Math.log(2.8 / 0.1);
