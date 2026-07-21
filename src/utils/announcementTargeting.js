// Client-side visibility filter for the announcement feed. Mirrors the
// matching the notify-announcement edge function uses to pick recipients, so a
// PWD/guardian only sees announcements aimed at them.
//
// A "target" is { municipality, barangay, types } — a PWD has one (their own),
// a guardian has one per ward. An announcement with no municipalities, no
// barangays and no disability_types is for everyone.

export function announcementMatches(announcement, municipality, barangay, types) {
  const mun = announcement.municipalities;
  const bar = announcement.barangays;
  const dis = announcement.disability_types;
  const municipalityOk =
    !Array.isArray(mun) ||
    mun.length === 0 ||
    (Boolean(municipality) && mun.includes(municipality));
  const barangayOk =
    !Array.isArray(bar) || bar.length === 0 || (Boolean(barangay) && bar.includes(barangay));
  const typesOk =
    !Array.isArray(dis) ||
    dis.length === 0 ||
    (Array.isArray(types) && types.some((t) => dis.includes(t)));
  return municipalityOk && barangayOk && typesOk;
}

// Is this announcement visible to a viewer with the given targets?
export function announcementVisibleTo(announcement, targets) {
  const mun = announcement.municipalities;
  const bar = announcement.barangays;
  const dis = announcement.disability_types;
  const untargeted =
    (!Array.isArray(mun) || mun.length === 0) &&
    (!Array.isArray(bar) || bar.length === 0) &&
    (!Array.isArray(dis) || dis.length === 0);
  if (untargeted) return true; // for everyone
  if (!targets || targets.length === 0) return false;
  return targets.some((t) =>
    announcementMatches(announcement, t.municipality, t.barangay, t.types)
  );
}
