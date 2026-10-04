/* ==========================================================
   SALÓN 85 — interacciones
   ========================================================== */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
if (!hasGSAP || reduced) document.documentElement.classList.add('reduced');
if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* ----------------------------------------------------------
   DATOS DEL NEGOCIO
   ---------------------------------------------------------- */
const WA_NUMBER = '34637454439';
// minutos desde medianoche · 0 = domingo
const HOURS = { 0: null, 1: null, 2: [570, 1140], 3: [570, 1140], 4: [570, 1140], 5: [570, 1140], 6: [570, 840] };

/* ----------------------------------------------------------
   TEXTOS DINÁMICOS
   ---------------------------------------------------------- */
const STR = {
  es: {
    days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    open: t => `Abierto ahora · hasta las ${t}`,
    closedToday: t => `Cerrado · abre hoy a las ${t}`,
    closedTomorrow: t => `Cerrado · abre mañana a las ${t}`,
    closedDay: (d, t) => `Cerrado · abre el ${d.toLowerCase()} a las ${t}`,
    closed: 'Cerrado',
    wa: 'Hola Salón 85, me gustaría reservar una cita.',
    waTone: n => `Hola Salón 85, me gustaría pedir cita para un color ${n}.`,
    waRitual: (n, h, t) => `Hola Salón 85, me gustaría reservar el ${n}${h ? ` (cabello ${h.toLowerCase()})` : ''}${t ? ` · ${t}` : ''}.`,
    rEmpty: { k: 'Tu ritual', n: 'Responde y lo creamos.', d: 'Elige una opción en cada paso: tu propuesta aparece aquí al instante.' },
    rHint: 'Ahora dinos qué le pide tu cabello (paso 02).',
    rKicker: 'Tu ritual a medida',
    dur: 'duración orientativa',
    noTime: 'Elige cuánto tiempo tienes para ver la duración.',
    toneLabel: 'Tono'
  },
  ca: {
    days: ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'],
    open: t => `Obert ara · fins a les ${t}`,
    closedToday: t => `Tancat · obre avui a les ${t}`,
    closedTomorrow: t => `Tancat · obre demà a les ${t}`,
    closedDay: (d, t) => `Tancat · obre ${d.toLowerCase()} a les ${t}`,
    closed: 'Tancat',
    wa: 'Hola Salón 85, m’agradaria reservar una cita.',
    waTone: n => `Hola Salón 85, m’agradaria demanar cita per a un color ${n}.`,
    waRitual: (n, h, t) => `Hola Salón 85, m’agradaria reservar el ${n}${h ? ` (cabell ${h.toLowerCase()})` : ''}${t ? ` · ${t}` : ''}.`,
    rEmpty: { k: 'El teu ritual', n: 'Respon i el creem.', d: 'Tria una opció a cada pas: la teva proposta apareix aquí a l’instant.' },
    rHint: 'Ara digues-nos què et demana el cabell (pas 02).',
    rKicker: 'El teu ritual a mida',
    dur: 'durada orientativa',
    noTime: 'Tria quant de temps tens per veure’n la durada.',
    toneLabel: 'To'
  },
  en: {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    open: t => `Open now · until ${t}`,
    closedToday: t => `Closed · opens today at ${t}`,
    closedTomorrow: t => `Closed · opens tomorrow at ${t}`,
    closedDay: (d, t) => `Closed · opens ${d} at ${t}`,
    closed: 'Closed',
    wa: 'Hi Salón 85, I’d like to book an appointment.',
    waTone: n => `Hi Salón 85, I’d like to book a colour appointment: ${n}.`,
    waRitual: (n, h, t) => `Hi Salón 85, I’d like to book the ${n}${h ? ` (${h.toLowerCase()} hair)` : ''}${t ? ` · ${t}` : ''}.`,
    rEmpty: { k: 'Your ritual', n: 'Answer and we’ll create it.', d: 'Pick one option in each step: your proposal appears here instantly.' },
    rHint: 'Now tell us what your hair is asking for (step 02).',
    rKicker: 'Your tailored ritual',
    dur: 'approximate duration',
    noTime: 'Choose how much time you have to see the duration.',
    toneLabel: 'Shade'
  }
};

const TONES = [
  { c: '#C2873E', m: '#EDCB9C', co: .78, mo: .30, sw: 'linear-gradient(140deg,#EBC386,#A9702C)',
    es: ['Rubio miel', 'Luminoso y cálido. Ilumina el rostro y favorece a las pieles doradas.'],
    ca: ['Ros mel', 'Lluminós i càlid. Il·lumina el rostre i afavoreix les pells daurades.'],
    en: ['Honey blonde', 'Bright and warm. Lifts the face and flatters golden skin tones.'] },
  { c: '#9FA3A2', m: '#DCDCD8', co: .9, mo: .22, sw: 'linear-gradient(140deg,#E2E1DC,#8E918F)',
    es: ['Rubio ceniza', 'Frío y sofisticado. Neutraliza los reflejos amarillos con un acabado perla.'],
    ca: ['Ros cendra', 'Fred i sofisticat. Neutralitza els reflexos grocs amb un acabat perla.'],
    en: ['Ash blonde', 'Cool and refined. Neutralises brassy tones with a pearly finish.'] },
  { c: '#B4502A', m: '#D98E66', co: .85, mo: .45, sw: 'linear-gradient(140deg,#DE8A55,#8E3416)',
    es: ['Cobrizo', 'Intenso y con carácter. El tono de un atardecer en la Costa Brava.'],
    ca: ['Coure', 'Intens i amb caràcter. El to d’una posta de sol a la Costa Brava.'],
    en: ['Copper', 'Vivid and full of character. A Costa Brava sunset, in your hair.'] },
  { c: '#C98C93', m: '#EFCFCB', co: .75, mo: .25, sw: 'linear-gradient(140deg,#F1C9C6,#B5767D)',
    es: ['Rosé', 'Delicado y actual. Un velo rosado sobre una base clara.'],
    ca: ['Rosé', 'Delicat i actual. Un vel rosat sobre una base clara.'],
    en: ['Rosé', 'Soft and modern. A rosy veil over a light base.'] },
  { c: '#5A3522', m: '#5A3D2E', co: .9, mo: 1.15, sw: 'linear-gradient(140deg,#8B5E43,#3A2216)',
    es: ['Chocolate', 'Profundo y brillante. Aporta densidad visual y mucha luz.'],
    ca: ['Xocolata', 'Profund i brillant. Aporta densitat visual i molta llum.'],
    en: ['Chocolate', 'Deep and glossy. Adds visual density and plenty of shine.'] },
  { c: '#1E1A19', m: '#2B2523', co: .9, mo: 1.3, sw: 'linear-gradient(140deg,#4A4441,#0F0D0C)',
    es: ['Negro azabache', 'Elegante y atemporal. Un negro que sigue atrapando la luz.'],
    ca: ['Negre atzabeja', 'Elegant i atemporal. Un negre que continua atrapant la llum.'],
    en: ['Jet black', 'Timeless and elegant. A black that still catches the light.'] }
];

