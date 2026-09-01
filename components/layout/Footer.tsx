export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3.5 border-t border-white/8 px-[5vw] py-8 text-[0.82rem] text-cream-dim opacity-55 light:border-line light:text-ink-dim light:opacity-100">
      <div>Sunset · Encontre e compartilhe o melhor pôr do sol</div>
      <div>&copy; {new Date().getFullYear()}</div>
    </footer>
  );
}
