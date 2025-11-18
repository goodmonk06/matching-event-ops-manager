import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.application.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.event.deleteMany();

  console.log('✨ Cleared existing data');

  // Create Events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: '【20代限定】カジュアル婚活パーティー',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        location: '東京・恵比寿',
        capacity: 30,
        price: 5000,
        status: 'published',
      },
    }),
    prisma.event.create({
      data: {
        title: '【30代中心】大人の出会いパーティー',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        location: '東京・六本木',
        capacity: 40,
        price: 7000,
        status: 'published',
      },
    }),
    prisma.event.create({
      data: {
        title: '【趣味コン】アニメ＆ゲーム好き交流会',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        location: '東京・秋葉原',
        capacity: 25,
        price: 4500,
        status: 'published',
      },
    }),
    prisma.event.create({
      data: {
        title: '【高収入男性×20代女性】プレミアムパーティー',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
        location: '東京・銀座',
        capacity: 20,
        price: 10000,
        status: 'draft',
      },
    }),
    prisma.event.create({
      data: {
        title: '【バツイチ限定】再婚活応援パーティー',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago (completed)
        location: '東京・新宿',
        capacity: 30,
        price: 6000,
        status: 'completed',
      },
    }),
  ]);

  console.log(`✅ Created ${events.length} events`);

  // Create Participants
  const participants = await Promise.all([
    prisma.participant.create({
      data: {
        name: '佐藤花子',
        email: 'hanako.sato@example.com',
        gender: 'female',
        note: '初めての参加です。よろしくお願いします。',
      },
    }),
    prisma.participant.create({
      data: {
        name: '田中太郎',
        email: 'taro.tanaka@example.com',
        gender: 'male',
        note: 'アニメとゲームが大好きです。',
      },
    }),
    prisma.participant.create({
      data: {
        name: '鈴木美咲',
        email: 'misaki.suzuki@example.com',
        gender: 'female',
        note: '',
      },
    }),
    prisma.participant.create({
      data: {
        name: '高橋健',
        email: 'ken.takahashi@example.com',
        gender: 'male',
        note: '真剣に婚活しています。',
      },
    }),
    prisma.participant.create({
      data: {
        name: '伊藤あやか',
        email: 'ayaka.ito@example.com',
        gender: 'female',
        note: '友達に誘われて参加します。',
      },
    }),
    prisma.participant.create({
      data: {
        name: '山田拓也',
        email: 'takuya.yamada@example.com',
        gender: 'male',
        note: '',
      },
    }),
  ]);

  console.log(`✅ Created ${participants.length} participants`);

  // Create Applications
  const applications = await Promise.all([
    // Event 1 (20代限定) - 3 applications
    prisma.application.create({
      data: {
        eventId: events[0].id,
        participantId: participants[0].id,
        paymentStatus: 'paid',
        stripeSessionId: 'cs_test_demo_001',
      },
    }),
    prisma.application.create({
      data: {
        eventId: events[0].id,
        participantId: participants[1].id,
        paymentStatus: 'paid',
        stripeSessionId: 'cs_test_demo_002',
      },
    }),
    prisma.application.create({
      data: {
        eventId: events[0].id,
        participantId: participants[2].id,
        paymentStatus: 'pending',
        stripeSessionId: 'cs_test_demo_003',
      },
    }),

    // Event 2 (30代中心) - 2 applications
    prisma.application.create({
      data: {
        eventId: events[1].id,
        participantId: participants[3].id,
        paymentStatus: 'paid',
        stripeSessionId: 'cs_test_demo_004',
      },
    }),
    prisma.application.create({
      data: {
        eventId: events[1].id,
        participantId: participants[4].id,
        paymentStatus: 'paid',
        stripeSessionId: 'cs_test_demo_005',
      },
    }),

    // Event 3 (趣味コン) - 1 application
    prisma.application.create({
      data: {
        eventId: events[2].id,
        participantId: participants[1].id,
        paymentStatus: 'paid',
        stripeSessionId: 'cs_test_demo_006',
      },
    }),

    // Event 5 (completed event) - 4 applications
    prisma.application.create({
      data: {
        eventId: events[4].id,
        participantId: participants[0].id,
        paymentStatus: 'paid',
        stripeSessionId: 'cs_test_demo_007',
      },
    }),
    prisma.application.create({
      data: {
        eventId: events[4].id,
        participantId: participants[2].id,
        paymentStatus: 'paid',
        stripeSessionId: 'cs_test_demo_008',
      },
    }),
    prisma.application.create({
      data: {
        eventId: events[4].id,
        participantId: participants[3].id,
        paymentStatus: 'paid',
        stripeSessionId: 'cs_test_demo_009',
      },
    }),
    prisma.application.create({
      data: {
        eventId: events[4].id,
        participantId: participants[5].id,
        paymentStatus: 'paid',
        stripeSessionId: 'cs_test_demo_010',
      },
    }),
  ]);

  console.log(`✅ Created ${applications.length} applications`);

  console.log('\n📊 Seed Summary:');
  console.log(`  - Events: ${events.length}`);
  console.log(`  - Participants: ${participants.length}`);
  console.log(`  - Applications: ${applications.length}`);
  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