const RITUALS = {
  brillo: {
    es: { n: 'Ritual Brillo Natural', d: 'Para un cabello que refleja la luz y se siente suave al tacto.', s: ['Diagnóstico personalizado', 'Limpieza suave con champú ecológico', 'Baño de brillo y mascarilla nutritiva', 'Secado y peinado a tu gusto'], t: ['Brillo', 'Suavidad', 'Hidratación'] },
    ca: { n: 'Ritual Brillantor Natural', d: 'Per a un cabell que reflecteix la llum i és suau al tacte.', s: ['Diagnòstic personalitzat', 'Neteja suau amb xampú ecològic', 'Bany de brillantor i mascareta nutritiva', 'Assecat i pentinat al teu gust'], t: ['Brillantor', 'Suavitat', 'Hidratació'] },
    en: { n: 'Natural Shine Ritual', d: 'For hair that catches the light and feels soft to the touch.', s: ['Personal hair diagnosis', 'Gentle cleanse with eco shampoo', 'Gloss treatment and nourishing mask', 'Blow-dry and styling'], t: ['Shine', 'Softness', 'Hydration'] }
  },
  reparar: {
    es: { n: 'Ritual Reconstrucción', d: 'Devuelve fuerza y elasticidad al cabello castigado por el calor, el sol o la química.', s: ['Diagnóstico de la fibra', 'Biopolimerización reconstructora', 'Sellado con mascarilla nutritiva', 'Saneado de puntas y peinado'], t: ['Fuerza', 'Elasticidad', 'Menos rotura'] },
    ca: { n: 'Ritual Reconstrucció', d: 'Retorna força i elasticitat al cabell castigat per la calor, el sol o la química.', s: ['Diagnòstic de la fibra', 'Biopolimerització reconstructora', 'Segellat amb mascareta nutritiva', 'Sanejat de puntes i pentinat'], t: ['Força', 'Elasticitat', 'Menys trencament'] },
    en: { n: 'Reconstruction Ritual', d: 'Restores strength and elasticity to hair stressed by heat, sun or chemicals.', s: ['Hair fibre diagnosis', 'Restorative biopolymerisation', 'Sealing nourishing mask', 'Trim and styling'], t: ['Strength', 'Elasticity', 'Less breakage'] }
  },
  volumen: {
    es: { n: 'Ritual Volumen & Aire', d: 'Cuerpo y movimiento que duran, sin apelmazar.', s: ['Estudio de tu rostro y tu textura', 'Corte estratégico para dar cuerpo', 'Tratamiento ligero de raíz', 'Secado con volumen'], t: ['Cuerpo', 'Ligereza', 'Movimiento'] },
    ca: { n: 'Ritual Volum & Aire', d: 'Cos i moviment que duren, sense apelmassar.', s: ['Estudi del teu rostre i la teva textura', 'Tall estratègic per donar cos', 'Tractament lleuger d’arrel', 'Assecat amb volum'], t: ['Cos', 'Lleugeresa', 'Moviment'] },
    en: { n: 'Volume & Air Ritual', d: 'Lasting body and movement, never weighed down.', s: ['Face shape and texture study', 'Strategic cut for body', 'Light root treatment', 'Volumising blow-dry'], t: ['Body', 'Lightness', 'Movement'] }
  },
  color: {
    es: { n: 'Ritual Color Consciente', d: 'Un cambio de color pensado para ti, cuidando la fibra en cada paso.', s: ['Asesoría de color y prueba de tono', 'Color, mechas o balayage a medida', 'Tratamiento protector post-color', 'Peinado y consejos de mantenimiento'], t: ['Luz', 'Tono a medida', 'Cuidado del color'] },
    ca: { n: 'Ritual Color Conscient', d: 'Un canvi de color pensat per a tu, cuidant la fibra a cada pas.', s: ['Assessorament de color i prova de to', 'Color, metxes o balayage a mida', 'Tractament protector post-color', 'Pentinat i consells de manteniment'], t: ['Llum', 'To a mida', 'Cura del color'] },
    en: { n: 'Conscious Colour Ritual', d: 'A colour change designed for you, caring for the fibre at every step.', s: ['Colour consultation and shade test', 'Bespoke colour, highlights or balayage', 'Post-colour protective treatment', 'Styling and aftercare advice'], t: ['Light', 'Bespoke shade', 'Colour care'] }
  },
  raiz: {
    es: { n: 'Ritual Raíz Sana', d: 'Calma y equilibrio para un cuero cabelludo sensible. Un cabello bonito nace de una raíz sana.', s: ['Análisis del cuero cabelludo', 'Exfoliación suave y masaje', 'Tratamiento equilibrante botánico', 'Secado delicado'], t: ['Calma', 'Equilibrio', 'Bienestar'] },
    ca: { n: 'Ritual Arrel Sana', d: 'Calma i equilibri per a un cuir cabellut sensible. Un cabell bonic neix d’una arrel sana.', s: ['Anàlisi del cuir cabellut', 'Exfoliació suau i massatge', 'Tractament equilibrant botànic', 'Assecat delicat'], t: ['Calma', 'Equilibri', 'Benestar'] },
    en: { n: 'Healthy Roots Ritual', d: 'Calm and balance for a sensitive scalp. Beautiful hair starts at the root.', s: ['Scalp analysis', 'Gentle exfoliation and massage', 'Botanical balancing treatment', 'Delicate blow-dry'], t: ['Calm', 'Balance', 'Wellbeing'] }
  }
};

