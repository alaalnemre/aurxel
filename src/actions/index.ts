// src/actions/index.ts
// Barrel export for server actions

export { registerUser, loginUser } from './auth';
export type { RegisterResult, LoginResult } from './auth';

export { becomeSeller, becomeDriver } from './capabilities';
export type { CapabilityResult } from './capabilities';
