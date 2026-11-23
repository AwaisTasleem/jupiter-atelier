export const CONFIG = {
  brand: "JUPITER",
  tagline: "A scroll-led tour of the largest planet in the Solar System",
  nav: [
    { label: "Atmosphere", href: "#atmosphere" },
    { label: "Palette", href: "#palette" },
    { label: "Missions", href: "#missions" },
  ],
  cta: { label: "Request briefing", href: "#briefing" },

  sections: [
    {
      id: "atmosphere", side: "left", label: "01 — ATMOSPHERE",
      title: "Bands of cloud, torn by wind.",
      body: "Jupiter's visible surface is a layer of ammonia-rich clouds stretched into light zones and dark belts by fast, alternating jet streams.",
    },
    {
      id: "spot", side: "right", label: "02 — GREAT RED SPOT",
      title: "A storm older than telescopes' memory.",
      body: "The Great Red Spot is a giant anticyclone that has been observed for well over a century and has been shrinking in recent decades.",
    },
    {
      id: "moons", side: "left", label: "03 — GALILEAN MOONS",
      title: "Four worlds, found in 1610.",
      body: "Io, Europa, Ganymede and Callisto were seen by Galileo Galilei. Each is a distinct world: volcanic, icy, enormous and ancient.",
    },
  ],

  palettes: [
    { id: "natural", label: "Natural", swatch: "#d9b48a" },
    { id: "infrared", label: "Infrared", swatch: "#e0603a" },
    { id: "ultraviolet", label: "Ultraviolet", swatch: "#7a6cff" },
  ],
  paletteCopy: {
    label: "04 — PALETTE", side: "right",
    title: "See it in other light.",
    body: "Choose a view. These are stylised colour treatments for this concept, not calibrated instrument data.",
  },

  facts: [
    { k: "Orbital period", v: "≈ 11.86 years" },
    { k: "Day length", v: "≈ 9 h 56 min" },
    { k: "Mass", v: "≈ 318 × Earth" },
    { k: "Distance from Sun", v: "≈ 5.2 AU" },
  ],

  missions: [
    {
      id: "juno",
      name: "Juno",
      agency: "NASA",
      status: "Arrived 2016",
      text: "Maps gravity, magnetic field and the deep atmosphere.",
      craft: "juno",
      launch: "5 Aug 2011",
      arrival: "July 2016",
      overview:
        "Juno flies a highly elliptical polar orbit that skims close to the cloud tops, then swings far out to limit radiation exposure. It studies what lies beneath the clouds: water abundance, interior structure and the magnetic field.",
      goals: [
        "Measure how much water is in the deep atmosphere",
        "Map the gravity field to learn about the core",
        "Map the magnetic field and study the auroras",
      ],
      robot: {
        title: "Spin-stabilised, solar-powered",
        blurb:
          "Three large solar arrays extend from a hexagonal body. The whole spacecraft spins slowly for stability, and the electronics sit inside a titanium radiation vault.",
        specs: [
          { k: "Solar arrays", v: "3 wings, ≈ 9 m long each" },
          { k: "Launch mass", v: "≈ 3.6 tonnes" },
          { k: "Science instruments", v: "9" },
        ],
        instruments: ["Microwave radiometer", "JIRAM infrared imager", "Magnetometer", "JunoCam", "Waves", "UV spectrograph"],
      },
    },
    {
      id: "juice",
      name: "JUICE",
      agency: "ESA",
      status: "Launched 2023",
      text: "Heads for Ganymede, Callisto and Europa.",
      craft: "juice",
      launch: "14 Apr 2023",
      arrival: "≈ 2031",
      overview:
        "JUICE (JUpiter ICy moons Explorer) will tour Jupiter's system, flying past Europa and Callisto, then settle into orbit around Ganymede, the largest moon in the Solar System.",
      goals: [
        "Characterise Ganymede's ocean, ice and magnetic field",
        "Study Callisto as a record of early history",
        "Investigate Europa's recently active regions",
      ],
      robot: {
        title: "Two big wings and an ice-penetrating radar",
        blurb:
          "Large solar wings gather power far from the Sun. A long radar antenna looks for structure beneath the icy crusts of the moons.",
        specs: [
          { k: "Radar antenna", v: "≈ 16 m (RIME)" },
          { k: "Launch mass", v: "≈ 6 tonnes" },
          { k: "Science instruments", v: "10" },
        ],
        instruments: ["RIME ice radar", "JANUS camera", "GALA laser altimeter", "Magnetometer", "Particle package"],
      },
    },
    {
      id: "clipper",
      name: "Europa Clipper",
      agency: "NASA",
      status: "Launched 2024",
      text: "Studies Europa's ice shell and ocean potential.",
      craft: "clipper",
      launch: "14 Oct 2024",
      arrival: "≈ 2030",
      overview:
        "Europa Clipper orbits Jupiter and makes dozens of close flybys of Europa. Its aim is to assess whether the moon has conditions that could be suitable for life, not to detect life directly.",
      goals: [
        "Measure the thickness of the ice shell",
        "Look for evidence of water below the surface",
        "Study surface composition and geology",
      ],
      robot: {
        title: "A solar-powered flyby specialist",
        blurb:
          "Two long solar arrays feed a compact body carrying radar, cameras and spectrometers. Flybys, rather than a single orbit, keep radiation exposure manageable.",
        specs: [
          { k: "Solar arrays", v: "≈ 30 m tip to tip" },
          { k: "Launch mass", v: "≈ 6 tonnes" },
          { k: "Europa flybys", v: "≈ 50 planned" },
        ],
        instruments: ["REASON ice radar", "Cameras (EIS)", "Thermal imager", "Mass spectrometers", "Dust analyser"],
      },
    },
  ],
  missionNote: "Figures are approximate and drawn from public agency material. Confirm current status with NASA or ESA.",

  funFacts: [
    "Jupiter holds more than twice the mass of all the other planets combined.",
    "A day on Jupiter lasts under ten hours, the shortest of any planet.",
    "Ganymede is larger than the planet Mercury.",
    "Jupiter's faint ring system was discovered by Voyager 1 in 1979.",
    "Jupiter has more than 90 known moons.",
  ],

  briefing: {
    title: "Request a mission briefing",
    note: "Demo form: nothing is sent anywhere until you connect a backend.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "topic", label: "Topic", type: "select", options: ["Atmosphere", "Moons", "Missions"] },
    ],
  },

  footer: "Concept project. Not affiliated with NASA, ESA or any agency. Facts are approximate.",
};