import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Matching Event Ops Manager</h1>
        <div className="grid gap-4">
          <Link
            href="/events"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">管理画面</h2>
            <p className="text-gray-600">イベントの作成・管理、参加者の確認</p>
          </Link>
          <Link
            href="/public/events"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">公開ページ</h2>
            <p className="text-gray-600">イベント一覧と参加申込</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
