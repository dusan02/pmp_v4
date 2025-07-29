import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Sample data for testing
  const sampleData = [
    {
      ticker: 'AAPL',
      preMarketPrice: 205.14,
      closePrice: 210.00,
      percentChange: -2.31,
      marketCapDiff: -42.00,
    },
    {
      ticker: 'MSFT',
      preMarketPrice: 415.50,
      closePrice: 420.00,
      percentChange: -1.07,
      marketCapDiff: -35.00,
    },
    {
      ticker: 'NVDA',
      preMarketPrice: 125.75,
      closePrice: 120.00,
      percentChange: 4.79,
      marketCapDiff: 58.00,
    },
  ]

  for (const data of sampleData) {
    await prisma.priceSnapshot.create({
      data: {
        ...data,
        createdAt: new Date()
      }
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 