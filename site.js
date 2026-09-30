/* ═══════════════════════════════════════════════════════════════════
   ZACK OF ALL TRADES — shared site script
   Loaded by every page. Two small jobs:
   1. toggleNav() — opens/closes the mobile menu
   2. submitForm() — contact form. There is no backend: it opens the
      visitor's email app with a pre-addressed message to
      zack@zoathomeservices.com. Keep the email address in sync here
      and in the HTML if it ever changes.
   ═══════════════════════════════════════════════════════════════════ */

function toggleNav() {
  document.querySelector(".nav-links").classList.toggle("open");
}

function submitForm() {
  var name = document.getElementById("fname").value;
  var phone = document.getElementById("fphone").value;
  var email = document.getElementById("femail").value;
  var address = document.getElementById("faddress").value;
  var service = document.getElementById("fservice").value;
  var message = document.getElementById("fmessage").value;
  if (!name || (!phone && !email)) {
    alert("Please fill in your name and at least a phone number or email.");
    return;
  }
  var subject = encodeURIComponent("New Service Request from " + name);
  var body = encodeURIComponent(
    "Name: " + name + "\n" +
    "Phone: " + phone + "\n" +
    "Email: " + email + "\n" +
    "City / Area: " + address + "\n" +
    "Service: " + service + "\n" +
    "Message:\n" + message
  );
  window.location.href = "mailto:zack@zoathomeservices.com?subject=" + subject + "&body=" + body;
  document.getElementById("formSuccess").style.display = "block";
}

/* ═══════════════════════════════════════════════════════════════════
   3. Mobile gallery auto-advance — on phones the gallery is a
      swipeable row. It drifts to the next photo every 3 seconds, but
      only while the gallery is on screen, and it loops seamlessly
      (the photo set is quietly doubled so the wrap has no visible
      jump). The moment the visitor touches or scrolls it, autoplay
      stops and the gallery is theirs. Skipped entirely for visitors
      who prefer reduced motion.
   ═══════════════════════════════════════════════════════════════════ */
(function() {
  var grid = document.querySelector(".gallery-grid");
  if (!grid || !grid.querySelector(".gallery-item")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var mq = window.matchMedia("(max-width: 640px)");
  var timer = null;
  var stopped = false;   /* visitor took over */
  var inView = false;    /* gallery is on screen */
  var SET_W = 0;         /* width of one photo set, for the seamless wrap */

  function cardStep() {
    var card = grid.querySelector(".gallery-item");
    if (!card) return 0;
    var gap = parseFloat(getComputedStyle(grid).gap) || 12;
    return card.getBoundingClientRect().width + gap;
  }

  /* Duplicate the photos once so the end wraps to an identical copy. */
  function setupLoop() {
    if (grid.dataset.looped) return;
    var items = grid.querySelectorAll('.gallery-item:not([data-clone])');
    if (!items.length) return;
    Array.prototype.forEach.call(items, function(it) {
      var c = it.cloneNode(true);
      c.setAttribute("data-clone", "1");
      c.setAttribute("aria-hidden", "true");
      grid.appendChild(c);
    });
    grid.dataset.looped = "1";
    var first = items[0];
    var firstClone = grid.querySelector(".gallery-item[data-clone]");
    SET_W = firstClone.getBoundingClientRect().left - first.getBoundingClientRect().left;
  }
  function teardownLoop() {
    Array.prototype.forEach.call(
      grid.querySelectorAll(".gallery-item[data-clone]"),
      function(c) { c.remove(); }
    );
    delete grid.dataset.looped;
    SET_W = 0;
    grid.scrollLeft = 0;
  }

  function advance() {
    if (stopped || document.hidden || !inView || !mq.matches || !SET_W) return;
    if (grid.scrollLeft >= SET_W - 4) {
      grid.scrollLeft -= SET_W; /* invisible wrap onto the identical copy */
    } else {
      grid.scrollBy({ left: cardStep(), behavior: "smooth" });
    }
  }
  function poke() {
    var want = !stopped && inView && mq.matches;
    if (want && !timer) timer = setInterval(advance, 3000);
    if (!want && timer) { clearInterval(timer); timer = null; }
  }
  function stop() {
    stopped = true;
    if (timer) { clearInterval(timer); timer = null; }
  }

  /* Any manual interaction hands control to the visitor for good. */
  grid.addEventListener("pointerdown", stop, { passive: true });
  grid.addEventListener("wheel", stop, { passive: true });

  /* Only animate while the gallery is actually on screen. */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function(entries) {
      inView = entries[0].isIntersecting;
      poke();
    }, { threshold: 0.2 }).observe(grid);
  } else {
    inView = true;
  }

  document.addEventListener("visibilitychange", poke);
  mq.addEventListener("change", function(e) {
    if (e.matches) { setupLoop(); } else { teardownLoop(); }
    poke();
  });
  if (mq.matches) setupLoop();
  poke();
})();
