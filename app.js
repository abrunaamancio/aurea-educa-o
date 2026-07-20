// LinkedIn Maestria — lógica do frontend
(() => {
  const form = document.getElementById("profile-form");
  const formSection = document.getElementById("formulario");
  const loadingSection = document.getElementById("loading");
  const resultSection = document.getElementById("resultado");
  const resultContainer = document.getElementById("resultado-conteudo");
  const formError = document.getElementById("form-error");
  const submitBtn = document.getElementById("submit-btn");
  const loadingMsg = document.getElementById("loading-msg");
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const fileList = document.getElementById("file-list");

  let arquivos = []; // {nome, tipo, dados(base64 sem prefixo), tamanho, thumb}
  let ultimoResultado = null;
  let loadingTimer = null;

  const MAX_ARQUIVOS = 12;
  const MAX_PAYLOAD_BASE64 = 4_200_000; // ~4,2 MB — limite de requisição do servidor

  const LOADING_MSGS = [
    "Analisando os 4 pilares do SSI.",
    "Lendo seus prints e extraindo o conteúdo do perfil.",
    "Comparando seu perfil com as boas práticas de 2026.",
    "Reescrevendo sua headline e seu Sobre.",
    "Montando o checklist de configuração.",
    "Definindo sua estratégia de conexões.",
    "Fechando o plano de publicações."
  ];

  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  /* ============ upload de arquivos ============ */

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener("change", () => {
    adicionarArquivos([...fileInput.files]);
    fileInput.value = "";
  });
  ["dragover", "dragenter"].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    })
  );
  ["dragleave", "drop"].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
    })
  );
  dropzone.addEventListener("drop", (e) => adicionarArquivos([...e.dataTransfer.files]));

  async function adicionarArquivos(files) {
    formError.hidden = true;
    for (const file of files) {
      if (arquivos.length >= MAX_ARQUIVOS) {
        mostrarErro(`Limite de ${MAX_ARQUIVOS} arquivos. Remova algum antes de adicionar outro.`);
        break;
      }
      try {
        if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
          const dados = await lerBase64(file);
          arquivos.push({ nome: file.name, tipo: "application/pdf", dados, tamanho: file.size, thumb: null });
        } else if (file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name)) {
          const { dados, thumb, tamanho } = await comprimirImagem(file);
          arquivos.push({ nome: file.name, tipo: "image/jpeg", dados, tamanho, thumb });
        } else {
          mostrarErro(`"${file.name}" não é um formato aceito. Envie PNG, JPG ou PDF.`);
        }
      } catch {
        mostrarErro(`Não consegui ler o arquivo "${file.name}". Tente novamente.`);
      }
    }
    renderFileList();
  }

  function lerBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1]);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  // Reduz prints grandes para o envio ser rápido, mantendo o texto legível
  function comprimirImagem(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const MAX = 1800;
        const escala = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        URL.revokeObjectURL(url);
        const dados = dataUrl.split(",")[1];
        resolve({ dados, thumb: dataUrl, tamanho: Math.round(dados.length * 0.75) });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("imagem inválida"));
      };
      img.src = url;
    });
  }

  function renderFileList() {
    fileList.innerHTML = arquivos
      .map(
        (a, i) => `
      <li>
        ${a.thumb ? `<img class="file-thumb" src="${a.thumb}" alt="" />` : `<span class="file-pdf-icon">PDF</span>`}
        <span class="file-name">${esc(a.nome)}</span>
        <span class="file-size">${(a.tamanho / 1024).toFixed(0)} KB</span>
        <button type="button" class="file-remove" data-i="${i}" aria-label="Remover ${esc(a.nome)}">✕</button>
      </li>`
      )
      .join("");
    fileList.querySelectorAll(".file-remove").forEach((btn) =>
      btn.addEventListener("click", () => {
        arquivos.splice(Number(btn.dataset.i), 1);
        renderFileList();
      })
    );
  }

  /* ============ coleta e validação ============ */

  function coletarDados() {
    const fd = new FormData(form);
    const d = {};
    for (const [k, v] of fd.entries()) d[k] = typeof v === "string" ? v.trim() : v;
    ["tem_foto", "tem_banner", "tem_url", "tem_recomendacoes", "tem_destaques"].forEach(
      (k) => (d[k] = form.elements[k].checked)
    );
    ["ssi_total", "ssi_pilar_marca", "ssi_pilar_pessoas", "ssi_pilar_insights", "ssi_pilar_relacionamentos"].forEach(
      (k) => {
        const n = parseFloat(String(d[k] || "").replace(",", "."));
        d[k] = Number.isFinite(n) ? n : null;
      }
    );
    d.arquivos = arquivos.map(({ nome, tipo, dados }) => ({ nome, tipo, dados }));
    return d;
  }

  function mostrarErro(msg) {
    formError.textContent = msg;
    formError.hidden = false;
    formError.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.hidden = true;

    const d = coletarDados();

    if (!d.arquivos.length && !d.headline && !d.sobre && !d.experiencias) {
      mostrarErro(
        "Envie os prints ou o PDF do seu perfil na área do Passo 1 — ou, se preferir, abra o Caminho C e cole os textos."
      );
      return;
    }
    const payloadBase64 = d.arquivos.reduce((s, a) => s + a.dados.length, 0);
    if (payloadBase64 > MAX_PAYLOAD_BASE64) {
      mostrarErro(
        "Os arquivos passaram do limite de envio. Remova algum print repetido ou envie só o PDF do LinkedIn (Caminho B)."
      );
      return;
    }
    if (d.ssi_total !== null && (d.ssi_total < 0 || d.ssi_total > 100)) {
      mostrarErro("O SSI total vai de 0 a 100. Confira o número na sua página do SSI.");
      return;
    }
    const pilaresInvalidos = ["ssi_pilar_marca", "ssi_pilar_pessoas", "ssi_pilar_insights", "ssi_pilar_relacionamentos"]
      .some((k) => d[k] !== null && (d[k] < 0 || d[k] > 25));
    if (pilaresInvalidos) {
      mostrarErro("Cada pilar do SSI vai de 0 a 25. Confira os números na sua página do SSI.");
      return;
    }

    submitBtn.disabled = true;
    form.hidden = true;
    resultSection.hidden = true;
    loadingSection.hidden = false;
    loadingSection.scrollIntoView({ behavior: "smooth" });

    let i = 0;
    loadingTimer = setInterval(() => {
      i = (i + 1) % LOADING_MSGS.length;
      loadingMsg.textContent = LOADING_MSGS[i];
    }, 9000);

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d)
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Erro na análise. Tente novamente.");

      ultimoResultado = json;
      renderizar(json);
      loadingSection.hidden = true;
      resultSection.hidden = false;
      resultSection.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      loadingSection.hidden = true;
      form.hidden = false;
      mostrarErro(err.message || "Erro inesperado. Tente novamente.");
    } finally {
      clearInterval(loadingTimer);
      submitBtn.disabled = false;
    }
  });

  /* ============ resultado ============ */

  function copyBox(texto, rotulo) {
    return `
      <div class="copy-box">
        <button type="button" class="copy-btn" data-copy="${esc(texto)}">${rotulo || "Copiar"}</button>
        <div class="copy-box-content">${esc(texto)}</div>
      </div>`;
  }

  function lista(items, cls = "dicas") {
    if (!items || !items.length) return "";
    return `<ul class="${cls}">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  }

  function renderizar(r) {
    const statusLabel = { ok: "OK", ajustar: "Ajustar", criar: "Criar" };

    resultContainer.innerHTML = `
      <div class="score-panel">
        <div>
          <p class="score-label">${r.diagnostico.origem_nota === "oficial" ? "SSI oficial" : "SSI estimado"}</p>
          <p class="score-num">${esc(r.diagnostico.nota_geral)}<span style="font-size:0.4em">/100</span></p>
          ${
            r.diagnostico.origem_nota === "oficial"
              ? ""
              : `<p class="score-note">Confira seu número real em <a href="https://www.linkedin.com/sales/ssi" target="_blank" rel="noopener">linkedin.com/sales/ssi</a> e refaça a análise com ele.</p>`
          }
        </div>
        <p class="score-resumo">${esc(r.diagnostico.resumo)}</p>
      </div>

      <div class="pilares">
        ${r.diagnostico.pilares
          .map(
            (p) => `
          <div class="pilar-card">
            <h4>${esc(p.pilar)}</h4>
            <span class="pilar-nota">${esc(p.nota)}/25</span>
            <div class="pilar-bar"><span style="width:${Math.min(100, (p.nota / 25) * 100)}%"></span></div>
            <p>${esc(p.analise)}</p>
            ${lista(p.acoes)}
          </div>`
          )
          .join("")}
      </div>

      <div class="result-block">
        <h3>Headline</h3>
        <p class="analise">${esc(r.headline.analise)}</p>
        ${r.headline.opcoes.map((o, i) => copyBox(o, `Copiar opção ${i + 1}`)).join("")}
      </div>

      <div class="result-block">
        <h3>Sobre</h3>
        <p class="analise">${esc(r.sobre.analise)}</p>
        ${copyBox(r.sobre.texto_sugerido, "Copiar Sobre")}
        ${lista(r.sobre.dicas)}
      </div>

      <div class="result-block">
        <h3>Experiências</h3>
        <p class="analise">${esc(r.experiencia.analise)}</p>
        ${copyBox(r.experiencia.exemplo_reescrito, "Copiar exemplo")}
        ${lista(r.experiencia.dicas)}
      </div>

      <div class="result-block">
        <h3>Competências</h3>
        <p class="analise">${esc(r.competencias.analise)}</p>
        <p><strong>Fixe estas 3 no topo:</strong></p>
        <div class="tags">${r.competencias.top3.map((t) => `<span class="tag destaque">${esc(t)}</span>`).join("")}</div>
        <p><strong>Lista completa sugerida:</strong></p>
        <div class="tags">${r.competencias.lista_sugerida.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      </div>

      <div class="result-block">
        <h3>Checklist de configuração</h3>
        <table class="check-table">
          <thead><tr><th>Item</th><th>Status</th><th>O que fazer</th></tr></thead>
          <tbody>
            ${r.checklist_configuracao
              .map(
                (c) => `
              <tr>
                <td><strong>${esc(c.item)}</strong></td>
                <td><span class="status-pill status-${esc(c.status)}">${statusLabel[c.status] || esc(c.status)}</span></td>
                <td>${esc(c.recomendacao)}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="result-block">
        <h3>Estratégia de conexões</h3>
        <p class="analise">${esc(r.conexoes.estrategia)}</p>
        <p><strong>Perfis para conectar:</strong></p>
        ${lista(r.conexoes.perfis_alvo)}
        <p style="margin-top:16px"><strong>Mensagem de convite modelo:</strong></p>
        ${copyBox(r.conexoes.mensagem_modelo, "Copiar mensagem")}
        <p><strong>Meta semanal:</strong> ${esc(r.conexoes.meta_semanal)}</p>
      </div>

      <div class="result-block">
        <h3>Plano de publicações</h3>
        <p class="analise">${esc(r.publicacoes.estrategia)}</p>
        <p><strong>Seus temas de autoridade:</strong></p>
        <div class="tags">${r.publicacoes.temas.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="plano-grid" style="margin-top:16px">
          ${r.publicacoes.plano
            .map(
              (p) => `
            <div class="plano-card">
              <p class="quando">${esc(p.quando)}</p>
              <p class="formato">${esc(p.formato)} · ${esc(p.tema)}</p>
              <p class="gancho">"${esc(p.gancho)}"</p>
            </div>`
            )
            .join("")}
        </div>
        <p style="margin-top:20px"><strong>Para subir o engajamento:</strong></p>
        ${lista(r.publicacoes.dicas_engajamento)}
      </div>
    `;

    resultContainer.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(btn.dataset.copy);
        const original = btn.textContent;
        btn.textContent = "Copiado";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove("copied");
        }, 2000);
      });
    });
  }

  document.getElementById("nova-analise").addEventListener("click", () => {
    resultSection.hidden = true;
    form.hidden = false;
    formSection.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("baixar-md").addEventListener("click", () => {
    if (!ultimoResultado) return;
    const r = ultimoResultado;
    const md = [
      `# Diagnóstico LinkedIn Maestria — áurea educação`,
      ``,
      `## SSI ${r.diagnostico.origem_nota === "oficial" ? "oficial" : "estimado"}: ${r.diagnostico.nota_geral}/100`,
      r.diagnostico.resumo,
      ``,
      `## Pilares do SSI`,
      ...r.diagnostico.pilares.flatMap((p) => [
        `### ${p.pilar} — ${p.nota}/25`,
        p.analise,
        ...p.acoes.map((a) => `- ${a}`),
        ``
      ]),
      `## Headline (3 opções)`,
      r.headline.analise,
      ...r.headline.opcoes.map((o, i) => `\n**Opção ${i + 1}:** ${o}`),
      ``,
      `## Sobre`,
      r.sobre.analise,
      "```",
      r.sobre.texto_sugerido,
      "```",
      ...r.sobre.dicas.map((d) => `- ${d}`),
      ``,
      `## Experiências`,
      r.experiencia.analise,
      "```",
      r.experiencia.exemplo_reescrito,
      "```",
      ...r.experiencia.dicas.map((d) => `- ${d}`),
      ``,
      `## Competências`,
      r.competencias.analise,
      `**Top 3 (fixar):** ${r.competencias.top3.join(" · ")}`,
      `**Lista completa:** ${r.competencias.lista_sugerida.join(", ")}`,
      ``,
      `## Checklist de configuração`,
      ...r.checklist_configuracao.map((c) => `- [${c.status === "ok" ? "x" : " "}] **${c.item}** (${c.status}): ${c.recomendacao}`),
      ``,
      `## Estratégia de conexões`,
      r.conexoes.estrategia,
      ...r.conexoes.perfis_alvo.map((p) => `- ${p}`),
      `**Mensagem modelo:** ${r.conexoes.mensagem_modelo}`,
      `**Meta semanal:** ${r.conexoes.meta_semanal}`,
      ``,
      `## Plano de publicações`,
      r.publicacoes.estrategia,
      `**Temas:** ${r.publicacoes.temas.join(" · ")}`,
      ...r.publicacoes.plano.map((p) => `- **${p.quando}** — ${p.formato} · ${p.tema}\n  Gancho: "${p.gancho}"`),
      ``,
      `**Engajamento:**`,
      ...r.publicacoes.dicas_engajamento.map((d) => `- ${d}`)
    ].join("\n");

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "diagnostico-linkedin-maestria.md";
    a.click();
    URL.revokeObjectURL(a.href);
  });
})();
