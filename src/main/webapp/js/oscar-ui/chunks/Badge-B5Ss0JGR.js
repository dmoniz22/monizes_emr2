import { r as require_react, t as require_jsx_runtime } from "./jsx-runtime-CV8b5LSl.js";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var variantStyles = {
	primary: {
		backgroundColor: "var(--color-primary-600)",
		color: "#fff",
		border: "none"
	},
	secondary: {
		backgroundColor: "var(--color-neutral-200)",
		color: "var(--color-neutral-800)",
		border: "1px solid var(--color-neutral-300)"
	},
	danger: {
		backgroundColor: "var(--color-error)",
		color: "#fff",
		border: "none"
	},
	ghost: {
		backgroundColor: "transparent",
		color: "var(--color-primary-600)",
		border: "none"
	}
};
var sizeStyles = {
	sm: {
		padding: "var(--spacing-1) var(--spacing-3)",
		fontSize: "var(--font-size-sm)"
	},
	md: {
		padding: "var(--spacing-2) var(--spacing-4)",
		fontSize: "var(--font-size-base)"
	},
	lg: {
		padding: "var(--spacing-3) var(--spacing-6)",
		fontSize: "var(--font-size-lg)"
	}
};
var Button = ({ variant = "primary", size = "md", loading = false, disabled, children, style, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		style: {
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			gap: "var(--spacing-2)",
			borderRadius: "var(--radius-md)",
			fontWeight: 500,
			cursor: disabled || loading ? "not-allowed" : "pointer",
			opacity: disabled || loading ? .6 : 1,
			transition: "var(--transition-fast)",
			...variantStyles[variant],
			...sizeStyles[size],
			...style
		},
		disabled: disabled || loading,
		...props,
		children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, { size: 14 }), children]
	});
};
var Spinner = ({ size = 16 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	style: { animation: "spin 0.75s linear infinite" },
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `@keyframes spin { to { transform: rotate(360deg); } }` }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "12",
			r: "10",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "3",
			strokeDasharray: "32",
			strokeLinecap: "round",
			opacity: .3
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "12",
			r: "10",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "3",
			strokeDasharray: "32",
			strokeDashoffset: "24",
			strokeLinecap: "round"
		})
	]
});
//#endregion
//#region src/design-system/Card/Card.tsx
var Card = ({ title, subtitle, children, footer, onClick, style }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	onClick,
	style: {
		background: "#fff",
		borderRadius: "var(--radius-lg)",
		border: "1px solid var(--color-neutral-200)",
		boxShadow: "var(--shadow-sm)",
		cursor: onClick ? "pointer" : void 0,
		transition: "box-shadow var(--transition-fast)",
		...style
	},
	children: [
		(title || subtitle) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				padding: "var(--spacing-4)",
				borderBottom: title ? "1px solid var(--color-neutral-100)" : void 0
			},
			children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				style: {
					margin: 0,
					fontSize: "var(--font-size-lg)",
					fontWeight: 600
				},
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				style: {
					margin: "var(--spacing-1) 0 0",
					color: "var(--color-neutral-500)",
					fontSize: "var(--font-size-sm)"
				},
				children: subtitle
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: { padding: "var(--spacing-4)" },
			children
		}),
		footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				padding: "var(--spacing-4)",
				borderTop: "1px solid var(--color-neutral-100)"
			},
			children: footer
		})
	]
});
//#endregion
//#region src/design-system/Badge/Badge.tsx
var colors = {
	success: {
		bg: "var(--color-success-light)",
		text: "var(--color-success)"
	},
	warning: {
		bg: "var(--color-warning-light)",
		text: "var(--color-warning)"
	},
	error: {
		bg: "var(--color-error-light)",
		text: "var(--color-error)"
	},
	info: {
		bg: "var(--color-info-light)",
		text: "var(--color-info)"
	},
	neutral: {
		bg: "var(--color-neutral-100)",
		text: "var(--color-neutral-700)"
	}
};
var Badge = ({ variant = "neutral", children }) => {
	const c = colors[variant];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		style: {
			display: "inline-flex",
			alignItems: "center",
			padding: "1px var(--spacing-2)",
			fontSize: "var(--font-size-xs)",
			fontWeight: 600,
			borderRadius: "9999px",
			backgroundColor: c.bg,
			color: c.text,
			lineHeight: 1.5
		},
		children
	});
};
var Tabs = ({ tabs, activeKey, onChange }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	style: {
		display: "flex",
		borderBottom: "2px solid var(--color-neutral-200)",
		gap: 0
	},
	children: tabs.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: () => onChange(tab.key),
		style: {
			padding: "var(--spacing-2) var(--spacing-4)",
			background: "none",
			border: "none",
			borderBottom: activeKey === tab.key ? "2px solid var(--color-primary-500)" : "2px solid transparent",
			marginBottom: -2,
			color: activeKey === tab.key ? "var(--color-primary-600)" : "var(--color-neutral-500)",
			fontWeight: activeKey === tab.key ? 600 : 400,
			cursor: "pointer",
			fontSize: "var(--font-size-sm)"
		},
		children: tab.label
	}, tab.key))
});
//#endregion
export { Button as i, Tabs as n, Card as r, Badge as t };

//# sourceMappingURL=Badge-B5Ss0JGR.js.map