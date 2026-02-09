/**
 * Schema for property bulk import.
 * Non-relational fields only (from properties table / propertyNew.json).
 * Used for template generation, header normalization, and validation.
 */
export const PROPERTY_IMPORT_FIELDS = [
  { key: "address", label: "Address", required: true, type: "string" },
  { key: "city", label: "City", required: true, type: "string" },
  { key: "state", label: "State", required: true, type: "string" },
  { key: "zip", label: "Zip", required: true, type: "string" },
  { key: "main_photo", label: "Main Photo", required: false, type: "string" },
  { key: "tax_id", label: "Tax ID", required: false, type: "string" },
  { key: "county", label: "County", required: false, type: "string" },
  { key: "owner_name", label: "Owner Name", required: false, type: "string" },
  { key: "owner_name_2", label: "Owner Name 2", required: false, type: "string" },
  { key: "owner_city", label: "Owner City", required: false, type: "string" },
  { key: "occupant_name", label: "Occupant Name", required: false, type: "string" },
  { key: "occupant_type", label: "Occupant Type", required: false, type: "string" },
  { key: "owner_phone", label: "Owner Phone", required: false, type: "string" },
  { key: "phone_to_show", label: "Phone To Show", required: false, type: "string" },
  { key: "property_type", label: "Property Type", required: false, type: "string" },
  { key: "sub_type", label: "Sub Type", required: false, type: "string" },
  { key: "roof_type", label: "Roof Type", required: false, type: "string" },
  { key: "year_built", label: "Year Built", required: false, type: "integer" },
  { key: "effective_year_built", label: "Effective Year Built", required: false, type: "integer" },
  { key: "effective_year_built_source", label: "Effective Year Built Source", required: false, type: "string" },
  { key: "sq_ft_total", label: "Sq Ft Total", required: false, type: "number" },
  { key: "sq_ft_finished", label: "Sq Ft Finished", required: false, type: "number" },
  { key: "sq_ft_unfinished", label: "Sq Ft Unfinished", required: false, type: "number" },
  { key: "garage_sq_ft", label: "Garage Sq Ft", required: false, type: "number" },
  { key: "total_dwelling_sq_ft", label: "Total Dwelling Sq Ft", required: false, type: "number" },
  { key: "sq_ft_source", label: "Sq Ft Source", required: false, type: "string" },
  { key: "lot_size", label: "Lot Size", required: false, type: "string" },
  { key: "lot_size_source", label: "Lot Size Source", required: false, type: "string" },
  { key: "lot_dim", label: "Lot Dim", required: false, type: "string" },
  { key: "price_per_sq_ft", label: "Price Per Sq Ft", required: false, type: "string" },
  { key: "total_price_per_sq_ft", label: "Total Price Per Sq Ft", required: false, type: "string" },
  { key: "bed_count", label: "Bed Count", required: false, type: "integer" },
  { key: "bath_count", label: "Bath Count", required: false, type: "integer" },
  { key: "full_baths", label: "Full Baths", required: false, type: "integer" },
  { key: "three_quarter_baths", label: "Three Quarter Baths", required: false, type: "integer" },
  { key: "half_baths", label: "Half Baths", required: false, type: "integer" },
  { key: "number_of_showers", label: "Number Of Showers", required: false, type: "integer" },
  { key: "number_of_bathtubs", label: "Number Of Bathtubs", required: false, type: "integer" },
  { key: "fireplaces", label: "Fireplaces", required: false, type: "integer" },
  { key: "fireplace_types", label: "Fireplace Types", required: false, type: "string" },
  { key: "basement", label: "Basement", required: false, type: "string" },
  { key: "parking_type", label: "Parking Type", required: false, type: "string" },
  { key: "total_covered_parking", label: "Total Covered Parking", required: false, type: "integer" },
  { key: "total_uncovered_parking", label: "Total Uncovered Parking", required: false, type: "integer" },
  { key: "school_district", label: "School District", required: false, type: "string" },
  { key: "elementary_school", label: "Elementary School", required: false, type: "string" },
  { key: "junior_high_school", label: "Junior High School", required: false, type: "string" },
  { key: "senior_high_school", label: "Senior High School", required: false, type: "string" },
  { key: "school_district_websites", label: "School District Websites", required: false, type: "string" },
  { key: "list_date", label: "List Date", required: false, type: "string" },
  { key: "expire_date", label: "Expire Date", required: false, type: "string" },
];

/** Canonical keys only. */
export const PROPERTY_IMPORT_KEYS = PROPERTY_IMPORT_FIELDS.map((f) => f.key);

const LABEL_TO_KEY = new Map();
PROPERTY_IMPORT_FIELDS.forEach(({ key, label }) => {
  const variants = [
    key,
    label,
    key.replace(/_/g, " "),
    label.toLowerCase(),
    key.toLowerCase(),
  ];
  variants.forEach((v) => {
    if (v && !LABEL_TO_KEY.has(v)) LABEL_TO_KEY.set(v, key);
  });
});

export function normalizeHeader(header) {
  if (header == null || typeof header !== "string") return null;
  const trimmed = String(header).trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  return LABEL_TO_KEY.get(trimmed) ?? LABEL_TO_KEY.get(lower) ?? null;
}

export function getTemplateRow() {
  return PROPERTY_IMPORT_KEYS.reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {});
}

export function getTemplateHeaders() {
  return PROPERTY_IMPORT_FIELDS.map((f) => f.label);
}

export default PROPERTY_IMPORT_FIELDS;
