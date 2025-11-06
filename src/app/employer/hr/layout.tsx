// Бүх HR хуудсуудыг dynamic болгох
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-16 lg:pt-0">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}