import { Callback, Context, PreAuthenticationTriggerEvent } from "aws-lambda";

export async function handler(event: PreAuthenticationTriggerEvent, context: Context,
      callback: Callback): Promise<void> {
      
   // Sanitized logging - avoid logging sensitive data
   console.log('Pre-authentication trigger invoked', {
      userPoolId: event.userPoolId,
      userName: event.userName,
      triggerSource: event.triggerSource
   });

   try {
      const userEmail = event.request.userAttributes.email?.toLowerCase();
      
      // Get blocked emails from environment variables
      const blockedEmails = process.env.BLOCKED_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
      
      if (blockedEmails.includes(userEmail)) {
         console.warn('Authentication blocked for user', { userName: event.userName, reason: 'BLOCKED_USER' });
         callback("Authentication failed. Please contact support.", event);
         return;
      }

      // Allow authentication
      callback(null, event);
      
   } catch (error) {
      console.error('Error in pre-authentication function:', error);
      callback("Authentication service temporarily unavailable.", event);
   }
}