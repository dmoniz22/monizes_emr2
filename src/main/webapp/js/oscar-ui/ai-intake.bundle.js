import { a as Button, c as require_react, i as Modal, l as __toESM, o as require_jsx_runtime, r as Card, s as require_client, t as Badge } from "./chunks/variables-DYl3s5BR.js";
//#region src/entries/ai-intake.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_client = require_client();
var import_jsx_runtime = require_jsx_runtime();
var AI_SERVICE_URL = "http://localhost:8000";
function SmartIntake() {
	const [step, setStep] = (0, import_react.useState)("input");
	const [text, setText] = (0, import_react.useState)("");
	const [parsed, setParsed] = (0, import_react.useState)(null);
	const [edited, setEdited] = (0, import_react.useState)({});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [showConfirm, setShowConfirm] = (0, import_react.useState)(false);
	const merge = () => ({
		...parsed,
		...edited
	});
	const handleParse = async () => {
		setError(null);
		setLoading(true);
		try {
			const res = await fetch(`${AI_SERVICE_URL}/api/v1/intake/parse`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text })
			});
			if (!res.ok) throw new Error(`Server error: ${res.status}`);
			setParsed(await res.json());
			setEdited({});
			setStep("review");
		} catch (e) {
			setError(e.message || "Failed to parse. Is the AI service running?");
		} finally {
			setLoading(false);
		}
	};
	const handleConfirm = () => {
		setShowConfirm(true);
	};
	const handleCreatePatient = () => {
		const data = merge();
		const form = document.createElement("form");
		form.method = "POST";
		form.action = "/oscar/ai/create_patient.jsp";
		form.target = "_self";
		for (const [key, value] of Object.entries(data)) {
			if (value === null || value === void 0) continue;
			const input = document.createElement("input");
			input.type = "hidden";
			input.name = key;
			input.value = Array.isArray(value) ? value.join(",") : String(value);
			form.appendChild(input);
		}
		document.body.appendChild(form);
		form.submit();
		setStep("success");
	};
	const handleReset = () => {
		setStep("input");
		setText("");
		setParsed(null);
		setError(null);
	};
	const updateField = (field, value) => {
		setEdited((prev) => ({
			...prev,
			[field]: value
		}));
	};
	const getConfidenceColor = (field) => {
		if (!parsed) return "info";
		const val = merge()[field];
		if (val && (typeof val === "string" ? val.length > 0 : true)) return "success";
		return "error";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			maxWidth: 750,
			margin: "0 auto",
			padding: "var(--spacing-4)"
		},
		children: [
			step === "input" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				title: "AI Smart Intake",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							color: "var(--color-neutral-500)",
							marginBottom: "var(--spacing-4)"
						},
						children: "Paste or type patient details below. The AI will extract structured data automatically."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: text,
						onChange: (e) => setText(e.target.value),
						placeholder: "e.g. Sarah Jones, DOB June 3 1990, 604-555-1234, 456 Oak St Vancouver V6B1A1, PHN: 9876-543-21-BC. Allergies: sulfa. Reason: annual physical",
						rows: 6,
						style: {
							width: "100%",
							padding: "var(--spacing-3)",
							fontSize: "var(--font-size-base)",
							border: "1px solid var(--color-neutral-300)",
							borderRadius: "var(--radius-md)",
							resize: "vertical",
							fontFamily: "var(--font-sans)"
						},
						disabled: loading
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							marginTop: "var(--spacing-2)",
							padding: "var(--spacing-3)",
							background: "var(--color-error-light)",
							borderRadius: "var(--radius-md)",
							color: "var(--color-error)",
							fontSize: "var(--font-size-sm)"
						},
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							marginTop: "var(--spacing-3)",
							display: "flex",
							gap: "var(--spacing-2)",
							alignItems: "center"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleParse,
							disabled: text.length < 10 || loading,
							children: loading ? "Parsing..." : "Parse with AI"
						}), parsed?.mock && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "warning",
							children: "Using offline parser (AI not configured)"
						})]
					})
				]
			}),
			step === "review" && parsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				title: "Review Extracted Data",
				children: [
					parsed.mock && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							marginBottom: "var(--spacing-3)",
							padding: "var(--spacing-2)",
							background: "var(--color-warning-light)",
							borderRadius: "var(--radius-md)",
							fontSize: "var(--font-size-sm)"
						},
						children: "Running in mock mode. Connect an AI provider for better accuracy."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "var(--spacing-3)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRow, {
								label: "First Name",
								field: "first_name",
								data: merge(),
								update: updateField,
								color: getConfidenceColor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRow, {
								label: "Last Name",
								field: "last_name",
								data: merge(),
								update: updateField,
								color: getConfidenceColor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRow, {
								label: "Date of Birth",
								field: "dob",
								data: merge(),
								update: updateField,
								color: getConfidenceColor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRow, {
								label: "Phone",
								field: "phone",
								data: merge(),
								update: updateField,
								color: getConfidenceColor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRow, {
								label: "Address",
								field: "address",
								data: merge(),
								update: updateField,
								color: getConfidenceColor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRow, {
								label: "City",
								field: "city",
								data: merge(),
								update: updateField,
								color: getConfidenceColor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRow, {
								label: "Province",
								field: "province",
								data: merge(),
								update: updateField,
								color: getConfidenceColor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRow, {
								label: "Postal Code",
								field: "postal_code",
								data: merge(),
								update: updateField,
								color: getConfidenceColor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRow, {
								label: "Health Card",
								field: "health_card_number",
								data: merge(),
								update: updateField,
								color: getConfidenceColor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									fontSize: "var(--font-size-xs)",
									color: "var(--color-neutral-500)"
								},
								children: "Allergies"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									gap: "var(--spacing-1)",
									flexWrap: "wrap",
									marginTop: 2
								},
								children: merge().allergies.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										color: "var(--color-neutral-400)",
										fontSize: "var(--font-size-sm)"
									},
									children: "None"
								}) : merge().allergies.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "warning",
									children: a
								}, i))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRow, {
								label: "Reason for Visit",
								field: "reason_for_visit",
								data: merge(),
								update: updateField,
								color: getConfidenceColor
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							marginTop: "var(--spacing-4)",
							display: "flex",
							gap: "var(--spacing-2)",
							justifyContent: "flex-end"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => setStep("input"),
								children: "Back"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: handleReset,
								children: "Reset"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: handleConfirm,
								children: "Create Patient"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
						open: showConfirm,
						onClose: () => setShowConfirm(false),
						title: "Confirm Patient Creation",
						footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setShowConfirm(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleCreatePatient,
							children: "Confirm"
						})] }),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Create patient record for ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
								merge().first_name,
								" ",
								merge().last_name
							] }),
							"?"
						] })
					})
				]
			}),
			step === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				title: "Patient Created",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: { color: "var(--color-success)" },
					children: "Patient record submitted successfully."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { marginTop: "var(--spacing-3)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: handleReset,
						children: "Add Another Patient"
					})
				})]
			})
		]
	});
}
function FieldRow({ label, field, data, update, color }) {
	const value = data[field] ?? "";
	const confColor = color(field);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "flex",
			alignItems: "center",
			gap: 4,
			marginBottom: 2
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			style: {
				fontSize: "var(--font-size-xs)",
				color: "var(--color-neutral-500)"
			},
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: confColor,
			children: [confColor === "success" ? "high" : "low", " confidence"]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		value: typeof value === "string" ? value : "",
		onChange: (e) => update(field, e.target.value),
		style: {
			width: "100%",
			padding: "var(--spacing-1) var(--spacing-2)",
			fontSize: "var(--font-size-sm)",
			border: "1px solid var(--color-neutral-300)",
			borderRadius: "var(--radius-sm)"
		}
	})] });
}
var el = document.getElementById("ai-intake-root");
if (el) (0, import_client.createRoot)(el).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmartIntake, {}));
//#endregion

//# sourceMappingURL=ai-intake.bundle.js.map