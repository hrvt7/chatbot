export const metadata = {
  title: "ZöldRadar — Magyarország Zöld Pulzusa",
  description: "Interaktív környezeti intelligencia platform — levegőminőség, napenergia, EV töltők",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
