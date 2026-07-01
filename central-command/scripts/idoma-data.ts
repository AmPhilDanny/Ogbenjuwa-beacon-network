// Verified Idoma geographic data from Idoma communities.txt
// Sources: IdomaLand.org, Wikipedia "Idoma people", Wikipedia "List of villages in Benue State"

export interface VillageData { name: string; wardName: string; }
export interface LgaSeedData {
  name: string;
  code: string;
  state: string;
  region: string;
  headquarters: string;
  language: string;
  dialect: string;
  wards: { name: string; villages: string[] }[];
}

export const IDOMA_LGAS: LgaSeedData[] = [
  {
    name: 'Ado', code: 'ADO', state: 'Benue', region: 'Southern Idoma',
    headquarters: 'Otukpa', language: 'Idoma', dialect: 'Southern Idoma',
    wards: [
      { name: 'Agila', villages: 'Agbekpu; Agila; New Agila; Agwu; Ai-Amidu; Ai-Ogbola; Ai-Unazi; Aikpiliogwu; Aizu; Akpa Centre; Akpoge; Anjotsu; Anmeta; Efoha; Efofu; Ibende; Igbizi; Ikpeba; Ikpilogwu; Ivetse; Oda; Ogbegbera; Ogbilolo; Ogbokwu; Ogebee; Oglede; Oje Otaje; Okpakor; Okpatobo; Okwo; Onogwu; Opwa; Osalemu; Osudu; Ote-Ogbeche; Otokilo; Udegu; Udegu Urisi; Udegu-Ai-Osa-Kpoma; Udegu-Akpo; Udokwu-Agarada'.split('; ').map(s => s.trim()) },
      { name: 'Utonkon', villages: 'Abey; Adaboa; Adochi; Atuolo; Ayaga; Efelo; Enjoji; Igba; Ijokoro; Ikpatene; Ikpomolokpo; Jalili; Ndekma; Ndogaba; Obe; Odurukwu; Ogedegi; Ogi; Ojenyo; Ojije; Okari; Okonoji; Okpudu; Okwasi; Olukpo; Osiloko; Rijo; Royongo; Udebo-Ukwonyo; Ugede; Ukwonyo; Unwege-Igba; Unweje-Rijo; Utonkon; Wunikpo; Wurechi'.split('; ').map(s => s.trim()) },
      { name: 'Igumale', villages: 'Abakpa; Ai-Ameh; Ai-Ebiega; Ai-Onazi; Ai-Adaaka; Ai-Agbo; Elikizi; Etenyi; Igah; Igedde; Ijigbam; Ikponkpon; Ogbee; Ogongo; Olekwu; Osabo; Osipi; Osukpo; Oturukpo'.split('; ').map(s => s.trim()) },
      { name: 'Ulayi', villages: 'Abisunya; Achibila; Adegime; Agom; Ai-Oga; Ai-Okpam; Ebera; Efopfu; Ehaje; Ichesi; Idobi; Ijigboli; Ikpole; Ipole; Izigban; Ofunaga; Ogongo; Ojeba; Okpe; Omogwu; Ugbala; Ulayi'.split('; ').map(s => s.trim()) },
      { name: 'Otukpa', villages: ['Otukpa Town'] },
    ],
  },
  {
    name: 'Agatu', code: 'AGA', state: 'Benue', region: 'Northern Idoma',
    headquarters: 'Obagaji', language: 'Idoma', dialect: 'Northern Idoma',
    wards: [
      { name: 'Agatu', villages: 'Abalichi; Abogbe; Adagbo; Adana; Adum; Agbachi; Agbaduma; Aila; Aiyele-Igaisu; Akele; Akolo; Akpeko; Akwu; Ankpa; Ashama; Atakpa; Ayele; Ebete; Edeje; Egba; Egwuma; Ekwo; Elo; Engla; Enjima; Enogaje; Enugba; Ichogolugwu-Ogwule; Idahuna; Igagisu; Ikele-Gochi; Ikpele Ope; Ikpole; Obagaji; Obanowa; Odejo; Ogam; Ogbangede; Ogbaulu; Ogufa; Ogwule-Kaduna; Ogwule-Ugbaulu; Ogwule-Ugbokpo; Ogwumegbo; Ojomachi; Okeji; Okokolo; Okpachenyi; Okpagabi; Okpokoto; Olegoga; Olekochologba; Olobidu; Ologabulu; Ologobenyi; Olomachi; Omokwodi-Edeje; Onitsha; Onugbo; Oweto; Ugba; Ugboju-Ube; Ukadu; Usagbudu; Usha; Utugolugu'.split('; ').map(s => s.trim()) },
    ],
  },
  {
    name: 'Apa', code: 'APA', state: 'Benue', region: 'Northern Idoma',
    headquarters: 'Igumale', language: 'Idoma', dialect: 'Northern Idoma',
    wards: [
      { name: 'Ochekwu', villages: 'Achaba; Adija; Ahija; Ajube-Icho; Ajugbe-Echaje; Akpaniho; Akpanta; Akpete; Akpoloko; Alifeti; Amoke; Angwa; Ankapli; Auke; Auke-Geri; Bapa; Ebukodo; Edikwu-Icho; Ekela; Ibadum; Idada; Iga-Okpaya; Iga-Ologbeche; Igoro; Ijaha; Ijege; Ikampu; Ikobi Ugbobi; Ikor; Imana; Inyapu; Jericho; Jos; Kaduna; Oba; Obinda; Obuleha; Ochenmo; Ochichi-Ologiri; Ochinchi-Olaji; Ochumekwu; Odejo; Ododo-Ajaje; Odugbeho; Odugbo; Ofoko; Ogbenegwu; Ogbonoko; Ogebe; Ogodo; Ogoduma; Ohoke; Oiji; Ojantele; Ojecho; Ojeke; Ojide; Ojuloko; Okpakachi; Okpeme; Okpoda; Okpokwu; Okwoho; Okwuji; Ola Kamonye; Oladu; Oleitodoakpa; Olekele; Olete; Olobaidu; Olodoga; Ologba; Oloja; Olojo-Utukugwu; Oloko-Angbo; Olufene; Omelemu; Omogidi; Opah; Opanda; Otakpa; Oye; Ugbokpo; Zauku'.split('; ').map(s => s.trim()) },
    ],
  },
  {
    name: 'Obi', code: 'OBI', state: 'Benue', region: 'Igede',
    headquarters: 'Obi', language: 'Igede', dialect: 'Igede',
    wards: [
      { name: 'Obi', villages: ['Obi Town'] },
    ],
  },
  {
    name: 'Ogbadibo', code: 'OGB', state: 'Benue', region: 'Western Idoma',
    headquarters: 'Orokam', language: 'Idoma', dialect: 'Western Idoma',
    wards: [
      { name: 'Orokam', villages: 'Adum-Oko; Ai-Ona; Efoma; Ejema; Enyajuru; Ibiladu; Ikemu; Imeyi; Ipole-Adupi; Ipole-Ako; Ipole-Iyiru; Ipole-Oko; Itesi; Leke; Obenda; Ocheje; Ogwurute; Okparigbo; Olaigbena; Ole-Igwu; Oleche; Orokam; Oture; Ugbagba-Ako; Ugbogidi; Ukalegu-Igwu; Ukporo'.split('; ').map(s => s.trim()) },
      { name: 'Otukpa', villages: 'Abache; Abo; Adepe; Adum; Agbafu; Ago; Aikwu; Akpagidigbo; Alagiranu; Ari-Engweewu; Court-Otukpa; Ebari; Ebudu; Efeche; Efekwo; Effion; Efocho; Efugo; Eha-Otukpa; Eke-Ekwute; Epe-Agbo; Epeilo; Epeilo-Ikpoyi; Idede; Idiri; Idodoloko; Ijadoja; Ikregi; Ipari; Ipichicha; Ipiga; Ipole Abo; Ipu-Ugbogbo; Ipuchicha; Obu; Oda; Odoba; Odwebe; Ofojo; Ogaje; Ogene; Ogonkwu; Okoncheta; Olabekpa; Olachagbaha; Oladu; Olagwuche; Olamago; Oloche; Onchegbi; Orido; Oto; Otukpa; Owoso; Ubiegi; Udegi; Ugbamaka; Ugbogwu; Ugbokpo; Ukwo; Umarichi; Zaria'.split('; ').map(s => s.trim()) },
      { name: 'Owukpa', villages: 'Adu; Agira; Aiede; Aifam-Centre; Aiji; Alagarunu; Amejo; Anchimodo; Ankpa; Annachowga; Atamaka; Ati; Ebanna; Ebela; Ede; Eha-Uleke; Ehicho; Ehuhu; Ejaa; Ejule; Eke; Eke-Ai Odu; Eke-Akpa; Elugu; Epiege; Eru; Eyere; Eyupi; Ibagba; Ibiti; Idogobe; Iga-Uroko; Ikwo; Ipole; Ipole-Aifam; Ipole-Aiuja; Ipole-Ekere; Ipole-Owukpa; Iwewe; Iwewe-Aiodu; Oderigbo; Ogbata; Ogbonoko; Ogichigodi; Ogwurutee; Okpoto; Okpudu; Olempe-Ogicho; Oma; Onyirada; Owukpa; Owuruwuru; Ubafu; Ubenjira; Ubono; Ugbokpo; Ugbugbu; Ukalegwu; Uko; Uleke; Umafu'.split('; ').map(s => s.trim()) },
    ],
  },
  {
    name: 'Ohimini', code: 'OHI', state: 'Benue', region: 'Central Idoma',
    headquarters: 'Oglewu', language: 'Idoma', dialect: 'Central Idoma',
    wards: [
      { name: 'Akpa', villages: 'Adankari; Adim; Ahanyo; Akwepa; Akwete; Allan; Atitio; Aturukpo; Egbla; Egbla Ndikwi; Egbla Nje; Ejo; Igbeji; Igbudeke; Isoo; Nachi; Obanyo; Odonto; Ofiloko; Ogwuche; Ogyoma; Ojigo; Okpenen; Omajaga; Omebe; Onyuwei; Otobi Camp'.split('; ').map(s => s.trim()) },
      { name: 'Oglewu', villages: 'Agbeke; Ai-Oga; Aigaji; Alagblanu; Amoda; Angue; Anwule; Atapa; Atlo; Awulema; Eboya; Ebu; Elulu; Enichi; Idabi; Ijaha; Ikila; Ochobo; Ochobo-Centre; Ojali; Ojano; Okete; Okete-Okpikwu; Olugbane; Omutelle; Onyepa; Otohia; Ukploko'.split('; ').map(s => s.trim()) },
      { name: 'Onyan-Gede', villages: 'Abakpa; Adankali; Agwa; Ajegbe; Anmaji; Anonomi; Ehatope; Enyioji; Epideru; Idekpa; Ikpolle; Ipiga; Iyanya; Odega; Ogande; Ogodu; Ogofu; Ondo; Otoje; Ugene; Ugene-Icho; Ughoju Ega; Ukpobi-Echaje; Ukpobi-Ichoi'.split('; ').map(s => s.trim()) },
    ],
  },
  {
    name: 'Oju', code: 'OJU', state: 'Benue', region: 'Igede',
    headquarters: 'Oju', language: 'Igede', dialect: 'Igede',
    wards: [
      { name: 'Igede', villages: 'Adum; Adum-Okete; Ainu-Ette; Ameka; Anchim; Andibilla; Anyadegwu; Anyone; Anyuwogbu; Atekpe; Ebonda; Edumoga; Ega; Eja; Ekoti; Ekpong; Epwa-Ibilla; Ibegi; Ibillalukpo; Ichacho; Ichakobe; Idajo; Ihulam; Ikachi; Ikomi; Imoho; Itega; Itikpala; Iyeche; Oba-Ogebe; Obachita; Obi; Obigwe; Obijegwu; Obohu; Oboru; Obotu; Obubu; Obuza; Ochimode; Ochodu; Odubo; Oga-Olowa; Ogengeng; Ogogo; Ohio; Ohirigwe; Ohoho; Ohuma; Okpodom; Ojinyi; Oju; Okakongo; Okete; Okileme; Okonche; Okpinya; Okpoma; Omope; Onyike; Opoan; Orihi; Oshirigwe; Otakini; Otakpi; Otunche; Owori-Obotu; Oyiwo; Uchenyum; Uchwo; Ugburu; Ukpa; Ukpila; Ukpute; Umoda; Utabiji; Wori-Obotu'.split('; ').map(s => s.trim()) },
      { name: 'Ito', villages: 'Abelega; Abofutu; Adega; Adiko; Adodo; Adum West; Adum-East; Akiraba; Akunda; Ameka; Anchiomodoma; Any-Oko; Anyagwu; Anyichika; Ayoye; Ebong-Itogo; Echoro; Eewu; Ekingo; Igbegi; Igwe; Ijanke; Ijegwu; Ijokwe; Ikandiye; Ikiriye; Ikponyine; Ikwokwu; Inyuma; Ipinu-Adiko; Irabi; Itakpa; Ito; Itogo-Ekingo; Iyaho; Oba; Obigago; Ochinebe; Odeleko; Odiapa; Ogede; Ogilewu-Itogo; Ogoro; Ogwope; Ohehe; Ohuma; Ohuye; Ojantile; Ojegbe; Ojenya; Ojor; Ojuwo; Okpirikwu; Okpirikwu-Adum; Okpokwu; Okukukwu; Okuntegbe; Okwubi; Okwumaye; Otokwe; Owo; Owo-Adum; Oye-Obi; Oyinyi; Ubeke; Ubele; Udebor; Udegi; Ugbodom; Ukpuleru; Ukpute; Utugboji; Yeshewe'.split('; ').map(s => s.trim()) },
      { name: 'Uwokwu', villages: 'Adodo; Adum; Alloma; Anwu; Arigede; Ebenta; Egbilla-Idella; Egbilla-Izzi; Ekpete; Enugu-Oye; Enurn; Esewa; Ibalakum; Idele; Ifator; Igbegi; Igbella; Igbilla; Igwe-Ette; Igwoke; Ikatakwe; Ikoku; Ikori; Inyuma; Irachi; Itafor; Itakeni; Iyator; Iyokolo; Obaogede; Obene; Obiladun; Odaleko; Ogaka; Ogege; Ogori; Ojokwe; Okekpo; Okochi; Okwurum; Orihi; Otukpo-Oye; Owori-Ipinu; Oye; Ubeke; Uda; Udogwu; Uje; Ukpute'.split('; ').map(s => s.trim()) },
    ],
  },
  {
    name: 'Okpokwu', code: 'OKP', state: 'Benue', region: 'Western Idoma',
    headquarters: 'Okpoga', language: 'Idoma', dialect: 'Western Idoma',
    wards: [
      { name: 'Edumoga', villages: 'A-Adabulu; Adum; Agamud; Agbangwe; Agila-Oladikwu; Aiagom; Aiede; Ajide; Akaga; Akpitodo-Akpaya; Akpodo; Akpuneje; Alaglanu; Amafu; Amoda Olengbecho; Aokete; Aokpaneg; Aokpasu; Aokpe; Atekpo; Ebo-Ya; Ebodahubi; Edkeajio; Efede-Aoi; Efffa; Effion; Efoyo; Ejema; Ekenobi; Engle; Gapo; Igama; Ijeha; Ipoya; Iwewe; Laionyes; Obotu-Ehaje; Obotu-Icho; Obulu; Odaba; Oduda; Ogblega; Ogblo; Ogbodo; Ogbulo; Ogene; Ogodum; Ogomotu; Ojigo; Ojapo; Okana; Okga-Ogodo; Okopolikpo-I; Okpafie; Okpale; Okpale-Otta; Okpilioho; Okpolikpo-Ehaje; Oladegbo; Olago; Olaidu; Olaioleje; Olanyega; Ollo; Omolokpo; Omusu; Opidlo; Opioli; Otada-Otutu; Otobi; Ugbokolo; Ugbokpo'.split('; ').map(s => s.trim()) },
      { name: 'Ichama', villages: 'Acho; Adiga; Adiga Oyira; Ejaa; Ichana; Ipele-Ohebe; Ipole-Aiagbo; Ipole-Aiebega; Ipole-Aikpe; Ipole-Aiona; Iwewe-Ichama; Ode-Sasa; Odokpo; Ojocha; Ojoga; Oleayidu; Oma'.split('; ').map(s => s.trim()) },
      { name: 'Okpoga', villages: 'Agado; Agene; Ai-Anechi; Ai-Ochokpo; Aidogodo; Akpakpa; Amuju; Ede-Okpaga; Idiri; Idobe; Idoko-Aga; Ikonijo; Ogbaga; Ogwuche Akpa; Okadoga; Oklenyi; Okpoga; Okpudu; Olayi-Agbino'.split('; ').map(s => s.trim()) },
    ],
  },
  {
    name: 'Otukpo', code: 'OTU', state: 'Benue', region: 'Central Idoma',
    headquarters: 'Otukpo', language: 'Idoma', dialect: 'Central Idoma',
    wards: [
      { name: 'Adoka', villages: 'Abache; Adoka; Aibeli; Aichene; Aikolekwu; Aiobiduwa; Ajochoko; Alyeya; Anineju Ukwaba; Aukpa; Aune; Eeko; Ekantili; Ipole; Iwili; Obena; Ofiloko; Ogbago; Ogodum; Ogowu; Ojakpama; Ojanowa; Ojinebe; Oklenyi-Uga; Okpaflo; Okpannehe; Okpeje; Olakpoga; Olekpama; Oleogwoja; Oloke; Olokodeje; Onipi; Opah Adoka; Opah Aiokpetaa; Otada; Udabi; Uga; Ukplago; Umalichi; Umogidi; Upu'.split('; ').map(s => s.trim()) },
      { name: 'Otukpo Rural', villages: 'Adoka; Ajobe; Akpa; Akpachi-Ipepe; Akpachi-Ipole; Akpegede; Amla-Ehaje; Amla-Icho; Asa-Ehaje; Asa-Ehicho; Ebologba; Edikwu; Efa; Emichi; Idabi; Ife; Igbanonmaje; Ikobi; Ipakangwu; Itoo; Jericho; Obaganya; Odudaje; Ogome; Ojantelle; Okpamaju; Okpobeka; Olachinta; Olooja; Otada-Ehaje; Otada-Icho; Otobi-Otukpo; Otukpo-Icho; Otukpo-Nobi; Upu London; Upu-Icho'.split('; ').map(s => s.trim()) },
      { name: 'Ugboju', villages: 'Ai-Okpetu; Akpachi; Alaglanu; Angbier; Anwule; Aochemoche; Aokwu; Ebolo; Efeyi-Ankpa; Efeyi-Igbanonaje; Efeyi-Ipole; Emicho; Eyokpa; Ibaji; Ifete-Enumaje; Ifete-Ipana; Ifete-Olubie; Igahuwo; Igblagidi; Ipaha; Ipepe; Ipokpene; Ipolo-Ehaje; Ipolo-Ologbe; Ipom-Icho; Jericho; Obo; Obotu-Ehaje; Obotu-Icho; Odaubi; Oduda; Ofete-Olobele; Ofiloko; Ogobia; Ogoli; Ojegidigbe; Okoto; Okpligwu; Okwudu; Ola-Himu; Olegwaneku; Ombi-Ehaje; Ombi-Icho; Omulonye; Ona; Onaje; Owoto; Umalichi; Unwaba-Oju'.split('; ').map(s => s.trim()) },
      { name: 'Otukpo Urban', villages: ['Otukpo Town'] },
    ],
  },
];
