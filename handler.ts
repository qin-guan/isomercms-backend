// Handler file for serverless
// TODO: Fix directory alias issues with serverless typescript
export { generalDomainValidation } from "./microservices/site-launch/lambda-functions/general-domain-validation"
export { primaryDomainValidation } from "./microservices/site-launch/lambda-functions/primary-domain-validation"
export { successNotification } from "./microservices/site-launch/lambda-functions/success-notification"
export { failureNotification } from "./microservices/site-launch/lambda-functions/failure-notification"