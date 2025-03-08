import ClientLayout from "./ClientLayout"; // New Client Component

export const metadata = {
  title: "LMS",
  description: "Next.js LMS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
