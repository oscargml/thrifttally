/**
 * ThriftTally fee calculator.
 * Fee structures reflect each platform's publicly posted seller rate cards
 * as of April 2026. Marketplaces change fees without much notice — the
 * "last checked" date in the footer note is the source of truth, and this
 * tool should be treated as a planning estimate, not an invoice.
 */
(function () {
  "use strict";

  var money = function (n) {
    var sign = n < 0 ? "-" : "";
    return sign + "$" + Math.abs(n).toFixed(2);
  };

  // TODO(owner): swap these for your tracked eBay Partner Network / Etsy
  // Affiliate Program links once approved. Left as plain homepage links so
  // nothing is misrepresented as an affiliate link before it actually is one.
  var AFFILIATE_LINKS = {
    ebay: "https://www.ebay.com/",
    etsy: "https://www.etsy.com/",
    poshmark: "https://poshmark.com/",
    depop: "https://www.depop.com/",
    mercari: "https://www.mercari.com/",
    facebook: "https://www.facebook.com/marketplace/",
    whatnot: "https://www.whatnot.com/",
  };


  var state = {
    price: 40,
    cost: 12,
    shipping: 0,
    ebayCategory: "standard", // standard | business
    depopRegion: "us_uk",     // us_uk | intl
    fbFulfillment: "shipped", // shipped | local
  };

  function computeAll() {
    var p = Math.max(0, state.price || 0);
    var results = [];

    // ---- eBay ---------------------------------------------------------
    (function () {
      var rate = state.ebayCategory === "business" ? 0.0635 : 0.1325;
      var fvf = p * rate;
      var processing = p * 0.029 + 0.3;
      var fees = fvf + processing;
      results.push({
        id: "ebay",
        name: "eBay",
        fees: fees,
        lines: [
          ["Final value fee (" + (rate * 100).toFixed(2) + "%)", fvf],
          ["Payment processing", processing],
        ],
        note: "250 free listings/mo · rate varies by category",
      });
    })();

    // ---- Etsy -----------------------------------------------------------
    (function () {
      var listing = 0.2;
      var transaction = p * 0.065;
      var processing = p * 0.03 + 0.25;
      var fees = listing + transaction + processing;
      results.push({
        id: "etsy",
        name: "Etsy",
        fees: fees,
        lines: [
          ["Listing fee", listing],
          ["Transaction fee (6.5%)", transaction],
          ["Payment processing", processing],
        ],
        note: "vintage items must be 20+ years old to list as vintage",
      });
    })();

    // ---- Poshmark ---------------------------------------------------------
    (function () {
      var fee = p < 15 ? 2.95 : p * 0.2;
      results.push({
        id: "poshmark",
        name: "Poshmark",
        fees: fee,
        lines: [
          [p < 15 ? "Flat fee (sales under $15)" : "Commission (20%)", fee],
        ],
        note: "no separate listing or processing fee",
      });
    })();

    // ---- Depop ------------------------------------------------------------
    (function () {
      var fees, lines;
      if (state.depopRegion === "us_uk") {
        var processing = p * 0.033 + 0.45;
        fees = processing;
        lines = [["Payment processing (US/UK, 0% commission)", processing]];
      } else {
        var commission = p * 0.1;
        var processing2 = p * 0.033 + 0.45;
        fees = commission + processing2;
        lines = [
          ["Seller commission (10%)", commission],
          ["Payment processing", processing2],
        ];
      }
      results.push({
        id: "depop",
        name: "Depop",
        fees: fees,
        lines: lines,
        note: "0% commission currently applies to US & UK sellers only",
      });
    })();

    // ---- Mercari ------------------------------------------------------------
    (function () {
      var sellingFee = p * 0.1;
      var processing = p * 0.029 + 0.3;
      var fees = sellingFee + processing;
      results.push({
        id: "mercari",
        name: "Mercari",
        fees: fees,
        lines: [
          ["Selling fee (10%)", sellingFee],
          ["Payment processing", processing],
        ],
        note: "Instant Pay adds a separate $2 transfer fee",
      });
    })();

    // ---- Facebook Marketplace ---------------------------------------------
    (function () {
      var fees, lines, note;
      if (state.fbFulfillment === "shipped") {
        fees = Math.max(p * 0.05, 0.4);
        lines = [["Shipped-item fee (5%, min $0.40)", fees]];
        note = "local pickup sales carry no seller fee";
      } else {
        fees = 0;
        lines = [["Local pickup", 0]];
        note = "no shipping label, no buyer protection coverage";
      }
      results.push({ id: "facebook", name: "Facebook Marketplace", fees: fees, lines: lines, note: note });
    })();

    // ---- Whatnot ------------------------------------------------------------
    (function () {
      var fee = p * 0.095;
      results.push({
        id: "whatnot",
        name: "Whatnot",
        fees: fee,
        lines: [["Selling fee incl. processing (9.5%)", fee]],
        note: "live-auction format — final prices often run higher than fixed listings",
      });
    })();

    // finalize: net + profit, sort by net desc
    results.forEach(function (r) {
      r.net = p - r.fees - Math.max(0, state.shipping || 0);
      r.profit = r.net - Math.max(0, state.cost || 0);
    });
    results.sort(function (a, b) { return b.net - a.net; });
    return results;
  }

  function tagMarkup(r, isBest) {
    var breakdown = r.lines
      .map(function (l) {
        return "<div><span>" + l[0] + "</span><span>" + money(-l[1]) + "</span></div>";
      })
      .join("");

    var showProfit = state.cost > 0 || state.shipping > 0;

    return (
      '<article class="price-tag' + (isBest ? " is-best" : "") + '">' +
      '<div class="tag-notch" aria-hidden="true"></div>' +
      '<div class="tag-platform">' + r.name + "</div>" +
      '<div class="tag-net"><small>You keep</small>' + money(r.net) + "</div>" +
      (showProfit
        ? '<div class="tag-breakdown"><div><span>Profit after cost/shipping</span><span>' +
          money(r.profit) +
          "</span></div></div>"
        : "") +
      '<div class="tag-breakdown">' +
      breakdown +
      "</div>" +
      '<p style="font-size:.72rem;color:rgba(34,28,40,.6);margin:10px 0 0;">' + r.note + "</p>" +
      '<a class="tag-cta" href="' + AFFILIATE_LINKS[r.id] + '" target="_blank" rel="noopener">List it on ' + r.name + " &rarr;</a>" +
      "</article>"
    );

  }

  function render() {
    var grid = document.getElementById("tagGrid");
    if (!grid) return;
    var results = computeAll();
    grid.innerHTML = results.map(function (r, i) { return tagMarkup(r, i === 0); }).join("");
  }

  function bindNumber(id, key) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", function () {
      state[key] = parseFloat(el.value) || 0;
      render();
    });
  }

  function bindToggle(groupId, key) {
    var group = document.getElementById(groupId);
    if (!group) return;
    var buttons = group.querySelectorAll("button");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        state[key] = btn.dataset.value;
        render();
      });
    });
  }

  function bindSelect(id, key) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", function () {
      state[key] = el.value;
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindNumber("inputPrice", "price");
    bindNumber("inputCost", "cost");
    bindNumber("inputShipping", "shipping");
    bindSelect("inputEbayCategory", "ebayCategory");
    bindToggle("toggleDepop", "depopRegion");
    bindToggle("toggleFb", "fbFulfillment");
    render();
  });
})();
