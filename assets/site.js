(function () {
  var pubs = (window.PUBLICATIONS || []).slice();
  var labels = { all: "All", journal: "Journals", conference: "Conferences", magazine: "Magazine", chapter: "Book chapter" };
  var state = "all";
  var list = document.getElementById("pub-list");
  var filters = document.getElementById("pub-filters");
  if (!list || !filters) return;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // newest first, accepted-but-unpublished at the top of their year
  var pending = { review: "Under review", revision: "Under revision", submitted: "Submitted" };
  function group(p) { return pending[p.status] ? "Under review / revision" : String(p.year); }
  // pending items first, then newest year first (stable within a group)
  pubs = pubs.map(function (p, i) { return { p: p, i: i }; }).sort(function (a, b) {
    var ra = pending[a.p.status] ? 0 : 1, rb = pending[b.p.status] ? 0 : 1;
    if (ra !== rb) return ra - rb;
    return (b.p.year || 0) - (a.p.year || 0) || a.i - b.i;
  }).map(function (x) { return x.p; });

  function render() {
    var out = "", lastGroup = null;
    pubs.forEach(function (p) {
      if (state !== "all" && p.type !== state) return;
      var g = group(p);
      if (g !== lastGroup) {
        out += '<li class="yearhead" aria-hidden="true">' + esc(g) + "</li>";
        lastGroup = g;
      }
      var tags = "";
      if (pending[p.status]) tags += '<span class="tag">' + (p.note ? esc(p.note) : pending[p.status]) + "</span>";
      if (p.status === "accepted") tags += '<span class="tag">Accepted</span>';
      if (p.award) tags += '<span class="tag">' + esc(p.award) + "</span>";
      var link = p.doi
        ? ' <a href="https://doi.org/' + encodeURI(p.doi) + '">doi:' + esc(p.doi) + "</a>"
        : "";
      out += "<li><span class=\"t\">" + esc(p.title) + "</span>" + tags +
        "<br><span class=\"a\">" + esc(p.authors) + "</span><br>" +
        "<span class=\"m\">" + esc(p.venue) + "." + link + "</span></li>";
    });
    list.innerHTML = out || "<li class=\"muted\">Nothing here yet.</li>";
  }

  var types = ["all"].concat(["journal", "conference", "magazine", "chapter"].filter(function (t) {
    return pubs.some(function (p) { return p.type === t; });
  }));
  types.forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = labels[t];
    b.setAttribute("aria-pressed", t === state ? "true" : "false");
    b.addEventListener("click", function () {
      state = t;
      Array.prototype.forEach.call(filters.children, function (c) {
        c.setAttribute("aria-pressed", c === b ? "true" : "false");
      });
      render();
    });
    filters.appendChild(b);
  });
  render();
})();
