import { i as __toESM, n as require_client, r as require_react, t as require_jsx_runtime } from "./chunks/jsx-runtime-CV8b5LSl.js";
import { i as Button, n as Tabs, r as Card, t as Badge } from "./chunks/Badge-B5Ss0JGR.js";
import { t as Input } from "./chunks/Input-BOJJLj47.js";
import { t as Select } from "./chunks/Select-BkCqKH8N.js";
import { t as Modal } from "./chunks/Modal-CDyWOG6o.js";
/* empty css                          */
//#region src/clinical/index.tsx
var import_client = require_client();
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var PatientHeader = ({ name, dob, age, hin, sex, providerName, allergies = [] }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	style: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: "var(--spacing-3) var(--spacing-4)",
		backgroundColor: "var(--color-primary-600)",
		color: "#fff",
		minHeight: 48,
		position: "sticky",
		top: 0,
		zIndex: 100
	},
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "flex",
			alignItems: "center",
			gap: "var(--spacing-3)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
				style: { fontSize: "var(--font-size-lg)" },
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				style: {
					opacity: .8,
					fontSize: "var(--font-size-sm)"
				},
				children: [
					dob,
					" (",
					age,
					"y) | ",
					sex,
					" | PHN: ",
					hin
				]
			}),
			allergies.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "error",
				children: [
					allergies.length,
					" allergy",
					allergies.length > 1 ? "s" : ""
				]
			})
		]
	}), providerName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		style: {
			opacity: .8,
			fontSize: "var(--font-size-sm)"
		},
		children: ["Dr. ", providerName]
	})]
});
var trendColors = {
	up: "var(--color-error)",
	down: "var(--color-success)",
	stable: "var(--color-neutral-400)"
};
var VitalsPanel = ({ vitals }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
	title: "Vitals",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
			gap: "var(--spacing-3)"
		},
		children: vitals.map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: { textAlign: "center" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					fontSize: "var(--font-size-2xl)",
					fontWeight: 700
				},
				children: v.value
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					fontSize: "var(--font-size-xs)",
					color: "var(--color-neutral-500)"
				},
				children: [
					v.label,
					" (",
					v.unit,
					")",
					v.trend && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							color: trendColors[v.trend],
							marginLeft: 4
						},
						children: v.trend === "up" ? "↑" : v.trend === "down" ? "↓" : "→"
					})
				]
			})]
		}, i))
	})
});
var MedicationList = ({ medications }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
	title: "Current Medications",
	children: medications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		style: {
			color: "var(--color-neutral-400)",
			fontStyle: "italic"
		},
		children: "No active medications"
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
		style: {
			width: "100%",
			borderCollapse: "collapse"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: medications.map((med, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
			style: { borderBottom: "1px solid var(--color-neutral-100)" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					style: {
						padding: "var(--spacing-2)",
						fontWeight: 500
					},
					children: med.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
					style: {
						padding: "var(--spacing-2)",
						color: "var(--color-neutral-500)"
					},
					children: [
						med.dose,
						" ",
						med.route,
						" ",
						med.frequency
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
					style: {
						padding: "var(--spacing-2)",
						color: "var(--color-neutral-400)",
						fontSize: "var(--font-size-sm)"
					},
					children: ["Since ", med.startDate]
				})
			]
		}, i)) })
	})
});
var severityMap = {
	severe: "error",
	moderate: "warning",
	mild: "neutral"
};
var AllergyBadge = ({ allergies }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	style: {
		display: "flex",
		gap: "var(--spacing-1)",
		flexWrap: "wrap"
	},
	children: allergies.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "success",
		children: "No known allergies"
	}) : allergies.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: severityMap[a.severity],
		children: a.name
	}, i))
});
var ProblemList = ({ problems }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
	title: "Active Problems",
	children: problems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		style: {
			color: "var(--color-neutral-400)",
			fontStyle: "italic"
		},
		children: "No active problems"
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
		style: {
			width: "100%",
			borderCollapse: "collapse"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: problems.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
			style: { borderBottom: "1px solid var(--color-neutral-100)" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					style: {
						padding: "var(--spacing-2)",
						fontWeight: 500
					},
					children: p.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					style: {
						padding: "var(--spacing-2)",
						color: "var(--color-neutral-400)",
						fontFamily: "var(--font-mono)",
						fontSize: "var(--font-size-sm)"
					},
					children: p.code
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
					style: {
						padding: "var(--spacing-2)",
						color: "var(--color-neutral-500)",
						fontSize: "var(--font-size-sm)"
					},
					children: ["Since ", p.onsetDate]
				})
			]
		}, i)) })
	})
});
//#endregion
//#region src/entries/test-component.tsx
function TestComponent() {
	const [count, setCount] = (0, import_react.useState)(0);
	const [modalOpen, setModalOpen] = (0, import_react.useState)(false);
	const [text, setText] = (0, import_react.useState)("");
	const [activeTab, setActiveTab] = (0, import_react.useState)("overview");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			maxWidth: 900,
			margin: "0 auto",
			padding: "var(--spacing-6)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				style: {
					marginBottom: "var(--spacing-6)",
					fontSize: "var(--font-size-3xl)"
				},
				children: "Oscar UI Component Library"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				tabs: [{
					key: "overview",
					label: "Design System"
				}, {
					key: "clinical",
					label: "Clinical Components"
				}],
				activeKey: activeTab,
				onChange: setActiveTab
			}),
			activeTab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "var(--spacing-6)",
					marginTop: "var(--spacing-6)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Buttons",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "var(--spacing-3)",
								flexWrap: "wrap",
								alignItems: "center"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									children: "Secondary"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "danger",
									children: "Danger"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									children: "Ghost"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									children: "Small"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "lg",
									children: "Large"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									loading: true,
									children: "Loading"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									disabled: true,
									children: "Disabled"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Inputs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "var(--spacing-4)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									label: "First Name",
									placeholder: "Enter name",
									value: text,
									onChange: (e) => setText(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									label: "Email",
									type: "email",
									placeholder: "user@example.com",
									error: text.length > 0 && !text.includes("@") ? "Invalid email" : void 0
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									label: "Province",
									options: [{
										value: "BC",
										label: "British Columbia"
									}, {
										value: "ON",
										label: "Ontario"
									}]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Badges",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "var(--spacing-2)",
								flexWrap: "wrap"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "success",
									children: "Success"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "warning",
									children: "Warning"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "error",
									children: "Error"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "info",
									children: "Info"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "neutral",
									children: "Neutral"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						title: "Modal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => setModalOpen(true),
							children: "Open Modal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
							open: modalOpen,
							onClose: () => setModalOpen(false),
							title: "Confirm Action",
							footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => setModalOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => {
									setCount((c) => c + 1);
									setModalOpen(false);
								},
								children: [
									"Confirm (clicked ",
									count,
									"x)"
								]
							})] }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This is a modal dialog with focus trap and Escape key support." })
						})]
					})
				]
			}),
			activeTab === "clinical" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "var(--spacing-4)",
					marginTop: "var(--spacing-4)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatientHeader, {
						name: "Sarah Johnson",
						dob: "1990-06-03",
						age: 36,
						hin: "9876-543-21-BC",
						sex: "F",
						providerName: "Smith",
						allergies: ["Sulfa", "Penicillin"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "var(--spacing-4)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VitalsPanel, { vitals: [
							{
								label: "BP",
								value: "120/80",
								unit: "mmHg",
								trend: "stable"
							},
							{
								label: "HR",
								value: "72",
								unit: "bpm",
								trend: "stable"
							},
							{
								label: "Temp",
								value: "37.0",
								unit: "°C",
								trend: "stable"
							},
							{
								label: "O2",
								value: "98",
								unit: "%",
								trend: "stable"
							}
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							title: "Allergies",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllergyBadge, { allergies: [
								{
									name: "Sulfa",
									severity: "severe"
								},
								{
									name: "Penicillin",
									severity: "moderate"
								},
								{
									name: "Latex",
									severity: "mild"
								}
							] })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedicationList, { medications: [{
						name: "Metformin",
						dose: "500mg",
						route: "PO",
						frequency: "BID",
						startDate: "2025-01-15"
					}, {
						name: "Ramipril",
						dose: "5mg",
						route: "PO",
						frequency: "Daily",
						startDate: "2025-03-01"
					}] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProblemList, { problems: [{
						code: "E11.9",
						name: "Type 2 Diabetes Mellitus",
						onsetDate: "2024-06-01",
						status: "active"
					}, {
						code: "I10",
						name: "Essential Hypertension",
						onsetDate: "2024-06-01",
						status: "active"
					}] })
				]
			})
		]
	});
}
var rootElement = document.getElementById("oscar-ui-root");
if (rootElement) (0, import_client.createRoot)(rootElement).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TestComponent, {}));
//#endregion

//# sourceMappingURL=test-component.bundle.js.map