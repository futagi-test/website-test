// モバイルメニューの開閉
(function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // メニュー内リンクをタップしたら閉じる
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
})();

// スクロールでヘッダーの透過/不透明を切り替え
(function () {
  var header = document.querySelector('.header');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// スクロール時に要素をふわっと表示
(function () {
  document.documentElement.classList.add('js-enabled');

  var targets = [
    '.band',
    '.news__head',
    '.news__item',
    '.section__head',
    '.card',
    '.reason',
    '.flow__step',
    '.plan',
    '.plans__note',
    '.about__body',
    '.about__info',
    '.office-gallery',
    '.greeting__person',
    '.greeting__body',
    '.cta__inner',
    '.article h2',
    '.article h3',
    '.article p:not(.article__lead)',
    '.article__list li'
  ].join(',');

  var elements = Array.prototype.slice.call(document.querySelectorAll(targets));
  if (!elements.length) return;

  elements.forEach(function (el) {
    el.classList.add('js-reveal');
  });

  document.querySelectorAll('.about__body,.greeting__person').forEach(function (el) {
    el.setAttribute('data-reveal', 'left');
  });
  document.querySelectorAll('.about__info,.greeting__body').forEach(function (el) {
    el.setAttribute('data-reveal', 'right');
  });
  document.querySelectorAll('.card,.plan,.reason,.flow__step').forEach(function (el) {
    el.setAttribute('data-reveal', 'scale');
  });

  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  elements.forEach(function (el) { observer.observe(el); });
})();

// ===== 最終調整：タイトル下波線を幅100％・右→左に1回だけ波打たせる =====
(function(){
  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function(){
    var heads = Array.prototype.slice.call(document.querySelectorAll('.section__head, .about__body, .greeting__body'));
    if(!heads.length) return;

    var W = 1400;
    var H = 48;
    var baseAmp = 4.8;
    var basePhase = .72;
    var baseY = 20;

    function waveD(amp, phase, shift){
      var step = 56;
      var d = '';
      for(var x=0; x<=W; x+=step){
        var n = x / W;
        var y = baseY + (shift || 0)
          + Math.sin(n * Math.PI * 2.05 + phase) * amp
          + Math.sin(n * Math.PI * 4.2 + phase * .62) * amp * .14;
        if(x === 0){
          d = 'M' + x + ',' + y.toFixed(2);
        }else{
          var px = x - step;
          var pn = px / W;
          var py = baseY + (shift || 0)
            + Math.sin(pn * Math.PI * 2.05 + phase) * amp
            + Math.sin(pn * Math.PI * 4.2 + phase * .62) * amp * .14;
          var cx = x - step / 2;
          d += ' C' + cx + ',' + py.toFixed(2) + ' ' + cx + ',' + y.toFixed(2) + ' ' + x + ',' + y.toFixed(2);
        }
      }
      return d;
    }

    function createWave(i){
      var ns = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns,'svg');
      svg.setAttribute('class','title-wave-svg');
      svg.setAttribute('viewBox','0 0 '+W+' '+H);
      svg.setAttribute('preserveAspectRatio','none');
      svg.setAttribute('aria-hidden','true');

      var defs = document.createElementNS(ns,'defs');
      var grad = document.createElementNS(ns,'linearGradient');
      var id = 'titleWaveGradient' + i;
      grad.setAttribute('id', id);
      grad.setAttribute('x1','0%'); grad.setAttribute('y1','0%');
      grad.setAttribute('x2','100%'); grad.setAttribute('y2','0%');
      [['0%','#00a98f'],['52%','#35d39a'],['100%','#9be15d']].forEach(function(s){
        var stop = document.createElementNS(ns,'stop');
        stop.setAttribute('offset',s[0]);
        stop.setAttribute('stop-color',s[1]);
        grad.appendChild(stop);
      });
      defs.appendChild(grad);
      svg.appendChild(defs);

      var soft = document.createElementNS(ns,'path');
      soft.setAttribute('class','title-wave-soft');
      soft.setAttribute('d', waveD(3.1, 1.38, 6));
      svg.appendChild(soft);

      var path = document.createElementNS(ns,'path');
      path.setAttribute('class','title-wave-path');
      path.setAttribute('stroke','url(#'+id+')');
      path.style.stroke = 'url(#' + id + ')';
      path.setAttribute('d', waveD(baseAmp, basePhase, 0));
      svg.appendChild(path);
      return {svg:svg,path:path,soft:soft};
    }

    var items = [];
    heads.forEach(function(head,i){
      var title = head.querySelector('.section__title');
      if(!title) return;
      // 既存のタイトル波線があれば除去して二重表示を防ぐ
      var old = head.querySelector('.title-wave-svg');
      if(old) old.remove();
      var wave = createWave(i);
      title.insertAdjacentElement('afterend', wave.svg);
      items.push({head:head,path:wave.path,soft:wave.soft,running:false,inView:false});
    });

    function easeInOutSine(t){ return -(Math.cos(Math.PI * t) - 1) / 2; }

    function animate(item){
      if(item.running) return;
      item.running = true;
      var duration = 3600;
      var start = performance.now();
      var softBaseAmp = 3.1;
      var softBasePhase = 1.38;
      var softBaseShift = 6;

      function tick(now){
        var p = Math.min((now - start) / duration, 1);
        var e = easeInOutSine(p);
        // 右→左へ1回だけ流れる。phaseを2π進めるため、終了形は開始形と完全一致する。
        var phaseMove = Math.PI * 2 * e;
        var pulse = Math.sin(Math.PI * e);
        var amp = baseAmp + pulse * 9.5;
        var phase = basePhase + phaseMove;
        var shift = pulse * 2.8;
        var softAmp = softBaseAmp + pulse * 5.5;
        var softPhase = softBasePhase + phaseMove;
        var softShift = softBaseShift + pulse * 1.6;

        if(p >= 1){
          item.path.setAttribute('d', waveD(baseAmp, basePhase, 0));
          item.soft.setAttribute('d', waveD(softBaseAmp, softBasePhase, softBaseShift));
          item.running = false;
          return;
        }
        item.path.setAttribute('d', waveD(amp, phase, shift));
        item.soft.setAttribute('d', waveD(softAmp, softPhase, softShift));
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          var item = items.find(function(v){ return v.head === entry.target; });
          if(!item) return;
          if(entry.isIntersecting){
            if(!item.inView){
              item.inView = true;
              animate(item);
            }
          }else{
            // 画面外に出たら再入場時にもう一度だけ動く
            item.inView = false;
          }
        });
      }, {threshold:.28, rootMargin:'0px 0px -6% 0px'});
      items.forEach(function(item){ io.observe(item.head); });
    }else{
      items.forEach(function(item){ animate(item); });
    }
  });
})();

