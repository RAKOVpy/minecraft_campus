(function () {
  "use strict";
  var cfg = window.SITE_CONFIG || {};
  var DEFAULT_NAME = "Наш сервер";

  // 1. Подставляем настройки из config.js
  if (cfg.name && cfg.name !== DEFAULT_NAME) {
    document.title = document.title.split(DEFAULT_NAME).join(cfg.name);
  }
  document.querySelectorAll("[data-config]").forEach(function (el) {
    var value = cfg[el.getAttribute("data-config")];
    if (value) el.textContent = value;
  });

  // Ссылки, которые зависят от настроек: показываем ссылку или запасной текст
  document.querySelectorAll("[data-config-link]").forEach(function (el) {
    var url = cfg[el.getAttribute("data-config-link")];
    var fallback = el.parentNode.querySelector("[data-config-fallback='" + el.getAttribute("data-config-link") + "']");
    if (url) {
      el.setAttribute("href", url);
      el.hidden = false;
      if (fallback) fallback.hidden = true;
    } else {
      el.hidden = true;
      if (fallback) fallback.hidden = false;
    }
  });

  // 2. Кнопки «Скопировать»
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy") ? resolve() : reject();
      } catch (e) {
        reject(e);
      }
      document.body.removeChild(area);
    });
  }

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    var label = button.textContent;
    button.addEventListener("click", function () {
      var key = button.getAttribute("data-copy");
      var text = cfg[key] || (document.querySelector("[data-config='" + key + "']") || {}).textContent || "";
      copyText(text.trim()).then(
        function () { button.textContent = "Скопировано"; },
        function () { button.textContent = "Не вышло — выделите вручную"; }
      ).then(function () {
        setTimeout(function () { button.textContent = label; }, 2200);
      });
    });
  });

  // 3. Оглавление обучения: подсвечиваем раздел, который сейчас на экране
  var toc = document.querySelector(".toc");
  // на телефоне оглавление свёрнуто, на широком экране — всегда открыто сбоку
  if (toc && window.matchMedia("(max-width: 1039px)").matches) toc.open = false;
  if (toc && "IntersectionObserver" in window) {
    var links = {};
    toc.querySelectorAll("a[href^='#']").forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });
    var current = null;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var link = links[entry.target.id];
          if (!link) return;
          if (current) current.removeAttribute("aria-current");
          link.setAttribute("aria-current", "true");
          current = link;
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }
})();
