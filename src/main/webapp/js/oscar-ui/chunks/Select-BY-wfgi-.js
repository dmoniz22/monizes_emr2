import { r as require_react, t as require_jsx_runtime } from "./variables-CHO5ILYh.js";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var labelStyle = {
	display: "block",
	fontSize: "var(--font-size-sm)",
	fontWeight: 500,
	color: "var(--color-neutral-700)",
	marginBottom: "var(--spacing-1)"
};
var Select = ({ label, options, error, style, id, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	style: { marginBottom: "var(--spacing-4)" },
	children: [
		label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			style: labelStyle,
			children: label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			id,
			style: {
				width: "100%",
				padding: "var(--spacing-2) var(--spacing-3)",
				fontSize: "var(--font-size-base)",
				border: "1px solid var(--color-neutral-300)",
				borderRadius: "var(--radius-md)",
				backgroundColor: "#fff",
				borderColor: error ? "var(--color-error)" : void 0,
				...style
			},
			...props,
			children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: o.value,
				children: o.label
			}, o.value))
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			style: {
				color: "var(--color-error)",
				fontSize: "var(--font-size-sm)",
				marginTop: "var(--spacing-1)"
			},
			children: error
		})
	]
});
//#endregion
export { Select as t };

//# sourceMappingURL=Select-BY-wfgi-.js.map