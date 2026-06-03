import { i as __toESM, r as require_react, t as require_jsx_runtime } from "./variables-CHO5ILYh.js";
import { i as Button } from "./Badge-DPVdTRGe.js";
//#region src/design-system/Modal/Modal.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var Modal = ({ open, onClose, title, children, footer }) => {
	const overlayRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const handleEsc = (e) => {
			if (e.key === "Escape") onClose();
		};
		if (open) document.addEventListener("keydown", handleEsc);
		return () => document.removeEventListener("keydown", handleEsc);
	}, [open, onClose]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: overlayRef,
		onClick: (e) => {
			if (e.target === overlayRef.current) onClose();
		},
		style: {
			position: "fixed",
			inset: 0,
			zIndex: 1e3,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: "rgba(0,0,0,0.5)"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				background: "#fff",
				borderRadius: "var(--radius-lg)",
				boxShadow: "var(--shadow-lg)",
				maxWidth: 560,
				width: "90%",
				maxHeight: "90vh",
				display: "flex",
				flexDirection: "column"
			},
			children: [
				title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: "var(--spacing-4)",
						borderBottom: "1px solid var(--color-neutral-200)",
						fontSize: "var(--font-size-lg)",
						fontWeight: 600
					},
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: "var(--spacing-4)",
						overflow: "auto",
						flex: 1
					},
					children
				}),
				footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: "var(--spacing-4)",
						borderTop: "1px solid var(--color-neutral-200)",
						display: "flex",
						justifyContent: "flex-end",
						gap: "var(--spacing-2)"
					},
					children: footer
				}),
				!footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: "var(--spacing-4)",
						borderTop: "1px solid var(--color-neutral-200)",
						textAlign: "right"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: onClose,
						children: "Close"
					})
				})
			]
		})
	});
};
//#endregion
export { Modal as t };

//# sourceMappingURL=Modal-PSnBOAWj.js.map