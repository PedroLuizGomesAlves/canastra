(function () {
  var KEY = "canastra-v1";
  var defaults = { limpa: 200, suja: 100, bater: 100, morto: 100, meta: 3000, doisMortos: false };
  var state = { rules: Object.assign({}, defaults), rounds: [], won: false };
  var cur = {
    us:   { pts: 0, mao: 0, limpas: 0, sujas: 0, bateu: false, morto: false },
    them: { pts: 0, mao: 0, limpas: 0, sujas: 0, bateu: false, morto: false }
  };
  var names = { us: "Nossa dupla", them: "Dupla adversária" };

  function load() { try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.rules && s.rounds) state = s; } catch (e) {} }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function num(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }

  function calc(t) {
    var r = state.rules;
    return (t.pts || 0) + t.limpas * r.limpa + t.sujas * r.suja + (t.bateu ? r.bater : 0) + (t.morto ? r.morto : 0);
  }
  function fmt(n) { return n.toLocaleString("pt-BR"); }

  function stepper(k, field, label, hint) {
    return '<div class="stepper"><div class="name">' + label + '<small>' + hint + '</small></div>' +
      '<div class="ctl"><button type="button" data-k="' + k + '" data-f="' + field + '" data-d="-1" aria-label="Menos ' + label + '">−</button>' +
      '<span class="n" id="n-' + k + '-' + field + '">0</span>' +
      '<button type="button" data-k="' + k + '" data-f="' + field + '" data-d="1" aria-label="Mais ' + label + '">+</button></div></div>';
  }
  function teamHTML(k) {
    var r = state.rules;
    return '<div class="team ' + k + '"><h2><span class="dot"></span>' + names[k] + '</h2>' +
      '<label class="f" for="pts-' + k + '">Pontos para adicionar<input type="number" inputmode="numeric" id="pts-' + k + '" data-k="' + k + '" data-f="pts" placeholder="0"></label>' +
      stepper(k, "limpas", "Canastra limpa", "+" + r.limpa + " cada") +
      stepper(k, "sujas", "Canastra suja", "+" + r.suja + " cada") +
      
      '<div class="checks">' +
      '<label class="chk"><input type="checkbox" data-k="' + k + '" data-f="bateu"> Bateu (+' + r.bater + ')</label>' +
      '<label class="chk"><input type="checkbox" data-k="' + k + '" data-f="morto"> Pegou o morto (+' + r.morto + ')</label>' +
      '</div><div class="sub">Total da rodada<b id="sub-' + k + '">0</b></div></div>';
  }

  function drawRound() {
    document.getElementById("round").innerHTML = teamHTML("us") + teamHTML("them");
  }
  function refreshRound() {
    ["us", "them"].forEach(function (k) {
      var t = cur[k];
      document.getElementById("n-" + k + "-limpas").textContent = t.limpas;
      document.getElementById("n-" + k + "-sujas").textContent = t.sujas;
      var b = document.getElementById("sub-" + k), v = calc(t);
      b.textContent = fmt(v); b.className = v < 0 ? "neg" : "";
    });
  }
  function totals() {
    var u = 0, t = 0;
    state.rounds.forEach(function (r) { u += r.us; t += r.them; });
    return { us: u, them: t };
  }
  function drawTotals() {
    var tt = totals(), meta = state.rules.meta;
    document.getElementById("totUs").textContent = fmt(tt.us);
    document.getElementById("totThem").textContent = fmt(tt.them);
    var bn = document.getElementById("banner");
    if (meta > 0 && (tt.us >= meta || tt.them >= meta)) {
      var w = tt.us === tt.them ? "Empate" : (tt.us > tt.them ? "Nossa dupla venceu" : "Dupla adversária venceu");
      bn.textContent = w + " (meta de " + fmt(meta) + " pontos atingida)";
      bn.hidden = false;
    } else { bn.hidden = true; }
  }
  function detail(r, k) {
    var d = r.d && r.d[k]; if (!d) return "";
    var p = ["Pontos " + fmt(d.pts), d.limpas + (d.limpas === 1 ? " limpa" : " limpas"), d.sujas + (d.sujas === 1 ? " suja" : " sujas")];
    if (d.bateu) p.push("Bateu");
    if (d.morto) p.push("Pegou o morto");
    return '<span class="det">' + p.join(" · ") + '</span>';
  }
  function drawHist() {
    var el = document.getElementById("hist");
    if (!state.rounds.length) { el.innerHTML = '<p class="empty">Nenhuma rodada ainda. Preencha os dois lados e toque em Fechar rodada.</p>'; return; }
    var tt = totals();
    var rows = state.rounds.map(function (r, i) {
      return '<div class="rr"><div class="rn">Rodada ' + (i + 1) + '</div><div class="rc us"><b>' + fmt(r.us) + '</b>' + detail(r, "us") + '</div><div class="rc them"><b>' + fmt(r.them) + '</b>' + detail(r, "them") + '</div></div>';
    }).join("");
    el.innerHTML = '<div class="hh"><span></span><span>Nós</span><span>Eles</span></div>' + rows +
      '<div class="rr tt"><div class="rn">Total</div><div class="rc us"><b>' + fmt(tt.us) + '</b></div><div class="rc them"><b>' + fmt(tt.them) + '</b></div></div>';
  }
  function drawRules() {
    var defs = [["limpa", "Canastra limpa"], ["suja", "Canastra suja"], ["bater", "Bater"], ["morto", "Pegar o morto"], ["meta", "Meta do jogo"]];
    document.getElementById("rules").innerHTML = defs.map(function (d) {
      return '<label class="f" for="rule-' + d[0] + '">' + d[1] + '<input type="number" inputmode="numeric" id="rule-' + d[0] + '" data-rule="' + d[0] + '" value="' + state.rules[d[0]] + '"></label>';
    }).join("") + '<label class="chk wide" for="rule-dois"><input type="checkbox" id="rule-dois" data-toggle="doisMortos"' + (state.rules.doisMortos ? " checked" : "") + '> Jogo com dois mortos (as duas duplas podem pegar)</label>';
  }
  function resetCur() {
    ["us", "them"].forEach(function (k) { cur[k] = { pts: null, mao: 0, limpas: 0, sujas: 0, bateu: false, morto: false }; });
    drawRound(); refreshRound();
  }
  function all() { drawRound(); refreshRound(); drawTotals(); drawHist(); drawRules(); }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.d) {
      var t = cur[b.dataset.k], f = b.dataset.f;
      t[f] = Math.max(0, t[f] + num(b.dataset.d)); refreshRound();
    }
  });
  document.addEventListener("input", function (e) {
    var el = e.target;
    if (el.dataset.toggle) {
      state.rules.doisMortos = el.checked;
      if (!el.checked && cur.us.morto && cur.them.morto) { cur.them.morto = false; syncInputs(); }
      save(); refreshRound(); return;
    }
    if (el.dataset.rule) {
      state.rules[el.dataset.rule] = Math.max(0, num(el.value)); save();
      if (el.dataset.rule === "meta") drawTotals();
      else { var snapshot = JSON.parse(JSON.stringify(cur)); drawRound(); cur = snapshot; syncInputs(); refreshRound(); }
      return;
    }
    if (el.dataset.k) {
      var t = cur[el.dataset.k];
      t[el.dataset.f] = el.type === "checkbox" ? el.checked : (el.value.trim() === "" ? null : num(el.value));
      if (el.dataset.f === "morto" && el.checked && !state.rules.doisMortos) {
        var other = el.dataset.k === "us" ? "them" : "us";
        cur[other].morto = false;
        document.querySelector('input[data-k="' + other + '"][data-f="morto"]').checked = false;
      }
      el.removeAttribute("aria-invalid"); document.getElementById("err").hidden = true;
      refreshRound();
    }
  });
  function syncInputs() {
    ["us", "them"].forEach(function (k) {
      var t = cur[k];
      document.getElementById("pts-" + k).value = t.pts;
      document.querySelector('input[data-k="' + k + '"][data-f="bateu"]').checked = t.bateu;
      document.querySelector('input[data-k="' + k + '"][data-f="morto"]').checked = t.morto;
    });
  }
  document.getElementById("close").addEventListener("click", function () {
    var errEl = document.getElementById("err"), missing = [];
    document.querySelectorAll('input[data-f="pts"]').forEach(function (i) { i.removeAttribute("aria-invalid"); });
    ["us", "them"].forEach(function (k) {
      if (cur[k].pts === null) { missing.push(names[k]); document.getElementById("pts-" + k).setAttribute("aria-invalid", "true"); }
    });
    if (missing.length) {
      errEl.textContent = "Preencha os pontos de: " + missing.join(" e ") + " (se não fez nada, coloque 0).";
      errEl.hidden = false;
      document.getElementById("pts-" + (cur.us.pts === null ? "us" : "them")).focus();
      return;
    }
    if (!state.rules.doisMortos && cur.us.morto && cur.them.morto) { errEl.textContent = "Só uma dupla pode pegar o morto. Ative \"dois mortos\" nas regras se o jogo tiver dois."; errEl.hidden = false; return; }
    if (cur.us.bateu && cur.them.bateu) { errEl.textContent = "Só uma dupla pode bater na rodada."; errEl.hidden = false; return; }
    errEl.hidden = true;
    state.rounds.push({ us: calc(cur.us), them: calc(cur.them), d: { us: JSON.parse(JSON.stringify(cur.us)), them: JSON.parse(JSON.stringify(cur.them)) } }); save();
    resetCur(); drawTotals(); drawHist();
  });
  document.getElementById("undo").addEventListener("click", function () {
    if (!state.rounds.length) return;
    state.rounds.pop(); save(); drawTotals(); drawHist();
  });
  var resetBtn = document.getElementById("reset"), armed = false, timer;
  resetBtn.addEventListener("click", function () {
    if (!armed) { armed = true; resetBtn.textContent = "Toque de novo para apagar"; timer = setTimeout(disarm, 3000); return; }
    clearTimeout(timer); disarm(); state.rounds = []; save(); resetCur(); drawTotals(); drawHist();
  });
  function disarm() { armed = false; resetBtn.textContent = "Novo jogo"; }

  load(); resetCur(); drawTotals(); drawHist(); drawRules();
})();
