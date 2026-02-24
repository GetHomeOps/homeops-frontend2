/**
 * Normalizes API professional format (snake_case) to the format expected by
 * ProfessionalCard, ProfileHeader, and other directory components.
 */
export function normalizeProfessional(apiPro) {
  if (!apiPro) return null;

  const serviceArea = apiPro.service_area
    || (apiPro.city && apiPro.state ? `${apiPro.city}, ${apiPro.state}` : null)
    || "";

  const projectPhotos = (apiPro.photos || []).map((p) => ({
    id: p.id,
    url: p.photo_url || p.url,
    caption: p.caption || "Project",
  }));

  return {
    id: apiPro.id,
    firstName: apiPro.first_name,
    lastName: apiPro.last_name,
    name: [apiPro.first_name, apiPro.last_name].filter(Boolean).join(" "),
    companyName: apiPro.company_name || "",
    categoryId: apiPro.category_id || apiPro.subcategory_id,
    categoryIds: [apiPro.category_id, apiPro.subcategory_id].filter(Boolean),
    categoryName: apiPro.subcategory_name || apiPro.category_name || "",
    location: apiPro.city && apiPro.state
      ? { label: `${apiPro.city}, ${apiPro.state} ${apiPro.zip_code || ""}`.trim(), city: apiPro.city, state: apiPro.state, zip: apiPro.zip_code }
      : null,
    serviceArea,
    rating: Number(apiPro.rating) || 0,
    reviewCount: Number(apiPro.review_count) || 0,
    yearsInBusiness: Number(apiPro.years_in_business) || 0,
    description: apiPro.description || "",
    languages: Array.isArray(apiPro.languages) ? apiPro.languages : [],
    phone: apiPro.phone || "",
    email: apiPro.email || "",
    photoUrl: apiPro.profile_photo_url || apiPro.profile_photo || "",
    website: apiPro.website || "",
    saved: Boolean(apiPro.saved),
    projectPhotos: projectPhotos.length > 0 ? projectPhotos : [],
    budgetLevel: apiPro.budget_level,
    isVerified: Boolean(apiPro.is_verified),
  };
}
