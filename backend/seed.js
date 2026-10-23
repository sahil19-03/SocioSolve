/**
 * SocioSolve — Unified DB Seeder (Pristine Mode)
 * ─────────────────────────────────────────────────────────────────────
 * Wipes the database and seeds:
 * 1. 13 role accounts covering all user roles
 * 2. 11 Real Indian Societal Problem Statements (published/open)
 * 3. Industry partnership records for the Industry Portal dashboard
 *
 * NO fake teams, NO fake solutions. The seeded partnerships populate the
 * Industry Portal while the user can perform the team/solution workflow via the UI.
 *
 * In a disposable local/test database, set SEED_DEMO_PASSWORD and
 * SEED_ALLOW_DATABASE_RESET=true in .env, then run:
 * node backend/seed.js
 * ─────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const { sequelize } = require('./config/database');
const { User, Challenge, IndustryPartnership } = require('./models');

if (!['development', 'test'].includes(process.env.NODE_ENV)) {
  throw new Error('Refusing to run the destructive seeder unless NODE_ENV is development or test.');
}

if (process.env.SEED_ALLOW_DATABASE_RESET !== 'true') {
  throw new Error('Refusing to reset the database. Set SEED_ALLOW_DATABASE_RESET=true only for a disposable development/test database.');
}

const seedPassword = process.env.SEED_DEMO_PASSWORD;
if (!seedPassword || (seedPassword !== 'password123' && seedPassword.length < 16) || seedPassword === 'replace-with-a-unique-local-password') {
  throw new Error('For local demo accounts, set SEED_DEMO_PASSWORD=password123, or use a unique password of at least 16 characters.');
}

const upsertUser = async (where, data) => {
  const [user] = await User.findOrCreate({ where, defaults: { ...data, password: seedPassword } });
  user.password = seedPassword;
  await user.save();
  return user;
};

async function seed() {
  try {
    console.log('🔄 Dropping all tables and wiping database (force: true)…');
    // Use force: true to guarantee no ghost data from previous seeds
    await sequelize.sync({ force: true });

    /* ═══════════════════════════════════════════════════════════════
       STEP 1 — ALL ROLE ACCOUNTS
       ═══════════════════════════════════════════════════════════════ */
    console.log('\n👤 Creating role accounts…');

    const admin = await upsertUser({ email: 'admin@example.invalid' }, {
      name: 'Arjun Mehta', role: 'admin',
      organization: 'SocioSolve Platform', state: 'Delhi', district: 'New Delhi',
      bio: 'Platform administrator responsible for content moderation and user management.'
    });

    const citizen = await upsertUser({ email: 'citizen@example.invalid' }, {
      name: 'Priya Nair', role: 'citizen',
      organization: 'Jal-Drishti Water Conservation NGO', organizationType: 'ngo',
      state: 'Maharashtra', district: 'Nashik',
      bio: 'Grassroots activist focused on rural water access and community sanitation.',
      interests: ['water_sanitation', 'tribal_rights', 'rural_livelihoods']
    });

    const nodal = await upsertUser({ email: 'nodal.officer@example.invalid' }, {
      name: 'Rajesh Kumar Singh', role: 'nodal_officer',
      organization: 'Jharkhand Jal Mission', state: 'Jharkhand', district: 'Ranchi',
      bio: 'Nodal officer coordinating water and sanitation projects across the district.', registrationNo: 'JH-OFFICER-001'
    });

    const uniAdmin = await upsertUser({ email: 'university.admin@example.invalid' }, {
      name: 'Dr. Lakshmi Subramaniam', role: 'university_admin',
      organization: 'Anna Technical University', institutionType: 'hei',
      state: 'Tamil Nadu', district: 'Chennai', website: 'https://example.invalid',
      registrationNo: 'TN-HEI-2024-001', bio: 'University administrator overseeing innovation cell and student challenge registrations.'
    });

    const faculty = await upsertUser({ email: 'faculty@example.invalid' }, {
      name: 'Prof. Venkat Rao', role: 'faculty',
      organization: 'Department of Electronics & Communication', university: 'Anna Technical University',
      state: 'Telangana', district: 'Warangal',
      bio: 'Faculty mentor specialising in IoT and embedded systems for rural technology applications.',
      skills: ['IoT', 'Embedded Systems', 'LoRaWAN']
    });

    const student = await upsertUser({ email: 'student.one@example.invalid' }, {
      name: 'Ananya Krishnan', role: 'student',
      university: 'Anna Technical University', state: 'Tamil Nadu', district: 'Chennai',
      bio: 'Final-year ECE student passionate about IoT-based rural water and energy solutions.',
      skills: ['React', 'Node.js', 'Python', 'IoT', 'Embedded C', 'LoRaWAN'],
      interests: ['water_sanitation', 'solar_energy']
    });

    const student2 = await upsertUser({ email: 'student.two@example.invalid' }, {
      name: 'Karthik Balaji', role: 'student',
      university: 'Anna Technical University', state: 'Tamil Nadu', district: 'Chennai',
      bio: 'Civil engineering student with a focus on GIS-based water resource mapping.',
      skills: ['GIS', 'Python', 'Water Chemistry', 'PostGIS'],
      interests: ['water_sanitation', 'gis']
    });

    const student3 = await upsertUser({ email: 'student.three@example.invalid' }, {
      name: 'Sneha Tiwari', role: 'student',
      university: 'Banaras Hindu University', state: 'Uttar Pradesh', district: 'Varanasi',
      bio: 'Computer science student building civic-tech apps for urban governance.',
      skills: ['React', 'React Native', 'Node.js', 'PostgreSQL'],
      interests: ['public_administration', 'smart_cities']
    });

    const expert = await upsertUser({ email: 'expert@example.invalid' }, {
      name: 'Dr. Suresh Iyer', role: 'expert', organization: 'Indian Institute of Science',
      state: 'Karnataka', district: 'Bengaluru',
      bio: 'Senior researcher specialising in renewable energy systems and IoT architecture for social impact.',
      skills: ['IoT', 'Solar Energy', 'System Architecture']
    });

    const industryPartner = await upsertUser({ email: 'industry.partner@example.invalid' }, {
      name: 'Meghna Sharma', role: 'industry_partner',
      organization: 'GreenEdge Technologies', organizationType: 'industry', institutionType: 'startup',
      state: 'Karnataka', district: 'Bengaluru', website: 'https://example.invalid',
      registrationNo: 'KA-STARTUP-2024-112',
      bio: 'Co-founder of a cleantech startup focused on solar-IoT solutions for rural municipalities.'
    });

    const csrPartner = await upsertUser({ email: 'csr.partner@example.invalid' }, {
      name: 'Rohit Agarwal', role: 'industry_partner',
      organization: 'Tata Community Impact Foundation', organizationType: 'industry', institutionType: 'csr',
      state: 'Jharkhand', district: 'Ranchi', website: 'https://example.invalid',
      registrationNo: 'JH-CSR-2024-009',
      bio: 'CSR lead managing community welfare initiatives and pilot programme funding in tribal regions.'
    });

    const msmePartner = await upsertUser({ email: 'msme.partner@example.invalid' }, {
      name: 'Divya Chandrasekaran', role: 'industry_partner',
      organization: 'AquaSense Instruments', organizationType: 'industry', institutionType: 'msme',
      state: 'Tamil Nadu', district: 'Chennai', website: 'https://example.invalid',
      registrationNo: 'TN-MSME-2024-447',
      bio: 'Founder of an MSME manufacturing affordable water-quality sensors for field deployments.'
    });

    const community = await upsertUser({ email: 'community.member@example.invalid' }, {
      name: 'Sunita Oraon', role: 'community',
      organization: 'Gumla Gram Vikas Samiti', organizationType: 'community_org',
      state: 'Jharkhand', district: 'Gumla',
      bio: 'Community leader representing panchayat voices on local water and health challenges.'
    });

    console.log('All 13 role accounts ready.');

    /* ═══════════════════════════════════════════════════════════════
       STEP 2 — REAL PROBLEM STATEMENTS (OPEN & PUBLISHED ONLY)
       ═══════════════════════════════════════════════════════════════ */
    console.log('\n📋 Seeding real societal problem statements…');

    const challengesData = [
      {
        title: 'Severe Summer Drinking Water Shortage & Groundwater Depletion in Gumla Block',
        description: `Over 8 panchayats in Gumla district experience chronic seasonal drinking water depletion from March to June every year. Hand pumps run dry as water tables plunge below 80 meters during peak summer, forcing women and children to walk up to 4 km daily to fetch water from distant ponds — which are often contaminated.\n\nREQUIRED TECHNICAL INTERVENTION:\nAn IoT-enabled smart community borewell pumping and water allocation kiosk powered by solar micro-grids.`,
        category: 'water', difficulty: 'intermediate',
        status: 'published',
        submissionCode: 'JH-WAT-2026-001',
        state: 'Jharkhand', district: 'Gumla', pincode: '835207',
        impactScope: 'district', location: 'Gumla Block — 8 Gram Panchayats',
        affectedPopulation: '12,000 rural villagers',
        urgency: 'critical',
        requiredSkills: ['IoT', 'Embedded Systems', 'Solar Power', 'React', 'Node.js', 'LoRaWAN'],
        tags: ['water', 'solar', 'iot', 'rural_livelihoods'],
        submitterId: citizen.id, submitterOrg: 'Jal-Drishti Water Conservation NGO',
        teamCount: 0, solutionCount: 0, viewCount: 45
      },
      {
        title: 'Panchayat Health Sub-Centre Cold Chain Solar Monitoring in Latehar',
        description: `Primary health sub-centres in Latehar frequently encounter spoiled vaccine batches due to undetected temperature excursions during power outages.\n\nRequired Intervention:\nLow-cost cellular-connected IoT temperature dataloggers with threshold buzzer alerts and SMS escalations.`,
        category: 'healthcare', difficulty: 'beginner',
        status: 'published',
        submissionCode: 'JH-HEA-2026-004',
        state: 'Jharkhand', district: 'Latehar', pincode: '829206',
        impactScope: 'district', location: 'Latehar District Health Sub-Centres',
        affectedPopulation: '65,000 citizens',
        urgency: 'high',
        requiredSkills: ['IoT', 'Arduino', 'Python', 'React'],
        tags: ['healthcare', 'iot', 'vaccine', 'cold_chain'],
        submitterId: citizen.id, submitterOrg: citizen.organization,
        teamCount: 0, solutionCount: 0, viewCount: 88
      },
      {
        title: 'Solar-Powered Automated Fluoride & Nitrate Filtration Kiosks for Schools',
        description: `Over 40 government primary schools in Palamu district face high groundwater fluoride and nitrate levels exceeding WHO permissible limits. Children exhibit early symptoms of dental and skeletal fluorosis.\n\nRequired Intervention:\nA rugged, solar-powered electrocoagulation and filtration unit with automated backwash cycle, continuous water quality telemetry, and RFID student drinking water dispense accounting.`,
        category: 'water', difficulty: 'advanced',
        status: 'published',
        submissionCode: 'JH-WAT-2026-009',
        state: 'Jharkhand', district: 'Palamu', pincode: '822101',
        impactScope: 'district', location: 'Palamu District Rural Primary Schools',
        affectedPopulation: '6,500 school students',
        urgency: 'high',
        requiredSkills: ['IoT', 'Embedded Systems', 'Solar Power', 'Water Chemistry'],
        tags: ['water', 'fluoride', 'solar', 'iot', 'schools'],
        submitterId: citizen.id, submitterOrg: citizen.organization,
        teamCount: 0, solutionCount: 0, viewCount: 112
      },
      {
        title: 'Real-Time Groundwater Arsenic & Salinity Telemetry Network',
        description: `Groundwater across multiple river basin belts suffers from severe seasonal fluctuations in arsenic and salinity levels. Current testing relies on sporadic manual lab samples collected weeks apart, leaving vulnerable rural populations unaware of toxic spikes.\n\nRequired Intervention:\nAn end-to-end solar-assisted telemetry node cluster that continuously measures electrochemical impedance and sends encrypted LoRaWAN telemetry to a centralized municipal water dashboard with automated SMS hazard alerts.`,
        category: 'water', difficulty: 'intermediate',
        status: 'published',
        state: 'West Bengal', district: 'Murshidabad', pincode: '742101',
        impactScope: 'state', location: 'West Bengal & Bihar Basin Belts',
        affectedPopulation: 'Over 45,000 rural residents',
        requiredSkills: ['IoT', 'LoRaWAN', 'Node.js', 'PostgreSQL', 'Embedded C', 'React'],
        tags: ['water', 'iot', 'sensors', 'public_health'],
        submitterId: citizen.id, submitterOrg: citizen.organization,
        teamCount: 0, solutionCount: 0, viewCount: 142
      },
      {
        title: 'AI Microgrid Peak Demand Balancer for Primary Health Sub-Centres',
        description: `Primary Health Centres (PHCs) in remote hilly regions frequently suffer unannounced power blackouts, jeopardizing refrigerated vaccine cold-chains and essential life-saving equipment.\n\nRequired Intervention:\nAn intelligent edge controller that prioritizes critical cold-chain power pathways, forecasts solar yield using local meteorological APIs, and automatically load-sheds non-essential circuits during grid outages.`,
        category: 'energy', difficulty: 'advanced',
        status: 'published',
        state: 'Uttarakhand', district: 'Chamoli', pincode: '246424',
        impactScope: 'district', location: 'Garhwal & Kumaon Himalayan PHCs',
        affectedPopulation: '22 rural primary healthcare clinics',
        requiredSkills: ['Python', 'Machine Learning', 'Edge Computing', 'React', 'Docker'],
        tags: ['energy', 'healthcare', 'microgrid', 'edge_ai'],
        submitterId: citizen.id, submitterOrg: citizen.organization,
        teamCount: 0, solutionCount: 0, viewCount: 98
      },
      {
        title: 'Computer Vision Automated Crop Pathology & Precision Pesticide Triage',
        description: `Smallholder cotton and legume farmers lose up to 35% of yield to late-stage fungal blast and pest infestations. Farmers over-apply expensive, toxic pesticides indiscriminately.\n\nRequired Intervention:\nA lightweight offline-first mobile application with on-device computer vision to diagnose foliar distress from phone camera images and compute precision micro-dosage recommendations in regional vernacular languages.`,
        category: 'agriculture', difficulty: 'intermediate',
        status: 'published',
        state: 'Maharashtra', district: 'Amravati', pincode: '444601',
        impactScope: 'state', location: 'Vidarbha & Marathwada Agrarian Zones',
        affectedPopulation: 'Smallholder farming collectives',
        requiredSkills: ['Computer Vision', 'PyTorch', 'TensorFlow Lite', 'React', 'Python'],
        tags: ['agriculture', 'computer_vision', 'mobile', 'offline_first'],
        submitterId: admin.id, submitterOrg: 'SocioSolve Foundation',
        teamCount: 0, solutionCount: 0, viewCount: 210
      },
      {
        title: 'Dynamic Routing & Fill-Level Telemetry for Municipal Solid Waste Corridors',
        description: `Urban waste management trucks run static daily routes irrespective of actual bin fill levels, causing fuel waste on half-empty bins while overflowing dumpsters remain uncollected for days.\n\nRequired Intervention:\nUltrasound sensor nodes on community dumpsters paired with an algorithmic dispatch router that dynamically recalculates sanitation truck paths to minimize diesel consumption while ensuring zero overflow.`,
        category: 'waste_management', difficulty: 'intermediate',
        status: 'published',
        state: 'Rajasthan', district: 'Jaipur', pincode: '302001',
        impactScope: 'district', location: 'Jaipur Municipal Corporation Wards',
        affectedPopulation: 'Urban sanitation departments and peri-urban wards',
        requiredSkills: ['GIS', 'Node.js', 'Graph Algorithms', 'React', 'IoT'],
        tags: ['waste_management', 'smart_city', 'routing', 'iot'],
        submitterId: admin.id, submitterOrg: 'Municipal Innovation Cell',
        teamCount: 0, solutionCount: 0, viewCount: 87
      },
      {
        title: 'Sign Language Recognition Kiosk for Government Service Counters',
        description: `Deaf and hard-of-hearing citizens face significant barriers accessing government services at counters such as ration offices, panchayat offices, and municipal bodies where no sign language interpreters are available.\n\nRequired Intervention:\nA real-time Indian Sign Language (ISL) recognition system using a webcam-based ML model, deployed on a low-cost kiosk at government service counters, that translates ISL gestures to text and voice in the local language.`,
        category: 'accessibility', difficulty: 'advanced',
        status: 'published',
        state: 'Tamil Nadu', district: 'Chennai', pincode: '600001',
        impactScope: 'national', location: 'Government Service Counters across Tamil Nadu',
        affectedPopulation: '18 million Deaf and hard-of-hearing citizens across India',
        requiredSkills: ['Computer Vision', 'MediaPipe', 'Python', 'React', 'NLP'],
        tags: ['accessibility', 'sign_language', 'ai', 'government'],
        submitterId: citizen.id, submitterOrg: 'Ability Foundation Chennai',
        teamCount: 0, solutionCount: 0, viewCount: 165
      },
      {
        title: 'Blockchain-Based Land Record Mutation Transparency Portal for Tribal Areas',
        description: `Tribal communities in Central India frequently lose ancestral land due to fraudulent mutations in revenue records. Land records are maintained on paper, making them susceptible to tampering.\n\nRequired Intervention:\nAn immutable blockchain-backed land record system linked to Aadhaar identity verification, with a multilingual mobile interface that allows tribals to view, verify, and raise disputes against their land mutation records.`,
        category: 'rural_livelihoods', difficulty: 'advanced',
        status: 'published',
        state: 'Jharkhand', district: 'Ranchi', pincode: '834001',
        impactScope: 'state', location: 'Tribal districts of Jharkhand & Chhattisgarh',
        affectedPopulation: '3.2 million Scheduled Tribe households in forest land zones',
        requiredSkills: ['Blockchain', 'Solidity', 'React', 'Node.js', 'Aadhaar API'],
        tags: ['rural_livelihoods', 'blockchain', 'land_records', 'tribal'],
        submitterId: admin.id, submitterOrg: 'Tribal Welfare Research Centre',
        teamCount: 0, solutionCount: 0, viewCount: 72
      },
      {
        title: 'Predictive Flood Inundation Mapping for Urban Drainage Systems',
        description: `Rapidly expanding urban areas in coastal and river-delta cities suffer recurrent waterlogging during monsoon due to undersized stormwater drains and blocked culverts. Municipal engineers lack predictive tools.\n\nRequired Intervention:\nA GIS-integrated flood simulation tool that ingests IMD rainfall forecasts, city DEM data, and real-time drain water-level sensors to generate 6-hour inundation probability maps with priority zone evacuation alerts.`,
        category: 'urban_infrastructure', difficulty: 'advanced',
        status: 'published',
        state: 'Kerala', district: 'Ernakulam', pincode: '682001',
        impactScope: 'state', location: 'Kochi Metropolitan Region',
        affectedPopulation: 'Urban residents in flood-prone zones of Kochi & Thrissur',
        requiredSkills: ['GIS', 'Python', 'Machine Learning', 'React', 'PostGIS'],
        tags: ['urban_infrastructure', 'flood', 'gis', 'prediction'],
        submitterId: citizen.id, submitterOrg: 'Kerala State Disaster Management Authority',
        teamCount: 0, solutionCount: 0, viewCount: 198
      },
      {
        title: 'AI-Driven Multilingual Grievance Classification for District Portals',
        description: `District-level public grievance portals receive thousands of complaints daily in multiple languages, many of which are misrouted to incorrect departments, causing delays of weeks or months.\n\nRequired Intervention:\nAn NLP classification pipeline that automatically identifies the department, urgency level, and sub-category of a grievance submitted in any of 10 Indian languages, and routes it with a generated SLA deadline to the correct officer's dashboard.`,
        category: 'public_administration', difficulty: 'intermediate',
        status: 'published',
        state: 'Uttar Pradesh', district: 'Lucknow', pincode: '226001',
        impactScope: 'national', location: 'District Collector Offices — Uttar Pradesh',
        affectedPopulation: '220 million+ citizens who file annual public grievances',
        requiredSkills: ['NLP', 'Transformers', 'Python', 'FastAPI', 'React', 'Hindi NLP'],
        tags: ['public_administration', 'nlp', 'grievance', 'multilingual'],
        submitterId: admin.id, submitterOrg: 'Digital India Cell — UP',
        teamCount: 0, solutionCount: 0, viewCount: 130
      }
    ];

    const challengesByCode = {};
    for (const c of challengesData) {
      const challenge = await Challenge.create(c);
      if (c.submissionCode) challengesByCode[c.submissionCode] = challenge;
    }
    console.log('✅ Problem statements seeded.');

    console.log('\n🤝 Seeding industry partnerships…');
    const partnershipData = [
      {
        industryPartnerId: industryPartner.id,
        challengeId: challengesByCode['JH-WAT-2026-001'].id,
        type: 'mentoring',
        status: 'active',
        proposal: 'Provide domain mentoring on solar-powered water systems, LoRaWAN sensor selection, and field deployment planning for the Gumla water challenge.',
        notes: 'Active partnership for the Industry Portal dashboard.'
      },
      {
        industryPartnerId: industryPartner.id,
        challengeId: challengesByCode['JH-HEA-2026-004'].id,
        type: 'prototyping',
        status: 'under_review',
        proposal: 'Offer access to a temperature-sensor prototyping kit and technical feedback for the vaccine cold-chain monitoring challenge.'
      },
      {
        industryPartnerId: industryPartner.id,
        challengeId: challengesByCode['JH-WAT-2026-009'].id,
        type: 'funding',
        status: 'proposed',
        proposal: 'Consider a small prototype grant for solar-powered school water filtration kiosks.',
        fundingAmount: 350000
      },
      {
        industryPartnerId: csrPartner.id,
        challengeId: challengesByCode['JH-WAT-2026-001'].id,
        type: 'csr',
        status: 'accepted',
        proposal: 'Support a community pilot for safe drinking-water access, including local participation and impact documentation.',
        fundingAmount: 500000,
        notes: 'Accepted CSR partnership for community pilot.'
      },
      {
        industryPartnerId: msmePartner.id,
        challengeId: challengesByCode['JH-HEA-2026-004'].id,
        type: 'pilot_implementation',
        status: 'proposed',
        proposal: 'Assess a pilot deployment of low-cost vaccine refrigerator temperature monitoring units at selected health sub-centres.'
      }
    ];

    for (const partnership of partnershipData) {
      await IndustryPartnership.create(partnership);
    }

    console.log('\n✅ ═══════════════════════════════════════════════════');
    console.log('   SocioSolve Unified DB Seeded Successfully!');
    console.log(`   13 Users, ${challengesData.length} Challenges & ${partnershipData.length} Industry Partnerships are ready for manual testing.`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
