/**
 * @fileoverview Support networks data for kidney patients and carers.
 * Contains national and regional UK support organisations.
 * @module data/supportNetworks
 */

export interface SupportNetwork {
  id: string;
  name: string;
  type: 'national' | 'regional' | 'nhs-trust' | 'condition-specific' | 'carer-support';
  regions: string[]; // Keywords for search matching
  description: string;
  services: string[];
  phone?: string;
  website: string;
  forCarers: boolean;
  forPatients: boolean;
}

/**
 * UK kidney support networks database.
 * Includes national organisations, NHS trusts, and carer-specific support.
 */
export const SUPPORT_NETWORKS: SupportNetwork[] = [
  // === NATIONAL ORGANISATIONS ===
  {
    id: 'kidney-care-uk',
    name: 'Kidney Care UK',
    type: 'national',
    regions: ['uk', 'national', 'england', 'wales', 'scotland', 'northern ireland'],
    description: 'The leading UK kidney patient support charity providing practical, emotional and financial support to kidney patients and their families.',
    services: [
      'Helpline support',
      'Counselling services',
      'Financial grants',
      'Peer support partnerships',
      'Patient advocacy',
      'Information resources'
    ],
    phone: '0808 801 0000',
    website: 'https://kidneycareuk.org/',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'national-kidney-federation',
    name: 'National Kidney Federation',
    type: 'national',
    regions: ['uk', 'national', 'england', 'wales', 'scotland', 'northern ireland'],
    description: 'Federation of over 50 local kidney patient associations across the UK, offering peer support and advocacy.',
    services: [
      'Helpline support',
      'Local patient groups',
      'Trained peer supporters',
      'Holiday dialysis information',
      'Advocacy services'
    ],
    phone: '0800 169 0936',
    website: 'https://www.kidney.org.uk/',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'kidney-research-uk',
    name: 'Kidney Research UK',
    type: 'national',
    regions: ['uk', 'national', 'england', 'wales', 'scotland', 'northern ireland'],
    description: 'Funding life-saving research and providing information about kidney disease prevention, treatment and management.',
    services: [
      'Research funding',
      'Health information',
      'Patient involvement network',
      'Educational resources'
    ],
    website: 'https://kidneyresearchuk.org/',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'carers-uk',
    name: 'Carers UK',
    type: 'carer-support',
    regions: ['uk', 'national', 'england', 'wales', 'scotland', 'northern ireland'],
    description: 'The national charity for carers, providing expert advice, information and support for anyone caring for family or friends.',
    services: [
      'Helpline support',
      'Online community',
      'Carers rights information',
      'Financial support advice',
      'Local carer services directory'
    ],
    phone: '0808 808 7777',
    website: 'https://www.carersuk.org/',
    forCarers: true,
    forPatients: false,
  },
  {
    id: 'carers-trust',
    name: 'Carers Trust',
    type: 'carer-support',
    regions: ['uk', 'national', 'england', 'wales', 'scotland', 'northern ireland'],
    description: 'Network of local carer centres providing replacement care and support services to carers across the UK.',
    services: [
      'Respite care',
      'Carer breaks',
      'Local support groups',
      'Young carers support',
      'Carer assessments'
    ],
    website: 'https://carers.org/',
    forCarers: true,
    forPatients: false,
  },
  {
    id: 'kidney-patient-involvement-network',
    name: 'Kidney Patient Involvement Network (KPIN)',
    type: 'national',
    regions: ['uk', 'national', 'england', 'wales', 'scotland', 'northern ireland'],
    description: 'Inclusive network for kidney patients, carers and health professionals to get involved in improving kidney services.',
    services: [
      'Patient involvement opportunities',
      'Research participation',
      'Service improvement',
      'Peer networking'
    ],
    website: 'https://kpin.org.uk/',
    forCarers: true,
    forPatients: true,
  },

  // === CONDITION-SPECIFIC ===
  {
    id: 'pkd-charity',
    name: 'PKD Charity',
    type: 'condition-specific',
    regions: ['uk', 'national', 'polycystic', 'pkd'],
    description: 'Support and information for people affected by Polycystic Kidney Disease (PKD) and their families.',
    services: [
      'Helpline support',
      'Local support groups',
      'Information resources',
      'Research updates',
      'Family support'
    ],
    phone: '0300 111 1234',
    website: 'https://pkdcharity.org.uk/',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'nest-trust',
    name: 'NeST (Nephrotic Syndrome Trust)',
    type: 'condition-specific',
    regions: ['uk', 'national', 'nephrotic', 'syndrome'],
    description: 'Support for people affected by Nephrotic Syndrome and their families.',
    services: [
      'Support groups',
      'Information resources',
      'Family support',
      'Research updates'
    ],
    website: 'https://nstrust.org/',
    forCarers: true,
    forPatients: true,
  },

  // === REGIONAL - YORKSHIRE ===
  {
    id: 'kidney-research-yorkshire',
    name: 'Kidney Research Yorkshire',
    type: 'regional',
    regions: ['yorkshire', 'leeds', 'bradford', 'sheffield', 'york', 'hull', 'wakefield', 'huddersfield', 'halifax', 'dewsbury', 'barnsley', 'doncaster', 'rotherham'],
    description: 'Funding kidney disease research in Yorkshire and supporting local kidney patients.',
    services: [
      'Research funding',
      'Patient support',
      'Local events',
      'Educational resources'
    ],
    website: 'https://www.kidneyresearchyorkshire.org.uk/',
    forCarers: true,
    forPatients: true,
  },

  // === NHS TRUSTS ===
  {
    id: 'bradford-teaching-hospitals',
    name: 'Bradford Teaching Hospitals NHS Foundation Trust - Renal Services',
    type: 'nhs-trust',
    regions: ['bradford', 'airedale', 'skipton', 'keighley', 'shipley', 'bingley', 'ilkley', 'west yorkshire'],
    description: 'Comprehensive renal services including dialysis units at St Luke\'s Hospital and Bradford Royal Infirmary, serving Bradford and surrounding areas.',
    services: [
      'Haemodialysis',
      'Peritoneal dialysis',
      'Transplant care',
      'Outpatient clinics',
      'Pre-dialysis education'
    ],
    website: 'https://www.bradfordhospitals.nhs.uk/renal-services/',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'leeds-teaching-hospitals',
    name: 'Leeds Teaching Hospitals NHS Trust - Renal Services',
    type: 'nhs-trust',
    regions: ['leeds', 'wakefield', 'dewsbury', 'huddersfield', 'halifax', 'beeston', 'seacroft', 'west yorkshire'],
    description: 'Major regional renal centre at St James\'s University Hospital providing inpatient, outpatient, dialysis and transplant services.',
    services: [
      'Haemodialysis',
      'Peritoneal dialysis',
      'Kidney transplant centre',
      'Satellite dialysis units',
      'Outpatient clinics'
    ],
    website: 'https://www.leedsth.nhs.uk/services/clinical-and-health-psychology/renal-kidney-medicine/',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'manchester-royal-infirmary',
    name: 'Manchester Royal Infirmary - Renal Services',
    type: 'nhs-trust',
    regions: ['manchester', 'tameside', 'glossop', 'stockport', 'trafford', 'salford', 'greater manchester', 'south cheshire'],
    description: 'East Sector renal services serving Greater Manchester, providing comprehensive kidney care for over 1.4 million people.',
    services: [
      'Haemodialysis',
      'Peritoneal dialysis',
      'Transplant services',
      'Holiday dialysis support',
      'Outpatient clinics'
    ],
    website: 'https://mft.nhs.uk/mri/services/renal-care/',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'sheffield-teaching-hospitals',
    name: 'Sheffield Teaching Hospitals NHS Foundation Trust - Renal Services',
    type: 'nhs-trust',
    regions: ['sheffield', 'barnsley', 'rotherham', 'doncaster', 'chesterfield', 'south yorkshire'],
    description: 'Renal services at the Northern General Hospital providing dialysis, transplant and outpatient care for South Yorkshire.',
    services: [
      'Haemodialysis',
      'Peritoneal dialysis',
      'Transplant services',
      'Outpatient clinics',
      'Pre-dialysis education'
    ],
    website: 'https://www.sth.nhs.uk/services/a-z-of-services?id=47',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'oxford-kidney-unit',
    name: 'Oxford Kidney Unit',
    type: 'nhs-trust',
    regions: ['oxford', 'oxfordshire', 'buckinghamshire', 'swindon', 'reading', 'berkshire', 'south east'],
    description: 'Comprehensive regional renal service covering Oxfordshire, Buckinghamshire and surrounding areas.',
    services: [
      'Haemodialysis',
      'Peritoneal dialysis',
      'Transplant services',
      'Outpatient clinics',
      'Pre-dialysis education'
    ],
    website: 'https://www.ouh.nhs.uk/oku/',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'guys-st-thomas-renal',
    name: 'Guy\'s and St Thomas\' NHS Foundation Trust - Renal Services',
    type: 'nhs-trust',
    regions: ['london', 'southwark', 'lambeth', 'lewisham', 'greenwich', 'bromley', 'kent', 'south london', 'south east'],
    description: 'Major London renal centre providing comprehensive kidney services including one of the UK\'s largest transplant programmes.',
    services: [
      'Haemodialysis',
      'Peritoneal dialysis',
      'Transplant centre',
      'Living donor programme',
      'Outpatient clinics'
    ],
    website: 'https://www.guysandstthomas.nhs.uk/our-services/kidney-services',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'royal-free-renal',
    name: 'Royal Free London NHS Foundation Trust - Renal Services',
    type: 'nhs-trust',
    regions: ['london', 'hampstead', 'barnet', 'enfield', 'haringey', 'camden', 'north london'],
    description: 'North London renal services including the UK\'s largest peritoneal dialysis programme.',
    services: [
      'Haemodialysis',
      'Peritoneal dialysis',
      'Transplant services',
      'Outpatient clinics',
      'Pre-dialysis education'
    ],
    website: 'https://www.royalfree.nhs.uk/services/services-a-z/renal-services/',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'birmingham-university-hospitals-renal',
    name: 'University Hospitals Birmingham - Renal Services',
    type: 'nhs-trust',
    regions: ['birmingham', 'solihull', 'west midlands', 'warwickshire', 'worcestershire'],
    description: 'One of the largest renal units in Europe providing comprehensive kidney care and transplant services.',
    services: [
      'Haemodialysis',
      'Peritoneal dialysis',
      'Transplant centre',
      'Living donor programme',
      'Outpatient clinics'
    ],
    website: 'https://www.uhb.nhs.uk/services/renal-services.htm',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'newcastle-renal-services',
    name: 'Newcastle upon Tyne Hospitals NHS Foundation Trust - Renal Services',
    type: 'nhs-trust',
    regions: ['newcastle', 'gateshead', 'sunderland', 'durham', 'northumberland', 'north east', 'tyneside'],
    description: 'Regional renal centre providing comprehensive kidney services for the North East.',
    services: [
      'Haemodialysis',
      'Peritoneal dialysis',
      'Transplant services',
      'Outpatient clinics',
      'Pre-dialysis education'
    ],
    website: 'https://www.newcastle-hospitals.nhs.uk/services/renal-medicine/',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'liverpool-renal-services',
    name: 'Royal Liverpool and Broadgreen University Hospitals - Renal Services',
    type: 'nhs-trust',
    regions: ['liverpool', 'merseyside', 'wirral', 'st helens', 'knowsley', 'sefton', 'north west'],
    description: 'Renal services for Merseyside including dialysis and transplant care.',
    services: [
      'Haemodialysis',
      'Peritoneal dialysis',
      'Transplant services',
      'Outpatient clinics',
      'Pre-dialysis education'
    ],
    website: 'https://www.rlbuht.nhs.uk/our-services/services-list/renal-medicine/',
    forCarers: true,
    forPatients: true,
  },
  {
    id: 'bristol-renal-services',
    name: 'North Bristol NHS Trust - Richard Bright Renal Unit',
    type: 'nhs-trust',
    regions: ['bristol', 'bath', 'somerset', 'gloucestershire', 'wiltshire', 'south west'],
    description: 'Regional renal centre at Southmead Hospital serving the South West.',
    services: [
      'Haemodialysis',
      'Peritoneal dialysis',
      'Transplant services',
      'Outpatient clinics',
      'Pre-dialysis education'
    ],
    website: 'https://www.nbt.nhs.uk/our-services/a-z-services/renal-services',
    forCarers: true,
    forPatients: true,
  },

  // === SCOTLAND ===
  {
    id: 'scottish-renal-association',
    name: 'Scottish Renal Association',
    type: 'regional',
    regions: ['scotland', 'edinburgh', 'glasgow', 'aberdeen', 'dundee', 'inverness', 'scottish'],
    description: 'Supporting kidney patients across Scotland with local groups and resources.',
    services: [
      'Local patient groups',
      'Information resources',
      'Patient advocacy',
      'Peer support'
    ],
    website: 'https://www.scottishrenal.org/',
    forCarers: true,
    forPatients: true,
  },

  // === WALES ===
  {
    id: 'kidney-wales',
    name: 'Kidney Wales',
    type: 'regional',
    regions: ['wales', 'cardiff', 'swansea', 'newport', 'bangor', 'welsh'],
    description: 'Supporting kidney patients and families across Wales.',
    services: [
      'Support groups',
      'Information resources',
      'Patient advocacy',
      'Welsh language support'
    ],
    website: 'https://www.kidneywales.cymru/',
    forCarers: true,
    forPatients: true,
  },

  // === NORTHERN IRELAND ===
  {
    id: 'ni-kidney-patient-association',
    name: 'Northern Ireland Kidney Patient Association',
    type: 'regional',
    regions: ['northern ireland', 'belfast', 'derry', 'newry', 'armagh', 'ni'],
    description: 'Supporting kidney patients across Northern Ireland.',
    services: [
      'Support groups',
      'Patient advocacy',
      'Information resources',
      'Peer support'
    ],
    website: 'https://nikpa.org/',
    forCarers: true,
    forPatients: true,
  },
];

