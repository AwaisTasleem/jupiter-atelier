export const scroll = { p: 0 };

export function startScrollTracking() {
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scroll.p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  return () => {
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  };
}