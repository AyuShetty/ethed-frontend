import { createAuthClient } from "better-auth/react";
import { emailOTPClient, siweClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    siweClient(),
    adminClient(),
  ]
});