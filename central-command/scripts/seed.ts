import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import bcrypt from 'bcryptjs';
import * as schema from '../server/db/schema/index.js';
import { IDOMA_LGAS } from './idoma-data.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const queryClient = postgres(DATABASE_URL, { max: 5 });
const db = drizzle(queryClient, { schema });

const SEED_EMAIL_DOMAIN = 'ogbenjuwa.local';

async function truncateAll() {
  const tables = [
    'patrol_checkins', 'patrol_shifts', 'patrol_members', 'patrol_teams',
    'incident_evidence', 'incidents', 'alerts', 'announcements', 'messages',
    'notifications', 'connections', 'resident_reports', 'sms_logs',
    'alert_contacts', 'family_registry', 'resources', 'villages', 'wards', 'lgas',
    'api_keys', 'audit_logs', 'sos_signals', 'sessions', 'site_settings',
    'alert_types',
  ];
  for (const table of tables) {
    try { await queryClient.unsafe(`DELETE FROM "${table}"`); } catch {}
  }
  await queryClient.unsafe(`DELETE FROM users WHERE email LIKE '%@${SEED_EMAIL_DOMAIN}'`);
}

async function seed() {
  console.log('\n🌱 Seeding Ogbenjuwa database with real Idoma data...\n');

  // ── 0. Clean slate ──────────────────────────────────────────────────
  console.log('Clearing existing seed data...');
  await truncateAll();
  console.log('  ✓ Done\n');

  // ── 1. LGAs + Wards + Villages ──────────────────────────────────────
  console.log('Seeding LGAs, wards, and villages...');
  const lgaIdMap = new Map<string, string>();
  const wardIdMap = new Map<string, string>();

  for (const lgaData of IDOMA_LGAS) {
    const [lga] = await db.insert(schema.lgas).values({
      name: lgaData.name,
      code: lgaData.code,
      state: 'Benue',
      region: lgaData.region,
      coverageTarget: 80,
      isActive: true,
    }).returning();
    lgaIdMap.set(lgaData.name, lga.id);

    for (const wardData of lgaData.wards) {
      const [ward] = await db.insert(schema.wards).values({
        name: wardData.name,
        lgaId: lga.id,
        isActive: true,
      }).returning();
      wardIdMap.set(`${lgaData.name}:${wardData.name}`, ward.id);

      if (wardData.villages.length > 0) {
        await db.insert(schema.villages).values(
          wardData.villages.map(v => ({
            name: v.trim(),
            lgaId: lga.id,
            wardId: ward.id,
            isActive: true,
          }))
        );
      }
    }
  }

  let totalVillages = 0;
  for (const lga of IDOMA_LGAS) {
    for (const ward of lga.wards) totalVillages += ward.villages.length;
  }
  console.log(`  ✓ ${IDOMA_LGAS.length} LGAs, ${IDOMA_LGAS.reduce((s, l) => s + l.wards.length, 0)} wards, ${totalVillages}+ villages seeded\n`);

  // ── 2. Sample Users (5 — deletable via @ogbenjuwa.local) ────────────
  console.log('Seeding sample users...');
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const usersData = [
    { name: 'Daniel Ochoche', email: `daniel@${SEED_EMAIL_DOMAIN}`, role: 'super_admin' as const, phone: '+2348034412290', lga: 'Otukpo' },
    { name: 'Oche Agbo', email: `oche.agbo@${SEED_EMAIL_DOMAIN}`, role: 'lga_coordinator' as const, phone: '+2348123456789', lga: 'Agatu' },
    { name: 'Adah Ogiri', email: `adah.ogiri@${SEED_EMAIL_DOMAIN}`, role: 'vigilante_leader' as const, phone: '+2348065432109', lga: 'Apa' },
    { name: 'Mama Ojoma', email: `mama.ojoma@${SEED_EMAIL_DOMAIN}`, role: 'community_admin' as const, phone: '+2348157890123', lga: 'Ohimini' },
    { name: 'Godwin Ibe', email: `godwin.ibe@${SEED_EMAIL_DOMAIN}`, role: 'resident' as const, phone: '+2347056789012', lga: 'Otukpo' },
  ];

  const userIdMap = new Map<string, string>();
  for (const u of usersData) {
    const lgaId = lgaIdMap.get(u.lga)!;
    const [user] = await db.insert(schema.users).values({
      name: u.name,
      email: u.email,
      passwordHash,
      phone: u.phone,
      role: u.role,
      lgaId,
      isActive: true,
    }).returning();
    userIdMap.set(u.name, user.id);
    console.log(`  ✓ ${u.name.padEnd(20)} ${u.role.padEnd(18)} ${u.email}`);
  }
  console.log('  (All users use password: Password123!)\n');

  // ── 3. Alert Types (5) ──────────────────────────────────────────────
  console.log('Seeding alert types...');
  const alertTypesData = [
    { key: 'attack', label: 'Armed Attack', labelIdoma: 'Ufele', icon: '⚔️', color: '#DC2626', smsTemplate: '🚨 OGBENJUWA ALERT: Armed attack reported near {v}. Warriors dispatched. Seek shelter.' },
    { key: 'fire', label: 'Fire Outbreak', labelIdoma: 'Ole', icon: '🔥', color: '#EA580C', smsTemplate: '🔥 OGBENJUWA ALERT: Fire outbreak reported at {v}. Evacuate the area.' },
    { key: 'medical', label: 'Medical Emergency', labelIdoma: 'Ochere', icon: '🏥', color: '#8B5CF6', smsTemplate: '🏥 OGBENJUWA ALERT: Medical emergency at {v}. Warrior medics dispatched.' },
    { key: 'abduction', label: 'Abduction Report', labelIdoma: 'Ofa', icon: '🚷', color: '#B45309', smsTemplate: '🚷 OGBENJUWA ALERT: Abduction reported near {v}. Warriors on the move.' },
    { key: 'other', label: 'Other / Unknown', labelIdoma: 'Obu Ofu', icon: '⚠️', color: '#6B7280', smsTemplate: '⚠️ OGBENJUWA ALERT: Incident reported at {v}. Warriors alerted.' },
  ];

  await db.insert(schema.alertTypes).values(
    alertTypesData.map(at => ({
      key: at.key,
      label: at.label,
      labelIdoma: at.labelIdoma,
      icon: at.icon,
      color: at.color,
      smsTemplate: at.smsTemplate,
      isActive: true,
    }))
  );
  console.log('  ✓ 5 alert types seeded\n');

  // ── 4. Alert Contacts (5) ───────────────────────────────────────────
  console.log('Seeding alert contacts...');
  const superAdminId = userIdMap.get('Daniel Ochoche')!;
  const contactsData = [
    { name: 'Mama Ojoma', phone: '+2348034412290', village: 'Oglewu', lga: 'Ohimini' },
    { name: 'Oche Agbo', phone: '+2348123456789', village: 'Obagaji', lga: 'Agatu' },
    { name: 'Adah Ogiri', phone: '+2348065432109', village: 'Igumale', lga: 'Apa' },
    { name: 'Sunday Oche', phone: '+2348157890123', village: 'Otukpa', lga: 'Ado' },
    { name: 'Ene Adamu', phone: '+2347056789012', village: 'Okpoga', lga: 'Okpokwu' },
  ];

  for (const c of contactsData) {
    const lgaId = lgaIdMap.get(c.lga)!;
    await db.insert(schema.alertContacts).values({
      name: c.name,
      phone: c.phone,
      village: c.village,
      lgaId,
      createdBy: superAdminId,
      isActive: true,
    });
  }
  console.log('  ✓ 5 alert contacts seeded\n');

  // ── 5. Resources (5) ────────────────────────────────────────────────
  console.log('Seeding resources...');
  const superAdminId2 = userIdMap.get('Daniel Ochoche')!;
  const resourcesData = [
    { type: 'medical' as const, name: 'FMC Otukpo', lga: 'Otukpo', capacity: 200, occupied: 156, phone: '+2348031234567' },
    { type: 'shelter' as const, name: "St. John's Camp", lga: 'Agatu', capacity: 300, occupied: 247 },
    { type: 'water' as const, name: 'Oglewu Borehole', lga: 'Ohimini', capacity: 5000, occupied: 3200 },
    { type: 'food' as const, name: 'Otukpo Food Bank', lga: 'Otukpo', capacity: 1000, occupied: 640 },
    { type: 'shelter' as const, name: 'Igumale IDP Camp', lga: 'Apa', capacity: 500, occupied: 412 },
  ];

  for (const r of resourcesData) {
    const lgaId = lgaIdMap.get(r.lga)!;
    await db.insert(schema.resources).values({
      type: r.type,
      name: r.name,
      lgaId,
      capacity: r.capacity,
      occupied: r.occupied,
      phone: (r as any).phone || null,
      isActive: true,
    });
  }
  console.log('  ✓ 5 resources seeded\n');

  // ── 6. Family Registry (5 entries) ──────────────────────────────────
  console.log('Seeding family registry...');
  const familyData = [
    { name: 'Ene Ojoma Adakole', age: 50, gender: 'F' as const, lga: 'Agatu', village: 'Oglewu', status: 'at_camp' as const, camp: "St. John's Camp" },
    { name: 'Oche Sunday Agbo', age: 34, gender: 'M' as const, lga: 'Otukpo', village: 'Otukpo', status: 'reunified' as const },
    { name: 'Adah Ochoche', age: 28, gender: 'F' as const, lga: 'Ado', village: 'Otukpa', status: 'searching' as const },
    { name: 'Godwin Ibe Oche', age: 45, gender: 'M' as const, lga: 'Otukpo', village: 'Oturkpo', status: 'at_camp' as const, camp: 'Igumale IDP Camp' },
    { name: 'Patience Oche', age: 32, gender: 'F' as const, lga: 'Ohimini', village: 'Oglewu', status: 'searching' as const },
  ];

  for (const f of familyData) {
    const lgaId = lgaIdMap.get(f.lga)!;
    await db.insert(schema.familyRegistry).values({
      name: f.name,
      age: f.age,
      gender: f.gender,
      lgaId,
      village: f.village,
      status: f.status,
      camp: (f as any).camp || null,
      registeredBy: superAdminId,
    });
  }
  console.log('  ✓ 5 family entries seeded\n');

  // ── 7. Patrol Teams (2) ─────────────────────────────────────────────
  console.log('Seeding patrol teams...');
  const patrolData = [
    { name: 'Otukpo Alpha Team', lga: 'Otukpo', leader: 'Oche Agbo' },
    { name: 'Agatu Rapid Response', lga: 'Agatu', leader: 'Adah Ogiri' },
  ];

  for (const p of patrolData) {
    const lgaId = lgaIdMap.get(p.lga)!;
    const leaderId = userIdMap.get(p.leader)!;
    await db.insert(schema.patrolTeams).values({
      name: p.name,
      lgaId,
      leaderId,
      memberCount: 3,
      isActive: true,
    });
  }
  console.log('  ✓ 2 patrol teams seeded\n');

  // ── 8. Site Settings ────────────────────────────────────────────────
  console.log('Seeding site settings...');
  await db.insert(schema.siteSettings).values({
    siteName: 'Ogbenjuwa',
    tagline: 'Community Security & Safety Platform',
    primaryColor: '#1e40af',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    fontFamily: 'Inter, sans-serif',
    heroHeading: 'Community Security & Safety Network',
    heroSubheading: 'Warriors protecting the Idoma Region',
    heroDescription: 'An early-warning and emergency response platform for the Idoma Region, Benue State. Sub-2-minute alerting across 9 LGAs — no smartphone required.',
    heroCtaText: 'Live Demo',
    heroCtaLink: '/login',
    heroSecondaryCtaText: 'Patrol Map',
    heroSecondaryCtaLink: '/patrol',
    metaDescription: 'Ogbenjuwa Community Safety Network — Warriors protecting the Idoma Region, Benue State, Nigeria. Early warning and emergency response platform.',
    metaKeywords: 'Ogbenjuwa, community safety, Idoma, Benue, Nigeria, emergency alert, vigilante, patrol',
    footerText: 'Warriors protecting the Idoma Region, Benue State, Nigeria.',
    updatedBy: superAdminId,
  });
  console.log('  ✓ Default site settings seeded\n');

  // ── 9. Sample Announcements (3) ─────────────────────────────────────
  console.log('Seeding announcements...');
  const announceData = [
    { title: 'Community Security Meeting', body: 'Town hall meeting this Saturday at the central market. All residents welcome.', lga: 'Otukpo' },
    { title: 'Patrol Schedule Update', body: 'Night patrols have been increased. Please stay indoors after 10 PM.', lga: 'Agatu' },
    { title: 'New Emergency Contact Line', body: 'A new emergency hotline (199) is now active for all Idoma LGAs.', lga: null },
  ];

  for (const a of announceData) {
    await db.insert(schema.announcements).values({
      title: a.title,
      body: a.body,
      lgaId: a.lga ? lgaIdMap.get(a.lga)! : null,
      createdBy: superAdminId,
      isPublished: true,
      publishedAt: new Date(),
    });
  }
  console.log('  ✓ 3 announcements seeded\n');

  // ── 10. Sample Alerts (3) ──────────────────────────────────────────
  console.log('Seeding sample alerts...');
  const alertsData = [
    { type: 'attack', severity: 'high' as const, title: 'Suspicious Movement Reported near Obagaji market', lga: 'Agatu', status: 'active' as const },
    { type: 'fire', severity: 'medium' as const, title: 'Bushfire reported near Otukpo main road', lga: 'Otukpo', status: 'investigating' as const },
    { type: 'medical', severity: 'low' as const, title: 'Medical assistance requested in Igumale community', lga: 'Apa', status: 'active' as const },
  ];

  for (const a of alertsData) {
    const lgaId = lgaIdMap.get(a.lga)!;
    await db.insert(schema.alerts).values({
      type: a.type,
      severity: a.severity,
      title: a.title,
      lgaId,
      reportedBy: superAdminId,
      status: a.status,
      isPublic: true,
    });
  }
  console.log('  ✓ 3 sample alerts seeded\n');

  // ── 11. API Key ──────────────────────────────────────────────────────
  console.log('Seeding default API key...');
  const keyHash = await bcrypt.hash('ogb_seed_dev_key_placeholder', 10);
  await db.insert(schema.apiKeys).values({
    name: 'Beacon Network Dev Key',
    keyPrefix: 'ogb_seed_dev',
    keyHash,
    layer: 'layer1',
    permissions: ['alerts:read', 'alerts:write', 'patrols:read'],
    isActive: true,
    createdBy: superAdminId,
  });
  console.log('  ✓ Default API key seeded\n');

  // ── Summary ─────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════');
  console.log('  ✅ Seed complete!');
  console.log('═══════════════════════════════════════════════\n');
  console.log('  Login credentials:');
  console.log('  ─────────────────────────────────────────────────────────');
  console.log('  daniel@ogbenjuwa.local     │ super_admin        │ Password123!');
  console.log('  oche.agbo@ogbenjuwa.local  │ lga_coordinator    │ Password123!');
  console.log('  adah.ogiri@ogbenjuwa.local │ vigilante_leader   │ Password123!');
  console.log('  mama.ojoma@ogbenjuwa.local │ community_admin    │ Password123!');
  console.log('  godwin.ibe@ogbenjuwa.local │ resident           │ Password123!');
  console.log('');
  console.log('  To delete all seed data:');
  console.log(`  DELETE FROM users WHERE email LIKE '%@${SEED_EMAIL_DOMAIN}' (cascades to related data)\n`);

  await queryClient.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
