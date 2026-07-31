// Supabase connection for the road.
//
// These two values are PUBLIC by design and safe to ship in a GitHub Pages
// bundle. The publishable key grants only what Row Level Security allows, and
// site/schema.sql locks that down to: insert-your-own events, read/write your
// own profile and progress, read nothing belonging to anyone else. Verified on
// 2026-07-31 by hitting the REST API with this exact key -- a profiles insert
// came back 42501, and an events select returned [] while a row was present.
//
// What must NEVER appear in this file, or anywhere else in site/: the secret
// key, and the database password. GitHub Pages serves every byte of this repo
// to the public. They live in ~/.config/quantvideos.env at 0600 and are used
// only from the local machine.
window.SUPABASE_CONFIG = {
  url: "https://fnzdpfgwrcapdnqiuhaf.supabase.co",
  publishableKey: "sb_publishable_v46yRft0VGSxXmhj_31smg_8lD4e3VQ",
};

// Minimal REST helpers, so the site stays dependency-free and offline-tolerant.
// No Supabase JS SDK: it is ~40KB over the wire and we use three endpoints.
window.sb = {
  // Fire-and-forget analytics. Never awaited by the UI and never allowed to
  // throw -- a learner mid-lesson must not notice that a beacon failed, and
  // unit 1 has to work with the network off.
  event(name, props, sessionId) {
    try {
      const body = JSON.stringify({
        session_id: sessionId, name: name, props: props || {},
      });
      const url = window.SUPABASE_CONFIG.url + "/rest/v1/events";
      fetch(url, {
        method: "POST",
        keepalive: true,          // survives the tab closing, which is exactly
                                  // when the 'quit' event matters most
        headers: {
          "apikey": window.SUPABASE_CONFIG.publishableKey,
          "Authorization": "Bearer " + window.SUPABASE_CONFIG.publishableKey,
          "Content-Type": "application/json",
        },
        body: body,
      }).catch(function () {});
    } catch (e) { /* analytics is never load-bearing */ }
  },
};