const HAIR_NOTES = {
  fino:      { es: 'Para cabello fino: texturas ligeras que dan cuerpo sin apelmazar.', ca: 'Per a cabell fi: textures lleugeres que donen cos sense apelmassar.', en: 'For fine hair: light textures that add body without weighing it down.' },
  grueso:    { es: 'Para cabello grueso: nutrición profunda y control del encrespamiento.', ca: 'Per a cabell gruixut: nutrició profunda i control de l’encrespament.', en: 'For thick hair: deep nourishment and frizz control.' },
  rizado:    { es: 'Para rizos y ondas: definición e hidratación respetando tu forma natural.', ca: 'Per a rínxols i ones: definició i hidratació respectant la teva forma natural.', en: 'For curls and waves: definition and hydration that respect your natural pattern.' },
  procesado: { es: 'Para cabello teñido: protección extra para la fibra y el color.', ca: 'Per a cabell tenyit: protecció extra per a la fibra i el color.', en: 'For coloured hair: extra protection for the fibre and the colour.' }
};

const TIMES = {
  express: { es: { n: 'Formato express', d: '≈ 45 min' }, ca: { n: 'Format exprés', d: '≈ 45 min' }, en: { n: 'Express format', d: '≈ 45 min' } },
  ritual:  { es: { n: 'Ritual completo', d: '≈ 90 min' }, ca: { n: 'Ritual complet', d: '≈ 90 min' }, en: { n: 'Full ritual', d: '≈ 90 min' } },
  calma:   { es: { n: 'Experiencia sin prisa', d: '≈ 2 h', x: 'Masaje capilar relajante' }, ca: { n: 'Experiència sense pressa', d: '≈ 2 h', x: 'Massatge capil·lar relaxant' }, en: { n: 'Unhurried experience', d: '≈ 2 h', x: 'Relaxing scalp massage' } }
};

/* ----------------------------------------------------------
   TRADUCCIONES DE LA PÁGINA (ES = HTML original)
   ---------------------------------------------------------- */
