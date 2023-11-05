export const TEN_YEARS_IN_SEC = 315360000;

export const cookieOptions = {
  maxAge: TEN_YEARS_IN_SEC,
  secure: true,
  sameSite: "lax" as const,
  // httpOnly:
};
