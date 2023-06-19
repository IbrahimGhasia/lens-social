export const CREATE_PROFILE = `mutation CreateProfile($username: CreateHandle!) {
    createProfile(request: { 
      handle: $username,
      followModule: {
        freeFollowModule: true
      }
    }) {
      ... on RelayerResult {
        txHash
      }
      ... on RelayError {
        reason
      }
      __typename
    }
  }`;