// 電話番号ポップアップ
(function(){
  var modal = document.getElementById('phoneModal');
  if(!modal) return;
  var openers = document.querySelectorAll('.phone-modal-open');
  var closers = modal.querySelectorAll('[data-phone-close]');
  function openModal(){
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
  }
  openers.forEach(function(btn){ btn.addEventListener('click', openModal); });
  closers.forEach(function(btn){ btn.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });
})();

// スマホ縦長：ヒーロー内の相談ボタンと固定ボタンの重なりを避ける
(function(){
  var hero = document.querySelector('.hero');
  var floating = document.querySelector('.floating-cta');
  if (!hero || !floating || !('IntersectionObserver' in window)) return;
  var observer = new IntersectionObserver(function(entries){
    floating.classList.toggle('hero-in-view', entries[0].isIntersecting);
  });
  observer.observe(hero);
})();
// 宛先のコピー（メールは自動送信しません）
document.querySelectorAll('[data-copy-email]').forEach(function(button){
  button.addEventListener('click',async function(){
    var box=button.closest('.contact-email');
    var status=box.querySelector('.contact-email__status');
    try{
      await navigator.clipboard.writeText('info@yahaba-sharoushi.com');
      status.textContent='メールアドレスをコピーしました。';
    }catch(error){
      var selection=window.getSelection();
      var range=document.createRange();
      range.selectNodeContents(box.querySelector('.contact-email__address'));
      selection.removeAllRanges();selection.addRange(range);
      status.textContent='アドレスを選択しました。コピーしてご利用ください。';
    }
  });
});