const I18N = {
  ca: {
    'nav.services': 'Serveis', 'nav.color': 'Color', 'nav.ritual': 'El teu ritual', 'nav.eco': 'Filosofia', 'nav.reviews': 'Opinions', 'nav.visit': 'Visita’ns',
    'cta.book': 'Reservar', 'cta.bookLong': 'Reservar cita', 'cta.ritual': 'Dissenya el teu ritual',
    'hero.eyebrow': 'Perruqueria i estètica ecològica · Lloret de Mar',
    'hero.l1': 'Bellesa sostenible', 'hero.l2': 'que cuida el teu cabell.',
    'hero.lead': 'Productes que combinen tecnologia i natura, i el temps necessari per escoltar-te. Per a ella, per a ell i per als petits.',
    'hero.reviews': '· 74 opinions a Google', 'hero.cap1': 'Tecnologia i natura,', 'hero.cap2': 'al teu cabell.', 'hero.scroll': 'Llisca',
    'man.kicker': 'La nostra filosofia',
    'man.text': 'A Salón 85 creiem que un cabell bonic comença per un cabell sa. Per això treballem amb productes ecològics de gran qualitat, tècniques actuals i temps per escoltar-te. Bellesa que té cura de tu, i també del planeta.',
    'man.sign': 'Lloret de Mar · Costa Brava',
    'svc.kicker': 'Serveis', 'svc.title': 'Tot el que el teu cabell <em>necessita</em>.', 'svc.hint': 'Llisca per descobrir',
    'svc.1.t': 'Tall &amp; estil', 'svc.1.d': 'Talls pensats per al teu rostre, la teva textura i el teu dia a dia. Dona, home i petits.',
    'svc.2.t': 'Color &amp; metxes', 'svc.2.d': 'Balayage, babylights i color amb fórmules respectuoses que il·luminen mentre cuiden la fibra.',
    'svc.3.t': 'Biopolimerització', 'svc.3.d': 'Tractament reconstructor que retorna força, elasticitat i brillantor al cabell castigat.',
    'svc.4.t': 'Tractaments capil·lars', 'svc.4.d': 'Hidratació, nutrició i cura del cuir cabellut amb actius d’origen natural.',
    'svc.5.t': 'Pentinats &amp; esdeveniments', 'svc.5.d': 'Ones, recollits i trenes per a casaments, festes i dies que es recorden.',
    'svc.6.t': 'Perruques &amp; postissos', 'svc.6.d': 'Assessorament discret i personalitzat per recuperar volum i confiança.',
    'svc.7.t': 'Estètica &amp; massatge', 'svc.7.d': 'Cura de la pell i massatges per alliberar tensions. Perquè la bellesa també és descans.',
    'svc.8.t': 'Assessorament d’imatge', 'svc.8.d': 'T’ajudem a trobar el tall i el to que millor parlen de tu.',
    'svc.end.t': 'No saps per on començar?', 'svc.end.d': 'Respon tres preguntes i et proposem un ritual a la teva mida.',
    'tone.hold': 'Mantén premut per veure l’original', 'tone.badge': 'Simulació orientativa', 'tone.kicker': 'Laboratori de color',
    'tone.title': 'Prova el teu proper <em>to</em>.',
    'tone.lead': 'Tria un to i mira com canvia la llum de la teva cabellera. Al saló l’ajustem a la teva pell, la teva base i el teu estil amb fórmules que respecten la fibra.',
    'tone.intensity': 'Intensitat', 'tone.cta': 'Vull aquest to',
    'rit.kicker': 'Diagnòstic capil·lar', 'rit.title': 'Dissenya el teu <em>ritual</em> en tres passos.',
    'rit.lead': 'Explica’ns com és el teu cabell i què et demana. Et proposem un ritual a mida que afinarem amb tu al saló.',
    'rit.q1': 'Com és el teu cabell?', 'rit.hair.fino': 'Fi', 'rit.hair.grueso': 'Gruixut', 'rit.hair.rizado': 'Arrissat o ondulat', 'rit.hair.procesado': 'Tenyit o decolorat',
    'rit.q2': 'Què et demana?', 'rit.need.brillo': 'Brillantor i suavitat', 'rit.need.reparar': 'Reparar danys', 'rit.need.volumen': 'Volum i lleugeresa', 'rit.need.color': 'Un canvi de color', 'rit.need.raiz': 'Cuir cabellut sensible',
    'rit.q3': 'Quant de temps tens?', 'rit.time.express': 'Vaig amb pressa', 'rit.time.ritual': 'Un matí per a mi', 'rit.time.calma': 'Sense rellotge',
    'rit.cta': 'Reservar aquest ritual',
    'eco.kicker': 'Perruqueria ecològica', 'eco.title': 'Tecnologia i natura, <em>en equilibri</em>.',
    'eco.1.t': 'Productes ecològics', 'eco.1.d': 'Fórmules d’origen natural i gran qualitat, escollides per la seva eficàcia i pel seu respecte cap a la fibra capil·lar i el cuir cabellut.',
    'eco.2.t': 'Tecnologia + natural', 'eco.2.d': 'Tècniques actuals com la biopolimerització, unides a actius botànics. Resultats de saló, sense renunciar al que és natural.',
    'eco.3.t': 'Atenció sense presses', 'eco.3.d': 'Diagnòstic i consell a cada visita. Escoltem abans de tallar, i t’expliquem com cuidar el teu cabell a casa.',
    'eco.4.t': 'Un espai per a tothom', 'eco.4.d': 'Un saló net, lluminós i acollidor, on tothom és benvingut. Espai LGBTQ+ friendly.',
    'team.kicker': 'La mà al darrere',
    'team.lead': 'Perruquera, colorista i assessora d’imatge. Qui s’asseu a la seva cadira repeteix el mateix: professionalitat, bons consells i un tracte que et fa sentir com a casa.',
    'rev.google': 'Opinió a Google', 'team.t1': 'Color &amp; metxes', 'team.t2': 'Biopolimerització', 'team.t3': 'Pentinats', 'team.t4': 'Formació contínua',
    'rev.anon': 'Ressenya', 'rev.kicker': 'Opinions', 'rev.count': '74 opinions a Google', 'rev.note': 'Opinions reals publicades a Google Maps (en castellà).',
    'gal.title': 'Fet a <em>Salón 85</em>',
    'vis.kicker': 'Visita’ns', 'vis.title': 'T’esperem a <em>Lloret</em>.', 'vis.addr': 'Adreça', 'vis.phone': 'Telèfon', 'vis.route': 'Com arribar-hi', 'vis.call': 'Trucar',
    'foot.small': 'Parlem del teu cabell?', 'foot.big': 'Reserva la teva cita', 'foot.tag': 'Perruqueria i estètica ecològica'
  },
  en: {
    'nav.services': 'Services', 'nav.color': 'Colour', 'nav.ritual': 'Your ritual', 'nav.eco': 'Philosophy', 'nav.reviews': 'Reviews', 'nav.visit': 'Visit us',
    'cta.book': 'Book', 'cta.bookLong': 'Book an appointment', 'cta.ritual': 'Design your ritual',
    'hero.eyebrow': 'Eco hair salon & beauty · Lloret de Mar',
    'hero.l1': 'Sustainable beauty', 'hero.l2': 'that cares for your hair.',
    'hero.lead': 'Products that blend technology and nature, and all the time it takes to listen to you. For her, for him and for the little ones.',
    'hero.reviews': '· 74 Google reviews', 'hero.cap1': 'Technology and nature,', 'hero.cap2': 'in your hair.', 'hero.scroll': 'Scroll',
    'man.kicker': 'Our philosophy',
    'man.text': 'At Salón 85 we believe beautiful hair starts with healthy hair. That’s why we work with high-quality eco products, modern techniques and time to truly listen. Beauty that takes care of you, and of the planet too.',
    'man.sign': 'Lloret de Mar · Costa Brava',
    'svc.kicker': 'Services', 'svc.title': 'Everything your hair <em>needs</em>.', 'svc.hint': 'Scroll to explore',
    'svc.1.t': 'Cut &amp; style', 'svc.1.d': 'Cuts designed around your face, your texture and your everyday life. Women, men and kids.',
    'svc.2.t': 'Colour &amp; highlights', 'svc.2.d': 'Balayage, babylights and colour with gentle formulas that brighten while caring for the fibre.',
    'svc.3.t': 'Biopolymerisation', 'svc.3.d': 'A restorative treatment that brings strength, elasticity and shine back to damaged hair.',
    'svc.4.t': 'Hair treatments', 'svc.4.d': 'Hydration, nourishment and scalp care with naturally derived actives.',
    'svc.5.t': 'Styling &amp; events', 'svc.5.d': 'Waves, updos and braids for weddings, parties and days to remember.',
    'svc.6.t': 'Wigs &amp; hairpieces', 'svc.6.d': 'Discreet, personal advice to regain volume and confidence.',
    'svc.7.t': 'Beauty &amp; massage', 'svc.7.d': 'Skin care and massages to release tension. Because beauty is also rest.',
    'svc.8.t': 'Image consulting', 'svc.8.d': 'We help you find the cut and the shade that say the most about you.',
    'svc.end.t': 'Not sure where to start?', 'svc.end.d': 'Answer three questions and we’ll suggest a ritual made for you.',
    'tone.hold': 'Press and hold to see the original', 'tone.badge': 'Approximate preview', 'tone.kicker': 'Colour lab',
    'tone.title': 'Try your next <em>shade</em>.',
    'tone.lead': 'Pick a shade and watch how the light in your hair changes. In the salon we tailor it to your skin, your base and your style with formulas that respect the fibre.',
    'tone.intensity': 'Intensity', 'tone.cta': 'I want this shade',
    'rit.kicker': 'Hair diagnosis', 'rit.title': 'Design your <em>ritual</em> in three steps.',
    'rit.lead': 'Tell us about your hair and what it’s asking for. We’ll suggest a tailored ritual and fine-tune it with you in the salon.',
    'rit.q1': 'What’s your hair like?', 'rit.hair.fino': 'Fine', 'rit.hair.grueso': 'Thick', 'rit.hair.rizado': 'Curly or wavy', 'rit.hair.procesado': 'Coloured or bleached',
    'rit.q2': 'What is it asking for?', 'rit.need.brillo': 'Shine and softness', 'rit.need.reparar': 'Repair damage', 'rit.need.volumen': 'Volume and lightness', 'rit.need.color': 'A colour change', 'rit.need.raiz': 'Sensitive scalp',
    'rit.q3': 'How much time do you have?', 'rit.time.express': 'I’m in a hurry', 'rit.time.ritual': 'A morning for me', 'rit.time.calma': 'No clock',
    'rit.cta': 'Book this ritual',
    'eco.kicker': 'Eco hair salon', 'eco.title': 'Technology and nature, <em>in balance</em>.',
    'eco.1.t': 'Eco products', 'eco.1.d': 'High-quality, naturally derived formulas, chosen for their results and their respect for the hair fibre and scalp.',
    'eco.2.t': 'Technology + nature', 'eco.2.d': 'Modern techniques such as biopolymerisation, paired with botanical actives. Salon results, without giving up on nature.',
    'eco.3.t': 'Unhurried care', 'eco.3.d': 'Diagnosis and advice at every visit. We listen before we cut, and show you how to care for your hair at home.',
    'eco.4.t': 'A space for everyone', 'eco.4.d': 'A clean, bright and welcoming salon where everyone belongs. LGBTQ+ friendly.',
    'team.kicker': 'The hands behind it',
    'team.lead': 'Hairdresser, colourist and image consultant. Clients all say the same: professionalism, great advice and a warmth that makes you feel at home.',
    'rev.google': 'Google review', 'team.t1': 'Colour &amp; highlights', 'team.t2': 'Biopolymerisation', 'team.t3': 'Styling', 'team.t4': 'Ongoing training',
    'rev.anon': 'Review', 'rev.kicker': 'Reviews', 'rev.count': '74 Google reviews', 'rev.note': 'Real reviews published on Google Maps (in Spanish).',
    'gal.title': 'Made at <em>Salón 85</em>',
    'vis.kicker': 'Visit us', 'vis.title': 'See you in <em>Lloret</em>.', 'vis.addr': 'Address', 'vis.phone': 'Phone', 'vis.route': 'Get directions', 'vis.call': 'Call',
    'foot.small': 'Shall we talk about your hair?', 'foot.big': 'Book your visit', 'foot.tag': 'Eco hair salon & beauty'
  }
};

