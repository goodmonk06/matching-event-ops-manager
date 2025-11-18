'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

export default function EventsPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    capacity: '',
    price: '',
    status: 'draft' as const,
  });

  const utils = trpc.useUtils();
  const { data: events, isLoading } = trpc.event.list.useQuery();
  const createEvent = trpc.event.create.useMutation({
    onSuccess: () => {
      utils.event.list.invalidate();
      setShowForm(false);
      setFormData({
        title: '',
        date: '',
        location: '',
        capacity: '',
        price: '',
        status: 'draft',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent.mutate({
      title: formData.title,
      date: formData.date,
      location: formData.location,
      capacity: parseInt(formData.capacity),
      price: parseInt(formData.price),
      status: formData.status,
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">イベント管理</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ホームに戻る
          </Link>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showForm ? 'フォームを閉じる' : '新規イベント作成'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded-lg bg-white">
            <h2 className="text-2xl font-semibold mb-4">新規イベント</h2>
            <div className="grid gap-4">
              <div>
                <label className="block mb-2 font-medium">タイトル</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">日時</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">場所</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">定員</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">価格（円）</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">ステータス</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
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
              <button
                type="submit"
                disabled={createEvent.isPending}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {createEvent.isPending ? '作成中...' : '作成'}
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <p>読み込み中...</p>
        ) : (
          <div className="grid gap-4">
            {events?.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">{event.title}</h2>
                    <p className="text-gray-600">
                      {new Date(event.date).toLocaleString('ja-JP')}
                    </p>
                    <p className="text-gray-600">{event.location}</p>
                    <p className="text-gray-600">
                      定員: {event._count.applications}/{event.capacity}
                    </p>
                    <p className="text-gray-600">価格: ¥{event.price.toLocaleString()}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      event.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : event.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {event.status === 'published'
                      ? '公開'
                      : event.status === 'draft'
                      ? '下書き'
                      : event.status === 'cancelled'
                      ? '中止'
                      : '完了'}
                  </span>
                </div>
              </Link>
            ))}
            {events?.length === 0 && (
              <p className="text-gray-600">イベントがありません</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
