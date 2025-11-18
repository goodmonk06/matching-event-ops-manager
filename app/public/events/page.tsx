'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

export default function PublicEventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: 'male' as const,
    note: '',
  });

  const { data: events, isLoading } = trpc.event.listPublished.useQuery();
  const createApplication = trpc.application.create.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    createApplication.mutate({
      eventId: selectedEvent,
      participant: formData,
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">イベント一覧</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ホームに戻る
          </Link>
        </div>

        {isLoading ? (
          <p>読み込み中...</p>
        ) : (
          <div className="grid gap-6">
            {events?.map((event) => (
              <div key={event.id} className="p-6 border rounded-lg bg-white shadow">
                <h2 className="text-2xl font-semibold mb-2">{event.title}</h2>
                <div className="mb-4 text-gray-600">
                  <p>日時: {new Date(event.date).toLocaleString('ja-JP')}</p>
                  <p>場所: {event.location}</p>
                  <p>定員: {event.capacity}人</p>
                  <p>価格: ¥{event.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedEvent(event.id);
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  このイベントに申し込む
                </button>
              </div>
            ))}
            {events?.length === 0 && (
              <p className="text-gray-600">現在公開中のイベントはありません</p>
            )}
          </div>
        )}

        {selectedEvent && (
          <div className="mt-12 p-6 border rounded-lg bg-white shadow">
            <h2 className="text-2xl font-semibold mb-4">参加申込フォーム</h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="block mb-2 font-medium">お名前</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">メールアドレス</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">性別</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })
                  }
                >
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium">備考（任意）</label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
              {createApplication.error && (
                <div className="p-3 bg-red-100 text-red-800 rounded">
                  エラー: {createApplication.error.message}
                </div>
              )}
              <button
                type="submit"
                disabled={createApplication.isPending}
                className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 font-semibold"
              >
                {createApplication.isPending ? '処理中...' : '支払いへ進む'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
