export const LOGIN = `query Challenge ($address: EthereumAddress!) {
    challenge(request: { address: $address }) {
      text
    }
  }`;
