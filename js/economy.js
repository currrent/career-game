window.GameEconomy = {
  clickValue: 1,
  maxOfflineSeconds: 8 * 60 * 60,
  format(value) {
    const n = Math.floor(value || 0);
    if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.00$/,"") + " млрд";
    if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.00$/,"") + " млн";
    if (n >= 1e4) return Math.round(n).toLocaleString("ru-RU");
    return n.toLocaleString("ru-RU");
  },
  money(value) { return this.format(value) + " ₽"; },
  cost(base, owned) { return Math.ceil(base * Math.pow(1.16, owned)); }
};
