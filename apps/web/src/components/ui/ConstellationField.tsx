import { Box, type BoxProps } from "@chakra-ui/react";
import { type RefObject, useEffect, useRef } from "react";

import { useColorMode } from "@/components/ui/color-mode";

type Node = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	r: number;
};

type ConstellationFieldProps = BoxProps & {
	/** Element that receives pointer events. Defaults to immediate parent. */
	trackRef?: RefObject<HTMLElement | null>;
	/** Slightly denser field for full-page / fixed overlays. */
	density?: "default" | "page";
};

type Palette = {
	dot: string;
	accent: string;
	line: string;
	lineMouse: string;
};

/** Light: tons escuros pra contrastar canvas claro. Dark: dourado vivo. */
const PALETTE_LIGHT: Palette = {
	dot: "rgba(204, 110, 0, 0.95)",
	accent: "rgba(153, 82, 0, 1)",
	line: "rgba(204, 110, 0, 0.65)",
	lineMouse: "rgba(255, 138, 0, 0.85)",
};

const PALETTE_DARK: Palette = {
	dot: "rgba(253, 184, 19, 0.95)",
	accent: "rgba(255, 224, 130, 1)",
	line: "rgba(253, 184, 19, 0.75)",
	lineMouse: "rgba(255, 168, 40, 0.9)",
};

function nodeCount(width: number, density: "default" | "page"): number {
	const boost = density === "page" ? 1.25 : 1;
	if (width < 640) return Math.round(36 * boost);
	if (width < 1024) return Math.round(60 * boost);
	return Math.round(90 * boost);
}

function createNodes(count: number, w: number, h: number): Node[] {
	return Array.from({ length: count }, () => ({
		x: Math.random() * w,
		y: Math.random() * h,
		vx: (Math.random() - 0.5) * 0.4,
		vy: (Math.random() - 0.5) * 0.4,
		r: Math.random() * 2.2 + 1.4,
	}));
}

export function ConstellationField({
	trackRef,
	density = "default",
	...rest
}: ConstellationFieldProps) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { colorMode } = useColorMode();

	useEffect(() => {
		if (!wrapRef.current || !canvasRef.current) return;

		const wrapEl: HTMLDivElement = wrapRef.current;
		const canvasEl: HTMLCanvasElement = canvasRef.current;
		const context = canvasEl.getContext("2d");
		if (!context) return;
		const ctx: CanvasRenderingContext2D = context;

		const palette = colorMode === "light" ? PALETTE_LIGHT : PALETTE_DARK;

		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		let w = 0;
		let h = 0;
		let nodes: Node[] = [];
		let raf = 0;
		let running = true;

		const mouse = { x: -9999, y: -9999, active: false };
		const linkDistance = density === "page" ? 140 : 130;
		const mouseDistance = density === "page" ? 180 : 160;

		const trackEl =
			trackRef?.current ?? (wrapEl.parentElement as HTMLElement | null);

		function resize() {
			const rect = wrapEl.getBoundingClientRect();
			w = rect.width;
			h = rect.height;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvasEl.width = Math.floor(w * dpr);
			canvasEl.height = Math.floor(h * dpr);
			canvasEl.style.width = `${w}px`;
			canvasEl.style.height = `${h}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			const count = nodeCount(w, density);
			if (nodes.length !== count) {
				nodes = createNodes(count, w, h);
			} else {
				for (const n of nodes) {
					n.x = Math.min(Math.max(n.x, 0), w);
					n.y = Math.min(Math.max(n.y, 0), h);
				}
			}

			if (reduceMotion) {
				drawStatic();
			}
		}

		function drawStatic() {
			ctx.clearRect(0, 0, w, h);
			for (const n of nodes) {
				ctx.beginPath();
				ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
				ctx.fillStyle = n.r > 2.4 ? palette.accent : palette.dot;
				ctx.fill();
			}
		}

		function frame() {
			if (!running) return;
			ctx.clearRect(0, 0, w, h);

			for (const n of nodes) {
				n.x += n.vx;
				n.y += n.vy;

				if (n.x < 0 || n.x > w) n.vx *= -1;
				if (n.y < 0 || n.y > h) n.vy *= -1;
				n.x = Math.min(Math.max(n.x, 0), w);
				n.y = Math.min(Math.max(n.y, 0), h);

				if (mouse.active) {
					const dx = n.x - mouse.x;
					const dy = n.y - mouse.y;
					const dist = Math.hypot(dx, dy);
					if (dist < mouseDistance && dist > 0.01) {
						const push = (1 - dist / mouseDistance) * 0.65;
						n.x += (dx / dist) * push;
						n.y += (dy / dist) * push;
					}
				}
			}

			for (let i = 0; i < nodes.length; i++) {
				const a = nodes[i];
				for (let j = i + 1; j < nodes.length; j++) {
					const b = nodes[j];
					const dx = b.x - a.x;
					const dy = b.y - a.y;
					const dist = Math.hypot(dx, dy);
					if (dist < linkDistance) {
						ctx.beginPath();
						ctx.moveTo(a.x, a.y);
						ctx.lineTo(b.x, b.y);
						ctx.strokeStyle = palette.line;
						ctx.globalAlpha = Math.max(0.2, 1 - dist / linkDistance);
						ctx.lineWidth = 1.1;
						ctx.stroke();
						ctx.globalAlpha = 1;
					}
				}

				if (mouse.active) {
					const dx = a.x - mouse.x;
					const dy = a.y - mouse.y;
					const dist = Math.hypot(dx, dy);
					if (dist < mouseDistance) {
						ctx.beginPath();
						ctx.moveTo(a.x, a.y);
						ctx.lineTo(mouse.x, mouse.y);
						ctx.strokeStyle = palette.lineMouse;
						ctx.globalAlpha = Math.max(0.25, 1 - dist / mouseDistance);
						ctx.lineWidth = 1.4;
						ctx.stroke();
						ctx.globalAlpha = 1;
					}
				}
			}

			for (const n of nodes) {
				ctx.beginPath();
				ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
				ctx.fillStyle = n.r > 2.4 ? palette.accent : palette.dot;
				ctx.fill();
			}

			raf = requestAnimationFrame(frame);
		}

		function onPointerMove(e: PointerEvent) {
			const rect = wrapEl.getBoundingClientRect();
			mouse.x = e.clientX - rect.left;
			mouse.y = e.clientY - rect.top;
			mouse.active = true;
		}

		function onPointerLeave() {
			mouse.active = false;
			mouse.x = -9999;
			mouse.y = -9999;
		}

		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(wrapEl);

		if (trackEl) {
			trackEl.addEventListener("pointermove", onPointerMove);
			trackEl.addEventListener("pointerleave", onPointerLeave);
		}

		if (!reduceMotion) {
			raf = requestAnimationFrame(frame);
		}

		return () => {
			running = false;
			cancelAnimationFrame(raf);
			ro.disconnect();
			if (trackEl) {
				trackEl.removeEventListener("pointermove", onPointerMove);
				trackEl.removeEventListener("pointerleave", onPointerLeave);
			}
		};
	}, [trackRef, colorMode, density]);

	return (
		<Box
			ref={wrapRef}
			position="absolute"
			inset={0}
			overflow="hidden"
			pointerEvents="none"
			aria-hidden
			{...rest}
		>
			<canvas
				ref={canvasRef}
				style={{ display: "block", width: "100%", height: "100%" }}
			/>
		</Box>
	);
}
