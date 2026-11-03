// Express app ko import kar rahe hain.
// Actual Express configuration app.ts mein hogi.
import { app } from "./app";

// Centralized environment configuration.
import { env } from "./config/env";

// Server ko specified port par start kar rahe hain.
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
});