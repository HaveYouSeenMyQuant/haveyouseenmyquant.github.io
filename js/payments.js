/* ==========================================================================
 * SEAM — PAYMENTS.  One module, one function: QQPay.checkout(libraryId).
 * ==========================================================================
 *
 * The rule this file exists to enforce: money only ever buys a SEPARATE, NAMED
 * LIBRARY (the Jane Street set, the Optiver speed round). The main road is free
 * for ever. Nothing in this module can lock a road level — it does not even
 * know levels exist.
 *
 * WHAT IT DOES TODAY (stub): records local interest, resolves with
 * { ok:false, stub:true }. No checkout opens, no card form, no processor.
 *
 * WHAT A REAL IMPLEMENTATION LOOKS LIKE: replace the body of `checkout`.
 * Contract:
 *
 *     QQPay.checkout(libraryId) -> Promise<{ ok, stub?, url?, error? }>
 *
 * With Stripe Payment Links this is the entire change — one URL per library,
 * no server:
 *
 *     var LINKS = { jane_street: 'https://buy.stripe.com/xxx' };
 *     QQPay.checkout = function (id) {
 *       var url = LINKS[id];
 *       if (!url) return Promise.resolve({ ok: false, error: 'no_link' });
 *       QQA.track('checkout_opened', { libraryId: id });
 *       location.href = url;
 *       return Promise.resolve({ ok: true, url: url });
 *     };
 *
 * Entitlement (who owns what) must NOT be decided in this file once money is
 * real — a browser can lie. `QQPay.owns()` is a local convenience only; the
 * server behind QQAuth is what may hand over paid questions.
 *
 * USER ACTIONS REQUIRED (Claude cannot do these): create the payment processor
 * account, complete identity/bank verification, create the products and prices,
 * set the tax settings, and paste the resulting public links here.
 * ========================================================================== */
(function (global) {
  'use strict';

  var QQPay = {
    isStub: true,

    /* THE seam function. Swap the body; keep the signature. */
    checkout: function (libraryId) {
      QQStore.registerLibraryInterest(libraryId);
      return Promise.resolve({ ok: false, stub: true, libraryId: libraryId });
    },

    /* Local only. Real entitlement belongs on the server. */
    owns: function (libraryId) { return false; },

    priceLabel: function (lib) {
      return lib.priceUsd ? ('$' + lib.priceUsd) : '';
    }
  };

  global.QQPay = QQPay;
})(window);
