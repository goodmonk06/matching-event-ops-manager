'use client';

import { use } from 'react';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const utils = trpc.useUtils();
  const { data: event, isLoading } = trpc.event.getById.useQuery({ id });
  const updateStatus = trpc.event.updateStatus.useMutation({
    onSuccess: () => {
      utils.event.getById.invalidate({ id });
      utils.event.list.invalidate();
    },
  });

  const handleExportCSV = () => {
    if (!event?.applications) return;

    const headers = ['申込ID', '参加者名', 'メール', '性別', '支払いステータス', '申込日時'];
    const rows = event.applications.map((app) => [
      app.id,
      app.participant.name,
      app.participant.email,
      app.participant.gender === 'male' ? '男性' : app.participant.gender === 'female' ? '女性' : 'その他',
      app.paymentStatus === 'paid' ? '支払済' : app.paymentStatus === 'pending' ? '未払い' : app.paymentStatus === 'cancelled' ? 'キャンセル' : '返金済',
      new Date(app.createdAt).toLocaleString('ja-JP'),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title}_参加者一覧.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen p-8">
        <p>イベントが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{event.title}</h1>
          <Link
            href="/events"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            イベント一覧に戻る
          </Link>
        </div>

        <div className="mb-8 p-6 border rounded-lg bg-white">
          <h2 className="text-2xl font-semibold mb-4">イベント情報</h2>
          <div className="grid gap-2">
            <p>
              <span className="font-medium">日時:</span>{' '}
              {new Date(event.date).toLocaleString('ja-JP')}
            </p>
            <p>
              <span className="font-medium">場所:</span> {event.location}
            </p>
            <p>
              <span className="font-medium">定員:</span> {event.capacity}人
            </p>
            <p>
              <span className="font-medium">現在の申込数:</span> {event.applications.length}人
            </p>
            <p>
              <span className="font-medium">価格:</span> ¥{event.price.toLocaleString()}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <span className="font-medium">ステータス:</span>
              <select
                className="px-3 py-2 border rounded"
                value={event.status}
                onChange={(e) =>
                  updateStatus.mutate({
                    id: event.id,
                    status: e.target.value as 'draft' | 'published' | 'cancelled' | 'completed',
                  })
                }
              >
                <option value="draft">下書き</option>
                <option value="published">公開</option>
                <option value="cancelled">中止</option>
                <option value="completed">完了</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">参加者一覧 ({event.applications.length}人)</h2>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              CSVエクスポート
            </button>
          </div>

          {event.applications.length === 0 ? (
            <p className="text-gray-600">まだ参加者がいません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">参加者名</th>
                    <th className="border p-2 text-left">メール</th>
                    <th className="border p-2 text-left">性別</th>
                    <th className="border p-2 text-left">備考</th>
                    <th className="border p-2 text-left">支払いステータス</th>
                    <th className="border p-2 text-left">申込日時</th>
                  </tr>
                </thead>
                <tbody>
                  {event.applications.map((app) => (
                    <tr key={app.id}>
                      <td className="border p-2">{app.participant.name}</td>
                      <td className="border p-2">{app.participant.email}</td>
                      <td className="border p-2">
                        {app.participant.gender === 'male'
                          ? '男性'
                          : app.participant.gender === 'female'
                          ? '女性'
                          : 'その他'}
                      </td>
                      <td className="border p-2">{app.participant.note || '-'}</td>
                      <td className="border p-2">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            app.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : app.paymentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : app.paymentStatus === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {app.paymentStatus === 'paid'
                            ? '支払済'
                            : app.paymentStatus === 'pending'
                            ? '未払い'
                            : app.paymentStatus === 'cancelled'
                            ? 'キャンセル'
                            : '返金済'}
                        </span>
                      </td>
                      <td className="border p-2">
                        {new Date(app.createdAt).toLocaleString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