/* ----------------------------------------------------------
   IDIOMA
   ---------------------------------------------------------- */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
};
// duplicamos las opiniones para que el carrusel sea infinito y sin saltos
const mTrack = $('.marquee__track');
if (mTrack) [...mTrack.children].forEach(c => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); mTrack.appendChild(k); });

const originals = new Map();
$$('[data-i18n]').forEach(el => originals.set(el, el.innerHTML));

let lang = store.get('s85-lang');
if (!['es', 'ca', 'en'].includes(lang)) {
  const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
  lang = nav === 'ca' ? 'ca' : nav === 'en' ? 'en' : 'es';
}

const fmtNum = n => lang === 'en' ? String(n) : String(n).replace('.', ',');
const waLink = msg => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

function applyLang(l, init = false) {
  lang = l;
  document.documentElement.lang = l;
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = l === 'es' ? originals.get(el) : (I18N[l] && I18N[l][key]) || originals.get(el);
    if (el.innerHTML !== val) el.innerHTML = val;
  });
  $$('[data-lang]').forEach(b => b.classList.toggle('is-active', b.dataset.lang === l));
  $$('[data-num]').forEach(el => { el.textContent = fmtNum(el.dataset.num); });
  $$('[data-wa]').forEach(a => { a.href = waLink(STR[l].wa); });
  splitManifesto();
  renderStatus();
  renderHours();
  renderTone(false);
  renderRitual(false);
  if (!init) {
    store.set('s85-lang', l);
    if (hasGSAP) requestAnimationFrame(() => ScrollTrigger.refresh());
    updateManifesto();
  }
}
$$('[data-lang]').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));

/* ----------------------------------------------------------
   HORARIO · ABIERTO AHORA
   ---------------------------------------------------------- */
function madridNow() {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const o = {}; parts.forEach(p => { o[p.type] = p.value; });
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), min: (+o.hour % 24) * 60 + (+o.minute) };
  } catch (e) {
    const d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
  }
}
const fmtTime = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

function getStatus() {
  const { day, min } = madridNow(); const s = STR[lang]; const h = HOURS[day];
  if (h && min >= h[0] && min < h[1]) return { open: true, text: s.open(fmtTime(h[1])) };
  if (h && min < h[0]) return { open: false, text: s.closedToday(fmtTime(h[0])) };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (HOURS[d]) return { open: false, text: i === 1 ? s.closedTomorrow(fmtTime(HOURS[d][0])) : s.closedDay(s.days[d], fmtTime(HOURS[d][0])) };
  }
  return { open: false, text: s.closed };
}
function renderStatus() {
  const st = getStatus();
  $$('[data-status]').forEach(el => {
    el.classList.toggle('is-open', st.open);
    $('.status__text', el).textContent = st.text;
  });
}
function renderHours() {
  const ul = $('.hours'); if (!ul) return;
  const s = STR[lang]; const today = madridNow().day;
  ul.innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
    const h = HOURS[d];
    return `<li class="${d === today ? 'is-today' : ''}"><span>${s.days[d]}</span><span class="${h ? '' : 'closed'}">${h ? `${fmtTime(h[0])} – ${fmtTime(h[1])}` : s.closed}</span></li>`;
  }).join('');
}
setInterval(renderStatus, 60000);

