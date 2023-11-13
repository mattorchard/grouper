export const wrapError = (error: unknown) => {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  if (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  )
    return new Error(error.message);

  console.warn(`Unknown error`, error);
  const unknownError = new Error(`Unknown Error`);
  unknownError.cause = error;
  return unknownError;
};
