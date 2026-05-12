/**
 * Helper to set refresh cookie
 */
export const setRefreshCookie = (res, refreshToken) => {
  const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge,
  })
}

export default setRefreshCookie
