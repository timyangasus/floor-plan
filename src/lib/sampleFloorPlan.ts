export async function loadSampleFloorPlan(): Promise<File> {
  const res = await fetch(`${import.meta.env.BASE_URL}sample-floorplan.jpg`)
  const blob = await res.blob()
  return new File([blob], 'sample-floorplan.jpg', { type: 'image/jpeg' })
}
