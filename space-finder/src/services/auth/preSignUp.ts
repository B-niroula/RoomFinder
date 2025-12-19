import { CognitoUserPoolTriggerEvent, Context } from 'aws-lambda';

export const handler = async (event: CognitoUserPoolTriggerEvent, _context: Context) => {
    // Auto-confirm and auto-verify email/phone if provided so users can sign in immediately.
    event.response.autoConfirmUser = true;
    if (event.request.userAttributes.email) {
        event.response.autoVerifyEmail = true;
    }
    if (event.request.userAttributes.phone_number) {
        event.response.autoVerifyPhone = true;
    }
    return event;
};
