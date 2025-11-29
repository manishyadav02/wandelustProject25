// booking.js (with fixed-offers client-side)
(function () {
  if (window.bookingWidgetInitialized) return;
  window.bookingWidgetInitialized = true;
  console.log("Booking Widget Script Loaded");

  const LISTING_PRICE =
    (window.listingData && Number(window.listingData.price)) || 0;

  // ----- NEW: If listing.price is already the total for 2 nights, use this constant -----
  const DEFAULT_LISTING_NIGHTS = 2;
  const PER_NIGHT =
    DEFAULT_LISTING_NIGHTS > 0
      ? LISTING_PRICE / DEFAULT_LISTING_NIGHTS
      : LISTING_PRICE;

  // Elements
  const bookingForm = document.getElementById("bookingForm");
  const checkInEl = document.getElementById("checkin-date");
  const checkOutEl = document.getElementById("checkout-date");
  const priceDisplay = document.getElementById("price-total");
  const nightLabel = document.getElementById("night-label");
  const totalNightsSpan = document.getElementById("total-nights");
  const cancellationBox = document.getElementById("cancellation-box");

  const guestToggle = document.getElementById("guest-toggle");
  const guestDropdown = document.getElementById("guest-dropdown");
  const guestCountText = document.getElementById("guest-count");
  const guestPopupCount = document.getElementById("guest-count-popup");
  const btnPlus = document.getElementById("guest-plus");
  const btnMinus = document.getElementById("guest-minus");

  const hiddenCheckIn = document.getElementById("hidden-checkin");
  const hiddenCheckOut = document.getElementById("hidden-checkout");
  const hiddenGuests = document.getElementById("hidden-guests");
  const hiddenPrice = document.getElementById("hidden-price");

  // Offer rules (from show.ejs) - fallback to defaults if not provided
  const offers =
    window.siteOffers && Array.isArray(window.siteOffers)
      ? window.siteOffers
      : [
          {
            minNights: 31,
            pct: 20,
            label: "20% off — stays longer than 30 nights",
          },
          {
            minNights: 8,
            pct: 10,
            label: "10% off — stays longer than 7 nights",
          },
          {
            minNights: 3,
            pct: 5,
            label: "5% off — stays longer than 2 nights",
          },
        ];

  // helpers
  function toISO(d) {
    return new Date(d).toISOString().split("T")[0];
  }
  function addDaysISO(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return toISO(d);
  }
  function formatINR(n) {
    try {
      return n.toLocaleString("en-IN");
    } catch (e) {
      return n;
    }
  }

  // compute nights helper
  function nightsBetween(aStr, bStr) {
    if (!aStr || !bStr) return 0;
    const a = new Date(aStr + "T00:00:00");
    const b = new Date(bStr + "T00:00:00");
    const ms = b - a;
    if (ms <= 0) return 0;
    return Math.round(ms / (1000 * 60 * 60 * 24));
  }

  // find best offer for nights (offers sorted desc by minNights)
  function bestOfferFor(nights) {
    for (const o of offers) {
      if (nights >= (o.minNights || 0)) return o;
    }
    return null;
  }

  // init dates: min checkin = today; default checkout = checkin + 2
  const today = new Date();
  const todayStr = toISO(today);

  if (checkInEl) checkInEl.min = todayStr;
  if (checkInEl && checkOutEl) {
    if (!checkInEl.value) checkInEl.value = todayStr;
    if (!checkOutEl.value)
      checkOutEl.value = addDaysISO(checkInEl.value, DEFAULT_LISTING_NIGHTS);
    checkOutEl.min = addDaysISO(checkInEl.value, 1);
  }

  // ensure checkout min
  function ensureCheckoutMin() {
    if (!checkInEl || !checkOutEl) return;
    const minCO = addDaysISO(checkInEl.value, 1);
    checkOutEl.min = minCO;
    const coDate = new Date(checkOutEl.value);
    const minDate = new Date(minCO);
    if (coDate < minDate) {
      checkOutEl.value = addDaysISO(checkInEl.value, DEFAULT_LISTING_NIGHTS);
    }
  }

  // update UI & price calculations
  function updateCalculations() {
    if (!checkInEl || !checkOutEl) return;
    const nights = nightsBetween(checkInEl.value, checkOutEl.value);

    if (nights > 0) {
      const subtotal = nights * PER_NIGHT;
      const offer = bestOfferFor(nights);
      let total = subtotal;
      if (offer && typeof offer.pct === "number" && offer.pct > 0) {
        total = Math.round(subtotal * (1 - offer.pct / 100));
        // show discount label next to price
        priceDisplay.innerHTML = `₹${formatINR(
          total
        )} <span class="discount-tag">(${offer.pct}% off)</span>`;
      } else {
        priceDisplay.innerText = "₹" + formatINR(subtotal);
      }

      nightLabel.innerText = `for ${nights} ${
        nights === 1 ? "night" : "nights"
      }`;
      if (cancellationBox) {
        cancellationBox.style.display = "block";
        totalNightsSpan.innerText = nights;
      }
      if (hiddenPrice) hiddenPrice.value = total;
    } else {
      // fallback to show listing price and default nights
      priceDisplay.innerText = "₹" + formatINR(LISTING_PRICE);
      nightLabel.innerText = `for ${DEFAULT_LISTING_NIGHTS} night${
        DEFAULT_LISTING_NIGHTS > 1 ? "s" : ""
      }`;
      if (hiddenPrice) hiddenPrice.value = LISTING_PRICE;
      if (cancellationBox) cancellationBox.style.display = "none";
    }

    if (hiddenCheckIn) hiddenCheckIn.value = checkInEl.value;
    if (hiddenCheckOut) hiddenCheckOut.value = checkOutEl.value;
  }

  // set listeners
  if (checkInEl) {
    checkInEl.addEventListener("change", () => {
      ensureCheckoutMin();
      // if checkout is <= checkin, set a friendly default of +2 nights
      if (new Date(checkOutEl.value) <= new Date(checkInEl.value)) {
        checkOutEl.value = addDaysISO(checkInEl.value, DEFAULT_LISTING_NIGHTS);
      }
      updateCalculations();
    });
  }
  if (checkOutEl) {
    checkOutEl.addEventListener("change", () => {
      updateCalculations();
    });
  }

  // Guests logic (unchanged)
  let guestCount = parseInt(hiddenGuests?.value || "1", 10) || 1;
  function updateGuestUI() {
    if (guestCountText) guestCountText.innerText = guestCount;
    if (guestPopupCount) guestPopupCount.innerText = guestCount;
    if (hiddenGuests) hiddenGuests.value = guestCount;
    if (btnMinus) btnMinus.disabled = guestCount <= 1;
  }
  updateGuestUI();

  // dropdown show/hide
  function showDropdown() {
    if (!guestDropdown || !guestToggle) return;
    guestDropdown.classList.add("show");
    guestToggle.setAttribute("aria-expanded", "true");
    guestDropdown.setAttribute("aria-hidden", "false");
    const icon = guestToggle.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-chevron-down");
      icon.classList.add("fa-chevron-up");
    }
  }
  function hideDropdown() {
    if (!guestDropdown || !guestToggle) return;
    guestDropdown.classList.remove("show");
    guestToggle.setAttribute("aria-expanded", "false");
    guestDropdown.setAttribute("aria-hidden", "true");
    const icon = guestToggle.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-chevron-up");
      icon.classList.add("fa-chevron-down");
    }
  }
  function toggleDropdown() {
    if (!guestDropdown) return;
    if (guestDropdown.classList.contains("show")) hideDropdown();
    else showDropdown();
  }

  if (guestToggle) {
    guestToggle.addEventListener("click", (e) => {
      if (e.target.closest("#guest-dropdown")) return;
      toggleDropdown();
    });
    guestToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleDropdown();
      }
      if (e.key === "Escape") hideDropdown();
    });
  }

  document.addEventListener("click", (e) => {
    if (!guestToggle || !guestDropdown) return;
    if (!e.target.closest("#guest-toggle")) {
      if (guestDropdown.classList.contains("show")) hideDropdown();
    }
  });

  if (btnPlus) {
    btnPlus.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (guestCount < 10) {
        guestCount++;
        updateGuestUI();
      }
    });
  }
  if (btnMinus) {
    btnMinus.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (guestCount > 1) {
        guestCount--;
        updateGuestUI();
      }
    });
  }

  // form submit validation
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      ensureCheckoutMin();
      updateCalculations();
      if (hiddenGuests) hiddenGuests.value = guestCount;

      const d1 = new Date(checkInEl.value);
      const d2 = new Date(checkOutEl.value);
      if (d2 <= d1) {
        e.preventDefault();
        alert("Checkout must be after check-in.");
        return false;
      }
    });
  }

  // init on load
  ensureCheckoutMin();
  updateCalculations();
  console.log(
    "Booking widget initialized. Listing price:",
    LISTING_PRICE,
    "per-night used:",
    PER_NIGHT,
    "offers:",
    offers
  );
})();
