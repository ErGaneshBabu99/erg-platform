import type { DistrictRow } from "@/lib/districtMatch";

// Module-level (not React state) so this promise is shared across every
// mount/remount of every <DistrictAutocomplete> instance for the lifetime
// of the page session. First caller triggers the fetch; everyone else
// (including instances that mount later) just awaits the same promise or
// reads the already-resolved list. This is what makes it "load once."
let districtsPromise: Promise<DistrictRow[]> | null = null;

export function loadDistricts(): Promise<DistrictRow[]> {
  if (!districtsPromise) {
    districtsPromise = fetch("/api/districts")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load districts: ${res.status}`);
        return res.json();
      })
      .then((data) => data.districts as DistrictRow[])
      .catch((err) => {
        districtsPromise = null; // allow a retry on next mount if this attempt failed
        throw err;
      });
  }
  return districtsPromise;
}
