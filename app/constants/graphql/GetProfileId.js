export const LENS_PROFILE_EXISTS = `query AccountExists ($name:Handle){profile(request: {handle: $name}) {id}}`;
