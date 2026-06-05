const mysql = require('mysql2/promise')

const staticPackages = [
  { slug: 'team-tuft', name: 'Team Tuft', location: 'Memnagar Studio', city: 'Ahmedabad', startTime: '11:00', price: 4500, seatCapacity: 20, status: 'active', notes: 'Seeded from static package data. Range 10-20. ~3 hrs. At our studio.' },
  { slug: 'office-popup', name: 'Office Pop-Up', location: 'Your office', city: 'Ahmedabad', startTime: '15:00', price: 5500, seatCapacity: 50, status: 'active', notes: 'Seeded from static package data. Range 15-50. 3-4 hrs. Onsite setup.' },
  { slug: 'brand-rug', name: 'Brand Rug', location: 'Studio or office', city: 'Ahmedabad', startTime: '16:30', price: 65000, seatCapacity: 25, status: 'active', notes: 'Seeded from static package data. Collaborative statement piece.' },
]

function nextDate(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

;(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  })

  for (let i = 0; i < staticPackages.length; i++) {
    const p = staticPackages[i]
    const workshopDate = nextDate(7 + i * 7)

    await conn.query(
      `INSERT INTO campaigns
        (slug, name, location, city, workshop_date, start_time, price_pp, seat_capacity, status, notes)
       VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        location = VALUES(location),
        city = VALUES(city),
        price_pp = VALUES(price_pp),
        seat_capacity = VALUES(seat_capacity),
        status = VALUES(status),
        notes = VALUES(notes),
        updated_at = CURRENT_TIMESTAMP`,
      [p.slug, p.name, p.location, p.city, workshopDate, p.startTime, p.price, p.seatCapacity, p.status, p.notes],
    )
  }

  const [rows] = await conn.query(
    `SELECT id, slug, name, location, city, DATE_FORMAT(workshop_date, '%Y-%m-%d') AS workshopDate,
            DATE_FORMAT(start_time, '%H:%i') AS startTime, price_pp, seat_capacity, status
     FROM campaigns
     WHERE slug IN ('team-tuft', 'office-popup', 'brand-rug')
     ORDER BY FIELD(slug, 'team-tuft', 'office-popup', 'brand-rug')`,
  )

  console.log('SEEDED_STATIC_PACKAGES', rows)
  await conn.end()
})().catch((e) => {
  console.error('SEED_STATIC_PACKAGES_ERROR', e.code || '', e.message)
  process.exit(1)
})