/* ----------------------------------------------------------
   MANIFIESTO · palabras que se iluminan
   ---------------------------------------------------------- */
const manifesto = $('.manifesto__text');
function splitManifesto() {
  if (!manifesto) return;
  const words = manifesto.textContent.trim().split(/\s+/);
  manifesto.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
}
function updateManifesto() {
  if (!manifesto) return;
  const ws = $$('.w', manifesto);
  const r = manifesto.getBoundingClientRect();
  const vh = innerHeight;
  const p = clamp((vh * .82 - r.top) / (r.height + vh * .35));
  const pos = p * (ws.length + 6) - 3;
  ws.forEach((w, i) => { w.style.opacity = (0.14 + 0.86 * clamp(pos - i)).toFixed(3); });
}

/* ----------------------------------------------------------
   LABORATORIO DE COLOR
   ---------------------------------------------------------- */
const toneImg = $('#toneImg');
const tintC = $('.tone__tint--c');
const tintM = $('.tone__tint--m');
const swWrap = $('.swatches');
const range = $('#toneRange');
let toneIdx = 0;
let intensity = .7;

TONES.forEach((t, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'swatch'; b.setAttribute('role', 'radio');
  b.style.setProperty('--c', t.sw);
  b.addEventListener('click', () => { toneIdx = i; renderTone(true); });
  swWrap.appendChild(b);
});

function renderTone(animate) {
  const t = TONES[toneIdx]; const [name, desc] = t[lang];
  tintC.style.backgroundColor = t.c; tintC.style.opacity = (t.co * intensity).toFixed(3);
  tintM.style.backgroundColor = t.m; tintM.style.opacity = Math.min(1, t.mo * intensity).toFixed(3);
  $$('.swatch', swWrap).forEach((b, i) => {
    b.setAttribute('aria-checked', i === toneIdx ? 'true' : 'false');
    b.setAttribute('aria-label', `${STR[lang].toneLabel}: ${TONES[i][lang][0]}`);
  });
  const nameEl = $('.tone__name'), descEl = $('.tone__desc');
  $('.tone__index').textContent = `${String(toneIdx + 1).padStart(2, '0')} / ${String(TONES.length).padStart(2, '0')}`;
  if (animate && hasGSAP && !reduced) {
    gsap.timeline()
      .to([nameEl, descEl], { opacity: 0, y: -10, duration: .25, ease: 'power2.in', stagger: .04 })
      .add(() => { nameEl.textContent = name; descEl.textContent = desc; })
      .fromTo([nameEl, descEl], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out', stagger: .06 });
    toneImg.classList.remove('is-shine'); void toneImg.offsetWidth; toneImg.classList.add('is-shine');
  } else {
    nameEl.textContent = name; descEl.textContent = desc;
  }
  $('#toneCta').href = waLink(STR[lang].waTone(name.toLowerCase()));
}
range.addEventListener('input', () => {
  intensity = range.value / 100;
  range.style.setProperty('--p', `${((range.value - range.min) / (range.max - range.min)) * 100}%`);
  renderTone(false);
});
range.style.setProperty('--p', `${((range.value - range.min) / (range.max - range.min)) * 100}%`);

const hold = $('.tone__hold');
const holdOn = e => { e.preventDefault(); toneImg.classList.add('is-original'); };
const holdOff = () => toneImg.classList.remove('is-original');
hold.addEventListener('pointerdown', holdOn);
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => hold.addEventListener(ev, holdOff));
hold.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') holdOn(e); });
hold.addEventListener('keyup', holdOff);

/* ----------------------------------------------------------
   DISEÑA TU RITUAL
   ---------------------------------------------------------- */
const form = $('.ritual__steps');
const rOut = $('.ritual__out');
const rCta = $('.ritual__cta');
const val = name => { const el = form.querySelector(`input[name="${name}"]:checked`); return el ? el.value : ''; };
const label = name => { const el = form.querySelector(`input[name="${name}"]:checked`); return el ? el.nextElementSibling.textContent.trim() : ''; };

function renderRitual(animate = true) {
  const s = STR[lang];
  const hair = val('hair'), need = val('need'), time = val('time');
  $$('.ritual__progress i').forEach((d, i) => d.classList.toggle('is-on', [hair, need, time][i] !== ''));
  let html;
  if (!need) {
    html = `<p class="ritual__kicker">${s.rEmpty.k}</p><h3 class="ritual__name">${s.rEmpty.n}</h3><p class="ritual__desc">${(hair || time) ? s.rHint : s.rEmpty.d}</p>`;
    rCta.classList.add('is-disabled');
    rCta.href = '#';
  } else {
    const r = RITUALS[need][lang];
    const T = time ? TIMES[time][lang] : null;
    const steps = [...r.s];
    if (time === 'calma') steps.splice(steps.length - 1, 0, T.x);
    const note = hair ? ` ${HAIR_NOTES[hair][lang]}` : '';
    html = `<p class="ritual__kicker">${s.rKicker}</p>
      <h3 class="ritual__name">${r.n}</h3>
      <p class="ritual__desc">${r.d}${note}</p>
      <ol class="ritual__list">${steps.map(x => `<li>${x}</li>`).join('')}</ol>
      <div class="ritual__tags">${r.t.map(x => `<span>${x}</span>`).join('')}</div>
      <p class="ritual__meta">${T ? `${T.n} · ${T.d} · ${s.dur}` : s.noTime}</p>`;
    rCta.classList.remove('is-disabled');
    rCta.href = waLink(s.waRitual(r.n, label('hair'), T ? `${T.n} (${T.d})` : ''));
  }
  rOut.innerHTML = html;
  if (animate && !reduced) { rOut.classList.remove('is-swap'); void rOut.offsetWidth; rOut.classList.add('is-swap'); }
}
form.addEventListener('change', e => {
  renderRitual(true);
  // en móvil, al completar los tres pasos llevamos a la propuesta
  if (innerWidth < 900 && val('hair') && val('need') && val('time') && e.target.name === 'time') {
    const card = $('.ritual__card');
    if (lenis) lenis.scrollTo(card, { offset: -90, duration: 1.2 }); else card.scrollIntoView({ behavior: 'smooth' });
  }
});

