export const SERVICES = [
  {
    title: "BOQ Preparation",
    description:
      "Preparation of professional Bills of Quantities (BOQ) for construction projects."
  },

  {
    title: "Quantity Estimation",
    description:
      "Detailed quantity estimation for buildings, roads, bridges, hydropower and water supply projects."
  },

  {
    title: "Rate Analysis",
    description:
      "Preparation of detailed rate analysis based on Nepal Government norms and district rates."
  },

  {
    title: "District Rate PDF",
    description:
      "Free access to District Rate PDFs for all 77 districts of Nepal."
  },

  {
    title: "Engineering Consultancy",
    description:
      "Professional civil engineering consultancy and technical support."
  },

  {
    title: "AutoCAD Assistance",
    description:
      "Guidance and support for AutoCAD and engineering drafting."
  },

  {
    title: "Engineering Learning",
    description:
      "Learning resources for engineering students and professionals."
  }
];

export const SERVICES_TEXT = SERVICES.map(
  (s) => `• ${s.title}: ${s.description}`
).join("\n");