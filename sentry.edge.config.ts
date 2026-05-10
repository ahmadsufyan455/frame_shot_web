// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://891ffb5be52464887531a148877e16b5@o4506946269675520.ingest.us.sentry.io/4511363899588608",

  // Do not send user PII or request headers. FrameShot handles private photos
  // and EXIF metadata, so Sentry events must stay intentionally sparse.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});