/**
 * Search support networks by region/location.
 * @param query - Search query (city, region, or keyword)
 * @returns Matching support networks sorted by relevance
 */
export function searchSupportNetworks(query: string): SupportNetwork[] {
  if (!query.trim()) {
    return SUPPORT_NETWORKS.filter(n => n.type === 'national' || n.type === 'carer-support');
  }

  const searchTerms = query.toLowerCase().split(/\s+/);

  const results = SUPPORT_NETWORKS.filter(network => {
    const searchableText = [
      network.name.toLowerCase(),
      network.description.toLowerCase(),
      ...network.regions.map(r => r.toLowerCase()),
      ...network.services.map(s => s.toLowerCase()),
    ].join(' ');

    return searchTerms.some(term => searchableText.includes(term));
  });

  // Sort: national orgs first, then by match relevance
  return results.sort((a, b) => {
    const aIsNational = a.type === 'national' || a.type === 'carer-support';
    const bIsNational = b.type === 'national' || b.type === 'carer-support';

    if (aIsNational && !bIsNational) return -1;
    if (!aIsNational && bIsNational) return 1;
    return 0;
  });
}

/**
 * Filter support networks by type.
 * @param networks - Networks to filter
 * @param filter - Filter type ('all' | 'patient' | 'carer' | 'nhs' | 'national')
 * @returns Filtered networks
 */
export function filterSupportNetworks(
  networks: SupportNetwork[],
  filter: 'all' | 'patient' | 'carer' | 'nhs' | 'national'
): SupportNetwork[] {
  switch (filter) {
    case 'patient':
      return networks.filter(n => n.forPatients && n.type !== 'carer-support');
    case 'carer':
      return networks.filter(n => n.forCarers && (n.type === 'carer-support' || n.forCarers));
    case 'nhs':
      return networks.filter(n => n.type === 'nhs-trust');
    case 'national':
      return networks.filter(n => n.type === 'national' || n.type === 'carer-support');
    default:
      return networks;
  }
}

/**
 * Get all national support organisations.
 */
export function getNationalOrganisations(): SupportNetwork[] {
  return SUPPORT_NETWORKS.filter(n => n.type === 'national' || n.type === 'carer-support');
}
