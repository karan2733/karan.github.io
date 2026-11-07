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
  pubs.sort(function (a, b) { return b.year - a.year; });

  function render() {
    var out = "", lastYear = null;
    pubs.forEach(function (p) {
      if (state !== "all" && p.type !== state) return;
      if (p.year !== lastYear) {
        out += '<li class="yearhead" aria-hidden="true">' + p.year + "</li>";
        lastYear = p.year;
      }
      var tags = "";
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
