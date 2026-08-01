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
  // `userId` is the auth user when there is a session (js/auth.js), so a signed-in
  // player's events join to their row; null for the anonymous majority, which is
  // most of the traffic and the whole point of unit 1.
  event(name, props, sessionId, userId) {
    try {
      // Never log from a dev server or a local file. Our own testing was
      // indistinguishable from real visitors and completely swamped the funnel:
      // on 2026-08-01 the site showed 53 "sessions" whose hourly peaks mapped
      // exactly onto when agents were driving Chrome, and a 33% -> 45% jump in
      // the first-tap rate turned out to be an artefact of who was testing.
      // A metric you cannot trust is worse than no metric, because you act on it.
      var h = (window.location && window.location.hostname) || '';
      if (window.location.protocol === 'file:' ||
          h === 'localhost' || h === '127.0.0.1' || h === '' ||
          h.indexOf('192.168.') === 0 || h.indexOf('10.') === 0) return;
      const body = JSON.stringify({
        session_id: sessionId, user_id: userId || null, name: name,
        props: Object.assign({ host: (window.location && window.location.hostname) || '?' }, props || {}),
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
