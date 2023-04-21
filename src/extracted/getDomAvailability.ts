// STOREABLE

export function getDomAvailability(): 'available' | 'unavailable' {
  try {
    return !!window ? 'available' : 'unavailable';
  } catch (error) {
    return 'unavailable';
  }
}