/* ----------------------------------------------------------
   MENÚ MÓVIL + NAVEGACIÓN
   ---------------------------------------------------------- */
let lenis = null;
const burger = $('.burger');
const menu = $('.menu');
function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  if (lenis) open ? lenis.stop() : lenis.start();
}
burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));

function scrollToTarget(hash) {
  const target = hash === '#top' ? 0 : document.querySelector(hash);
  if (target === null) return;
  if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: 0 });
  else if (target === 0) scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const hash = a.getAttribute('href');
  if (hash === '#' || hash.length < 2) { e.preventDefault(); return; }
  e.preventDefault();
  const wasOpen = document.body.classList.contains('menu-open');
  if (wasOpen) setMenu(false);
  setTimeout(() => scrollToTarget(hash), wasOpen ? 350 : 0);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ----------------------------------------------------------
   HERO · el arco que se abre
   ---------------------------------------------------------- */
const hero = $('.hero');
const sticky = $('.hero__sticky');
const media = $('.hero__media');
const mediaImg = $('.hero__media img');
const shade = $('.hero__shade');
const head = $('.hero__head');
const cols = $$('.hero__col');
const colL = $('.hero__col--l');
const caption = $('.hero__caption');
const heroState = { intro: hasGSAP && !reduced ? 0 : 1, p: 0 };
let geom = null;

function measureHero() {
  const w = innerWidth, h = sticky.clientHeight, mob = w < 760;
  const ref = mob ? colL : head;
  const top = Math.min(ref.offsetTop + ref.offsetHeight + (mob ? 26 : 34), h * .74);
  const side = mob ? w * .07 : w * .355;
  const bottom = mob ? 14 : h * .045;
  geom = { w, h, top, side, bottom, r: (w - side * 2) / 2 };
}
function renderHero() {
  if (!geom) measureHero();
  const { w, h, top, side, bottom, r } = geom;
  const i = easeOut(heroState.intro);
  const e = easeIO(clamp(heroState.p / .78));
  const k = 1 - e;
  const iTop = h - (h - top) * i;
  const iSide = (w / 2 - 1) - ((w / 2 - 1) - side) * i;
  const t = iTop * k, sd = iSide * k, b = bottom * k, rad = r * k;
  media.style.clipPath = `inset(${t.toFixed(1)}px ${sd.toFixed(1)}px ${b.toFixed(1)}px ${sd.toFixed(1)}px round ${rad.toFixed(1)}px ${rad.toFixed(1)}px 0px 0px)`;
  mediaImg.style.transform = `scale(${(1.2 - .2 * e).toFixed(4)})`;
  shade.style.opacity = e.toFixed(3);
  const fade = clamp(1 - heroState.p * 3.2);
  head.style.opacity = fade.toFixed(3);
  head.style.transform = `translateY(${(-heroState.p * 140).toFixed(1)}px)`;
  cols.forEach(c => { c.style.opacity = fade.toFixed(3); c.style.transform = `translateY(${(heroState.p * 60).toFixed(1)}px)`; });
  const cp = clamp((heroState.p - .7) / .2);
  caption.style.opacity = cp.toFixed(3);
  caption.style.transform = `translateY(${((1 - cp) * 40).toFixed(1)}px)`;
  caption.classList.toggle('is-on', cp > .5);
}
function heroProgress() {
  const r = hero.getBoundingClientRect();
  const span = hero.offsetHeight - innerHeight;
  heroState.p = span > 0 ? clamp(-r.top / span) : 0;
}

/* ----------------------------------------------------------
   SCROLL GLOBAL (nav, fab, hero, manifesto)
   ---------------------------------------------------------- */
const nav = $('#nav');
const fab = $('.wa-fab');
let lastY = 0, ticking = false;
function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 30);
  if (!document.body.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > lastY && y > innerHeight * .9);
  lastY = y;
  fab.classList.toggle('is-on', y > innerHeight * 1.6 && y < document.documentElement.scrollHeight - innerHeight * 1.9);
  heroProgress(); renderHero();
  updateManifesto();
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener('resize', () => { measureHero(); renderHero(); updateManifesto(); });

/* ----------------------------------------------------------
   CURSOR + MAGNÉTICOS
   ---------------------------------------------------------- */
if (finePointer && !reduced) {
  const cur = $('.cursor'), lab = $('.cursor__label');
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cur.classList.add('is-visible'); }, { passive: true });
  document.addEventListener('mouseleave', () => cur.classList.remove('is-visible'));
  (function loop() {
    cx += (x - cx) * .2; cy += (y - cy) * .2;
    cur.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-cursor],a,button,label,input[type="range"]');
    const lbl = t && t.dataset ? t.dataset.cursor : '';
    cur.classList.toggle('is-label', !!lbl);
    cur.classList.toggle('is-link', !!t && !lbl);
    lab.textContent = lbl || '';
  });
  $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${(dx * .18).toFixed(1)}px,${(dy * .3).toFixed(1)}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ----------------------------------------------------------
   ANIMACIONES GSAP
   ---------------------------------------------------------- */
