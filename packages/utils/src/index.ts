export async function checkAvailability(
  apiName: string,
  options?: Record<string, unknown>
): Promise<{ available: boolean; message: string }> {
  const api = (self as unknown as Record<string, { availability: (o?: Record<string, unknown>) => Promise<string> }>)[
    apiName
  ];
  if (!api) {
    return { available: false, message: `${apiName} API is not available in this environment.` };
  }

  const availability = await (options ? api.availability(options) : api.availability());
  if (availability === 'unavailable' || !availability) {
    return { available: false, message: `${apiName} model is unavailable.` };
  }

  if (availability === 'downloading') {
    return { available: false, message: `${apiName} model is downloading.` };
  }

  if (availability === 'downloadable') {
    return { available: true, message: `${apiName} model started downloading, please wait.` };
  }

  return { available: true, message: `${apiName} model is ready to use.` };
}
