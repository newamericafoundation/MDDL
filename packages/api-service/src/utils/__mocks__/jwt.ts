export const decodeToken = jest.fn(async () =>
  Promise.resolve({
    iss: 'my_issuer',
    aud: 'World',
    iat: 1400062400223,
  }),
)