function setupScrollAnimations() {
  if (!hasGSAP || reduced) return;

  // apariciones
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', stagger: .09, overwrite: true })
  });

  // servicios en horizontal (escritorio)
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = $('.services__track');
    const bar = $('.services__progress span');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.services', start: 'top top', end: () => `+=${dist()}`,
        pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => { bar.style.transform = `scaleX(${self.progress.toFixed(4)})`; }
      }
    });
    $$('.svc:not(.svc--end)').forEach(card => {
      const img = $('img', card);
      gsap.fromTo(img, { xPercent: -6 }, {
        xPercent: 6, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
      });
    });
    gsap.from('.svc', { y: 80, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: .07, scrollTrigger: { trigger: '.services', start: 'top 70%', once: true } });
  });
  mm.add('(max-width: 900px)', () => {
    const vp = $('.services__viewport');
    gsap.from('.svc', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', stagger: .06, scrollTrigger: { trigger: vp, start: 'top 85%', once: true } });
  });

  // trazos botánicos
  const paths = $$('.eco__draw .draw');
  paths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  gsap.to(paths, {
    strokeDashoffset: 0, ease: 'none', stagger: .1,
    scrollTrigger: { trigger: '.eco', start: 'top 65%', end: 'bottom 75%', scrub: 1 }
  });

  // parallax de imágenes
  $$('.pillar__img img, .team__img img').forEach(img => {
    gsap.fromTo(img, { yPercent: -14 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('.pillar__img').forEach(box => {
    gsap.fromTo(box, { clipPath: 'inset(12% 8% 12% 8% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', ease: 'none', scrollTrigger: { trigger: box, start: 'top 95%', end: 'top 45%', scrub: true } });
  });

  // galería
  gsap.from('.g', { y: 90, opacity: 0, duration: 1.3, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '.gallery__grid', start: 'top 85%', once: true } });

  // nota de reseñas
  const num = $('.score__num');
  ScrollTrigger.create({
    trigger: '.reviews', start: 'top 70%', once: true,
    onEnter: () => {
      const o = { v: 0 };
      gsap.to(o, { v: +num.dataset.count, duration: 2, ease: 'power3.out', onUpdate: () => { num.textContent = fmtNum(o.v.toFixed(1)); } });
      $('.score__fill').style.width = `${(+num.dataset.count / 5) * 100}%`;
    }
  });

  // marca del pie
  gsap.from('.footer__mark > *', { yPercent: 60, opacity: 0, duration: 1.4, ease: 'power4.out', stagger: .1, scrollTrigger: { trigger: '.footer__mark', start: 'top 92%', once: true } });

  // enlace activo del menú
  ['servicios', 'color', 'ritual', 'filosofia', 'opiniones', 'visitanos'].forEach(id => {
    const link = $(`.nav__links a[href="#${id}"]`);
    const sec = document.getElementById(id);
    if (!link || !sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: self => link.classList.toggle('is-active', self.isActive) });
  });
}

function staticFallback() {
  const num = $('.score__num');
  num.textContent = fmtNum(num.dataset.count);
  $('.score__fill').style.width = `${(+num.dataset.count / 5) * 100}%`;
}

/* ----------------------------------------------------------
   PRELOADER + INTRO
   ---------------------------------------------------------- */
function heroIntro() {
  document.body.classList.remove('is-loading');
  if (lenis) lenis.start();
  if (!hasGSAP || reduced) { heroState.intro = 1; renderHero(); return; }
  gsap.to(heroState, { intro: 1, duration: 1.8, ease: 'power3.inOut', onUpdate: renderHero });
  gsap.to('.hero .mask > *', { y: 0, duration: 1.4, ease: 'power4.out', stagger: .12, delay: .15 });
  gsap.from('.hero .eyebrow', { opacity: 0, y: 14, duration: 1, ease: 'power3.out', delay: .1 });
  gsap.from('.hero__col > *', { opacity: 0, y: 24, duration: 1.2, ease: 'power3.out', stagger: .1, delay: .6 });
  gsap.from('.nav > *', { opacity: 0, y: -16, duration: 1, ease: 'power3.out', stagger: .08, delay: .3 });
}

function runLoader() {
  const loader = $('.loader');
  if (!hasGSAP || reduced) { loader.remove(); heroIntro(); return; }
  const num = $('.loader__num');
  const counter = { v: 0 };
  const img = mediaImg;
  const imgReady = img.complete ? Promise.resolve() : new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const timeout = new Promise(r => setTimeout(r, 4000));
  const ready = Promise.race([Promise.all([imgReady, fontsReady]), timeout]);

  const intro = gsap.timeline();
  intro.to('.loader__word span', { opacity: 1, y: 0, duration: .8, stagger: .06, ease: 'power3.out' })
    .to('.loader__box', { clipPath: 'inset(0 0% 0 0)', duration: .9, ease: 'power4.inOut' }, '-=.45')
    .to(counter, { v: 85, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { num.textContent = String(Math.round(counter.v)).padStart(2, '0'); } }, '<')
    .to('.loader__bar span', { scaleX: 1, duration: 1.9, ease: 'power2.inOut' }, 0)
    .to('.loader__sub', { opacity: 1, duration: .6 }, '-=1');

  Promise.all([ready, new Promise(r => intro.eventCallback('onComplete', r))]).then(() => {
    measureHero(); renderHero();
    gsap.timeline({ onComplete: () => loader.remove() })
      .to('.loader__logo, .loader__sub', { y: -30, opacity: 0, duration: .6, ease: 'power3.in' })
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power4.inOut' }, '-=.2')
      .add(heroIntro, '-=.75');
  });
}

/* ----------------------------------------------------------
   INICIO
   ---------------------------------------------------------- */
scrollTo(0, 0);
applyLang(lang, true);
renderTone(false);

if (hasGSAP && !reduced && typeof window.Lenis !== 'undefined') {
  lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

measureHero(); renderHero(); updateManifesto();
setupScrollAnimations();
if (!hasGSAP || reduced) staticFallback();
runLoader();

if (document.fonts) document.fonts.ready.then(() => { measureHero(); renderHero(); if (hasGSAP) ScrollTrigger.refresh(); });
addEventListener('load', () => { if (hasGSAP) ScrollTrigger.refresh(); });
})();
