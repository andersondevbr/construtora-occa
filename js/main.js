/* Construtora OCCA - interações do site */
(function () {
  'use strict';

  var arr = function (lista) { return Array.prototype.slice.call(lista || []); };
  var reduzMovimento = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  function aoMudarMidia(mql, fn) {
    if (!mql) return;
    if (mql.addEventListener) mql.addEventListener('change', fn);
    else if (mql.addListener) mql.addListener(fn);
  }

  /* ---------- ano no rodapé ---------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = String(new Date().getFullYear());

  /* ---------- topo e menu ---------- */
  var topo = document.getElementById('topo');
  var menu = document.getElementById('menu');
  var botaoMenu = document.querySelector('.topo__botao');
  var desktop = window.matchMedia ? window.matchMedia('(min-width: 900px)') : null;

  function abreMenu(abrir) {
    if (!menu || !botaoMenu) return;
    botaoMenu.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    var rotulo = botaoMenu.querySelector('.sr');
    if (rotulo) rotulo.textContent = abrir ? 'Fechar menu' : 'Abrir menu';
    menu.classList.toggle('aberto', abrir);
    topo.classList.toggle('menu-aberto', abrir);
    document.documentElement.classList.toggle('travado', abrir);
    atualizaFlutuante();
    if (abrir) {
      var primeiro = menu.querySelector('a');
      if (primeiro) primeiro.focus({ preventScroll: true });
    }
  }

  if (botaoMenu) {
    botaoMenu.addEventListener('click', function () {
      abreMenu(botaoMenu.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a') && menu.classList.contains('aberto')) abreMenu(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('aberto')) {
      abreMenu(false);
      botaoMenu.focus();
    }
  });
  aoMudarMidia(desktop, function (m) { if (m.matches) abreMenu(false); });

  function atualizaTopo() {
    if (topo) topo.classList.toggle('solido', window.pageYOffset > 24);
  }

  /* link do menu da seção atual */
  var linksMenu = arr(document.querySelectorAll('.menu__lista a'));
  if ('IntersectionObserver' in window && linksMenu.length) {
    var ioMenu = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        var alvo = en.target.id ? '#' + en.target.id : '';
        linksMenu.forEach(function (a) {
          a.classList.toggle('atual', !!alvo && a.getAttribute('href') === alvo);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    arr(document.querySelectorAll('main > section')).forEach(function (s) { ioMenu.observe(s); });
  }

  /* ---------- placa 126 (contador) ---------- */
  var contador = document.querySelector('.contador');
  if (contador) {
    if ('IntersectionObserver' in window && !reduzMovimento.matches) {
      var ioContador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting) {
            contador.classList.add('visto');
            ioContador.disconnect();
          }
        });
      }, { threshold: 0.45 });
      ioContador.observe(contador);
    } else {
      contador.classList.add('visto');
    }
  }

  /* ---------- etapas: desenho que se constrói ---------- */
  var secaoEtapas = document.getElementById('etapas');
  var svgObra = document.querySelector('.obra-svg');
  var desenho = document.querySelector('.desenho');
  var etapas = arr(document.querySelectorAll('.etapa'));
  var camadas = svgObra ? arr(svgObra.querySelectorAll('.camada')) : [];
  var reguaItens = arr(document.querySelectorAll('.regua li'));
  var numEtapa = document.querySelector('[data-etapa-num]');
  var nomeEtapa = document.querySelector('[data-etapa-nome]');
  var etapaAtual = -1;

  function mostraEtapa(n) {
    if (n === etapaAtual) return;
    etapaAtual = n;
    if (svgObra) svgObra.setAttribute('data-etapa', String(n));

    camadas.forEach(function (c) {
      var de = parseInt(c.getAttribute('data-de'), 10) || 0;
      var ate = c.hasAttribute('data-ate') ? parseInt(c.getAttribute('data-ate'), 10) : 99;
      var ligada = n >= de && n <= ate;
      c.classList.toggle('on', ligada);
      if (c.classList.contains('fundacao')) c.classList.toggle('enterrada', n >= 7);
    });

    etapas.forEach(function (e, i) { e.classList.toggle('ativa', i + 1 === n); });
    reguaItens.forEach(function (r, i) { r.classList.toggle('feita', i < n); });

    var ref = etapas[Math.max(0, n - 1)];
    var mostrado = Math.max(1, n);
    if (numEtapa) numEtapa.textContent = (mostrado < 10 ? '0' : '') + mostrado;
    if (nomeEtapa && ref) nomeEtapa.textContent = ref.getAttribute('data-nome');
  }

  function calculaEtapa() {
    if (!etapas.length) return;
    var vh = window.innerHeight;
    var linha = vh * 0.5;
    if (window.innerWidth < 900 && desenho) {
      var baseDesenho = desenho.getBoundingClientRect().bottom;
      linha = baseDesenho + (vh - baseDesenho) * 0.45;
    }
    var n = 0;
    for (var i = 0; i < etapas.length; i++) {
      if (etapas[i].getBoundingClientRect().top <= linha) n = i + 1;
      else break;
    }
    mostraEtapa(n);
  }

  /* ---------- botão flutuante do WhatsApp ---------- */
  var flutuante = document.querySelector('.whats-flutuante');
  var hero = document.getElementById('inicio');
  var contato = document.getElementById('contato');

  function atualizaFlutuante() {
    if (!flutuante) return;
    var vh = window.innerHeight;
    var passouHero = hero ? hero.getBoundingClientRect().bottom < vh * 0.35 : true;
    var noContato = false;
    if (contato) {
      var r = contato.getBoundingClientRect();
      noContato = r.top < vh * 0.8 && r.bottom > 0;
    }
    var menuAberto = menu && menu.classList.contains('aberto');
    flutuante.classList.toggle('visivel', passouHero && !noContato && !menuAberto);
  }

  /* ---------- rolagem (um único laço) ---------- */
  var agendado = false;
  function aoRolar() {
    if (agendado) return;
    agendado = true;
    window.requestAnimationFrame(function () {
      agendado = false;
      atualizaTopo();
      atualizaFlutuante();
      if (secaoEtapas) {
        var r = secaoEtapas.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.5 && r.bottom > -window.innerHeight * 0.5) calculaEtapa();
      }
    });
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar);
  window.addEventListener('load', aoRolar);
  atualizaTopo();
  atualizaFlutuante();
  calculaEtapa();

  /* ---------- obras: filtro e "ver mais" ---------- */
  var galeria = document.getElementById('galeria');
  var obras = galeria ? arr(galeria.querySelectorAll('.obra')) : [];
  var filtros = arr(document.querySelectorAll('.filtro'));
  var verMais = document.getElementById('ver-mais');
  var LIMITE = 9;
  var filtroAtual = 'todas';
  var expandido = false;

  function aplicaFiltro() {
    var contagem = 0;
    obras.forEach(function (o) {
      var confere = filtroAtual === 'todas' || o.getAttribute('data-local') === filtroAtual;
      if (confere) contagem++;
      var mostra = confere && (filtroAtual !== 'todas' || expandido || contagem <= LIMITE);
      o.hidden = !mostra;
    });
    if (verMais) {
      var sobra = filtroAtual === 'todas' && !expandido && contagem > LIMITE;
      verMais.hidden = !sobra;
      verMais.setAttribute('aria-expanded', expandido ? 'true' : 'false');
    }
  }

  filtros.forEach(function (f) {
    f.addEventListener('click', function () {
      filtroAtual = f.getAttribute('data-filtro');
      filtros.forEach(function (g) { g.setAttribute('aria-pressed', g === f ? 'true' : 'false'); });
      aplicaFiltro();
    });
  });

  if (verMais) {
    verMais.addEventListener('click', function () {
      var antes = obras.filter(function (o) { return !o.hidden; }).length;
      expandido = true;
      aplicaFiltro();
      var novo = obras.filter(function (o) { return !o.hidden; })[antes];
      if (novo) {
        var b = novo.querySelector('.obra__abrir');
        if (b) b.focus({ preventScroll: true });
      }
    });
  }
  aplicaFiltro();

  /* ---------- visor de fotos ---------- */
  var visor = document.getElementById('visor');
  if (visor && galeria) {
    var vFigura = visor.querySelector('.visor__figura');
    var vImg = document.createElement('img');
    vImg.alt = '';
    vFigura.insertBefore(vImg, vFigura.firstChild);
    var vTitulo = visor.querySelector('figcaption strong');
    var vTexto = visor.querySelector('figcaption span');
    var lista = [];
    var posicao = 0;
    var origem = null;

    var exibe = function (i) {
      if (!lista.length) return;
      posicao = (i + lista.length) % lista.length;
      var item = lista[posicao];
      var foto = item.querySelector('img');
      vImg.src = foto.currentSrc || foto.src;
      vImg.alt = foto.alt;
      vTitulo.textContent = item.querySelector('h3').textContent;
      vTexto.textContent = item.querySelector('p').textContent;
    };

    galeria.addEventListener('click', function (e) {
      var botao = e.target.closest('.obra__abrir');
      if (!botao) return;
      var item = botao.closest('.obra');
      lista = obras.filter(function (o) { return !o.hidden; });
      origem = botao;
      if (typeof visor.showModal !== 'function') {
        window.open(item.querySelector('img').src, '_blank');
        return;
      }
      exibe(lista.indexOf(item));
      visor.showModal();
      document.documentElement.classList.add('travado');
    });

    visor.addEventListener('close', function () {
      document.documentElement.classList.remove('travado');
      if (origem) origem.focus({ preventScroll: true });
    });

    visor.addEventListener('click', function (e) {
      if (e.target.closest('[data-fechar]')) visor.close();
      else if (e.target.closest('[data-anterior]')) exibe(posicao - 1);
      else if (e.target.closest('[data-proxima]')) exibe(posicao + 1);
      else if (e.target === visor || e.target.classList.contains('visor__caixa')) visor.close();
    });

    visor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); exibe(posicao - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); exibe(posicao + 1); }
    });

    var toqueX = null;
    visor.addEventListener('touchstart', function (e) { toqueX = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener('touchend', function (e) {
      if (toqueX === null) return;
      var dx = e.changedTouches[0].clientX - toqueX;
      if (Math.abs(dx) > 50) exibe(posicao + (dx < 0 ? 1 : -1));
      toqueX = null;
    });
  }

  /* ---------- formulário: monta a mensagem e abre o WhatsApp ---------- */
  var form = document.getElementById('form-whats');
  if (form) {
    var campoNome = form.querySelector('#f-nome');
    var erroNome = document.getElementById('f-nome-erro');

    var limpaErro = function () {
      campoNome.removeAttribute('aria-invalid');
      erroNome.hidden = true;
    };

    campoNome.addEventListener('input', function () {
      if (campoNome.value.trim()) limpaErro();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = campoNome.value.trim();
      if (!nome) {
        campoNome.setAttribute('aria-invalid', 'true');
        erroNome.hidden = false;
        campoNome.focus();
        return;
      }
      limpaErro();

      var escolhido = form.querySelector('input[name="momento"]:checked');
      var local = form.querySelector('#f-local').value.trim();
      var mensagem = form.querySelector('#f-msg').value.trim();

      var linhas = ['Olá! Meu nome é ' + nome + ' e vim pelo site da OCCA.'];
      if (escolhido) linhas.push(escolhido.value + '.');
      if (local) linhas.push('Condomínio ou bairro: ' + local + '.');
      if (mensagem) linhas.push(mensagem);

      var url = 'https://wa.me/5586994576336?text=' + encodeURIComponent(linhas.join('\n'));
      var janela = window.open(url, '_blank');
      if (janela) janela.opener = null;
      else window.location.href = url;
    });
  }
})();
