// Shared EC2 instance configuration (used by LoginView and InstanceControl/TheHeader)
export const EC2_INSTANCE_ID = 'i-09a67c6323c0bd240';
export const EC2_INSTANCE_NAME = 'HomeOffice';

/**
 * Dev: .env.development (false). AWS (npm run build): .env.production (true).
 * Lokalny Docker: build:docker + .env.docker (false).
 */
const ec2ControlEnv = import.meta.env.VITE_EC2_CONTROL_ENABLED;
export const EC2_CONTROL_ENABLED =
  ec2ControlEnv === 'true' ? true : ec2ControlEnv === 'false' ? false : !import.meta.env.DEV;
