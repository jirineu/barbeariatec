const app = {
    dados: {
        caixa: 0.0, // Garantido como ponto flutuante para somas financeiras
        agenda: [], 
        historico: [], 
        prestadores: [], 
        estoque: [], 
        servicos: [],
        logsAcertos: [], 
        config: {
            diasTrabalho: {
                0: { ativo: false, inicio: "08:00", fim: "18:00", almocoInicio: "12:00", almocoFim: "13:00" }, // Domingo
                1: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" }, // Segunda
                2: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" }, // Terça
                3: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" }, // Quarta
                4: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" }, // Quinta
                5: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" }, // Sexta
                6: { ativo: true,  inicio: "08:00", fim: "18:00", almocoInicio: "12:00", almocoFim: "13:00" }  // Sábado
            },
            intervalo: 30 // Garantido como Integer para cálculos de horários
        }
    },
// Renderiza a lista de dias na tela de configurações
// --- SEQUÊNCIA: FUNÇÃO DE RENDERIZAÇÃO DE CONFIGURAÇÕES ---
renderizarConfigHorarios() {
    const container = document.getElementById('config-horarios-lista');
    if (!container) return;

    const diasNomes = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    container.innerHTML = '';

    // FUNÇÃO INTERNA PARA LIMPAR A HORA: Garante o formato HH:MM
    const limparHora = (valor) => {
        if (!valor) return "";
        
        let str = valor.toString();

        // Verifica se é o formato ISO (contém o caractere 'T')
        // Exemplo: 2026/04/10T03:00:00.000Z
        if (str.includes('T')) {
            // Pega a parte após o 'T' e extrai apenas HH:MM (os 5 primeiros caracteres dessa parte)
            return str.split('T')[1].substring(0, 5);
        }

        // Se vier como objeto de Data do JS tradicional
        if (valor instanceof Date) {
            return valor.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }

        // Se já for uma string simples (ex: "08:00:00"), garante apenas o HH:MM
        return str.substring(0, 5);
    };

    diasNomes.forEach((nome, i) => {
        const dadosDia = (this.dados.config && this.dados.config.diasTrabalho) ? this.dados.config.diasTrabalho[i] : null;
        
        const d = dadosDia || { ativo: false, inicio: "08:00", fim: "18:00", almocoInicio: "12:00", almocoFim: "13:00" };

        const estaAtivo = String(d.ativo).toLowerCase() === "true" || d.ativo === true || d.ativo === 1;

        container.innerHTML += `
            <div class="card" style="padding: 15px; border-left: 4px solid ${estaAtivo ? 'var(--accent)' : '#444'}; background: #1e1e1e; margin-bottom: 10px; border-radius: 8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
                    <label style="font-weight:bold; color: ${estaAtivo ? '#fff' : '#888'}">${nome}</label>
                    <input type="checkbox" id="dia-${i}-ativo" ${estaAtivo ? 'checked' : ''} onchange="app.toggleDiaConfig(${i})">
                </div>
                
                <div id="inputs-dia-${i}" style="display: ${estaAtivo ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.8rem; color: #ccc;">
                    <div class="input-field">
                        <label>Abertura</label>
                        <input type="time" id="dia-${i}-inicio" value="${limparHora(d.inicio) || '08:00'}" class="input-dark">
                    </div>
                    <div class="input-field">
                        <label>Fechamento</label>
                        <input type="time" id="dia-${i}-fim" value="${limparHora(d.fim) || '18:00'}" class="input-dark">
                    </div>
                    <div class="input-field">
                        <label>Almoço (Início)</label>
                        <input type="time" id="dia-${i}-almoco-ini" value="${limparHora(d.almocoInicio) || '12:00'}" class="input-dark">
                    </div>
                    <div class="input-field">
                        <label>Almoço (Fim)</label>
                        <input type="time" id="dia-${i}-almoco-fim" value="${limparHora(d.almocoFim) || '13:00'}" class="input-dark">
                    </div>
                </div>
            </div>
        `;
    });
},

// --- SEQUÊNCIA: FUNÇÃO TOGGLE DIA CONFIG ---
toggleDiaConfig(dia) {
    const div = document.getElementById(`inputs-dia-${dia}`);
    const checkbox = document.getElementById(`dia-${dia}-ativo`);
    
    if (div && checkbox) {
        const estaAtivo = checkbox.checked;

        // 1. INTERFACE: Mostra ou esconde os inputs de horário
        div.style.display = estaAtivo ? 'grid' : 'none';
        
        // 2. ESTILO: Busca o card para feedback visual
        const card = checkbox.closest('.card');
        if (card) {
            card.style.borderLeftColor = estaAtivo ? 'var(--accent)' : '#444';
            
            const label = card.querySelector('label');
            if (label) label.style.color = estaAtivo ? '#fff' : '#888';
        }

        // 3. ESTADO LOCAL: Atualiza imediatamente o objeto na memória.
        // Isso garante que, se o usuário salvar, o valor já esteja como Boolean puro.
        if (this.dados.config && this.dados.config.diasTrabalho[dia]) {
            this.dados.config.diasTrabalho[dia].ativo = estaAtivo;
        }
    }
},

// --- SEQUÊNCIA: FUNÇÃO SALVAR CONFIGURAÇÕES DE HORÁRIO ---
salvarConfiguracoesHorario() {
    // 1. GARANTIA DE ESTRUTURA: Previne erros de objeto indefinido
    if (!this.dados.config) this.dados.config = { diasTrabalho: {}, intervalo: 30 };
    if (!this.dados.config.diasTrabalho) this.dados.config.diasTrabalho = {};

    // 2. COLETA E HIGIENIZAÇÃO: Percorre os 7 dias da semana
    for (let i = 0; i < 7; i++) {
        const elAtivo = document.getElementById(`dia-${i}-ativo`);
        const elInicio = document.getElementById(`dia-${i}-inicio`);
        const elFim = document.getElementById(`dia-${i}-fim`);
        const elAlmocoIni = document.getElementById(`dia-${i}-almoco-ini`);
        const elAlmocoFim = document.getElementById(`dia-${i}-almoco-fim`);

        // Segurança: Só processa se os elementos básicos existirem no DOM
        if (elAtivo && elInicio && elFim) {
            this.dados.config.diasTrabalho[i] = {
                // Força o valor para Boolean puro (compatível com checkbox da planilha)
                ativo: Boolean(elAtivo.checked), 
                // Garante que são strings de horário válidas
                inicio: elInicio.value || "08:00",
                fim: elFim.value || "18:00",
                almocoInicio: elAlmocoIni ? elAlmocoIni.value : "12:00",
                almocoFim: elAlmocoFim ? elAlmocoFim.value : "13:00"
            };
        }
    }

    // 3. PERSISTÊNCIA E SINCRONIZAÇÃO:
    // Aqui chamamos o método que salva localmente e envia para o Google Sheets
    this.persistir(); 
    
    // Feedback ao usuário
    alert("✅ Horários de funcionamento atualizados!");
    
    // Retorna para a tela principal
    this.renderView('dash');
},
    
mostrarFeedbackSincronizacao() {
        // Cria um elementozinho de "Sincronizado" no canto da tela
        let toast = document.getElementById('sync-toast');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'sync-toast';
            document.body.appendChild(toast);
        }

        toast.innerText = "☁️ Sincronizado";
        toast.classList.add('show');

        // Some após 2 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    },
// --- SEQUÊNCIA: FUNÇÃO PERSISTIR (SINCRONIZAÇÃO) ---
persistir() {
    // 1. BACKUP LOCAL (Offline First)
    // Usamos um try/catch aqui porque se o banco crescer muito, o localStorage pode lotar
    try {
        localStorage.setItem('barber_local_db', JSON.stringify(this.dados));
    } catch (e) {
        console.warn("⚠️ LocalStorage cheio, salvando apenas na nuvem.");
    }

    // 2. DEBOUNCE: Evita múltiplas chamadas ao servidor enquanto você digita ou edita vários itens
    if (this.timerSalvar) clearTimeout(this.timerSalvar);

    // 3. AGENDAMENTO DO ENVIO (Aumentei para 1.5s para ser mais seguro em conexões 4G)
    this.timerSalvar = setTimeout(async () => {
        
        // Validação de URL: Garante que o app não tente salvar sem destino
        const URL_SCRIPT = githubDB.scriptURL; 
        if (!URL_SCRIPT) return console.error("❌ URL do Script não configurada!");

        console.log("☁️ Sincronizando com a Planilha...");

        // Prepara o pacote com as credenciais atuais
        const pacote = {
            usuario: this.dados.usuario || githubDB.creds?.userEmail,
            dados: this.dados
        };

        try {
            await fetch(URL_SCRIPT, {
                method: 'POST',
                mode: 'no-cors', // O Google Apps Script exige no-cors para domínios diferentes
                headers: {
                    'Content-Type': 'text/plain', // No-cors funciona melhor com text/plain no GAS
                },
                body: JSON.stringify(pacote)
            });

            console.log("✅ Dados enviados com sucesso!");

            // Opcional: Feedback visual na UI (um pequeno ícone de check que some depois)
            this.mostrarFeedbackSincronizacao();

        } catch (error) {
            console.error("❌ Falha na conexão com Google Sheets:", error);
        }
    }, 1500); 
},
// --- SEQUÊNCIA: FUNÇÃO RENDER VIEW (NAVEGAÇÃO) ---
renderView(view, btn) {
    // 1. TRATAMENTO ESPECIAL: Agendamento
    if (view === 'add-agenda') {
        this.prepararNovoAgendamento();
        return;
    }

    // 2. LIMPEZA VISUAL: Esconde todas as seções
    const sections = document.querySelectorAll('.view-section');
    if (sections) {
        sections.forEach(s => s.style.display = 'none');
    }
    
    // 3. DIRECIONAMENTO: Define qual ID de seção abrir
    const targetView = (view === 'externo') ? 'add-agenda' : view;
    const viewEl = document.getElementById(`view-${targetView}`);
    
    if (viewEl) {
        viewEl.style.display = 'block';
        window.scrollTo(0, 0);
    } else {
        console.error(`Erro: A seção "view-${targetView}" não foi encontrada.`);
    }

    // 4. BARRA DE NAVEGAÇÃO (TAB BAR): Controle de visibilidade
    const tabBar = document.querySelector('.tab-bar');
    if (tabBar) {
        // Telas auxiliares ou de login escondem o menu inferior para focar na ação
        const telasSemBarra = ['externo', 'historico', 'config', 'auth', 'login'];
        const esconderAbas = telasSemBarra.includes(view);
        tabBar.style.display = esconderAbas ? 'none' : 'flex';
    }
    
    // 5. ESTILO DOS BOTÕES: Marca o botão clicado como ativo
    if (btn) {
        const tabs = document.querySelectorAll('.tab-item');
        if (tabs) {
            tabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    }
    
    // 6. GATILHOS DE RENDERIZAÇÃO:
    // Se for para a tela de configurações, reconstrói a lista de horários
    if (view === 'config') {
        this.renderizarConfigHorarios();
    }

    // 7. SINCRONIZAÇÃO DE DADOS:
    // Crucial para garantir que a lista de serviços/estoque/agenda 
    // que veio do Google Apps Script seja desenhada na tela correta.
    this.atualizarDadosTela(targetView);
},

    // --- SEQUÊNCIA: FUNÇÃO ATUALIZAR DADOS DA TELA ---
atualizarDadosTela(view) {
    // 1. DASHBOARD: Garante que os cálculos financeiros (Caixa, Bruto, Líquido) 
    // sejam reprocessados com os números vindos da planilha.
    if (view === 'dash') {
        // Se você tiver a função renderDash, ela deve vir primeiro para desenhar a estrutura
        if (typeof this.renderDash === 'function') this.renderDash();
        this.atualizarDashPorPeriodo('mes'); 
    }

    // 2. AGENDA: Limpa filtros e reconstrói a lista de compromissos.
    // Importante: No Script, a agenda vem como Array, aqui garantimos a exibição.
    if (view === 'agenda') {
        this.filtrarLista('agenda', '');
    }

    // 3. HISTÓRICO: Processa a aba "_Hist" para exibir os fechamentos realizados.
    if (view === 'historico') {
        this.filtrarHistorico();
    }
    
    // 4. SERVIÇOS E ESTOQUE:
    // Como otimizamos a 'lerAbaParaArray' no Script, esses dados chegam como
    // objetos limpos. O filtrarLista com string vazia força o redesenho total.
    if (view === 'servicos') {
        this.filtrarLista('servicos', '');
    }

    if (view === 'estoque') {
        this.filtrarLista('estoque', '');
    }
    
    // 5. EQUIPE: Reconstrói a lista de barbeiros/prestadores.
    if (view === 'prestadores') {
        this.renderListaPrestadores();
    }
},

// --- SEQUÊNCIA: FUNÇÃO ATUALIZAR DASH POR PERÍODO ---
atualizarDashPorPeriodo(periodo) {
    // 1. GARANTIA DE DADOS: Evita erro se a aba de histórico estiver vazia
    if (!this.dados.historico) this.dados.historico = [];

    const agora = new Date();
    const hojePtBr = agora.toLocaleDateString('pt-BR'); 
    
    let inicio = new Date();
    inicio.setHours(0, 0, 0, 0);

    // 2. DEFINIÇÃO DO RANGE DE TEMPO
    if (periodo === 'semana') {
        inicio.setDate(agora.getDate() - 7);
    } else if (periodo === 'mes') {
        inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
    } else if (periodo === 'ano') {
        inicio = new Date(agora.getFullYear(), 0, 1);
    } else if (periodo === 'tudo') {
        inicio = new Date(0); 
    }

    // 3. FILTRAGEM SEGURA: Converte strings da planilha em datas comparáveis
    const filtrados = this.dados.historico.filter(h => {
        const dataHString = h.dataConclusao || h.data; 
        if (!dataHString) return false;

        if (periodo === 'dia') return dataHString === hojePtBr;
        if (periodo === 'tudo') return true;

        const partes = dataHString.split('/');
        if (partes.length !== 3) return false;
        
        // Criamos a data ao meio-dia para evitar erros de fuso horário (timezone)
        const dataH = new Date(partes[2], partes[1] - 1, partes[0], 12, 0, 0);
        return dataH >= inicio;
    });

    // 4. PROCESSAMENTO FINANCEIRO: Soma valores por método de pagamento
    const resumoPg = { pix: 0, dinheiro: 0, credito: 0, debito: 0 };
    
    filtrados.forEach(item => {
        // Filtra para somar apenas serviços reais, ignorando entradas de ajuste
        const ehServico = item.servico && item.servico.trim() !== "" && 
                          item.cliente !== "AJUSTE MANUAL" && 
                          item.cliente !== "PAGAMENTO REALIZADO";

        if (ehServico && item.pagamento) {
            const metodo = item.pagamento.toLowerCase().trim();
            // Verifica se o método existe no nosso objeto de resumo
            if (resumoPg.hasOwnProperty(metodo)) {
                // Força conversão para Number para evitar concatenação de strings
                resumoPg[metodo] += Number(item.valorBruto || item.valor || 0);
            }
        }
    });

    // 5. ATUALIZAÇÃO DA INTERFACE (MÉTODOS)
    const atualizarElemento = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.innerText = `R$ ${valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    };

    atualizarElemento('resumo-pix', resumoPg.pix);
    atualizarElemento('resumo-dinheiro', resumoPg.dinheiro);
    atualizarElemento('resumo-credito', resumoPg.credito);
    atualizarElemento('resumo-debito', resumoPg.debito);

    // 6. CÁLCULO DE TOTAIS
    // Usamos Number() em vez de parseFloat() para maior rigor com os dados do Script
    const bruto = filtrados.reduce((acc, curr) => acc + Number(curr.valorBruto || curr.valor || 0), 0);
    const liquido = filtrados.reduce((acc, curr) => acc + Number(curr.valorLiquido || 0), 0);

    this.atualizarInterfaceDash(periodo, bruto, liquido, filtrados);
},

// --- SEQUÊNCIA: FUNÇÃO TOGGLE RESUMO PAGAMENTO ---
toggleResumoPagamento() {
    const painel = document.getElementById('dash-pagamentos-resumo');
    const seta = document.getElementById('seta-resumo');
    
    // Verificação de segurança: Só executa se os elementos existirem
    if (!painel || !seta) return;

    // Normaliza a verificação do display
    const estaEscondido = painel.style.display === 'none' || painel.style.display === '';

    if (estaEscondido) {
        painel.style.display = 'block';
        seta.innerText = '▲';
        // Opcional: Adicionar uma classe para animação suave se você tiver no CSS
        painel.classList.add('fade-in'); 
    } else {
        painel.style.display = 'none';
        seta.innerText = '▼';
    }
},
// --- SEQUÊNCIA: FUNÇÃO ATUALIZAR INTERFACE DASH ---
atualizarInterfaceDash(texto, bruto, liquido, listaFiltrada) {
    const elBruto = document.getElementById('dash-bruto');
    const elLiquido = document.getElementById('dash-liquido');
    const elTxt = document.getElementById('dash-periodo-txt');
    const elTotalCortes = document.getElementById('dash-cortes-total');
    const elMelhorPres = document.getElementById('dash-barbeiro-top');
    const elClientePeriodo = document.getElementById('dash-cliente-top');
    const elClienteGeral = document.getElementById('dash-cliente-permanente');

    // 1. FORMATAÇÃO FINANCEIRA: Garante a exibição em Real (PT-BR)
    if (elBruto) elBruto.innerText = `R$ ${Number(bruto).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    if (elLiquido) elLiquido.innerText = `R$ ${Number(liquido).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    if (elTxt) elTxt.innerText = `Período: ${texto}`;

    // 2. CONTADORES DO PERÍODO SELECIONADO
    const contagemPeriodo = { prestadores: {}, clientes: {} };
    let totalCortesReais = 0;

    listaFiltrada.forEach(item => {
        const cliente = (item.cliente || "").trim();
        const profissional = (item.prestador || item.barbeiro || "").trim();
        const valor = Number(item.valorBruto || item.valor || 0);

        // Considera apenas serviços reais (ignora ajustes/pagamentos de comissão)
        const ehValido = valor > 0 && 
                        !cliente.toUpperCase().includes("AJUSTE") && 
                        !cliente.toUpperCase().includes("PAGAMENTO REALIZADO");

        if (ehValido) {
            totalCortesReais++;
            if (profissional) {
                contagemPeriodo.prestadores[profissional] = (contagemPeriodo.prestadores[profissional] || 0) + 1;
            }
            if (cliente) {
                contagemPeriodo.clientes[cliente] = (contagemPeriodo.clientes[cliente] || 0) + 1;
            }
        }
    });

    if (elTotalCortes) elTotalCortes.innerText = totalCortesReais;

    // 3. RANKING PERMANENTE (Varre TODO o histórico vindo do App Script)
    const contagemGeral = {};
    if (this.dados.historico) {
        this.dados.historico.forEach(item => {
            const cli = (item.cliente || "").trim();
            const serv = (item.servico || "").trim();
            
            const ehServicoValido = serv !== "" && 
                                    !cli.toUpperCase().includes("AJUSTE") && 
                                    !cli.toUpperCase().includes("PAGAMENTO REALIZADO");

            if (cli && ehServicoValido) {
                contagemGeral[cli] = (contagemGeral[cli] || 0) + 1;
            }
        });
    }
    // --- CONTINUAÇÃO: FUNÇÃO ATUALIZAR INTERFACE DASH (RANKINGS E BOTÕES) ---
    const getMelhor = (obj) => {
        const entries = Object.entries(obj);
        // Retorna o nome com maior contagem ou "-" se vazio
        return entries.length ? entries.sort((a, b) => b[1] - a[1])[0][0] : "-";
    };

    // 4. ATUALIZAÇÃO DOS CAMPOS DE TEXTO
    if (elTotalCortes) elTotalCortes.innerText = totalCortesReais;
    
    // Melhores do Período (Dinamismo baseado no filtro selecionado)
    if (elMelhorPres) elMelhorPres.innerText = getMelhor(contagemPeriodo.prestadores);
    if (elClientePeriodo) elClientePeriodo.innerText = getMelhor(contagemPeriodo.clientes);

    // Melhor de Todos os Tempos (Histórico completo da planilha)
    if (elClienteGeral) elClienteGeral.innerText = getMelhor(contagemGeral);

    // 5. ESTILO DOS BOTÕES DE FILTRO (Feedback visual de "Ativo")
    document.querySelectorAll('#view-dash .btn-small').forEach(btn => {
        const tBtn = btn.innerText.toLowerCase();
        // Normaliza "Dia" para "Hoje" para bater com o texto do filtro
        const termoBusca = (texto.toLowerCase() === 'hoje' || texto.toLowerCase() === 'dia') ? 'dia' : texto.toLowerCase();
        const active = (tBtn === termoBusca);
        
        btn.style.background = active ? 'var(--accent)' : '#333';
        btn.style.color = active ? '#000' : '#fff';
        btn.style.fontWeight = active ? 'bold' : 'normal';
    });
},

// --- SEQUÊNCIA: GESTÃO DE HISTÓRICO E FATURAMENTO ---
setFiltroRapido(modo) {
    const inputData = document.getElementById('filtro-data-hist');
    const inputMes = document.getElementById('filtro-mes-hist');
    
    if (!inputData || !inputMes) return;

    // Limpa os campos antes de aplicar o novo filtro
    inputData.value = "";
    inputMes.value = "";

    const hoje = new Date();

    if (modo === 'hoje') {
        // Formato YYYY-MM-DD para o input type="date"
        inputData.value = hoje.toISOString().split('T')[0];
    } else if (modo === 'mes') {
        // Formato YYYY-MM para o input type="month"
        inputMes.value = hoje.toISOString().slice(0, 7);
    }
    
    // Dispara a filtragem que vai ler os dados sincronizados do App Script
    this.filtrarHistorico();
},

// --- SEQUÊNCIA: FUNÇÃO FILTRAR HISTÓRICO ---
filtrarHistorico() {
    const dataFiltro = document.getElementById('filtro-data-hist').value;
    const mesFiltro = document.getElementById('filtro-mes-hist').value;
    const prestadorFiltro = document.getElementById('filtro-prestador-hist')?.value || "";
    const container = document.getElementById('lista-historico-content');

    if (!container) return;

    let filtrados = [...(this.dados.historico || [])];

    // 1. FILTRAGEM
    if (dataFiltro) {
        const dataBusca = dataFiltro.includes('-') ? dataFiltro.split('-').reverse().join('/') : dataFiltro;
        filtrados = filtrados.filter(h => (h.dataConclusao === dataBusca || h.data === dataBusca || h.data === dataFiltro));
    } else if (mesFiltro) {
        filtrados = filtrados.filter(h => {
            const dataItem = h.dataConclusao || h.data || "";
            return dataItem.includes(mesFiltro) || (dataItem.split('/')[1] === mesFiltro.split('-')[1] && dataItem.split('/')[2] === mesFiltro.split('-')[0]);
        });
    }

    if (prestadorFiltro) {
        filtrados = filtrados.filter(h => (h.prestador || h.barbeiro) === prestadorFiltro);
    }

    // 2. CÁLCULOS
    const faturamentoBruto = filtrados.reduce((acc, curr) => {
        const v = Number(curr.valorBruto || curr.valor || 0); 
        return acc + (v > 0 ? v : 0);
    }, 0);

    const lucroLiquido = filtrados.reduce((acc, curr) => {
        const l = Number(curr.valorLiquido || curr.lucroCasa || 0);
        return acc + l;
    }, 0);

    // 3. CABEÇALHO DE RESUMO
    const resumoHtml = `
        <div style="background:var(--card); padding:15px; border-radius:12px; margin-bottom:15px; border:1px solid #333;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px">
                <span style="color:#888; font-size:12px">Faturamento Bruto:</span>
                <strong style="color:var(--text); font-size:14px">R$ ${faturamentoBruto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-top:1px solid #333; padding-top:8px">
                <span style="color:#888; font-size:12px">Lucro Líquido (Caixa):</span>
                <strong style="color:var(--success); font-size:16px">R$ ${lucroLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
        </div>
    `;

    // 4. MAPEAMENTO DA LISTA
    const listaHtml = filtrados.slice().reverse().map(h => {
        const vBruto = Number(h.valorBruto || 0);
        const vLiquido = Number(h.valorLiquido || 0);
        const vComissao = Number(h.valorComissao || 0);
        const dataExibicao = (h.dataConclusao || h.data || '---').replace(/-/g, '/');

        // NOVA LÓGICA DE IDENTIFICAÇÃO DE AJUSTE
        const isAjuste = (h.pagamento === "ajuste" || h.cliente === "SISTEMA" || h.cliente === "AJUSTE MANUAL");
        const isPagamento = h.cliente === "PAGAMENTO REALIZADO";
        const isServico = !isAjuste && !isPagamento;

        // DEFINIÇÃO DE CORES E LABELS
        let labelTipo = isServico ? "✅ SERVIÇO" : (isAjuste ? "🛠️ ajuste" : "💰 PAGAMENTO");
        let corTema = isServico ? "var(--success)" : (isAjuste ? "#e67e22" : "#888"); // Laranja para ajuste
        let valorPrincipal = isServico ? vLiquido : vComissao;
        
        // Se for ajuste, mostramos o valor líquido (que é o que saiu do caixa)
        if (isAjuste) valorPrincipal = vLiquido;

        const coresPg = { pix: '#00ced1', dinheiro: '#2ecc71', credito: '#e67e22', debito: '#9b59b6', ajuste: '#e67e22' };
        const metodo = (h.pagamento || "").toLowerCase().trim();
        const corBadge = coresPg[metodo] || '#444';
        const badgeHtml = h.pagamento ? `<span style="background:${corBadge}; color:white; font-size:8px; padding:2px 5px; border-radius:4px; margin-left:5px; text-transform:uppercase; font-weight:bold;">${h.pagamento}</span>` : '';

        return `
            <div class="item-list" style="border-left: 4px solid ${corTema}; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; background: ${isAjuste ? '#2a1b10' : '#1a1a1a'}; padding: 12px; border-radius: 8px;">
                <div>
                    <strong style="color:${corTema}; font-size:13px; text-transform: uppercase;">${labelTipo}</strong>
                    ${badgeHtml}
                    <span style="color:${isAjuste ? '#fff' : '#666'}; font-size:11px; margin-left:5px">${h.servico || ''}</span><br>
                    <small style="color:#aaa">Prof: <b>${h.prestador || h.barbeiro || '---'}</b></small><br>
                    <small style="color:#555; font-size:10px">${dataExibicao} - ${h.hora || ''} | Cliente: ${h.cliente}</small>
                </div>
                <div style="text-align:right">
                    <span style="color:${isAjuste ? '#ef4444' : (isServico ? 'var(--success)' : 'white')}; font-weight:bold; font-size:14px">
                        R$ ${valorPrincipal.toFixed(2)}
                    </span><br>
                    <small style="color:#444; font-size:10px">
                        ${isServico ? `Total: R$ ${vBruto.toFixed(2)}` : 'Ajuste de Saldo'}
                    </small>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = resumoHtml + (listaHtml || '<p style="text-align:center; padding:20px; color:#666">Nenhum registro encontrado.</p>');
},

// Retorna apenas horários válidos e livres
// --- SEQUÊNCIA: FUNÇÃO OBTER HORÁRIOS DISPONÍVEIS ---
obterHorariosDisponiveis(dataSelecionada, profissionalNome) {
    // 1. TRATAMENTO DE DATA: Garante que a data seja lida corretamente sem erro de fuso
    const dataObj = new Date(dataSelecionada + 'T12:00:00'); // Meio-dia evita pular de dia
    const diaSemana = dataObj.getDay();
    
    // Busca a configuração no estado que sincronizamos do Script
    const conf = this.dados.config && this.dados.config.diasTrabalho ? this.dados.config.diasTrabalho[diaSemana] : null;

    // 2. VALIDAÇÃO DE ATIVIDADE: Se o dia está fechado na planilha, não gera horários
    // Curamos o booleano aqui também para segurança
    const diaAtivo = conf && (String(conf.ativo).toLowerCase() === "true" || conf.ativo === true);
    if (!diaAtivo) return [];

    const horariosLivres = [];
    
    // Normalizamos as horas para comparação de data fictícia
    let atual = new Date(`2000-01-01T${conf.inicio}:00`);
    const fim = new Date(`2000-01-01T${conf.fim}:00`);
    const almocoIni = new Date(`2000-01-01T${conf.almocoInicio}:00`);
    const almocoFim = new Date(`2000-01-01T${conf.almocoFim}:00`);
    const intervalo = parseInt(this.dados.config.intervalo) || 30;

    // 3. GERADOR DE SLOTS (BASEADO NA PLANILHA)
    while (atual < fim) {
        const horaTexto = atual.toTimeString().substring(0, 5);
        
        // Verifica se o slot cai dentro do intervalo de almoço configurado
        const isAlmoco = (atual >= almocoIni && atual < almocoFim);
        
        if (!isAlmoco) {
            // 4. CHECAGEM DE CONCORRÊNCIA NA AGENDA SINCRONIZADA
            // Comparamos data e hora exatamente como o Apps Script salva nas colunas
            const ocupado = this.dados.agenda.some(ag => {
                const dataAg = ag.data || "";
                const horaAg = ag.hora || "";
                const profAg = (ag.profissional || ag.prestador || "").trim().toLowerCase();
                const profBusca = (profissionalNome || "").trim().toLowerCase();

                return dataAg === dataSelecionada && 
                       horaAg === horaTexto && 
                       profAg === profBusca;
            });

            if (!ocupado) {
                horariosLivres.push(horaTexto);
            }
        }
        
        // Próximo slot conforme o intervalo da configuração
        atual.setMinutes(atual.getMinutes() + intervalo);
    }
    
    return horariosLivres;
},

// --- SEQUÊNCIA: FUNÇÃO PREPARAR NOVO AGENDAMENTO ---
prepararNovoAgendamento() {
    // 1. MAPEAMENTO DE DADOS (Vindos da Planilha)
    // Usamos Number() para garantir que os valores financeiros estejam limpos
    const optPrestadores = (this.dados.prestadores || []).map(p => 
        `<option value="${p.nome}">${p.nome}</option>`
    ).join('');

    const optServicos = (this.dados.servicos || []).map(s => {
        const valor = Number(s.valor || 0);
        return `<option value="${s.nome}" data-preco="${valor}">${s.nome} - R$ ${valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</option>`;
    }).join('');
    
    const optProdutos = (this.dados.estoque || []).map(p => {
        // Normaliza as diversas nomenclaturas de preço que podem vir da planilha
        const precoItem = Number(p.precoVenda || p.preco || p.valor || 0);
        const qtd = p.quantidade || p.qtd || 0;
        return `<option value="${p.nome}" data-preco="${precoItem}">${p.nome} - R$ ${precoItem.toFixed(2)} (${qtd} un)</option>`;
    }).join('');

    const hoje = new Date().toISOString().split('T')[0];
    
    // 2. DETECÇÃO DE CONTEXTO (Interno vs Cliente Externo)
    const params = new URLSearchParams(window.location.search);
    const ehExterno = params.has('agendar');

    const html = `
        <div class="${ehExterno ? 'agendar-mode-form' : ''}">
            <div class="input-group">
                <label style="font-size:12px; color:#888;">Nome do Cliente:</label>
                <input type="text" id="ag-nome" placeholder="Ex: João Silva" class="input-dark">
            </div>
            
            <label style="font-size:12px; color:#888; display:block; margin-top:10px">Data do Atendimento:</label>
            <input type="date" id="ag-data" value="${hoje}" onchange="app.atualizarHorariosDisponiveis()" class="input-dark">
            
            <label style="font-size:12px; color:#888; display:block; margin-top:10px">Barbeiro / Profissional:</label>
            <select id="ag-prestador-select" onchange="app.atualizarHorariosDisponiveis()" class="input-dark">
                <option value="">Selecione...</option>
                ${optPrestadores}
            </select>
            
            <label style="font-size:12px; color:#888; display:block; margin-top:10px">Serviço Principal:</label>
            <select id="ag-servico-select" onchange="app.atualizarTotalAgendamento()" class="input-dark">
                <option value="">Selecione o serviço...</option>
                ${optServicos}
            </select>

            <label style="font-size:12px; color:#888; display:block; margin-top:10px">Venda Adicional (Opcional):</label>
            <select id="ag-produto-select" onchange="app.atualizarTotalAgendamento()" class="input-dark">
                <option value="">Nenhum produto</option>
                ${optProdutos}
            </select>
            
            <label style="font-size:12px; color:#888; display:block; margin-top:10px">Horário Disponível:</label>
            <select id="ag-hora-select" class="input-dark">
                <option value="">Escolha o barbeiro primeiro...</option>
            </select>

            <div id="total-preview" style="margin-top:20px; text-align:right; font-weight:bold; color:var(--success); font-size:20px; border-top:1px solid #333; padding-top:10px">
                Total: R$ 0,00
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
                <button class="btn-primary" style="background: var(--accent); color: #000;" onclick="app.salvarAgenda()">Confirmar Agendamento</button>
                <button class="btn-primary" style="background:#333;" onclick="${ehExterno ? "window.location.reload()" : "app.fecharModal()"}">Cancelar</button>
            </div>
        </div>
    `;

    this.abrirModalForm(ehExterno ? "Reserva de Horário" : "Novo Agendamento", html);

    // 3. AJUSTE DE UI PARA LINKS EXTERNOS (Modo Cliente)
    if (ehExterno) {
        const sheet = document.querySelector('.bottom-sheet');
        if (sheet) {
            sheet.style.height = '100vh';
            sheet.style.borderRadius = '0';
            sheet.style.top = '0';
        }
    }
},

// --- SEQUÊNCIA: FUNÇÃO ATUALIZAR TOTAL DO AGENDAMENTO ---
atualizarTotalAgendamento() {
    let total = 0;
    
    // 1. VALOR DO SERVIÇO: Captura o preço do serviço selecionado
    const servSelect = document.getElementById('ag-servico-select');
    if (servSelect && servSelect.selectedIndex > 0) {
        const selectedServ = servSelect.options[servSelect.selectedIndex];
        // Usamos Number() por ser mais rigoroso que parseFloat para dados de planilha
        const precoServ = Number(selectedServ.dataset.preco || 0);
        total += precoServ;
    }

    // 2. VALOR DO PRODUTO: Captura o preço da venda adicional (Estoque)
    const prodSelect = document.getElementById('ag-produto-select');
    if (prodSelect && prodSelect.selectedIndex > 0) {
        const selectedProd = prodSelect.options[prodSelect.selectedIndex];
        const precoProd = Number(selectedProd.dataset.preco || 0);
        total += precoProd;
    }

    // 3. ATUALIZAÇÃO DA INTERFACE: Exibe o total formatado em Real
    const display = document.getElementById('total-preview');
    if (display) {
        // Formata para o padrão brasileiro (0,00) para manter a identidade da planilha
        display.innerText = `Total: R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    } else {
        console.warn("Elemento 'total-preview' não encontrado no modal.");
    }
},


// --- SEQUÊNCIA: FUNÇÃO SALVAR AGENDA (INTERNO E EXTERNO) ---
salvarAgenda(acao) {
    const params = new URLSearchParams(window.location.search);
    const ehExterno = params.has('agendar');

    // 1. CANCELAMENTO (MODO CLIENTE)
    if (ehExterno && acao === 'cancelar') {
        alert("Pode continuar o seu agendamento a qualquer momento. Não perca o seu horário!");
        return; 
    }

    // 2. COLETA DE DADOS DO FORMULÁRIO
    const cliente = document.getElementById('ag-nome').value.trim();
    const data = document.getElementById('ag-data').value;
    const prestador = document.getElementById('ag-prestador-select').value;
    const hora = document.getElementById('ag-hora-select').value;
    
    const selectServ = document.getElementById('ag-servico-select');
    const servico = selectServ.value;
    const precoServico = Number(selectServ.options[selectServ.selectedIndex]?.dataset.preco || 0);

    const selectProd = document.getElementById('ag-produto-select');
    const produtoNome = selectProd ? selectProd.value : "";
    const precoProduto = Number(selectProd?.options[selectProd.selectedIndex]?.dataset.preco || 0);

    const valorFinal = precoServico + precoProduto;

    // 3. VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
    if (cliente && data && prestador && hora && servico) {
        
        // 4. LÓGICA DE ESTOQUE (Local e Planilha)
        if (produtoNome) {
            const itemEstoque = this.dados.estoque.find(p => p.nome === produtoNome);
            if (itemEstoque) {
                const quantidadeAtual = Number(itemEstoque.qtd || itemEstoque.quantidade || 0);
                if (quantidadeAtual > 0) {
                    itemEstoque.qtd = quantidadeAtual - 1; // Abate localmente
                } else {
                    alert(`Desculpe, o produto "${produtoNome}" esgotou agora pouco.`);
                    return; 
                }
            }
        }

        // 5. REGISTRO NO OBJETO DE MEMÓRIA
        const novoAgendamento = { 
            id: Date.now(), 
            cliente, 
            data, 
            prestador, 
            hora, 
            servico: produtoNome ? `${servico} + ${produtoNome}` : servico, 
            produto: produtoNome || null,
            valorServico: precoServico,
            valorProduto: precoProduto,
            valor: valorFinal 
        };

        this.dados.agenda.push(novoAgendamento);

        // 6. PERSISTÊNCIA (ENVIAR PARA GOOGLE SHEETS)
        // Se for externo, usamos uma lógica de persistência imediata e limpeza de tela
        if (ehExterno) {
            this.persistirImediato().then(() => {
                const linkReagendamento = window.location.href;

                // Limpa dados sensíveis do navegador do cliente por segurança
                localStorage.removeItem('barber_auth');
                localStorage.removeItem('barber_local_db');
                
                this.fecharModal();

                // TELA DE SUCESSO PARA O CLIENTE
                document.body.innerHTML = `
                    <div style="height:100vh; background:#0f0f0f; display:flex; justify-content:center; align-items:center; font-family:sans-serif; padding:20px; color:white;">
                        <div style="background:#1a1a1a; padding:40px; border-radius:20px; border:1px solid #D4AF37; text-align:center; max-width:400px; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
                            <div style="font-size:60px; color:#D4AF37; margin-bottom:20px;">✓</div>
                            <h2 style="color:#D4AF37; margin-bottom:10px;">Confirmado!</h2>
                            <p style="color:#ccc; margin-bottom:30px; line-height:1.6;">
                                Olá <strong>${cliente}</strong>, seu horário para <strong>${data.split('-').reverse().join('/')}</strong> às <strong>${hora}</strong> foi reservado.
                            </p>
                            <button onclick="window.location.href='${linkReagendamento}'" 
                                style="width:100%; padding:18px; background:#D4AF37; border:none; border-radius:12px; font-weight:bold; color:black; font-size:16px;">
                                Fazer outro agendamento
                            </button>
                        </div>
                    </div>
                `;
            });
            return; 
        }

        // Se for o barbeiro no modo interno
        this.persistir();
        this.fecharModal();
        this.renderView('agenda');
        alert("✅ Agendamento salvo com sucesso!");

    } else {
        alert(ehExterno ? "Por favor, preencha todos os dados para reservar seu horário." : "Preencha todos os campos obrigatórios!");
    }
},
// Função auxiliar para o modo externo garantir o envio antes de limpar a tela
async persistirImediato() {
    localStorage.setItem('barber_local_db', JSON.stringify(this.dados));
    const pacote = { usuario: this.dados.usuario, dados: this.dados };
    try {
        await fetch(URL_SCRIPT, { method: 'POST', mode: 'no-cors', body: JSON.stringify(pacote) });
        console.log("🚀 Dados enviados para o Google Sheets");
    } catch (e) {
        console.error("Erro no envio imediato", e);
    }
},
// --- SEQUÊNCIA: FUNÇÃO ABRIR CHECKOUT (FECHAMENTO) ---
abrirCheckout(id) {
    // Busca o agendamento na memória local (sincronizada com o Sheets)
    const item = this.dados.agenda.find(a => a.id === id);
    if (!item) return;

    // Garante que o valor seja tratado como número para exibição
    const valorTotal = Number(item.valor || 0);

    // Montagem do Modal de Finalização
    document.getElementById('modal-content').innerHTML = `
        <h3 style="margin-bottom:15px; color:var(--accent)">Finalizar Atendimento</h3>
        
        <div style="text-align: left; font-size: 14px; color: #ccc; line-height: 1.6;">
            <p><strong>👤 Cliente:</strong> ${item.cliente}</p>
            <p><strong>✂️ Serviço/Produto:</strong> ${item.servico}</p>
            <p><strong>💈 Profissional:</strong> ${item.prestador || item.barbeiro}</p>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background: #1a1a1a; border-radius: 10px; text-align: left; border: 1px solid #333;">
            <label style="color: #888; font-size: 12px; display: block; margin-bottom: 8px;">Forma de Pagamento:</label>
            <select id="checkout-pagamento" style="width: 100%; padding: 12px; border-radius: 8px; background: #000; color: white; border: 1px solid #444; font-size: 16px;">
                <option value="dinheiro">💵 Dinheiro</option>
                <option value="pix">📱 PIX</option>
                <option value="credito">💳 Crédito</option>
                <option value="debito">💳 Débito</option>
            </select>
        </div>

        <div style="margin: 15px 0; padding: 15px; background: #1a1a1a; border-radius: 10px; text-align: center; border: 1px solid #333;">
            <span style="color: #888; font-size: 14px;">Total a Receber:</span>
            <h2 style="color:var(--success); margin-top:5px; font-size: 28px;">
                R$ ${valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </h2>
        </div>
        
        <button class="btn-primary" style="background: var(--success); color: white; font-weight: bold;" 
            onclick="app.finalizarPagamento(${id})">✅ Confirmar e Lançar no Caixa</button>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
            <button class="btn-primary" style="background:#b30000; font-size: 12px;" 
                onclick="app.excluirAgendamento(${id})">🗑️ Excluir</button>
            <button class="btn-primary" style="background:#333; font-size: 12px;" 
                onclick="app.fecharModal()">🔙 Voltar</button>
        </div>
    `;
    
    document.getElementById('modal-container').style.display = 'flex';
},
// --- SEQUÊNCIA: FUNÇÃO EXCLUIR AGENDAMENTO ---
excluirAgendamento(id) {
    // 1. CONFIRMAÇÃO: Evita exclusões acidentais com um toque
    if (confirm("⚠️ Deseja realmente excluir este agendamento? Esta ação não pode ser desfeita.")) {
        
        // 2. LOCALIZAÇÃO: Encontra a posição do item no array da memória
        const index = this.dados.agenda.findIndex(a => a.id === id);
        
        if (index !== -1) {
            // 3. REMOÇÃO: Remove 1 item na posição encontrada
            this.dados.agenda.splice(index, 1);
            
            // 4. SINCRONIZAÇÃO: Salva no LocalStorage e agenda o envio para a Planilha
            this.persistir();
            
            // 5. LIMPEZA DE INTERFACE: Fecha o modal de checkout/detalhes
            this.fecharModal();
            
            // 6. ATUALIZAÇÃO VISUAL: Pequeno delay para garantir que a memória foi limpa
            setTimeout(() => {
                // Força o redesenho da tela de agenda
                this.renderView('agenda');
                
                // Se houver busca ativa, limpa o filtro para mostrar a lista correta
                if (typeof this.filtrarLista === 'function') {
                    this.filtrarLista('agenda', '');
                }
                
                console.log(`✅ Agendamento ${id} removido com sucesso.`);
            }, 100);
        } else {
            console.error("❌ Erro: Agendamento não encontrado para exclusão.");
            alert("Erro ao localizar o agendamento.");
        }
    }
},

// --- SEQUÊNCIA: FUNÇÃO FINALIZAR PAGAMENTO (CHECKOUT FINANCEIRO) ---
finalizarPagamento(id) {
    const index = this.dados.agenda.findIndex(a => a.id === id);
    if (index === -1) return;

    // 1. CAPTURA DOS DADOS DO MODAL E AGENDA
    const selectPg = document.getElementById('checkout-pagamento');
    const formaPagamento = selectPg ? selectPg.value : "dinheiro";
    const itemConcluido = this.dados.agenda[index];
    let custoProdutoTotal = 0;

    // 2. LÓGICA DE ESTOQUE (Baixa local e cálculo de custo)
    if (itemConcluido.produto) {
        const pEstoque = this.dados.estoque.find(p => p.nome === itemConcluido.produto);
        if (pEstoque) {
            // Abate a quantidade (suporta chaves 'qtd' ou 'quantidade' da planilha)
            if (Number(pEstoque.qtd || 0) > 0) pEstoque.qtd = Number(pEstoque.qtd) - 1;
            else if (Number(pEstoque.quantidade || 0) > 0) pEstoque.quantidade = Number(pEstoque.quantidade) - 1;
            
            // Registra o custo para calcular o lucro real depois
            custoProdutoTotal = Number(pEstoque.precoCusto || pEstoque.custo || 0);
        }
    }

    // 3. CÁLCULO DE COMISSÃO (Regra: Apenas sobre o valor do serviço)
    const funcionario = this.dados.prestadores.find(p => p.nome === (itemConcluido.prestador || itemConcluido.barbeiro));
    
    const valorBrutoTotal = Number(itemConcluido.valor || 0);
    const valorApenasServico = Number(itemConcluido.valorServico || 0);
    const valorApenasProduto = Number(itemConcluido.valorProduto || 0);
    
    let valorComissaoCalculada = 0;

    if (funcionario) {
        const tipoComissao = (funcionario.tipo || 'fixo').toLowerCase();
        const taxaComissao = Number(funcionario.comissao || 0);
        
        if (tipoComissao === 'porcentagem' || tipoComissao === 'percentual') {
            valorComissaoCalculada = valorApenasServico * (taxaComissao / 100);
        } else {
            // Se for fixo, o valor da comissão é o próprio número cadastrado
            valorComissaoCalculada = taxaComissao;
        }
    }

    // REGRA DE OURO: Lucro Líquido = (Serviço - Comissão) + (Venda Produto - Custo Produto)
    const valorLiquidoCasa = (valorApenasServico - valorComissaoCalculada) + (valorApenasProduto - custoProdutoTotal);

    // 4. ATUALIZAÇÃO DO CAIXA E HISTÓRICO
    if (typeof this.dados.caixa !== 'number') this.dados.caixa = 0;
    this.dados.caixa += valorLiquidoCasa;

    // 5. PREPARAÇÃO PARA A PLANILHA (Aba _Hist)
    const novoHistorico = {
        data: new Date().toLocaleDateString('pt-BR'),
        dataConclusao: new Date().toLocaleDateString('pt-BR'), // Campo extra para segurança
        hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
        cliente: itemConcluido.cliente,
        servico: itemConcluido.servico,
        valor: valorBrutoTotal,                // Coluna Valor Bruto
        valorBruto: valorBrutoTotal,           // Compatibilidade com Dashboard
        valorComissao: valorComissaoCalculada, // Dinheiro do Barbeiro
        valorLiquido: valorLiquidoCasa,        // Dinheiro da Casa
        prestador: itemConcluido.prestador || itemConcluido.barbeiro,
        pagamento: formaPagamento,             // Dinheiro, Pix, etc.
        metodo: formaPagamento 
    };

    if (!this.dados.historico) this.dados.historico = [];
    this.dados.historico.push(novoHistorico);

    // 6. FINALIZAÇÃO E SINCRONIZAÇÃO
    // Remove da agenda (já foi atendido)
    this.dados.agenda.splice(index, 1);

    // Envia tudo para o Google Sheets (Agenda, Estoque, Histórico e Caixa)
    this.persistir(); 

    this.fecharModal();
    
    // Feedback e Redirecionamento
    setTimeout(() => {
        this.renderView('dash');
        alert(`Sucesso!\nBruto: R$ ${valorBrutoTotal.toFixed(2)}\nLíquido Casa: R$ ${valorLiquidoCasa.toFixed(2)}`);
    }, 300);

    console.log(`Checkout concluído: Bruto ${valorBrutoTotal} | Comissão ${valorComissaoCalculada} | Líquido ${valorLiquidoCasa}`);
},
    // --- FUNÇÕES DE APOIO (MANTIDAS) ---
// --- SEQUÊNCIA: FUNÇÃO FILTRAR LISTA (SERVIÇOS, ESTOQUE E AGENDA) ---
filtrarLista(tipo, termo) {
    const termoBusca = termo ? termo.toLowerCase().trim() : "";

    // --- BLOCO DE SERVIÇOS ---
    if (tipo === 'servicos') {
        const container = document.getElementById('lista-servicos-content');
        if (!container) return;
        
        const filtrados = (this.dados.servicos || []).filter(s => 
            (s.nome || "").toLowerCase().includes(termoBusca)
        );

        container.innerHTML = filtrados.map(s => `
            <div class="item-list" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #333;">
                <div>
                    <strong style="color:white">${s.nome}</strong><br>
                    <small style="color:var(--success)">R$ ${Number(s.valor || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</small>
                </div>
                <button class="btn-small" style="background:#444; color:white" onclick="app.prepararEdicaoServico(${s.id})">Editar</button>
            </div>
        `).join('') || '<p style="text-align:center; padding:10px; color:#666">Nenhum serviço encontrado.</p>';
    }

    // --- BLOCO DE ESTOQUE ---
    if (tipo === 'estoque') {
        const container = document.getElementById('lista-estoque-content');
        if (!container) return;

        const filtrados = (this.dados.estoque || []).filter(e => 
            (e.nome || "").toLowerCase().includes(termoBusca)
        );
        
        container.innerHTML = filtrados.map(e => {
            const venda = Number(e.precoVenda || e.preco || 0);
            const qtd = Number(e.qtd || e.quantidade || 0);
            const corStatus = qtd > 0 ? 'var(--success)' : 'var(--danger)';

            return `
                <div class="item-list" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #333; border-left: 4px solid ${corStatus}">
                    <div style="flex:1">
                        <strong style="color:white">${e.nome}</strong><br>
                        <small style="color:#888">Qtd: <b style="color:${corStatus}">${qtd}</b> | Venda: R$ ${venda.toFixed(2)}</small>
                    </div>
                    <div style="display:flex; gap:8px; align-items:center">
                        <button class="btn-small" style="background:#333; color:var(--danger); font-size:18px; width:35px" onclick="app.ajustarQtdManual(${e.id}, -1)">−</button>
                        <button class="btn-small" style="background:#333; color:var(--success); font-size:18px; width:35px" onclick="app.ajustarQtdManual(${e.id}, 1)">+</button>
                        <button class="btn-small" style="background:#444; color:white; margin-left:5px" onclick="app.prepararEdicaoEstoque(${e.id})">✏️</button>
                    </div>
                </div>
            `;
        }).join('') || '<p style="text-align:center; padding:10px; color:#666">Estoque vazio ou não encontrado.</p>';
    }

    // --- BLOCO DE AGENDA ---
    if (tipo === 'agenda') {
        const container = document.getElementById('lista-agenda-content');
        if (!container) return;

        const filtrados = (this.dados.agenda || []).filter(a => {
            const cliente = (a.cliente || "").toLowerCase();
            const prestador = (a.prestador || a.barbeiro || "").toLowerCase();
            return cliente.includes(termoBusca) || prestador.includes(termoBusca);
        });

        // Ordenação inteligente: Data mais próxima primeiro
        filtrados.sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora));

        container.innerHTML = filtrados.map(a => {
            const dataFormatada = a.data ? a.data.split('-').reverse().join('/') : '---';
            const valorTotal = Number(a.valor || 0);

            return `
                <div class="item-list" style="border-left: 4px solid var(--accent); margin-bottom: 8px; background: #1a1a1a; padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="font-size:14px; color:#aaa">${dataFormatada} - ${a.hora}</strong><br>
                        <div style="color:white; font-weight:bold; font-size:16px; margin: 4px 0;">${a.cliente}</div>
                        <small style="color:var(--accent)">✂️ ${a.servico}</small><br>
                        <small style="color:#666">Barbeiro: ${a.prestador || a.barbeiro}</small>
                    </div>
                    <div style="text-align:right">
                        <div style="font-weight:bold; color:var(--success); margin-bottom:8px">R$ ${valorTotal.toFixed(2)}</div>
                        <button class="btn-small" style="background:var(--success); color:black; font-weight:bold; padding:10px 15px;" 
                                onclick="app.abrirCheckout(${a.id})">PAGAR</button>
                    </div>
                </div>
            `;
        }).join('') || `<p style="text-align:center; padding:20px; color:#666">Nenhum agendamento para hoje.</p>`;
    }
},
// --- SEQUÊNCIA: FUNÇÃO AJUSTAR QUANTIDADE MANUAL (ESTOQUE) ---
ajustarQtdManual(id, mudanca) {
    // 1. LOCALIZAÇÃO: Busca o item no estado sincronizado
    const item = this.dados.estoque.find(e => e.id === id);
    
    if (item) {
        // Suporta tanto 'qtd' quanto 'quantidade' (comum em diferentes nomes de colunas no Sheets)
        const qtdAtual = parseInt(item.qtd || item.quantidade || 0);
        const novaQtd = qtdAtual + mudanca;
        
        // 2. VALIDAÇÃO: Impede estoque negativo
        if (novaQtd < 0) {
            alert("⚠️ A quantidade não pode ser inferior a zero.");
            return;
        }

        // 3. ATUALIZAÇÃO: Grava o novo valor no objeto de memória
        // Atualizamos ambas as chaves possíveis para garantir que o Apps Script receba o dado
        if (item.hasOwnProperty('qtd')) item.qtd = novaQtd;
        if (item.hasOwnProperty('quantidade')) item.quantidade = novaQtd;
        
        // Se o item não tiver nenhuma das chaves (erro de estrutura), força uma
        if (!item.hasOwnProperty('qtd') && !item.hasOwnProperty('quantidade')) {
            item.qtd = novaQtd;
        }

        // 4. PERSISTÊNCIA: Dispara o salvamento para o LocalStorage e o debounce para o Google Sheets
        this.persistir();
        
        // 5. FEEDBACK VISUAL: Atualiza a interface imediatamente
        // Usamos um pequeno delay visual apenas se quiser, mas aqui o filtrarLista já resolve
        this.filtrarLista('estoque', document.getElementById('search-estoque')?.value || '');

        // Log para depuração no console do navegador
        console.log(`📦 Estoque atualizado: ${item.nome} -> ${novaQtd}`);
    } else {
        console.error("Item de estoque não encontrado para o ID:", id);
    }
},

    // --- SEQUÊNCIA: FUNÇÕES DE CONTROLE DO MODAL ---

abrirModalForm(titulo, html) {
    const modal = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    
    if (!modal || !content) {
        console.error("Erro: Elementos do modal não encontrados no HTML.");
        return;
    }

    // 1. LIMPEZA E MONTAGEM: 
    // Resetamos o scroll para o topo e inserimos o conteúdo com um título padronizado
    content.scrollTop = 0; 
    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:10px;">
            <h3 style="margin:0; color:var(--accent); font-size:18px;">${titulo}</h3>
            <span onclick="app.fecharModal()" style="cursor:pointer; font-size:24px; color:#666;">&times;</span>
        </div>
        ${html}
    `;

    // 2. EXIBIÇÃO:
    modal.style.display = 'flex';
    
    // Adiciona um listener para fechar ao clicar fora do conteúdo (opcional, mas recomendado)
    modal.onclick = (e) => {
        if (e.target === modal) this.fecharModal();
    };
},

fecharModal() { 
    const modal = document.getElementById('modal-container');
    if (modal) {
        modal.style.display = 'none';
        
        // Limpa o conteúdo para evitar que IDs duplicados causem conflito quando abrir outro modal
        const content = document.getElementById('modal-content');
        if (content) content.innerHTML = '';
    }
},

// --- SEQUÊNCIA: FUNÇÃO ATUALIZAR HORÁRIOS DISPONÍVEIS ---
atualizarHorariosDisponiveis() {
    const barbeiro = document.getElementById('ag-prestador-select').value;
    const dataInput = document.getElementById('ag-data').value; // Formato AAAA-MM-DD
    const selectHora = document.getElementById('ag-hora-select');

    if (!barbeiro || !dataInput) {
        selectHora.innerHTML = '<option value="">Escolha o profissional...</option>';
        return;
    }

    // 1. TRATAMENTO DE DATA (Evita erro de fuso horário do JS)
    // Adicionamos T12:00:00 para garantir que o JS não mude o dia ao converter
    const dataObj = new Date(dataInput + 'T12:00:00');
    const diaSemana = dataObj.getDay();
    
    // Busca a configuração vinda da aba 'Config' da Planilha
    const conf = this.dados.config && this.dados.config.diasTrabalho ? this.dados.config.diasTrabalho[diaSemana] : null;

    // 2. VALIDAÇÃO DE DIA ATIVO
    const diaAtivo = conf && (String(conf.ativo).toLowerCase() === "true" || conf.ativo === true);
    if (!diaAtivo) {
        selectHora.innerHTML = '<option value="">Fechado neste dia</option>';
        return;
    }

    let html = '<option value="">Selecione o horário...</option>';
    
    // 3. CONFIGURAÇÃO DOS LIMITES (Normalizados para comparação)
    const criarDataHora = (horaTexto) => new Date(`2000-01-01T${horaTexto}:00`);
    
    let atual = criarDataHora(conf.inicio);
    const fim = criarDataHora(conf.fim);
    const almocoIni = criarDataHora(conf.almocoInicio);
    const almocoFim = criarDataHora(conf.almocoFim);
    const intervalo = parseInt(this.dados.config.intervalo) || 30;

    // 4. LOOP DE GERAÇÃO DE SLOTS
    let slotsGerados = 0;
    while (atual < fim) {
        const horaFormatada = atual.toTimeString().substring(0, 5);
        
        // Regra de Almoço/Pausa
        const estaNoAlmoco = (atual >= almocoIni && atual < almocoFim);
        
        if (!estaNoAlmoco) {
            // Regra de Ocupação: Verifica no array 'agenda' vindo da Planilha
            const ocupado = this.dados.agenda.some(a => {
                const profAgenda = (a.prestador || a.profissional || "").trim().toLowerCase();
                const profBusca = barbeiro.trim().toLowerCase();
                
                return profAgenda === profBusca && 
                       (a.hora === horaFormatada) && 
                       (a.data === dataInput);
            });

            if (!ocupado) {
                html += `<option value="${horaFormatada}">${horaFormatada}</option>`;
                slotsGerados++;
            }
        }
        
        // Próximo intervalo
        atual.setMinutes(atual.getMinutes() + intervalo);
        
        // Trava de segurança para evitar loops infinitos caso o intervalo seja 0
        if (intervalo <= 0) break; 
    }

    // 5. FEEDBACK FINAL
    if (slotsGerados === 0) {
        selectHora.innerHTML = '<option value="">Sem horários livres</option>';
    } else {
        selectHora.innerHTML = html;
    }
},

// Adicione estas funções dentro do objeto app:
// --- SEQUÊNCIA: FUNÇÃO RENDERIZAR LISTA DE PRESTADORES ---
renderListaPrestadores() {
    const container = document.getElementById('lista-pre');
    if (!container) return;

    // Criamos uma cópia para inverter a ordem (mais recentes primeiro) sem alterar o array original
    const listaInvertida = this.dados.prestadores ? [...this.dados.prestadores].reverse() : [];

    container.innerHTML = listaInvertida.map(p => {
        let infoRemuneracao = '';
        const tipo = (p.tipo || 'fixo').toLowerCase(); // Padroniza para evitar erro de caixa alta

        // 1. LÓGICA DE EXIBIÇÃO POR TIPO DE CONTRATO
        if (tipo === 'dono' || tipo === 'proprietário') {
            infoRemuneracao = '<span style="color:var(--accent); font-weight:bold">💎 Proprietário (Lucro Total)</span>';
        } else if (tipo === 'porcentagem' || tipo === 'percentual') {
            const comissaoNum = Number(p.comissao || 0);
            infoRemuneracao = `Comissão: <b>${comissaoNum}%</b> por serviço`;
        } else {
            const comissaoFixa = Number(p.comissao || 0);
            infoRemuneracao = `Comissão fixa: <b>R$ ${comissaoFixa.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</b>`;
        }

        // 2. MONTAGEM DO HTML (Foco em usabilidade mobile)
        return `
            <div class="item-list" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #333; border-left: 4px solid ${tipo === 'dono' ? 'var(--accent)' : '#555'}">
                <div style="flex:1">
                    <strong style="color:white; font-size:16px">${p.nome}</strong><br>
                    <small style="color:#aaa">${infoRemuneracao}</small>
                </div>
                
                <div style="display:flex; gap:10px">
                    <button class="btn-small" style="background:var(--success); color:black; font-weight:bold; border-radius:6px; padding:8px 12px;" 
                            onclick="app.abrirAcerto(${p.id})">Acerto</button>
                    
                    <button class="btn-small" style="background:#333; color:white; border-radius:6px; padding:8px 12px;" 
                            onclick="app.prepararEdicaoPrestador(${p.id})">✏️</button>
                </div>
            </div>
        `;
    }).join('') || '<p style="text-align:center; padding:30px; color:#666">Nenhum profissional cadastrado.</p>';
},

// --- SEQUÊNCIA: FUNÇÃO PREPARAR EDIÇÃO DE PRESTADOR (CADASTRO/EDIÇÃO) ---
prepararEdicaoPrestador(id = null) {
    // 1. BUSCA OU CRIAÇÃO DE DADOS:
    // Se não houver ID, criamos um objeto 'limpo' para um novo barbeiro
    const p = id ? this.dados.prestadores.find(x => x.id === id) : { 
        nome: '', 
        comissao: '', 
        tipo: 'porcentagem' 
    };
    
    // Define se o botão de excluir deve aparecer (apenas na edição)
    const btnExcluir = id ? `<button class="btn-primary" style="background:var(--danger); color:white; margin-top:5px" onclick="app.excluirItem('prestadores', ${id})">Remover Profissional</button>` : '';

    const html = `
        <div class="form-container">
            <input type="hidden" id="pre-id" value="${id || ''}">
            
            <label style="font-size:12px; color:#888">Nome do Profissional:</label>
            <input type="text" id="pre-nome" class="input-dark" value="${p.nome}" placeholder="Ex: Lucas Barbeiro" style="width:100%; margin-bottom:15px">

            <label style="font-size:12px; color:#888; display:block">Modelo de Contrato:</label>
            <select id="pre-tipo" class="input-dark" onchange="app.atualizarUIComissao()" style="width:100%; margin-bottom:15px">
                <option value="porcentagem" ${p.tipo === 'porcentagem' ? 'selected' : ''}>Porcentagem (%)</option>
                <option value="fixo" ${p.tipo === 'fixo' ? 'selected' : ''}>Valor Fixo por Serviço (R$)</option>
                <option value="dono" ${p.tipo === 'dono' ? 'selected' : ''}>Dono / Sócio (100%)</option>
            </select>

            <div id="div-valor-comissao" style="display: ${p.tipo === 'dono' ? 'none' : 'block'}">
                <label id="label-pre-comissao" style="font-size:12px; color:#888; display:block">
                    ${p.tipo === 'fixo' ? 'Valor da Comissão (em R$):' : 'Porcentagem da Comissão (em %):'}
                </label>
                <input type="number" id="pre-comissao" class="input-dark" value="${p.comissao}" placeholder="${p.tipo === 'fixo' ? 'Ex: 20.00' : 'Ex: 50'}" step="any" style="width:100%">
            </div>
            
            <div style="margin-top:25px; display: flex; flex-direction: column; gap: 8px;">
                <button class="btn-primary" style="background:var(--accent); color:black; font-weight:bold" onclick="app.salvarPrestador()">Salvar Dados</button>
                ${btnExcluir}
                <button class="btn-primary" style="background:#333;" onclick="app.fecharModal()">Cancelar</button>
            </div>
        </div>
    `;

    this.abrirModalForm(id ? "Editar Profissional" : "Adicionar Barbeiro", html);
},

// Função auxiliar para esconder/mostrar campos no modal
// --- SEQUÊNCIA: FUNÇÃO DE INTERATIVIDADE DO FORMULÁRIO DE PRESTADOR ---
atualizarUIComissao() {
    const tipo = document.getElementById('pre-tipo').value;
    const divValor = document.getElementById('div-valor-comissao');
    const label = document.getElementById('label-pre-comissao');
    const input = document.getElementById('pre-comissao');

    // Se o elemento não existir (modal fechado ou erro de ID), encerra a função
    if (!divValor || !label) return;

    if (tipo === 'dono') {
        // Esconde o campo de valor para o proprietário
        divValor.style.display = 'none';
        if (input) input.value = '0'; // Define zero internamente para o banco de dados
    } else {
        // Mostra o campo e ajusta o texto conforme a lógica de negócio
        divValor.style.display = 'block';
        
        if (tipo === 'fixo') {
            label.innerHTML = 'Comissão <b>(Valor em R$)</b>:';
            if (input) input.placeholder = 'Ex: 20.00';
        } else {
            label.innerHTML = 'Comissão <b>(Porcentagem %)</b>:';
            if (input) input.placeholder = 'Ex: 50';
        }
    }
},

// --- SEQUÊNCIA: FUNÇÃO SALVAR PRESTADOR (CADASTRO E EDIÇÃO) ---
salvarPrestador() {
    // 1. CAPTURA DE DADOS DO MODAL
    const id = document.getElementById('pre-id').value;
    const nome = document.getElementById('pre-nome').value.trim();
    const tipo = document.getElementById('pre-tipo').value; 
    const inputComissao = document.getElementById('pre-comissao');
    
    // 2. LÓGICA DE VALOR: Dono não tem comissão, os demais precisam de um número
    const comissao = tipo === 'dono' ? 0 : Number(inputComissao.value || 0);

    // 3. VALIDAÇÃO RIGOROSA
    if (!nome) {
        alert("⚠️ Por favor, digite o nome do profissional.");
        return;
    }
    if (tipo !== 'dono' && (isNaN(comissao) || comissao < 0)) {
        alert("⚠️ Informe um valor de comissão válido (zero ou maior).");
        return;
    }

    // 4. MONTAGEM DO OBJETO (Padronizado para a Planilha)
    const dadosPrestador = {
        id: id ? Number(id) : Date.now(), // Mantém o ID se for edição, gera novo se for cadastro
        nome: nome,
        tipo: tipo,
        comissao: comissao
    };

    // 5. ATUALIZAÇÃO DA MEMÓRIA LOCAL
    if (!this.dados.prestadores) this.dados.prestadores = [];

    if (id) {
        // EDIÇÃO: Localiza e substitui
        const index = this.dados.prestadores.findIndex(p => String(p.id) === String(id));
        if (index !== -1) {
            this.dados.prestadores[index] = dadosPrestador;
            console.log(`✅ Profissional ${nome} atualizado.`);
        }
    } else {
        // NOVO: Adiciona ao final da lista
        this.dados.prestadores.push(dadosPrestador);
        console.log(`✅ Novo profissional ${nome} cadastrado.`);
    }

    // 6. PERSISTÊNCIA E INTERFACE
    // Salva no LocalStorage e agenda o envio para o Apps Script
    this.persistir(); 
    
    this.fecharModal();
    
    // Atualiza a visualização da lista de equipe imediatamente
    this.renderView('prestadores');
},
    // --- DENTRO DO OBJETO APP ---

// --- SEQUÊNCIA: FUNÇÃO ABRIR ACERTO (GESTÃO DE COMISSÃO) ---
abrirAcerto(id) {
    const p = this.dados.prestadores.find(x => x.id === id);
    if (!p) return;

    // 1. CÁLCULO DE SALDO: Filtra o histórico global da planilha
    // Somamos apenas as comissões que pertencem a este profissional
    const saldoAtual = (this.dados.historico || [])
        .filter(h => (h.prestador || h.barbeiro) === p.nome)
        .reduce((acc, curr) => acc + (Number(curr.valorComissao) || 0), 0);

    // 2. RENDERIZAÇÃO DE LOGS (Auditoria de pagamentos e ajustes)
    const logs = (this.dados.logsAcertos || [])
        .filter(l => l.prestadorId === id)
        .reverse()
        .map(l => {
            const dataFmt = l.data ? l.data.split(',')[0] : '---';
            if (l.tipo === 'pagamento') {
                return `
                    <div style="font-size:11px; color:#888; border-bottom:1px solid #333; padding:5px 0; display:flex; justify-content:space-between">
                        <span>📅 ${dataFmt} (PAGO)</span>
                        <strong style="color:var(--success)">- R$ ${Number(l.valorPago).toFixed(2)}</strong>
                    </div>`;
            } else {
                return `
                    <div style="font-size:11px; color:#888; border-bottom:1px solid #333; padding:5px 0; display:flex; justify-content:space-between">
                        <span>📅 ${dataFmt} (AJUSTE)</span>
                        <span>R$ ${Number(l.antigo).toFixed(2)} ➔ R$ ${Number(l.novo).toFixed(2)}</span>
                    </div>`;
            }
        }).join('') || '<p style="font-size:11px; color:#555; text-align:center">Nenhuma movimentação registrada.</p>';

    // 3. INTERFACE DO MODAL
    const html = `
        <div style="text-align:center; margin-bottom:20px; background:#151515; padding:20px; border-radius:15px; border:1px solid #333">
            <h2 style="color:var(--accent); font-size:32px; margin:0">R$ ${saldoAtual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h2>
            <small style="color:#888; text-transform:uppercase; letter-spacing:1px">Saldo para: ${p.nome}</small>
        </div>
        
        <div style="background:#1a1a1a; padding:15px; border-radius:10px; margin-bottom:20px; border:1px solid #222">
            <label style="font-size:11px; color:#888; display:block; margin-bottom:8px">Lançar Ajuste Manual (R$):</label>
            <div style="display:flex; gap:8px">
                <input type="number" id="novo-saldo-acerto" placeholder="Ex: 50.00" 
                    style="flex:1; height:40px; background:#000; border:1px solid #444; color:white; border-radius:8px; padding:0 10px">
                <button onclick="app.confirmarAjusteSaldo(${id}, ${saldoAtual})" 
                    style="background:var(--accent); color:black; border:none; padding:0 20px; border-radius:8px; font-weight:bold; cursor:pointer">OK</button>
            </div>
        </div>

        <label style="font-size:12px; color:#888; display:block; margin-bottom:5px">Últimas Movimentações:</label>
        <div style="max-height:150px; overflow-y:auto; background:#111; padding:10px; border-radius:8px; margin-bottom:20px; border:1px solid #222">
            ${logs}
        </div>

        <button class="btn-primary" style="background:var(--success); color:white; font-weight:bold; height:50px" 
            onclick="app.zerarComissao(${id}, ${saldoAtual})">💸 PAGAR SALDO TOTAL</button>
        
        <button class="btn-primary" style="background:#333; margin-top:10px" 
            onclick="app.fecharModal()">VOLTAR</button>
    `;

    this.abrirModalForm(`Acerto Financeiro`, html);
},
// --- SEQUÊNCIA: FUNÇÃO CONFIRMAR AJUSTE DE SALDO (CONTABILIDADE) ---
confirmarAjusteSaldo(id, saldoAntigo) {
    const p = this.dados.prestadores.find(x => x.id === id);
    if (!p) return;

    const campoInput = document.getElementById('novo-saldo-acerto');
    const novoSaldo = parseFloat(campoInput.value);

    // 1. VALIDAÇÕES INICIAIS
    if (isNaN(novoSaldo)) return alert("⚠️ Por favor, insira um valor numérico válido.");
    
    const diferenca = novoSaldo - saldoAntigo;
    if (Math.abs(diferenca) < 0.01) return alert("⚠️ O valor informado é igual ao saldo atual.");

    // 2. REGISTRO NO HISTÓRICO
    // Se a diferença for positiva (ex: barbeiro tinha 100 e agora tem 150), 
    // a casa está "perdendo" 50 reais do caixa para dar ao profissional.
    const registroAjuste = {
        id: Date.now(),
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
        cliente: "SISTEMA", // Identifica que foi um ajuste interno
        // Descrição clara com o nome do profissional
        servico: `AJUSTE SALDO: ${p.nome}`, 
        prestador: p.nome,
        valorBruto: 0, 
        valorComissao: diferenca,      // Isso atualiza o saldo do profissional
        valorLiquido: -diferenca,     // ISSO FAZ SUBTRAIR DO CAIXA DA CASA
        pagamento: "ajuste",          // Identificador para o histórico
        metodo: "AJUSTE"
    };

    if (!this.dados.historico) this.dados.historico = [];
    this.dados.historico.push(registroAjuste);

    // 3. ATUALIZAÇÃO DO CAIXA (Subtrai o valor que foi dado ao funcionário)
    // Se a diferença for positiva, o caixa diminui.
    this.dados.caixa -= diferenca;

    // 4. REGISTRO DE LOG (Auditoria)
    if (!this.dados.logsAcertos) this.dados.logsAcertos = [];
    this.dados.logsAcertos.push({
        prestadorId: id,
        tipo: 'edicao',
        data: new Date().toLocaleString('pt-BR'),
        antigo: saldoAntigo,
        novo: novoSaldo,
        impactoCaixa: -diferenca
    });

    // 5. SINCRONIZAÇÃO
    this.persistir(); // Envia para o Google Sheets e LocalStorage
    
    alert(`Ajuste de R$ ${diferenca.toFixed(2)} registrado para ${p.nome}.\nO caixa da casa foi atualizado.`);
    this.abrirAcerto(id); 
},
// --- SEQUÊNCIA: FUNÇÃO ZERAR COMISSÃO (PAGAMENTO AO PROFISSIONAL) ---
zerarComissao(id, valorPago) {
    // 1. VALIDAÇÕES DE SEGURANÇA
    if (valorPago <= 0) {
        alert("⚠️ Não há saldo pendente para realizar o pagamento.");
        return;
    }
    
    if (!confirm(`Confirmar o pagamento total de R$ ${valorPago.toFixed(2)} para o profissional?`)) {
        return;
    }

    const p = this.dados.prestadores.find(x => x.id === id);
    if (!p) return;

    // 2. REGISTRO NO HISTÓRICO (O que zera o saldo no Sheets)
    const registroPagamento = {
        id: Date.now(),
        data: new Date().toLocaleDateString('pt-BR'), // Formato DD/MM/AAAA
        hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
        cliente: "---",
        servico: "💰 BAIXA DE COMISSÃO (PAGO)",
        prestador: p.nome,
        valorBruto: 0,
        valorLiquido: 0,     // Como você bem notou, o lucro já foi deduzido na venda original
        valorComissao: -valorPago, // Este valor negativo anula as comissões acumuladas
        metodo: "DINHEIRO/PIX"
    };

    if (!this.dados.historico) this.dados.historico = [];
    this.dados.historico.push(registroPagamento);

    // 3. REGISTRO NO LOG DE ACERTOS (Para exibição no modal de Acerto)
    if (!this.dados.logsAcertos) this.dados.logsAcertos = [];
    this.dados.logsAcertos.push({
        prestadorId: id,
        tipo: 'pagamento',
        data: new Date().toLocaleString('pt-BR'),
        valorPago: valorPago
    });

    // 4. ATUALIZAÇÃO DO CAIXA (Opcional)
    // Se você quiser que o saldo do caixa da barbearia diminua ao pagar o barbeiro:
    // this.dados.caixa -= valorPago;

    // 5. PERSISTÊNCIA E FEEDBACK
    this.persistir(); // Envia para o LocalStorage e agenda Push para o Sheets
    
    this.fecharModal();
    
    alert(`✅ Pagamento de R$ ${valorPago.toFixed(2)} registrado com sucesso para ${p.nome}!`);
    
    // Opcional: Renderiza novamente a lista de prestadores para atualizar visualmente
    if (typeof this.renderListaPrestadores === 'function') {
        this.renderListaPrestadores();
    }
},
    // --- SEQUÊNCIA: FUNÇÃO PREPARAR EDIÇÃO DE SERVIÇO ---
prepararEdicaoServico(id = null) {
    // 1. BUSCA OU INICIALIZAÇÃO:
    // Tenta encontrar o serviço pelo ID ou define um objeto vazio para novo cadastro
    const s = id ? this.dados.servicos.find(x => x.id === id) : { nome: '', valor: '' };
    
    // Define o botão de exclusão apenas se for uma edição (ID existente)
    const btnExcluir = id ? `
        <button class="btn-primary" style="background:var(--danger); color:white; margin-top:5px" 
            onclick="app.excluirItem('servicos', ${id})">🗑️ Excluir Serviço</button>` : '';

    // 2. CONSTRUÇÃO DO FORMULÁRIO (Foco em Inputs Limpos)
    const html = `
        <div class="form-container">
            <input type="hidden" id="ser-id" value="${id || ''}">
            
            <label style="font-size:12px; color:#888; display:block; margin-bottom:5px">Nome do Serviço:</label>
            <input type="text" id="ser-nome" class="input-dark" value="${s.nome}" 
                placeholder="Ex: Corte Degradê" style="width:100%; margin-bottom:15px">
            
            <label style="font-size:12px; color:#888; display:block; margin-bottom:5px">Preço de Venda (R$):</label>
            <input type="number" id="ser-valor" class="input-dark" value="${s.valor}" 
                placeholder="0.00" step="0.01" style="width:100%; margin-bottom:20px">
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="btn-primary" style="background:var(--accent); color:black; font-weight:bold" 
                    onclick="app.salvarServico()">💾 Salvar Serviço</button>
                
                ${btnExcluir}
                
                <button class="btn-primary" style="background:#333;" 
                    onclick="app.fecharModal()">Cancelar</button>
            </div>
        </div>
    `;

    // 3. ABERTURA DO MODAL
    this.abrirModalForm(id ? "Editar Serviço" : "✨ Novo Serviço", html);
},

// --- SEQUÊNCIA: FUNÇÃO SALVAR SERVIÇO (CADASTRO E EDIÇÃO) ---
salvarServico() {
    // 1. Captura de elementos com segurança
    const elNome = document.getElementById('ser-nome');
    const elValor = document.getElementById('ser-valor');
    const elId = document.getElementById('ser-id');

    if (!elNome || !elValor) {
        console.error("❌ Erro: Campos do modal não encontrados!");
        return;
    }

    const nome = elNome.value.trim();
    const valor = parseFloat(elValor.value);
    const id = elId ? elId.value : "";

    // Validação de preenchimento
    if (nome && !isNaN(valor)) {
        
        // Inicializa o array se ele não existir (prevenção de erro)
        if (!this.dados.servicos) this.dados.servicos = [];

        if (id) {
            // --- CASO A: EDIÇÃO DE SERVIÇO EXISTENTE ---
            const idx = this.dados.servicos.findIndex(s => String(s.id) === String(id));
            if (idx !== -1) {
                this.dados.servicos[idx] = { 
                    ...this.dados.servicos[idx], // Mantém campos extras se houver
                    nome: nome, 
                    valor: valor 
                };
            }
        } else {
            // --- CASO B: CRIAÇÃO DE NOVO SERVIÇO ---
            this.dados.servicos.push({ 
                id: Date.now(), 
                nome: nome, 
                valor: valor 
            });
        }

        // 2. Persistência: Salva Local e dispara Push para o Google Sheets
        this.persistir(); 
        this.fecharModal(); 

        // 3. Atualização da Interface com Delay de Segurança
        setTimeout(() => {
            // Tenta renderizar especificamente a lista ou a view completa
            if (typeof this.renderizarServicos === 'function') {
                this.renderizarServicos();
            }
            
            this.renderView('servicos');
            console.log(`✅ Serviço "${nome}" salvo com sucesso!`);
        }, 150); // Aumentado levemente para garantir processamento em celulares lentos

    } else {
        alert("⚠️ Por favor, preencha o nome e um valor numérico válido.");
    }
},

// --- SEQUÊNCIA: FUNÇÃO PREPARAR EDIÇÃO DE ESTOQUE (PRODUTOS) ---
prepararEdicaoEstoque(id = null) {
    // 1. BUSCA OU INICIALIZAÇÃO:
    // Tenta encontrar o produto no array 'estoque' ou cria um objeto vazio
    const e = id ? this.dados.estoque.find(x => x.id === id) : { 
        nome: '', 
        qtd: '', 
        precoVenda: '', 
        precoCusto: '' 
    };
    
    // Suporte para retrocompatibilidade (caso algum item use .preco em vez de .precoVenda)
    const precoVendaAtual = e.precoVenda || e.preco || '';
    const precoCustoAtual = e.precoCusto || e.custo || '';

    // Botão de excluir aparece apenas se o item já existir no banco de dados
    const btnExcluir = id ? `
        <button class="btn-primary" style="background:var(--danger); color:white; margin-top:5px" 
            onclick="app.excluirItem('estoque', ${id})">Excluir Produto</button>` : '';

    // 2. MONTAGEM DO HTML (Estrutura visualmente balanceada para mobile)
    const html = `
        <div class="form-container">
            <input type="hidden" id="est-id" value="${id || ''}">
            
            <label style="font-size:12px; color:#888; display:block; margin-bottom:5px">Nome do Produto:</label>
            <input type="text" id="est-nome" class="input-dark" value="${e.nome}" placeholder="Ex: Pomada Efeito Matte" style="width:100%; margin-bottom:15px">
            
            <label style="font-size:12px; color:#888; display:block; margin-bottom:5px">Quantidade Inicial/Atual:</label>
            <input type="number" id="est-qtd" class="input-dark" value="${e.qtd || e.quantidade || 0}" placeholder="Ex: 10" style="width:100%; margin-bottom:15px">
            
            <div style="display:flex; gap:10px; margin-bottom:20px">
                <div style="flex:1">
                    <label style="font-size:11px; color:#888; display:block; margin-bottom:5px">Custo (R$):</label>
                    <input type="number" id="est-preco-custo" class="input-dark" value="${precoCustoAtual}" placeholder="0.00" step="0.01" style="width:100%">
                </div>
                <div style="flex:1">
                    <label style="font-size:11px; color:#888; display:block; margin-bottom:5px">Venda (R$):</label>
                    <input type="number" id="est-preco-venda" class="input-dark" value="${precoVendaAtual}" placeholder="0.00" step="0.01" style="width:100%">
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="btn-primary" style="background:var(--accent); color:black; font-weight:bold" onclick="app.salvarEstoque()">Salvar Produto</button>
                ${btnExcluir}
                <button class="btn-primary" style="background:#333;" onclick="app.fecharModal()">Cancelar</button>
            </div>
        </div>
    `;

    this.abrirModalForm(id ? "Editar Produto" : "Novo Produto no Estoque", html);
},
// --- SEQUÊNCIA: FUNÇÃO SALVAR ESTOQUE (PRODUTOS) ---
// --- SEQUÊNCIA: FUNÇÃO SALVAR ESTOQUE (PRODUTOS) ---
salvarEstoque() {
    // 1. CAPTURA DE DADOS
    const elNome = document.getElementById('est-nome');
    const elQtd = document.getElementById('est-qtd');
    const elCusto = document.getElementById('est-preco-custo');
    const elVenda = document.getElementById('est-preco-venda');
    const elId = document.getElementById('est-id');

    // Validação de existência dos elementos
    if (!elNome || !elQtd) return;

    const nome = elNome.value.trim();
    const qtd = parseInt(elQtd.value);
    const precoCusto = parseFloat(elCusto.value) || 0;
    const precoVenda = parseFloat(elVenda.value) || 0;
    const id = elId.value;

    // 2. VALIDAÇÃO DE CONTEÚDO
    if (nome && !isNaN(qtd)) {
        const dadosProduto = { 
            id: id ? Number(id) : Date.now(), 
            nome: nome, 
            qtd: qtd, 
            precoCusto: precoCusto, 
            precoVenda: precoVenda 
        };

        // Inicializa array caso esteja vazio
        if (!this.dados.estoque) this.dados.estoque = [];

        if (id) {
            // EDIÇÃO: Localiza e substitui mantendo a integridade do ID
            const idx = this.dados.estoque.findIndex(e => String(e.id) === String(id));
            if (idx !== -1) {
                this.dados.estoque[idx] = dadosProduto;
            }
        } else {
            // NOVO PRODUTO
            this.dados.estoque.push(dadosProduto);
        }

        // 3. PERSISTÊNCIA E ATUALIZAÇÃO
        this.persistir(); // Envia para o LocalStorage e aciona o Push para o Sheets
        this.fecharModal(); 
        
        // Feedback visual e renderização da lista filtrada
        setTimeout(() => {
            this.renderView('estoque');
            console.log(`📦 Produto "${nome}" sincronizado.`);
        }, 100);

    } else {
        alert("⚠️ Por favor, preencha o nome do produto e a quantidade disponível.");
    }
},

   // --- SEQUÊNCIA: FUNÇÃO EXCLUIR ITEM (UNIVERSAL) ---
excluirItem(tipo, id) {
    // 1. CONFIRMAÇÃO: Evita cliques acidentais
    const confirmacao = confirm("⚠️ Tem certeza que deseja excluir este item? Esta ação removerá os dados permanentemente da planilha.");
    
    if (confirmacao) {
        // 2. FILTRAGEM: Remove o item do estado local
        // Usamos String() em ambos os lados para garantir que "123" seja igual a 123
        const tamanhoOriginal = this.dados[tipo].length;
        this.dados[tipo] = this.dados[tipo].filter(item => String(item.id) !== String(id));

        // Verifica se algo foi realmente removido antes de prosseguir
        if (this.dados[tipo].length < tamanhoOriginal) {
            
            // 3. PERSISTÊNCIA: Atualiza o LocalStorage e agenda o Push para o Apps Script
            this.persistir();
            this.fecharModal();
            
            // 4. ATUALIZAÇÃO DA INTERFACE
            // Pequeno delay para garantir que o processamento da exclusão termine
            setTimeout(() => {
                if (tipo === 'prestadores' || tipo === 'equipe') {
                    this.renderListaPrestadores();
                } else if (tipo === 'servicos') {
                    this.renderView('servicos');
                } else {
                    this.renderView(tipo);
                }
                
                console.log(`🗑️ Item do tipo [${tipo}] com ID [${id}] excluído.`);
            }, 100);

        } else {
            alert("❌ Erro: Item não encontrado para exclusão.");
        }
    }
},
// --- SEQUÊNCIA: FUNÇÃO COMPARTILHAR LINK DE AGENDAMENTO (CLIENTE) ---
compartilharLink() {
    try {
        const creds = githubDB.creds;

        if (!creds || !creds.userEmail || !creds.token) {
            alert("⚠️ Erro: Faça login primeiro!");
            return;
        }

        // --- AJUSTE AQUI ---
        // Extrai apenas "moises" do e-mail para bater com o nome das abas na planilha
        const usuarioLimpo = creds.userEmail.split('@')[0].split('.')[0].toLowerCase();

        // 1. PREPARAÇÃO DOS DADOS:
        const dadosParaUrl = {
            u: usuarioLimpo, // Agora envia "moises", não o e-mail longo
            s: creds.token      
        };
        // -------------------
        
        const jsonStr = JSON.stringify(dadosParaUrl);
        const tokenUrl = btoa(unescape(encodeURIComponent(jsonStr)));
        
        const base = window.location.href.split('?')[0];
        const urlFinal = `${base}?agendar=true&data=${tokenUrl}`;
        
        // ... restante do código (navigator.share, etc) ...
        if (navigator.share) {
            navigator.share({
                title: 'Agende seu horário!',
                text: 'Fala! Clique no link abaixo para agendar seu horário:',
                url: urlFinal,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(urlFinal).then(() => {
                alert("✅ Link de Agendamento copiado para o usuário: " + usuarioLimpo);
            });
        }
    } catch (e) {
        console.error("Erro ao gerar link:", e);
    }
},

}

async function salvarNoGoogle(dadosAgendamento) {
    // 1. URL do seu Script (Web App)
    const url = "https://script.google.com/macros/s/AKfycbxKLQVSSSFP7ELUCoh79PmlDdQ7-ey5jzdlmzfkap2GCEA_YqPvlrFnOVie2FLnZs-zpw/exec";
    
    // 2. Montagem do Payload
    // Garantimos que o usuário e os dados existam antes de enviar
    const payload = {
        usuario: app.dados.usuario || "desconhecido", 
        dados: dadosAgendamento
    };

    try {
        // 3. O Pulo do Gato para o Google Apps Script:
        // O modo 'no-cors' não permite cabeçalhos personalizados como 'application/json'.
        // Por isso, enviamos como texto puro ou via URLSearchParams se necessário.
        await fetch(url, {
            method: 'POST',
            mode: 'no-cors', // Importante: você não receberá o retorno (status 200) no JS
            cache: 'no-cache',
            headers: {
                // Em no-cors, apenas alguns cabeçalhos são permitidos
                'Content-Type': 'text/plain' 
            },
            body: JSON.stringify(payload)
        });

        // Como o 'no-cors' não retorna erro de rede mesmo se o script falhar,
        // o log aqui é uma confirmação de que o envio foi disparado.
        console.log(`🚀 Sincronização disparada para: ${payload.usuario}`);
        return true;

    } catch (error) {
        console.error("❌ Falha crítica no envio:", error);
        return false;
    }
}
// --- MÓDULO DE PERSISTÊNCIA REMOTA ---
const githubDB = {
    scriptURL: "https://script.google.com/macros/s/AKfycbxKLQVSSSFP7ELUCoh79PmlDdQ7-ey5jzdlmzfkap2GCEA_YqPvlrFnOVie2FLnZs-zpw/exec",

    // Recupera as credenciais salvas no login
    get creds() {
        const config = localStorage.getItem('barber_auth');
        return config ? JSON.parse(config) : null;
    },

    /**
     * ALTA PERFORMANCE: 
     * Faz um GET enviando o e-mail do usuário. 
     * O Script do Google deve retornar o JSON que está na célula Z1.
     */
    async carregar() {
        const c = this.creds;
        if (!c) return null;

        const url = `${this.scriptURL}?usuario=${encodeURIComponent(c.userEmail)}`;
        
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Erro na rede");
            
            const data = await res.json();
            
            // Valida se o que voltou é um objeto de dados válido
            return (data && typeof data === 'object' && data.servicos) ? data : null;
        } catch (e) { 
            console.error("⚠️ Falha ao sincronizar entrada:", e);
            return null; 
        }
    },

    /**
     * SALVAMENTO ASSÍNCRONO:
     * Envia o estado completo do APP (this.dados) para ser salvo na planilha.
     */
    async salvar(dados) {
        const c = this.creds;
        if (!c) {
            console.warn("❌ Tentativa de salvamento sem credenciais.");
            return false;
        }

        const payload = {
            usuario: c.userEmail,
            dados: dados 
        };

        try {
            // Usamos mode: 'no-cors' para evitar problemas de preflight do Google
            await fetch(this.scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' }, // GAS lida melhor com text/plain em no-cors
                body: JSON.stringify(payload)
            });
            
            console.log("☁️ Backup enviado para o Google Sheets!");
            return true;
        } catch (e) { 
            console.error("❌ Erro ao persistir dados:", e);
            return false; 
        }
    }
};

async function configurarCloud() {
    const emailInput = document.getElementById('u-email').value.trim().toLowerCase();
    const tokenInput = document.getElementById('u-token').value.trim();

    if (!emailInput || !tokenInput) return alert("⚠️ Preencha E-mail e Token para acessar.");

    // 1. GERAÇÃO DE IDENTIDADE: Baseada no e-mail (Seguindo padrão de segurança)
    const fileName = `db_${btoa(emailInput).substring(0, 8)}.json`;

    // 2. PREPARAÇÃO DO ACESSO: Limpa sessões anteriores e define a nova
    localStorage.clear(); 
    localStorage.setItem('barber_auth', JSON.stringify({
        token: tokenInput, 
        file: fileName, 
        userEmail: emailInput
    }));

    // Mostra um feedback visual de carregamento (opcional)
    console.log("🔍 Sincronizando com a nuvem...");

    try {
        // 3. TENTATIVA DE RECUPERAÇÃO DE DADOS
        const dadosNuvem = await githubDB.carregar();
        
        if (dadosNuvem) {
            // --- USUÁRIO EXISTENTE: Migração e Atualização ---
            app.dados = dadosNuvem;

            // Garante que a estrutura de horários por dia exista (Retrocompatibilidade)
            if (!app.dados.config || !app.dados.config.diasTrabalho) {
                console.log("🛠️ Atualizando estrutura de horários para o novo padrão...");
                
                const layoutHorariosPadrao = {
                    0: { ativo: false, inicio: "08:00", fim: "18:00", almocoInicio: "12:00", almocoFim: "13:00" }, // Dom
                    1: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" }, // Seg
                    2: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" }, // Ter
                    3: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" }, // Qua
                    4: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" }, // Qui
                    5: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" }, // Sex
                    6: { ativo: true,  inicio: "08:00", fim: "18:00", almocoInicio: "12:00", almocoFim: "13:00" }  // Sab
                };

                if (!app.dados.config) app.dados.config = { intervalo: 30 };
                app.dados.config.diasTrabalho = layoutHorariosPadrao;
            }
            
            alert(`✅ Bem-vindo de volta, ${emailInput.split('@')[0]}!`);
            
        } else {
            // --- USUÁRIO NOVO: Criação de banco do zero ---
            const estruturaInicial = { 
                usuario: emailInput, 
                caixa: 0, 
                agenda: [], 
                historico: [], 
                prestadores: [], 
                estoque: [], 
                servicos: [], 
                logsAcertos: [],
                config: { 
                    inicioDia: 8, 
                    fimDia: 19, 
                    intervalo: 30,
                    diasTrabalho: {
                        0: { ativo: false, inicio: "08:00", fim: "12:00", almocoInicio: "12:00", almocoFim: "13:00" },
                        1: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" },
                        2: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" },
                        3: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" },
                        4: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" },
                        5: { ativo: true,  inicio: "08:00", fim: "19:00", almocoInicio: "12:00", almocoFim: "13:00" },
                        6: { ativo: true,  inicio: "08:00", fim: "18:00", almocoInicio: "12:00", almocoFim: "13:00" }
                    }
                }
            };

            app.dados = estruturaInicial;
            
            // Salva na nuvem imediatamente para reservar o "espaço"
            const sucessoAoCriar = await githubDB.salvar(app.dados);
            if (!sucessoAoCriar) throw new Error("Não foi possível conectar ao Google Sheets.");
            
            alert(`✨ Novo banco de dados configurado para: ${emailInput}`);
        }   

        // 4. PERSISTÊNCIA LOCAL E REFRESH
        // Salva o estado atual no LocalStorage como cache de segurança
        localStorage.setItem(`barber_local_db`, JSON.stringify(app.dados));
        
        // Recarrega o app para iniciar com o novo estado
        window.location.reload(); 

    } catch (e) {
        console.error("Erro na configuração:", e);
        alert("❌ Falha na conexão: " + e.message);
    }
}
// Sincronização automática inicial
// --- SEQUÊNCIA: FUNÇÃO DE AUTENTICAÇÃO E SINCRONIZAÇÃO INICIAL ---
async function realizarLogin() {
    const config = githubDB.creds;
    if (!config) return false;

    // Feedback visual opcional: você pode disparar um loader aqui
    console.log("🔐 Autenticando usuário...");

    try {
        // 1. VALIDAÇÃO REMOTA (Ação de Login no Apps Script)
        // O script deve procurar na aba 'Usuarios' se o email e token batem
        const urlLogin = `${githubDB.scriptURL}?acao=login&usuario=${encodeURIComponent(config.userEmail)}&senha=${encodeURIComponent(config.token)}`;
        
        const resLogin = await fetch(urlLogin);
        if (!resLogin.ok) throw new Error("Erro na comunicação com o servidor");
        
        const status = await resLogin.text();

        if (status.trim() === "sucesso") {
            // 2. SINCRONIZAÇÃO DE DADOS (Snapshot)
            const dadosNuvem = await githubDB.carregar();
            
            if (dadosNuvem && typeof dadosNuvem === 'object') {
                app.dados = dadosNuvem;
                // Atualiza o cache local com os dados fresquinhos da nuvem
                localStorage.setItem('barber_local_db', JSON.stringify(app.dados));
                console.log("✅ Login e Sincronização concluídos.");
                return true;
            }
            
            // Se o login foi sucesso mas não há dados (Usuário novo)
            console.log("ℹ️ Login ok, iniciando banco de dados vazio.");
            return true; 

        } else if (status.trim() === "bloqueado") {
            alert("⛔ Acesso suspenso. Entre em contato com o administrador.");
            return false;
        } else {
            alert("❌ E-mail ou Token inválidos.");
            return false;
        }

    } catch (e) {
        // 3. MODO OFFLINE (Resiliência)
        console.error("⚠️ Servidor indisponível, tentando acesso offline...", e);
        
        const local = localStorage.getItem('barber_local_db');
        if (local) {
            try {
                const dadosRecuperados = JSON.parse(local);
                // Verifica se os dados locais pertencem mesmo ao usuário logado
                if (dadosRecuperados.usuario === config.userEmail) {
                    app.dados = dadosRecuperados;
                    alert("📡 Você está operando em Modo Offline.");
                    return true;
                }
            } catch (err) {
                console.error("Dados locais corrompidos.");
            }
        }
        
        alert("🌐 Erro de conexão. É necessário internet para o primeiro acesso.");
        return false;
    }
}
// 1. Função de Login (Acionada pelo Formulário)
// --- INTERCEPTOR DO FORMULÁRIO DE LOGIN ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('login-usuario').value.trim().toLowerCase();
    const senha = document.getElementById('login-password').value.trim();
    const btn = document.getElementById('btn-login');

    // 1. VALIDAÇÃO SIMPLES
    if (!usuario || !senha) {
        return alert("Por favor, preencha todos os campos.");
    }

    // 2. FEEDBACK VISUAL
    btn.disabled = true;
    const textoOriginal = btn.innerText;
    btn.innerHTML = `<span class="spinner"></span> Validando...`; // Adiciona um feedback de carregamento

    // 3. COMUNICAÇÃO COM O GOOGLE APPS SCRIPT
    // Note: usamos encodeURIComponent para evitar que caracteres especiais no e-mail ou senha quebrem a URL
    const url = `${githubDB.scriptURL}?acao=login&usuario=${encodeURIComponent(usuario)}&senha=${encodeURIComponent(senha)}`;

    try {
        const res = await fetch(url);
        
        if (!res.ok) throw new Error("Servidor fora do ar");
        
        const status = await res.text();

        // Limpa espaços extras que o Google Apps Script costuma enviar
        const statusLimpo = status.trim();

        if (statusLimpo === "sucesso") {
            // 4. PERSISTÊNCIA DA SESSÃO
            const authData = { 
                userEmail: usuario, 
                token: senha,
                timestamp: Date.now() // Útil para expirar a sessão no futuro se desejar
            };
            
            localStorage.setItem('barber_auth', JSON.stringify(authData));
            
            // Pequeno delay para o usuário ver o "sucesso" antes do reload
            btn.style.background = "#28a745";
            btn.innerText = "Acesso Autorizado!";
            
            setTimeout(() => {
                window.location.reload();
            }, 800);

        } else if (statusLimpo === "bloqueado") {
            alert("⚠️ Seu acesso está suspenso. Procure o administrador.");
            resetBtn();
        } else {
            alert("❌ Usuário ou senha incorretos.");
            resetBtn();
        }
    } catch (err) {
        console.error("Erro no login:", err);
        alert("🌐 Falha na conexão. Verifique sua internet.");
        resetBtn();
    }

    // Função interna para restaurar o botão em caso de falha
    function resetBtn() {
        btn.disabled = false;
        btn.innerText = textoOriginal;
        btn.style.background = ""; // Volta ao CSS original
    }
});

// 2. Função de LOGOUT (Adicione ao seu botão de Sair)
function fazerLogout() {
    if (confirm("🔌 Deseja realmente sair do sistema?")) {
        // 1. Limpa credenciais
        localStorage.removeItem('barber_auth'); 
        
        // 2. Limpa cache de dados
        localStorage.removeItem('barber_local_db'); 
        
        // 3. Reseta o estado do objeto (usando 'app' em vez de 'this')
        if (typeof app !== 'undefined') {
            app.dados = {};
        }

        // 4. Reinicializa a página
        window.location.href = window.location.pathname; 
    }
}


// --- 3. INICIALIZAÇÃO ÚNICA DO SISTEMA ---
window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');

    // 1. PROCESSA O "LINK MÁGICO" (Modo Cliente)
    if (params.has('agendar') && params.get('data')) {
        try {
            // Decodificação robusta para evitar erros com acentos/caracteres especiais
            const rawData = atob(params.get('data'));
            const info = JSON.parse(decodeURIComponent(escape(rawData)));
            
            // Salva credenciais temporárias para o cliente conseguir baixar os serviços/horários
            const authData = { userEmail: info.u, token: info.s };
            localStorage.setItem('barber_auth', JSON.stringify(authData));
            console.log("🔗 Link de cliente detectado e processado.");
        } catch (e) { 
            console.error("❌ Erro ao processar link de agendamento:", e); 
        }
    }

    // 2. VERIFICAÇÃO DE CREDENCIAIS
    const credencial = githubDB.creds;
    if (!credencial) {
        if (authScreen) authScreen.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
        return;
    }

    // 3. CARREGAMENTO DE DADOS (Snapshot da Nuvem)
    // Tenta carregar da nuvem; se falhar (ex: offline), o app usará o cache local
    const dadosNuvem = await githubDB.carregar();
    if (dadosNuvem) {
        app.dados = dadosNuvem;
    } else {
        const local = localStorage.getItem('barber_local_db');
        if (local) app.dados = JSON.parse(local);
    }

    // 4. DEFINIÇÃO DA INTERFACE (CLIENTE vs BARBEIRO)
    if (authScreen) authScreen.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';

    if (params.has('agendar')) {
        // --- MODO CLIENTE: Interface Ultra-Limpa ---
        
        const elementosPrivados = [
            '.tab-bar',          // Menu inferior
            '.mobile-header',    // Cabeçalho admin
            '#view-dash',        // Gráficos financeiros
            '.admin-only',       // Botões de config/excluir
            '#btn-logout',       // Botão sair
            '.sidebar'           // Menu lateral se houver
        ];
        
        elementosPrivados.forEach(seletor => {
            document.querySelectorAll(seletor).forEach(el => el.remove()); // Remove do DOM por segurança
        });

        // Estilização focada na conversão
        document.body.classList.add('client-mode');
        document.body.style.background = "#0a0a0a"; 
        
        // Direciona para agendamento
        app.renderView('agendamento'); 
        if (typeof app.prepararNovoAgendamento === 'function') {
            app.prepararNovoAgendamento();
        }

    } else {
        // --- MODO BARBEIRO: Dashboard Completo ---
        app.renderView('dash');
        console.log("💈 Modo Admin ativado.");
    }
};
// Logout limpa tudo para permitir login com outro e-mail

async function verificarAcessoInicial() {
    const loadingScreen = document.getElementById('loading-screen');
    const loginContent = document.getElementById('login-content');
    const mainApp = document.getElementById('main-app'); // Verifique se este ID existe

    // 1. Início: Proteção contra IDs inexistentes
    if (!loadingScreen || !loginContent) {
        console.error("❌ Erro: Elementos de tela (loading ou login) não encontrados no HTML.");
        return;
    }

    loadingScreen.style.display = 'flex';
    loginContent.style.display = 'none';

    try {
        // 2. Tempo mínimo de 5 segundos para a animação da logo
        const tempoEspera = new Promise(resolve => setTimeout(resolve, 5000));
        
        // 3. Verifica se existe credencial salva no navegador
        const authRaw = localStorage.getItem('barber_auth');
        const auth = authRaw ? JSON.parse(authRaw) : null;

        if (auth) {
            // Tenta logar (API) enquanto o cronômetro de 5s corre
            // Usamos Promise.allSettled para rodar as duas coisas ao mesmo tempo
            const [resultadoLogin] = await Promise.all([
                realizarLogin().catch(() => false), // Tenta o login
                tempoEspera // Espera os 5 segundos de qualquer jeito
            ]);

            if (resultadoLogin) {
                loadingScreen.style.display = 'none';
                if (mainApp) mainApp.style.display = 'block';
                app.renderView('dash'); 
                return; 
            }
        } else {
            // Sem login? Apenas espera os 5 segundos da animação
            await tempoEspera;
        }

    } catch (error) {
        console.error("⚠️ Erro durante o boot do app:", error);
    }

    // 4. FINALIZAÇÃO: Se falhou o login ou não existia, abre a tela de login
    loadingScreen.style.display = 'none';
    loginContent.style.display = 'block';
    if (mainApp) mainApp.style.display = 'none';
}

// Inicializa quando o navegador terminar de ler o HTML
document.addEventListener('DOMContentLoaded', verificarAcessoInicial);
