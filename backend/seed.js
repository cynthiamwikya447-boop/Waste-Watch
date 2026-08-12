import 'dotenv/config'
import { connectDB } from './config/db.js'
import { UserModel } from './models/User.js'
import { BinModel } from './models/Bin.js'

async function seed() {
  try {
    await connectDB()
  } catch (err) {
    console.error('\nCould not open/set up the SQLite database. Check backend/.env (DB_FILE) and make sure the process can write to that folder.\n')
    console.error(err.message)
    process.exit(1)
  }

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE } = process.env

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      '\nADMIN_EMAIL and ADMIN_PASSWORD are not set in your .env file.\n' +
        'Open backend/.env, fill in a REAL admin email and a strong password,\n' +
        'then run `npm run seed` again. Nothing was created.\n'
    )
    process.exit(1)
  }
  if (ADMIN_PASSWORD.length < 8) {
    console.error('\nADMIN_PASSWORD must be at least 8 characters. Nothing was created.\n')
    process.exit(1)
  }

  const existingAdmin = await UserModel.findByEmail(ADMIN_EMAIL.toLowerCase().trim())
  if (existingAdmin) {
    console.log(`An admin account already exists for ${ADMIN_EMAIL}. Skipping user creation.`)
  } else {
    await UserModel.create({
      name: ADMIN_NAME || 'Site Administrator',
      email: ADMIN_EMAIL.toLowerCase().trim(),
      password: ADMIN_PASSWORD,
      phone: ADMIN_PHONE || null,
      role: 'admin',
    })
    console.log(`Admin account created: ${ADMIN_EMAIL}`)
    console.log('You can now log in and use the Admin dashboard to create real collector accounts.')
  }

  // Sample bin infrastructure so the map/dashboard aren't empty on first run.
  // These are just physical bin locations, not user accounts - safe to seed.
  const existingBins = await BinModel.findAll()
  if (existingBins.length === 0) {
    const samples = [
      { bin_id: 'BIN-001', address: 'City Market Main Entrance', zone: 'CBD', lat: -1.2833, lng: 36.8167, fill_level: 45 },
      { bin_id: 'BIN-002', address: 'Bus Station Terminal A', zone: 'CBD', lat: -1.2864, lng: 36.8218, fill_level: 92 },
      { bin_id: 'BIN-003', address: 'Gikomba Market Section 1', zone: 'Eastlands', lat: -1.2833, lng: 36.8333, fill_level: 60 },
      { bin_id: 'BIN-004', address: 'Westlands Roundabout', zone: 'Westlands', lat: -1.2677, lng: 36.8121, fill_level: 20 },
    ]
    for (const bin of samples) {
      await BinModel.create(bin)
    }
    console.log('Sample bin locations created.')
  }

  console.log('\nSeed complete.')
  process.exit(0)
}

seed()
