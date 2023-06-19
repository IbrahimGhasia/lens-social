export const AUTHENTICATE_MUTATION = `mutation Authenticate ($address: EthereumAddress!, $signature:Signature!) {
    authenticate(request: {
      address: $address,
      signature: $signature
    }) {
      accessToken
      refreshToken
    }
  }`;
