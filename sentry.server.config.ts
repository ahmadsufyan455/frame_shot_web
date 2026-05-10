// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://891ffb5be52464887531a148877e16b5@o4506946269675520.ingest.us.sentry.io/4511363899588608",

  // Do not send user PII or request headers. FrameShot handles private photos
  // and EXIF metadata, so Sentry events must stay intentionally sparse.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});
