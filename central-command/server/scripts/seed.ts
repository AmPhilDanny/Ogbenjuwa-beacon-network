import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { lgas, wards, villages, users, alertTypes, alertContacts, resources, familyRegistry, patrolTeams, patrolMembers, alerts, incidents, announcements, siteSettings, apiKeys } from '../db/schema/index.js';

const PASSWORD = bcrypt.hashSync('Password123!', 10);

async function clearSeedData() {
  const tables = [
    'patrol_checkins', 'patrol_members', 'patrol_shifts', 'patrol_teams',
    'incident_evidence', 'incidents', 'alerts', 'alert_contacts', 'alert_types',
    'family_registry', 'resources', 'announcements', 'notifications', 'messages',
    'connections', 'resident_reports', 'sms_logs', 'file_uploads',
    'push_subscriptions', 'notification_preferences', 'audit_logs', 'api_keys',
    'villages', 'wards',
  ];
  for (const t of tables) {
    await db.execute(`DELETE FROM ${t}`);
  }
  await db.delete(users).where(sql`email LIKE '%@ogbenjuwa.local'`);
  await db.delete(siteSettings);
  await db.delete(lgas);
}

async function seed() {
  console.log('Clearing existing seed data...');
  await clearSeedData();

  // ── 9 LGAs ─────────────────────────────────────────────────────
  console.log('Seeding LGAs...');
  const lgaList: { name: string; code: string; state: string; region: string }[] = [
    { name: 'Ado', code: 'ADO', state: 'Benue', region: 'Idoma' },
    { name: 'Agatu', code: 'AGA', state: 'Benue', region: 'Idoma' },
    { name: 'Apa', code: 'APA', state: 'Benue', region: 'Idoma' },
    { name: 'Obi', code: 'OBI', state: 'Benue', region: 'Idoma' },
    { name: 'Ogbadibo', code: 'OGB', state: 'Benue', region: 'Idoma' },
    { name: 'Ohimini', code: 'OHI', state: 'Benue', region: 'Idoma' },
    { name: 'Oju', code: 'OJU', state: 'Benue', region: 'Idoma' },
    { name: 'Okpokwu', code: 'OKP', state: 'Benue', region: 'Idoma' },
    { name: 'Otukpo', code: 'OTU', state: 'Benue', region: 'Idoma' },
  ];
  const insertedLgas = await db.insert(lgas).values(lgaList).returning();

  const lgaMap: Record<string, string> = {};
  for (const l of insertedLgas) lgaMap[l.name] = l.id;

  // ── 24 Wards ───────────────────────────────────────────────────
  console.log('Seeding wards...');
  const wardData: { name: string; lgaName: string }[] = [
    { name: 'Agila', lgaName: 'Ado' },
    { name: 'Utonkon', lgaName: 'Ado' },
    { name: 'Igumale', lgaName: 'Ado' },
    { name: 'Ulayi', lgaName: 'Ado' },
    { name: 'Otukpa', lgaName: 'Ado' },
    { name: 'Agatu', lgaName: 'Agatu' },
    { name: 'Ochekwu', lgaName: 'Apa' },
    { name: 'Obi', lgaName: 'Obi' },
    { name: 'Orokam', lgaName: 'Ogbadibo' },
    { name: 'Otukpa', lgaName: 'Ogbadibo' }, // Note: different Otukpa in Ogbadibo
    { name: 'Owukpa', lgaName: 'Ogbadibo' },
    { name: 'Akpa', lgaName: 'Ohimini' },
    { name: 'Oglewu', lgaName: 'Ohimini' },
    { name: 'Onyan-Gede', lgaName: 'Ohimini' },
    { name: 'Igede', lgaName: 'Oju' },
    { name: 'Ito', lgaName: 'Oju' },
    { name: 'Uwokwu', lgaName: 'Oju' },
    { name: 'Edumoga', lgaName: 'Okpokwu' },
    { name: 'Ichama', lgaName: 'Okpokwu' },
    { name: 'Okpoga', lgaName: 'Okpokwu' },
    { name: 'Adoka', lgaName: 'Otukpo' },
    { name: 'Otukpo Rural', lgaName: 'Otukpo' },
    { name: 'Ugboju', lgaName: 'Otukpo' },
    { name: 'Otukpo Urban', lgaName: 'Otukpo' },
  ];
  const insertedWards = await db.insert(wards).values(
    wardData.map(w => ({ name: w.name, lgaId: lgaMap[w.lgaName] }))
  ).returning();

  // Build ward lookup by name
  const wardByName: Record<string, string[]> = {};
  for (const w of insertedWards) {
    if (!wardByName[w.name]) wardByName[w.name] = [];
    wardByName[w.name].push(w.id);
  }

  // ── Villages by LGA/ward ───────────────────────────────────────
  console.log('Seeding 934 villages...');
  const villageData: { name: string; wardName: string; lgaName: string }[] = [
    // Ado - Agila
    ...['Agbekpu','Agila','New Agila','Agwu','Ai-Amidu','Ai-Ogbola','Ai-Unazi','Aikpiliogwu','Aizu','Akpa Centre','Akpoge','Anjotsu','Anmeta','Efoha','Efofu','Ibende','Igbizi','Ikpeba','Ikpilogwu','Ivetse','Oda','Ogbegbera','Ogbilolo','Ogbokwu','Ogebee','Oglede','Oje Otaje','Okpakor','Okpatobo','Okwo','Onogwu','Opwa','Osalemu','Osudu','Ote-Ogbeche','Otokilo','Udegu','Udegu Urisi','Udegu-Ai-Osa-Kpoma','Udegu-Akpo','Udokwu-Agarada'].map(n => ({ name: n, wardName: 'Agila', lgaName: 'Ado' })),
    // Ado - Utonkon
    ...['Abey','Adaboa','Adochi','Atuolo','Ayaga','Efelo','Enjoji','Igba','Ijokoro','Ikpatene','Ikpomolokpo','Jalili','Ndekma','Ndogaba','Obe','Odurukwu','Ogedegi','Ogi','Ojenyo','Ojije','Okari','Okonoji','Okpudu','Okwasi','Olukpo','Osiloko','Rijo','Royongo','Udebo-Ukwonyo','Ugede','Ukwonyo','Unwege-Igba','Unweje-Rijo','Utonkon','Wunikpo','Wurechi'].map(n => ({ name: n, wardName: 'Utonkon', lgaName: 'Ado' })),
    // Ado - Igumale
    ...['Abakpa','Ai-Ameh','Ai-Ebiega','Ai-Onazi','Ai-Adaaka','Ai-Agbo','Elikizi','Etenyi','Igah','Igedde','Ijigbam','Ikponkpon','Ogbee','Ogongo','Olekwu','Osabo','Osipi','Osukpo','Oturukpo'].map(n => ({ name: n, wardName: 'Igumale', lgaName: 'Ado' })),
    // Ado - Ulayi
    ...['Abisunya','Achibila','Adegime','Agom','Ai-Oga','Ai-Okpam','Ebera','Efopfu','Ehaje','Ichesi','Idobi','Ijigboli','Ikpole','Ipole','Izigban','Ofunaga','Ogongo','Ojeba','Okpe','Omogwu','Ugbala','Ulayi'].map(n => ({ name: n, wardName: 'Ulayi', lgaName: 'Ado' })),
    // Ado - Otukpa
    ...['Otukpa Town'].map(n => ({ name: n, wardName: 'Otukpa', lgaName: 'Ado' })),
    // Agatu
    ...['Abalichi','Abogbe','Adagbo','Adana','Adum','Agbachi','Agbaduma','Aila','Aiyele-Igaisu','Akele','Akolo','Akpeko','Akwu','Ankpa','Ashama','Atakpa','Ayele','Ebete','Edeje','Egba','Egwuma','Ekwo','Elo','Engla','Enjima','Enogaje','Enugba','Ichogolugwu-Ogwule','Idahuna','Igagisu','Ikele-Gochi','Ikpele Ope','Ikpole','Obagaji','Obanowa','Odejo','Ogam','Ogbangede','Ogbaulu','Ogufa','Ogwule-Kaduna','Ogwule-Ugbaulu','Ogwule-Ugbokpo','Ogwumegbo','Ojomachi','Okeji','Okokolo','Okpachenyi','Okpagabi','Okpokoto','Olegoga','Olekochologba','Olobidu','Ologabulu','Ologobenyi','Olomachi','Omokwodi-Edeje','Onitsha','Onugbo','Oweto','Ugba','Ugboju-Ube','Ukadu','Usagbudu','Usha','Utugolugu'].map(n => ({ name: n, wardName: 'Agatu', lgaName: 'Agatu' })),
    // Apa - Ochekwu
    ...['Achaba','Adija','Ahija','Ajube-Icho','Ajugbe-Echaje','Akpaniho','Akpanta','Akpete','Akpoloko','Alifeti','Amoke','Angwa','Ankapli','Auke','Auke-Geri','Bapa','Ebukodo','Edikwu-Icho','Ekela','Ibadum','Idada','Iga-Okpaya','Iga-Ologbeche','Igoro','Ijaha','Ijege','Ikampu','Ikobi Ugbobi','Ikor','Imana','Inyapu','Jericho','Jos','Kaduna','Oba','Obinda','Obuleha','Ochenmo','Ochichi-Ologiri','Ochinchi-Olaji','Ochumekwu','Odejo','Ododo-Ajaje','Odugbeho','Odugbo','Ofoko','Ogbenegwu','Ogbonoko','Ogebe','Ogodo','Ogoduma','Ohoke','Oiji','Ojantele','Ojecho','Ojeke','Ojide','Ojuloko','Okpakachi','Okpeme','Okpoda','Okpokwu','Okwoho','Okwuji','Ola Kamonye','Oladu','Oleitodoakpa','Olekele','Olete','Olobaidu','Olodoga','Ologba','Oloja','Olojo-Utukugwu','Oloko-Angbo','Olufene','Omelemu','Omogidi','Opah','Opanda','Otakpa','Oye','Ugbokpo','Zauku'].map(n => ({ name: n, wardName: 'Ochekwu', lgaName: 'Apa' })),
    // Obi
    ...['Obi Town'].map(n => ({ name: n, wardName: 'Obi', lgaName: 'Obi' })),
    // Ogbadibo - Orokam
    ...['Adum-Oko','Ai-Ona','Efoma','Ejema','Enyajuru','Ibiladu','Ikemu','Imeyi','Ipole-Adupi','Ipole-Ako','Ipole-Iyiru','Ipole-Oko','Itesi','Leke','Obenda','Ocheje','Ogwurute','Okparigbo','Olaigbena','Ole-Igwu','Oleche','Orokam','Oture','Ugbagba-Ako','Ugbogidi','Ukalegu-Igwu','Ukporo'].map(n => ({ name: n, wardName: 'Orokam', lgaName: 'Ogbadibo' })),
    // Ogbadibo - Otukpa
    ...['Abache','Abo','Adepe','Adum','Agbafu','Ago','Aikwu','Akpagidigbo','Alagiranu','Ari-Engweewu','Court-Otukpa','Ebari','Ebudu','Efeche','Efekwo','Effion','Efocho','Efugo','Eha-Otukpa','Eke-Ekwute','Epe-Agbo','Epeilo','Epeilo-Ikpoyi','Idede','Idiri','Idodoloko','Ijadoja','Ikregi','Ipari','Ipichicha','Ipiga','Ipole Abo','Ipu-Ugbogbo','Ipuchicha','Obu','Oda','Odoba','Odwebe','Ofojo','Ogaje','Ogene','Ogonkwu','Okoncheta','Olabekpa','Olachagbaha','Oladu','Olagwuche','Olamago','Oloche','Onchegbi','Orido','Oto','Otukpa','Owoso','Ubiegi','Udegi','Ugbamaka','Ugbogwu','Ugbokpo','Ukwo','Umarichi','Zaria'].map(n => ({ name: n, wardName: 'Otukpa', lgaName: 'Ogbadibo' })),
    // Ogbadibo - Owukpa
    ...['Adu','Agira','Aiede','Aifam-Centre','Aiji','Alagarunu','Amejo','Anchimodo','Ankpa','Annachowga','Atamaka','Ati','Ebanna','Ebela','Ede','Eha-Uleke','Ehicho','Ehuhu','Ejaa','Ejule','Eke','Eke-Ai Odu','Eke-Akpa','Elugu','Epiege','Eru','Eyere','Eyupi','Ibagba','Ibiti','Idogobe','Iga-Uroko','Ikwo','Ipole','Ipole-Aifam','Ipole-Aiuja','Ipole-Ekere','Ipole-Owukpa','Iwewe','Iwewe-Aiodu','Oderigbo','Ogbata','Ogbonoko','Ogichigodi','Ogwurutee','Okpoto','Okpudu','Olempe-Ogicho','Oma','Onyirada','Owukpa','Owuruwuru','Ubafu','Ubenjira','Ubono','Ugbokpo','Ugbugbu','Ukalegwu','Uko','Uleke','Umafu'].map(n => ({ name: n, wardName: 'Owukpa', lgaName: 'Ogbadibo' })),
    // Ohimini - Akpa
    ...['Adankari','Adim','Ahanyo','Akwepa','Akwete','Allan','Atitio','Aturukpo','Egbla','Egbla Ndikwi','Egbla Nje','Ejo','Igbeji','Igbudeke','Isoo','Nachi','Obanyo','Odonto','Ofiloko','Ogwuche','Ogyoma','Ojigo','Okpenen','Omajaga','Omebe','Onyuwei','Otobi Camp'].map(n => ({ name: n, wardName: 'Akpa', lgaName: 'Ohimini' })),
    // Ohimini - Oglewu
    ...['Agbeke','Ai-Oga','Aigaji','Alagblanu','Amoda','Angue','Anwule','Atapa','Atlo','Awulema','Eboya','Ebu','Elulu','Enichi','Idabi','Ijaha','Ikila','Ochobo','Ochobo-Centre','Ojali','Ojano','Okete','Okete-Okpikwu','Olugbane','Omutelle','Onyepa','Otohia','Ukploko'].map(n => ({ name: n, wardName: 'Oglewu', lgaName: 'Ohimini' })),
    // Ohimini - Onyan-Gede
    ...['Abakpa','Adankali','Agwa','Ajegbe','Anmaji','Anonomi','Ehatope','Enyioji','Epideru','Idekpa','Ikpolle','Ipiga','Iyanya','Odega','Ogande','Ogodu','Ogofu','Ondo','Otoje','Ugene','Ugene-Icho','Ughoju Ega','Ukpobi-Echaje','Ukpobi-Ichoi'].map(n => ({ name: n, wardName: 'Onyan-Gede', lgaName: 'Ohimini' })),
    // Oju - Igede
    ...['Adum','Adum-Okete','Ainu-Ette','Ameka','Anchim','Andibilla','Anyadegwu','Anyone','Anyuwogbu','Atekpe','Ebonda','Edumoga','Ega','Eja','Ekoti','Ekpong','Epwa-Ibilla','Ibegi','Ibillalukpo','Ichacho','Ichakobe','Idajo','Ihulam','Ikachi','Ikomi','Imoho','Itega','Itikpala','Iyeche','Oba-Ogebe','Obachita','Obi','Obigwe','Obijegwu','Obohu','Oboru','Obotu','Obubu','Obuza','Ochimode','Ochodu','Odubo','Oga-Olowa','Ogengeng','Ogogo','Ohio','Ohirigwe','Ohoho','Ohuma','Okpodom','Ojinyi','Oju','Okakongo','Okete','Okileme','Okonche','Okpinya','Okpoma','Omope','Onyike','Opoan','Orihi','Oshirigwe','Otakini','Otakpi','Otunche','Owori-Obotu','Oyiwo','Uchenyum','Uchwo','Ugburu','Ukpa','Ukpila','Ukpute','Umoda','Utabiji','Wori-Obotu'].map(n => ({ name: n, wardName: 'Igede', lgaName: 'Oju' })),
    // Oju - Ito
    ...['Abelega','Abofutu','Adega','Adiko','Adodo','Adum West','Adum-East','Akiraba','Akunda','Ameka','Anchiomodoma','Any-Oko','Anyagwu','Anyichika','Ayoye','Ebong-Itogo','Echoro','Eewu','Ekingo','Igbegi','Igwe','Ijanke','Ijegwu','Ijokwe','Ikandiye','Ikiriye','Ikponyine','Ikwokwu','Inyuma','Ipinu-Adiko','Irabi','Itakpa','Ito','Itogo-Ekingo','Iyaho','Oba','Obigago','Ochinebe','Odeleko','Odiapa','Ogede','Ogilewu-Itogo','Ogoro','Ogwope','Ohehe','Ohuma','Ohuye','Ojantile','Ojegbe','Ojenya','Ojor','Ojuwo','Okpirikwu','Okpirikwu-Adum','Okpokwu','Okukukwu','Okuntegbe','Okwubi','Okwumaye','Otokwe','Owo','Owo-Adum','Oye-Obi','Oyinyi','Ubeke','Ubele','Udebor','Udegi','Ugbodom','Ukpuleru','Ukpute','Utugboji','Yeshewe'].map(n => ({ name: n, wardName: 'Ito', lgaName: 'Oju' })),
    // Oju - Uwokwu
    ...['Adodo','Adum','Alloma','Anwu','Arigede','Ebenta','Egbilla-Idella','Egbilla-Izzi','Ekpete','Enugu-Oye','Enurn','Esewa','Ibalakum','Idele','Ifator','Igbegi','Igbella','Igbilla','Igwe-Ette','Igwoke','Ikatakwe','Ikoku','Ikori','Inyuma','Irachi','Itafor','Itakeni','Iyator','Iyokolo','Obaogede','Obene','Obiladun','Odaleko','Ogaka','Ogege','Ogori','Ojokwe','Okekpo','Okochi','Okwurum','Orihi','Otukpo-Oye','Owori-Ipinu','Oye','Ubeke','Uda','Udogwu','Uje','Ukpute'].map(n => ({ name: n, wardName: 'Uwokwu', lgaName: 'Oju' })),
    // Okpokwu - Edumoga
    ...['A-Adabulu','Adum','Agamud','Agbangwe','Agila-Oladikwu','Aiagom','Aiede','Ajide','Akaga','Akpitodo-Akpaya','Akpodo','Akpuneje','Alaglanu','Amafu','Amoda Olengbecho','Aokete','Aokpaneg','Aokpasu','Aokpe','Atekpo','Ebo-Ya','Ebodahubi','Edkeajio','Efede-Aoi','Efffa','Effion','Efoyo','Ejema','Ekenobi','Engle','Gapo','Igama','Ijeha','Ipoya','Iwewe','Laionyes','Obotu-Ehaje','Obotu-Icho','Obulu','Odaba','Oduda','Ogblega','Ogblo','Ogbodo','Ogbulo','Ogene','Ogodum','Ogomotu','Ojigo','Ojapo','Okana','Okga-Ogodo','Okopolikpo-I','Okpafie','Okpale','Okpale-Otta','Okpilioho','Okpolikpo-Ehaje','Oladegbo','Olago','Olaidu','Olaioleje','Olanyega','Ollo','Omolokpo','Omusu','Opidlo','Opioli','Otada-Otutu','Otobi','Ugbokolo','Ugbokpo'].map(n => ({ name: n, wardName: 'Edumoga', lgaName: 'Okpokwu' })),
    // Okpokwu - Ichama
    ...['Acho','Adiga','Adiga Oyira','Ejaa','Ichana','Ipele-Ohebe','Ipole-Aiagbo','Ipole-Aiebega','Ipole-Aikpe','Ipole-Aiona','Iwewe-Ichama','Ode-Sasa','Odokpo','Ojocha','Ojoga','Oleayidu','Oma'].map(n => ({ name: n, wardName: 'Ichama', lgaName: 'Okpokwu' })),
    // Okpokwu - Okpoga
    ...['Agado','Agene','Ai-Anechi','Ai-Ochokpo','Aidogodo','Akpakpa','Amuju','Ede-Okpaga','Idiri','Idobe','Idoko-Aga','Ikonijo','Ogbaga','Ogwuche Akpa','Okadoga','Oklenyi','Okpoga','Okpudu','Olayi-Agbino'].map(n => ({ name: n, wardName: 'Okpoga', lgaName: 'Okpokwu' })),
    // Otukpo - Adoka
    ...['Abache','Adoka','Aibeli','Aichene','Aikolekwu','Aiobiduwa','Ajochoko','Alyeya','Anineju Ukwaba','Aukpa','Aune','Eeko','Ekantili','Ipole','Iwili','Obena','Ofiloko','Ogbago','Ogodum','Ogowu','Ojakpama','Ojanowa','Ojinebe','Oklenyi-Uga','Okpaflo','Okpannehe','Okpeje','Olakpoga','Olekpama','Oleogwoja','Oloke','Olokodeje','Onipi','Opah Adoka','Opah Aiokpetaa','Otada','Udabi','Uga','Ukplago','Umalichi','Umogidi','Upu'].map(n => ({ name: n, wardName: 'Adoka', lgaName: 'Otukpo' })),
    // Otukpo - Otukpo Rural
    ...['Adoka','Ajobe','Akpa','Akpachi-Ipepe','Akpachi-Ipole','Akpegede','Amla-Ehaje','Amla-Icho','Asa-Ehaje','Asa-Ehicho','Ebologba','Edikwu','Efa','Emichi','Idabi','Ife','Igbanonmaje','Ikobi','Ipakangwu','Itoo','Jericho','Obaganya','Odudaje','Ogome','Ojantelle','Okpamaju','Okpobeka','Olachinta','Olooja','Otada-Ehaje','Otada-Icho','Otobi-Otukpo','Otukpo-Icho','Otukpo-Nobi','Upu London','Upu-Icho'].map(n => ({ name: n, wardName: 'Otukpo Rural', lgaName: 'Otukpo' })),
    // Otukpo - Ugboju
    ...['Ai-Okpetu','Akpachi','Alaglanu','Angbier','Anwule','Aochemoche','Aokwu','Ebolo','Efeyi-Ankpa','Efeyi-Igbanonaje','Efeyi-Ipole','Emicho','Eyokpa','Ibaji','Ifete-Enumaje','Ifete-Ipana','Ifete-Olubie','Igahuwo','Igblagidi','Ipaha','Ipepe','Ipokpene','Ipolo-Ehaje','Ipolo-Ologbe','Ipom-Icho','Jericho','Obo','Obotu-Ehaje','Obotu-Icho','Odaubi','Oduda','Ofete-Olobele','Ofiloko','Ogobia','Ogoli','Ojegidigbe','Okoto','Okpligwu','Okwudu','Ola-Himu','Olegwaneku','Ombi-Ehaje','Ombi-Icho','Omulonye','Ona','Onaje','Owoto','Umalichi','Unwaba-Oju'].map(n => ({ name: n, wardName: 'Ugboju', lgaName: 'Otukpo' })),
    // Otukpo - Otukpo Urban
    ...['Otukpo Town'].map(n => ({ name: n, wardName: 'Otukpo Urban', lgaName: 'Otukpo' })),
  ];

  // Build village inserts with lat/lng approximations
  const lgaCoords: Record<string, { lat: number; lng: number }> = {
    Ado: { lat: 7.16, lng: 7.99 },
    Agatu: { lat: 7.71, lng: 8.11 },
    Apa: { lat: 7.00, lng: 8.24 },
    Obi: { lat: 7.44, lng: 8.33 },
    Ogbadibo: { lat: 7.25, lng: 7.95 },
    Ohimini: { lat: 7.42, lng: 8.05 },
    Oju: { lat: 6.85, lng: 8.42 },
    Okpokwu: { lat: 7.07, lng: 7.83 },
    Otukpo: { lat: 7.15, lng: 8.13 },
  };

  // Map ward names to IDs (handle duplicate ward names)
  function findWardId(wardName: string, lgaName: string): string {
    // Find the ward that belongs to this LGA
    const ward = insertedWards.find(w => {
      const wLga = insertedLgas.find(l => l.id === w.lgaId);
      return w.name === wardName && wLga?.name === lgaName;
    });
    return ward?.id || insertedWards[0].id;
  }

  const villageRows = villageData.map(v => {
    const center = lgaCoords[v.lgaName] || { lat: 7.15, lng: 8.13 };
    const lat = center.lat + (Math.random() - 0.5) * 0.1;
    const lng = center.lng + (Math.random() - 0.5) * 0.1;
    return {
      name: v.name,
      lgaId: lgaMap[v.lgaName],
      wardId: findWardId(v.wardName, v.lgaName),
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
      population: Math.floor(Math.random() * 500) + 50,
      isActive: true,
    };
  });
  await db.insert(villages).values(villageRows);

  // ── 5 Users ────────────────────────────────────────────────────
  console.log('Seeding users...');
  const userData = [
    { name: 'Daniel Ochoche', email: 'daniel@ogbenjuwa.local', role: 'super_admin', phone: '+2348034412290', lgaId: lgaMap['Otukpo'] },
    { name: 'Oche Agbo', email: 'oche.agbo@ogbenjuwa.local', role: 'lga_coordinator', phone: '+2348123456789', lgaId: lgaMap['Agatu'] },
    { name: 'Adah Ogiri', email: 'adah.ogiri@ogbenjuwa.local', role: 'vigilante_leader', phone: '+2348065432109', lgaId: lgaMap['Apa'] },
    { name: 'Mama Ojoma', email: 'mama.ojoma@ogbenjuwa.local', role: 'community_admin', phone: '+2348056789012', lgaId: lgaMap['Ohimini'] },
    { name: 'Godwin Ibe', email: 'godwin.ibe@ogbenjuwa.local', role: 'resident', phone: '+2348162345678', lgaId: lgaMap['Otukpo'] },
  ];
  const insertedUsers = await db.insert(users).values(
    userData.map(u => ({ ...u, password: PASSWORD, isActive: true }))
  ).returning();

  const userMap: Record<string, string> = {};
  for (const u of insertedUsers) userMap[u.email] = u.id;

  // ── 5 Alert Types ──────────────────────────────────────────────
  console.log('Seeding alert types...');
  await db.insert(alertTypes).values([
    { key: 'attack', label: 'Armed Attack', labelIdoma: 'Ufele', icon: '⚔️', color: '#DC2626', smsTemplate: '🚨 OGBENJUWA ALERT: Armed attack reported near {v}. Warriors dispatched. Seek shelter.' },
    { key: 'fire', label: 'Fire Outbreak', labelIdoma: 'Ole', icon: '🔥', color: '#EA580C', smsTemplate: '🔥 OGBENJUWA ALERT: Fire outbreak reported at {v}. Evacuate the area.' },
    { key: 'medical', label: 'Medical Emergency', labelIdoma: 'Ochere', icon: '🏥', color: '#8B5CF6', smsTemplate: '🏥 OGBENJUWA ALERT: Medical emergency at {v}. Warrior medics dispatched.' },
    { key: 'abduction', label: 'Abduction Report', labelIdoma: 'Ofa', icon: '🚷', color: '#B45309', smsTemplate: '🚷 OGBENJUWA ALERT: Abduction reported near {v}. Warriors on the move.' },
    { key: 'other', label: 'Other / Unknown', labelIdoma: 'Obu Ofu', icon: '⚠️', color: '#6B7280', smsTemplate: '⚠️ OGBENJUWA ALERT: Incident reported at {v}. Warriors alerted.' },
  ]);

  // ── 5 Alert Contacts ──────────────────────────────────────────
  console.log('Seeding alert contacts...');
  await db.insert(alertContacts).values([
    { name: 'Daniel Ochoche', phone: '+2348034412290', lgaId: lgaMap['Otukpo'], isActive: true, createdBy: Object.values(userMap)[0] },
    { name: 'Oche Agbo', phone: '+2348123456789', lgaId: lgaMap['Agatu'], isActive: true, createdBy: Object.values(userMap)[0] },
    { name: 'Adah Ogiri', phone: '+2348065432109', lgaId: lgaMap['Apa'], isActive: true, createdBy: Object.values(userMap)[0] },
    { name: 'Mama Ojoma', phone: '+2348056789012', lgaId: lgaMap['Ohimini'], isActive: true, createdBy: Object.values(userMap)[0] },
    { name: 'Godwin Ibe', phone: '+2348162345678', lgaId: lgaMap['Otukpo'], isActive: true, createdBy: Object.values(userMap)[0] },
  ]);

  // ── 5 Resources ───────────────────────────────────────────────
  console.log('Seeding resources...');
  const resourceData = [
    { type: 'medical', name: 'FMC Otukpo', lgaId: lgaMap['Otukpo'], lat: 7.148, lng: 8.135, capacity: 200, occupied: 156, phone: '+23444234567' },
    { type: 'shelter', name: "St. John's Camp", lgaId: lgaMap['Agatu'], lat: 7.71, lng: 8.108, capacity: 300, occupied: 247, phone: '+2348034412291' },
    { type: 'water', name: 'Oglewu Borehole', lgaId: lgaMap['Agatu'], lat: 7.702, lng: 8.115, capacity: 5000, occupied: 3200 },
    { type: 'food', name: 'Otukpo Food Bank', lgaId: lgaMap['Otukpo'], lat: 7.145, lng: 8.128, capacity: 1000, occupied: 640, phone: '+2348034412292' },
    { type: 'shelter', name: 'Igumale IDP Camp', lgaId: lgaMap['Apa'], lat: 7.005, lng: 8.23, capacity: 500, occupied: 412 },
  ];
  await db.insert(resources).values(resourceData);

  // ── 5 Family Registry Entries ─────────────────────────────────
  console.log('Seeding family registry...');
  await db.insert(familyRegistry).values([
    { name: 'Ene Ojoma Adakole', age: 50, gender: 'F', lgaId: lgaMap['Agatu'], village: 'Oglewu', status: 'at_camp', camp: "St. John's Camp", registeredBy: Object.values(userMap)[0] },
    { name: 'Ene Ojoma', age: 52, gender: 'F', lgaId: lgaMap['Apa'], village: 'Igumale', status: 'searching', registeredBy: Object.values(userMap)[0] },
    { name: 'Oche Sunday Agbo', age: 34, gender: 'M', lgaId: lgaMap['Otukpo'], village: 'Otukpo', status: 'reunified', registeredBy: Object.values(userMap)[0] },
    { name: 'Adah Ochoche', age: 28, gender: 'F', lgaId: lgaMap['Ado'], village: 'Otukpa', status: 'searching', registeredBy: Object.values(userMap)[0] },
    { name: 'Godwin Ibe Oche', age: 45, gender: 'M', lgaId: lgaMap['Otukpo'], village: 'Otukpo', status: 'at_camp', camp: 'Igumale IDP Camp', registeredBy: Object.values(userMap)[0] },
  ]);

  // ── 5 Patrol Teams ────────────────────────────────────────────
  console.log('Seeding patrol teams...');
  const now = new Date();
  const teamData = [
    { name: 'Otukpo Ward 1 Watch', lgaId: lgaMap['Otukpo'], leaderId: Object.values(userMap)[1] },
    { name: 'Agatu Riverine Patrol', lgaId: lgaMap['Agatu'], leaderId: Object.values(userMap)[2] },
    { name: 'Apa Border Security', lgaId: lgaMap['Apa'], leaderId: Object.values(userMap)[2] },
    { name: 'Ohimini Community Guard', lgaId: lgaMap['Ohimini'], leaderId: Object.values(userMap)[3] },
    { name: 'Otukpo Central Patrol', lgaId: lgaMap['Otukpo'], leaderId: Object.values(userMap)[1] },
  ];
  const insertedTeams = await db.insert(patrolTeams).values(teamData).returning();

  for (const team of insertedTeams) {
    await db.insert(patrolMembers).values([
      { teamId: team.id, userId: Object.values(userMap)[0], role: 'leader' },
      { teamId: team.id, userId: Object.values(userMap)[1], role: 'member' },
      { teamId: team.id, userId: Object.values(userMap)[2], role: 'member' },
    ]);
  }

  // ── 5 Alerts ──────────────────────────────────────────────────
  console.log('Seeding alerts...');
  await db.insert(alerts).values([
    { title: 'Suspicious Vehicle Reported', type: 'security', severity: 'medium', status: 'active', lgaId: lgaMap['Otukpo'], location: 'Otukpo Main Market', description: 'White Nissan van seen idling for over 30 minutes near market entrance.', isPublic: true, reportedBy: Object.values(userMap)[4] },
    { title: 'Fire Outbreak at Market', type: 'fire', severity: 'high', status: 'active', lgaId: lgaMap['Agatu'], location: 'Obagaji Market', description: 'Fire reported at the main market. Emergency services responding.', isPublic: true, reportedBy: Object.values(userMap)[1] },
    { title: 'Medical Emergency', type: 'medical', severity: 'critical', status: 'active', lgaId: lgaMap['Apa'], location: 'Igumale Health Centre', description: 'Multiple casualties from road accident near Igumale junction.', isPublic: false, reportedBy: Object.values(userMap)[2] },
    { title: 'Missing Child Report', type: 'security', severity: 'medium', status: 'active', lgaId: lgaMap['Ohimini'], location: 'Oglewu', description: '10-year-old boy missing since morning. Last seen near the borehole.', isPublic: true, reportedBy: Object.values(userMap)[3] },
    { title: 'Flood Warning', type: 'environmental', severity: 'high', status: 'monitoring', lgaId: lgaMap['Otukpo'], location: 'Otukpo Lowland Areas', description: 'Heavy rainfall expected. Low-lying areas advised to prepare for evacuation.', isPublic: true, reportedBy: Object.values(userMap)[0] },
  ]);

  // ── 5 Incidents ───────────────────────────────────────────────
  console.log('Seeding incidents...');
  await db.insert(incidents).values([
    { title: 'Armed Robbery at Otukpo', description: 'Armed robbery at a filling station. Suspects escaped.', status: 'open', severity: 'high', lgaId: lgaMap['Otukpo'], location: 'Otukpo Town', reportedBy: Object.values(userMap)[0] },
    { title: 'Cult Clash in Agatu', description: 'Suspected cult clash resulting in injuries.', status: 'investigating', severity: 'high', lgaId: lgaMap['Agatu'], location: 'Obagaji', reportedBy: Object.values(userMap)[1] },
    { title: 'Domestic Fire', description: 'Kitchen fire spread to two adjacent homes.', status: 'open', severity: 'medium', lgaId: lgaMap['Apa'], location: 'Igumale', reportedBy: Object.values(userMap)[2] },
    { title: 'Land Dispute', description: 'Communal land dispute between two families escalating.', status: 'monitoring', severity: 'low', lgaId: lgaMap['Ohimini'], location: 'Oglewu', reportedBy: Object.values(userMap)[3] },
    { title: 'Hit and Run', description: 'Driver struck pedestrian and fled the scene.', status: 'open', severity: 'medium', lgaId: lgaMap['Otukpo'], location: 'Otukpo-Agatu Road', reportedBy: Object.values(userMap)[4] },
  ]);

  // ── 5 Announcements ───────────────────────────────────────────
  console.log('Seeding announcements...');
  await db.insert(announcements).values([
    { title: 'Ward Security Meeting', content: 'Community safety meeting at Otukpo Local Govt Hall this Saturday 10AM.', lgaId: lgaMap['Otukpo'], isPublished: true, createdBy: Object.values(userMap)[0] },
    { title: 'Market Day Security', content: 'Extra patrols deployed during market days. Stay vigilant.', lgaId: lgaMap['Agatu'], isPublished: true, createdBy: Object.values(userMap)[1] },
    { title: 'New Patrol Roster', content: 'Night patrol schedule changed. Check the new roster at the ward office.', lgaId: lgaMap['Apa'], isPublished: true, createdBy: Object.values(userMap)[2] },
    { title: 'Community Clean-up', content: 'Community clean-up exercise this Saturday. All hands needed.', lgaId: lgaMap['Ohimini'], isPublished: true, createdBy: Object.values(userMap)[3] },
    { title: 'Siren Test Notice', content: 'Weekly siren test scheduled for tomorrow at 10AM. Do not panic.', lgaId: lgaMap['Otukpo'], isPublished: true, createdBy: Object.values(userMap)[4] },
  ]);

  // ── Site Settings ─────────────────────────────────────────────
  console.log('Seeding site settings...');
  await db.insert(siteSettings).values({
    siteName: 'Ogbenjuwa',
    tagline: 'Community-Led Safety Network for the Idoma Region',
    logoUrl: null,
    faviconUrl: null,
    primaryColor: '#166534',
    secondaryColor: '#15803D',
    accentColor: '#22C55E',
    fontFamily: 'Inter, sans-serif',
    emailContact: 'info@ogbenjuwa.org',
    phoneContact: '+2348034412290',
    address: 'Otukpo, Benue State, Nigeria',
    socialLinks: { facebook: '#', twitter: '#', instagram: '#' },
    heroHeading: 'Protecting Our Communities',
    heroSubheading: 'Ogbenjuwa Early Warning System',
    heroDescription: 'Ogbenjuwa is an early-warning and emergency response platform for the Idoma Region, Benue State. Sub-2-minute alerting across 9 LGAs — no smartphone required.',
    heroCtaText: 'Launch Alert Demo',
    metaDescription: 'Ogbenjuwa - Community-led safety network for the Idoma region of Benue State, Nigeria.',
  });

  // ── API Key ───────────────────────────────────────────────────
  console.log('Seeding API key...');
  await db.insert(apiKeys).values({
    name: 'Beacon-Network Integration',
    key: 'ogb_sk_beacon_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
    layer: 'beacon-network',
    permissions: ['alerts_read', 'alerts_write', 'patrols_read', 'resources_read'],
    isActive: true,
    createdBy: Object.values(userMap)[0],
  });

  console.log('✓ Seed complete!');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
