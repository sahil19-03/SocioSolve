/**
 * SocioSolve — Unified DB Seeder (Pristine Mode)
 * ─────────────────────────────────────────────────────────────────────
 * Wipes the database and seeds ONLY:
 * 1. 11 Real Role Accounts
 * 2. 11 Real Indian Societal Problem Statements (published/open)
 *
 * NO fake teams, NO fake solutions. The user can perform the entire
 * workflow manually via the UI.
 *
 * Run: node backend/seed.js
 * ─────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const { sequelize } = require('./config/database');
const { User, Challenge } = require('./models');
const bcrypt = require('bcryptjs');

const upsertUser = async (where, data) => {
  const [user] = await User.findOrCreate({ where, defaults: { ...data, password: 'password123' } });
  user.password = 'password123';
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

    const admin = await upsertUser({ email: 'admin@sociosolve.in' }, {
      name: 'System Administrator', role: 'admin',
      organization: 'SocioSolve National Platform',
      state: 'Delhi', district: 'New Delhi',
      bio: 'Platform administrator managing SocioSolve national innovation network.'
    });

    const citizen = await upsertUser({ email: 'sunita.deshmukh@jaldrishti.org' }, {
      name: 'Sunita Deshmukh', role: 'citizen', phone: '+91 94220 38471',
      organization: 'Jal-Drishti Water Conservation NGO', organizationType: 'ngo',
      state: 'Maharashtra', district: 'Nashik',
      bio: 'Social activist working on safe drinking water access.',
      interests: ['water_sanitation', 'tribal_rights', 'rural_livelihoods']
    });

    const nodal = await upsertUser({ email: 'nodal.water@jharkhand.gov.in' }, {
      name: 'Shri Manoj Kumar Sinha, IAS', role: 'nodal_officer', phone: '+91 651 2400123',
      organization: 'Dept. of Drinking Water & Sanitation, Govt. of Jharkhand',
      state: 'Jharkhand', district: 'Ranchi',
      bio: 'IAS officer with 18 years of service in rural water infrastructure.',
      registrationNo: 'IAS-JH-2006-BATCH-DWS'
    });

    const uniAdmin = await upsertUser({ email: 'coordinator@iitm.ac.in' }, {
      name: 'Prof. Meera Krishnamurthy', role: 'university_admin', phone: '+91 44 2257 8000',
      organization: 'IIT Madras', institutionType: 'hei',
      state: 'Tamil Nadu', district: 'Chennai',
      website: 'https://www.iitm.ac.in', registrationNo: 'NAAC-A++-IITM-2024',
      bio: 'Innovation Cell Director at IIT Madras.'
    });

    const faculty = await upsertUser({ email: 'faculty@nit.ac.in' }, {
      name: 'Dr. Rajesh Verma', role: 'faculty', phone: '+91 870 2459 301',
      organization: 'Dept. of Electronics & Telecommunication — NIT Warangal',
      university: 'NIT Warangal',
      state: 'Telangana', district: 'Warangal',
      bio: 'Professor with 17 years in wireless sensor networks.',
      skills: ['IoT', 'Embedded Systems', 'LoRaWAN']
    });

    const student = await upsertUser({ email: 'aarav.sharma@student.iitm.ac.in' }, {
      name: 'Aarav Sharma', role: 'student', phone: '+91 98765 43210',
      university: 'IIT Madras', state: 'Tamil Nadu', district: 'Chennai',
      bio: 'Final-year B.Tech student in Engineering Design.',
      skills: ['React', 'Node.js', 'Python', 'IoT', 'Embedded C', 'LoRaWAN'],
      interests: ['water_sanitation', 'solar_energy']
    });

    const student2 = await upsertUser({ email: 'priya.nair@student.iitm.ac.in' }, {
      name: 'Priya Nair', role: 'student', phone: '+91 97890 12345',
      university: 'IIT Madras', state: 'Tamil Nadu', district: 'Chennai',
      bio: 'M.Tech Water Resources Engineering.',
      skills: ['GIS', 'Python', 'Water Chemistry', 'PostGIS'],
      interests: ['water_sanitation', 'gis']
    });

    const student3 = await upsertUser({ email: 'rahul.gupta@student.iitm.ac.in' }, {
      name: 'Rahul Gupta', role: 'student', phone: '+91 93456 78901',
      university: 'IIT Madras', state: 'Uttar Pradesh', district: 'Varanasi',
      bio: 'B.Tech Computer Science.',
      skills: ['React', 'React Native', 'Node.js', 'PostgreSQL'],
      interests: ['public_administration', 'smart_cities']
    });

    const expert = await upsertUser({ email: 'priya.narang@ecogrid.in' }, {
      name: 'Dr. Priya Narang', role: 'expert', phone: '+91 80 4567 8901',
      organization: 'EcoGrid Dynamics Pvt Ltd',
      state: 'Karnataka', district: 'Bengaluru',
      bio: 'Principal Systems Architect.',
      skills: ['IoT', 'Solar Energy', 'System Architecture']
    });

    const industryPartner = await upsertUser({ email: 'partnerships@techinnovate.in' }, {
      name: 'Vikram Bose', role: 'industry_partner', phone: '+91 98400 56789',
      organization: 'TechInnovate Solutions Pvt Ltd', institutionType: 'startup',
      state: 'Karnataka', district: 'Bengaluru',
      website: 'https://techinnovate.in', registrationNo: 'GST29ABCDE1234F1Z5',
      bio: 'Founder of TechInnovate, a deep-tech startup.'
    });

    const community = await upsertUser({ email: 'ramesh.patil@gramsabha.in' }, {
      name: 'Ramesh Patil', role: 'community', phone: '+91 95527 34567',
      organization: 'Gram Sabha — Gumla Block B, Jharkhand', organizationType: 'community_org',
      state: 'Jharkhand', district: 'Gumla',
      bio: 'Sarpanch of Gumla Block B Panchayat.'
    });

    console.log('✅ All 11 user accounts ready.');

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

    for (const c of challengesData) {
      await Challenge.create(c);
    }
    console.log('✅ Problem statements seeded.');

    console.log('\n✅ ═══════════════════════════════════════════════════');
    console.log('   SocioSolve Unified DB Seeded Successfully!');
    console.log('   11 Users & 11 Challenges are ready for manual testing.');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    process.exit(0);
  }
}

seed();
