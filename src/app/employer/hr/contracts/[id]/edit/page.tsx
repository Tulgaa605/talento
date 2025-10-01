import EditContractClient from './EditContractClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Next.js 15 — params нь Promise байх тул өргөн төрөлтэй авна
type PageProps = {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ params }: PageProps) {
  const p = await params;
  const rawId = p.id;
  const id = Array.isArray(rawId) ? rawId[0]! : (rawId as string | undefined);
  if (!id) throw new Error('Missing id');

  return <EditContractClient id={id} />;
}
