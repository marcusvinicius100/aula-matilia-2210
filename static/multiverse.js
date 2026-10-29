/**
 * MULTIVERSE — Realidades Alternativas
 * Motor 3D WebGL (Three.js), Simulação Gravitacional & Experiências Interativas
 */

// Estado Global da Aplicação
const MultiverseState = {
  currentDimension: null,
  isWarping: false,
  opticalSpectrum: 'visible', // 'visible', 'darkmatter', 'gravitational'
  cinemaMode: false,
  audioMuted: true,
  dimensions: [
    {
      id: 'chronos',
      number: 'DIM-01',
      name: 'Chronos-9',
      subtitle: 'Dimensão do Tempo Revertido',
      desc: 'Onde o efeito precede a causa e supernovas se reconstituem no tempo.',
      color: 0xffd166,
      themeColor: '#ffd166',
      position: { x: -80, y: 25, z: -40 },
      size: 7.5,
      hasRings: true,
      atmosphereColor: 0xffaa00
    },
    {
      id: 'cyber',
      number: 'DIM-02',
      name: 'Cyber-Matrix',
      subtitle: 'Cosmos Sintético de Luz',
      desc: 'Planetas construídos com matrizes quânticas e oceanos de luz sintetizada.',
      color: 0x00f0ff,
      themeColor: '#00f0ff',
      position: { x: 75, y: -20, z: -60 },
      size: 6.8,
      hasRings: true,
      atmosphereColor: 0x00b4d8
    },
    {
      id: 'gaia',
      number: 'DIM-03',
      name: 'Gaia Lumina',
      subtitle: 'Solarpunk Biocósmico',
      desc: 'Cidades gravitacionais flutuantes e florestas estelares bioluminescentes.',
      color: 0x06d6a0,
      themeColor: '#06d6a0',
      position: { x: -65, y: -35, z: 50 },
      size: 7.2,
      hasRings: false,
      atmosphereColor: 0x00ffa3
    },
    {
      id: 'singularity',
      number: 'DIM-04',
      name: 'Singularity Void',
      subtitle: 'O Buraco Negro Consciente',
      desc: 'O horizonte de eventos onde todas as linhas temporais colapsam em uma só.',
      color: 0x111116,
      themeColor: '#ef476f',
      position: { x: 0, y: 0, z: 0 }, // Centro do Multiverso
      size: 11,
      isBlackHole: true,
      hasRings: true,
      atmosphereColor: 0xff0055
    },
    {
      id: 'aethel',
      number: 'DIM-05',
      name: 'Aethelgard',
      subtitle: 'Dimensão Cristalina & Oráculo',
      desc: 'Mundo de cristais harmônicos que sintonizam a consciência do multiverso.',
      color: 0xb5179e,
      themeColor: '#b5179e',
      position: { x: 60, y: 40, z: 45 },
      size: 6.5,
      hasRings: false,
      atmosphereColor: 0x7209b7
    },
    {
      id: 'mirror',
      number: 'DIM-06',
      name: 'Nexus Mirror',
      subtitle: 'O Scanner de Eus Alternativos',
      desc: 'O ponto de convergência quântica onde suas outras versões habitam.',
      color: 0x4cc9f0,
      themeColor: '#7209b7',
      position: { x: 0, y: 70, z: -85 },
      size: 6.0,
      hasRings: true,
      atmosphereColor: 0x9d4edd
    }
  ]
};

// Componentes Three.js
let scene, camera, renderer, controls;
let starField, starGeometry, starVelocities;
let celestialBodies = [];
let raycaster, mouse;
let blackHoleDisk;
let nebulaParticles;

// Inicialização Principal
document.addEventListener('DOMContentLoaded', () => {
  initThree();
  initCosmicSky();
  initDimensions();
  initEventListeners();
  initTelemetryLoop();
  animate();
});

function initThree() {
  const canvas = document.getElementById('webgl-canvas');
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03040a, 0.0012);

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 3000);
  camera.position.set(0, 45, 180);

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 500;
  controls.minDistance = 15;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;

  // Luzes Cósmicas
  const ambientLight = new THREE.AmbientLight(0x222944, 1.2);
  scene.add(ambientLight);

  const coreLight = new THREE.PointLight(0x00f0ff, 3, 400);
  coreLight.position.set(0, 0, 0);
  scene.add(coreLight);

  const starGlowLight = new THREE.DirectionalLight(0xffeedd, 0.8);
  starGlowLight.position.set(100, 150, 100);
  scene.add(starGlowLight);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Criação do Céu Estelar com Milhares de Estrelas e Nebulosas
function initCosmicSky() {
  const starCount = 5000;
  starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  starVelocities = new Float32Array(starCount);

  const palette = [
    new THREE.Color(0xffffff),
    new THREE.Color(0x00f0ff),
    new THREE.Color(0x9d4edd),
    new THREE.Color(0xffd166),
    new THREE.Color(0x80ffdb)
  ];

  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 1600;
    const y = (Math.random() - 0.5) * 1600;
    const z = (Math.random() - 0.5) * 1600;

    starPositions[i * 3] = x;
    starPositions[i * 3 + 1] = y;
    starPositions[i * 3 + 2] = z;

    const col = palette[Math.floor(Math.random() * palette.length)];
    starColors[i * 3] = col.r;
    starColors[i * 3 + 1] = col.g;
    starColors[i * 3 + 2] = col.b;

    starVelocities[i] = Math.random() * 0.5 + 0.2;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  // Textura procedural de partícula estrela
  const starCanvas = document.createElement('canvas');
  starCanvas.width = 32;
  starCanvas.height = 32;
  const ctx = starCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(0,240,255,0.8)');
  grad.addColorStop(0.7, 'rgba(157,78,221,0.2)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);

  const starTexture = new THREE.CanvasTexture(starCanvas);

  const starMaterial = new THREE.PointsMaterial({
    size: 2.4,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);

  // Nebulosa Volumétrica Cósmica
  const nebulaCount = 600;
  const nebulaGeo = new THREE.BufferGeometry();
  const nebPositions = new Float32Array(nebulaCount * 3);
  const nebColors = new Float32Array(nebulaCount * 3);

  for (let i = 0; i < nebulaCount; i++) {
    const radius = 100 + Math.random() * 200;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;

    nebPositions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
    nebPositions[i * 3 + 1] = radius * Math.sin(phi) * 0.4;
    nebPositions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

    const isCyan = Math.random() > 0.5;
    const color = isCyan ? new THREE.Color(0x00f0ff) : new THREE.Color(0x9d4edd);
    nebColors[i * 3] = color.r;
    nebColors[i * 3 + 1] = color.g;
    nebColors[i * 3 + 2] = color.b;
  }

  nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebPositions, 3));
  nebulaGeo.setAttribute('color', new THREE.BufferAttribute(nebColors, 3));

  const nebulaMat = new THREE.PointsMaterial({
    size: 35,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  nebulaParticles = new THREE.Points(nebulaGeo, nebulaMat);
  scene.add(nebulaParticles);
}

// Criação dos Planetas, Dimensões e Buraco Negro
function initDimensions() {
  MultiverseState.dimensions.forEach((dim) => {
    const group = new THREE.Group();
    group.position.set(dim.position.x, dim.position.y, dim.position.z);
    group.userData = dim;

    if (dim.isBlackHole) {
      // 1. Buraco Negro Singular
      const sphereGeo = new THREE.SphereGeometry(dim.size, 64, 64);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const blackSphere = new THREE.Mesh(sphereGeo, sphereMat);
      group.add(blackSphere);

      // Disco de Acreção Brilhante
      const diskGeo = new THREE.RingGeometry(dim.size * 1.3, dim.size * 3.2, 80);
      const diskMat = new THREE.MeshBasicMaterial({
        color: 0xff6b35,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      blackHoleDisk = new THREE.Mesh(diskGeo, diskMat);
      blackHoleDisk.rotation.x = Math.PI / 2.3;
      group.add(blackHoleDisk);

      // Halo de Lente Gravitacional
      const haloGeo = new THREE.SphereGeometry(dim.size * 1.15, 32, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xff0055,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      group.add(halo);

    } else {
      // 2. Planetas das Dimensões
      const geo = new THREE.SphereGeometry(dim.size, 48, 48);
      
      let mat;
      if (dim.id === 'cyber') {
        // Planeta Cibernético com wireframe de dados
        mat = new THREE.MeshStandardMaterial({
          color: dim.color,
          roughness: 0.2,
          metalness: 0.85,
          wireframe: false
        });
        const cyberGrid = new THREE.Mesh(
          new THREE.SphereGeometry(dim.size * 1.02, 24, 24),
          new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.5 })
        );
        group.add(cyberGrid);
      } else {
        mat = new THREE.MeshStandardMaterial({
          color: dim.color,
          roughness: 0.65,
          metalness: 0.2
        });
      }

      const planet = new THREE.Mesh(geo, mat);
      group.add(planet);

      // Atmosfera Fresnel Glow
      const glowGeo = new THREE.SphereGeometry(dim.size * 1.12, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: dim.atmosphereColor,
        transparent: true,
        opacity: 0.25,
        side: THREE.BackSide
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      group.add(glow);

      // Anéis Orbitais se houver
      if (dim.hasRings) {
        const ringGeo = new THREE.RingGeometry(dim.size * 1.4, dim.size * 2.3, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: dim.atmosphereColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.5;
        group.add(ring);
      }
    }

    // Linha de órbita estética conectando ao centro
    if (!dim.isBlackHole) {
      const dist = Math.sqrt(dim.position.x ** 2 + dim.position.z ** 2);
      const orbitGeo = new THREE.BufferGeometry();
      const points = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * dist, dim.position.y * 0.1, Math.sin(angle) * dist));
      }
      orbitGeo.setFromPoints(points);
      const orbitLine = new THREE.Line(
        orbitGeo,
        new THREE.LineBasicMaterial({ color: dim.color, transparent: true, opacity: 0.12 })
      );
      scene.add(orbitLine);
    }

    scene.add(group);
    celestialBodies.push(group);
  });
}

// Salto Quântico / Dobra Espacial (Warp Drive)
function warpToDimension(dimId) {
  const targetObj = celestialBodies.find(b => b.userData.id === dimId);
  if (!targetObj || MultiverseState.isWarping) return;

  MultiverseState.isWarping = true;
  MultiverseState.currentDimension = targetObj.userData;
  controls.autoRotate = false;

  // Som do salto
  if (window.cosmicAudio) {
    window.cosmicAudio.playWarpSound();
  }

  // Efeito Visual de Túnel de Luz
  const overlay = document.getElementById('warp-overlay');
  overlay.classList.add('active');

  // Posição final da câmera focada no planeta
  const targetPos = targetObj.position;
  const offset = targetObj.userData.size * 3.5;
  const endCamPos = new THREE.Vector3(
    targetPos.x + offset * 0.8,
    targetPos.y + offset * 0.5,
    targetPos.z + offset * 1.2
  );

  // Animação de aceleração da câmera
  const startPos = camera.position.clone();
  const startTime = performance.now();
  const duration = 1800; // 1.8 segundos de salto cinematográfico

  function animateWarp(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Curva cúbica para desaceleração dramática
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    camera.position.lerpVectors(startPos, endCamPos, easeProgress);
    controls.target.lerp(targetPos, easeProgress);
    controls.update();

    if (progress < 1) {
      requestAnimationFrame(animateWarp);
    } else {
      MultiverseState.isWarping = false;
      overlay.classList.remove('active');
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.2;

      // Atualiza botões ativos na interface
      updateActiveButtons(dimId);

      // Abre a experiência interativa da dimensão
      openDimensionExperience(targetObj.userData);
    }
  }

  requestAnimationFrame(animateWarp);
}

// Atualiza a seleção visual dos botões
function updateActiveButtons(dimId) {
  document.querySelectorAll('.reality-card-btn').forEach(btn => {
    if (btn.dataset.dim === dimId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Abre o Modal com a Experiência Interativa Específica
function openDimensionExperience(dimData) {
  const modal = document.getElementById('experience-modal');
  const title = document.getElementById('modal-dim-title');
  const subtitle = document.getElementById('modal-dim-subtitle');
  const body = document.getElementById('modal-experience-body');

  title.textContent = dimData.name;
  subtitle.textContent = `${dimData.number} • ${dimData.subtitle}`;

  // Injetar a experiência interativa correspondente
  body.innerHTML = getExperienceHTML(dimData.id);
  modal.classList.add('open');

  // Inicializar os scripts interativos daquela dimensão específica
  initSpecificExperienceLogic(dimData.id);
}

// Conteúdos HTML das 6 Experiências Interativas
function getExperienceHTML(dimId) {
  switch (dimId) {
    case 'chronos':
      return `
        <div class="time-rewind-container">
          <p style="color: var(--text-dim); text-align: center; max-width: 650px;">
            Nesta dimensão, a seta termodinâmica flui em sentido oposto. Mova o <strong>Reversor de Entropia</strong> abaixo para rebobinar o tempo cósmico de uma Supernova destruída até sua reconstituição original.
          </p>
          <div class="time-canvas-preview">
            <canvas id="chronos-canvas" width="700" height="280"></canvas>
          </div>
          <div class="time-slider-wrapper">
            <input type="range" id="entropy-slider" min="0" max="100" value="80">
            <div class="entropy-log" id="entropy-text">⏳ Estado Temporal: Entropia Revertendo em 80%</div>
          </div>
        </div>
      `;

    case 'cyber':
      return `
        <div>
          <p style="color: var(--text-dim); text-align: center;">
            Toque nas <strong>Cordas Gravitacionais Harmônicas</strong> para modular as ondas do espaço-tempo em tempo real. Cada corda emite uma frequência de ressonância dimensional diferente.
          </p>
          <div class="synth-strings-container">
            <div class="synth-string" data-note="220"><span>A3</span><div class="wave-pulse"></div><span>220Hz</span></div>
            <div class="synth-string" data-note="277"><span>C#4</span><div class="wave-pulse"></div><span>277Hz</span></div>
            <div class="synth-string" data-note="330"><span>E4</span><div class="wave-pulse"></div><span>330Hz</span></div>
            <div class="synth-string" data-note="370"><span>F#4</span><div class="wave-pulse"></div><span>370Hz</span></div>
            <div class="synth-string" data-note="440"><span>A4</span><div class="wave-pulse"></div><span>440Hz</span></div>
            <div class="synth-string" data-note="554"><span>C#5</span><div class="wave-pulse"></div><span>554Hz</span></div>
          </div>
          <p style="text-align: center; margin-top: 1rem; font-family: var(--font-hud); color: var(--cyan-primary);">
            ✨ Passe o mouse ou clique sobre as cordas para compor harmônicos cósmicos.
          </p>
        </div>
      `;

    case 'gaia':
      return `
        <div>
          <p style="color: var(--text-dim); margin-bottom: 1rem; text-align: center;">
            Arraste o <strong>Divisor Dimensional Quântico</strong> para comparar o planeta Terra da nossa linha de tempo com a civilização avançada de Gaia Lumina (onde o vácuo quântico e a biomassa pura venceram).
          </p>
          <div class="quantum-lens-container" id="gaia-lens-box">
            <div class="lens-bg-image lens-current-earth">
              <div>
                <h3 style="color: #ffaa00; font-family: var(--font-display);">Linha do Tempo Atual (Terra 1.0)</h3>
                <p>Combustíveis fósseis, saturação atmosférica de carbono (420ppm), arquitetura terrestre pesada e ecossistemas sob estresse.</p>
              </div>
            </div>
            <div class="lens-bg-image lens-alternate-earth" id="gaia-alt-layer">
              <div>
                <h3 style="color: #00ffa3; font-family: var(--font-display);">Gaia Lumina (Realidade Paralela)</h3>
                <p>Cidades antigravitacionais magnéticas, fotossíntese estelar artificial, emissão zero de resíduos e bioestruturas em órbita pura.</p>
              </div>
            </div>
            <div class="lens-divider" id="gaia-divider"></div>
          </div>
        </div>
      `;

    case 'singularity':
      return `
        <div>
          <p style="color: var(--text-dim); text-align: center; margin-bottom: 0.8rem;">
            Você está diante de <strong>Leviatã</strong>, o horizonte de eventos com consciência. Mova o cursor para criar uma distorção de <em>Lente Gravitacional (Gravitational Lensing)</em> que curva a luz das galáxias ao redor.
          </p>
          <div class="singularity-interactive-wrap">
            <canvas id="singularity-canvas"></canvas>
          </div>
          <p style="text-align: center; margin-top: 0.8rem; font-family: var(--font-hud); color: #ef476f;">
            ⚠️ Clique sobre o buraco negro para emitir um pulso de radiação Hawking.
          </p>
        </div>
      `;

    case 'aethel':
      return `
        <div class="oracle-container">
          <p style="color: var(--text-dim);">
            Conecte-se com a <strong>Consciência do Oráculo Multiversal</strong>. Faça qualquer pergunta sobre o destino das galáxias, a natureza da realidade ou o significado do tempo.
          </p>
          <div class="oracle-dialog" id="oracle-chat-box">
            <div style="color: var(--purple-portal); font-weight: bold; margin-bottom: 0.5rem;">[Oráculo de Aethelgard]</div>
            <p id="oracle-msg">"Eu sou a ressonância de infinitas probabilidades. O que a sua consciência busca vislumbrar no tecido do espaço-tempo?"</p>
          </div>
          <div class="oracle-input-row">
            <input type="text" id="oracle-input" class="oracle-input" placeholder="Ex: O que acontece se o tempo parar? Qual meu destino nas estrelas?" />
            <button class="dock-btn-main" id="oracle-send-btn">Consultar</button>
          </div>
        </div>
      `;

    case 'mirror':
      return `
        <div>
          <p style="color: var(--text-dim); margin-bottom: 1rem; text-align: center;">
            Descubra quem você é na dimensão paralela mais próxima. Responda aos 3 parâmetros quânticos para emitir o seu <strong>Passaporte Multiversal</strong>.
          </p>
          <form class="alternate-me-form" id="alt-me-form" onsubmit="return false;">
            <div class="form-group">
              <label>Seu Nome ou Codinome Terrestre</label>
              <input type="text" id="alt-name" placeholder="Ex: Marcus / Sarah / Alex" required />
            </div>
            <div class="form-group">
              <label>Qual elemento te atrai mais no vácuo?</label>
              <select id="alt-element">
                <option value="plasma">Plasma Solar de Supernovas</option>
                <option value="darkmatter">Matéria Escura Invisível</option>
                <option value="crystal">Cristais Ressonantes de Vácuo</option>
                <option value="entropy">O Fluxo Temporal Reverso</option>
              </select>
            </div>
            <div class="form-group">
              <label>Seu maior dilema cósmico</label>
              <select id="alt-dilemma">
                <option value="explore">Explorar galáxias desconhecidas sozinho</option>
                <option value="protect">Proteger a última estrela do universo</option>
                <option value="decode">Decodificar o código da criação do cosmos</option>
              </select>
            </div>
            <div class="form-group" style="justify-content: flex-end;">
              <button class="dock-btn-main" id="btn-scan-alt-me" style="width: 100%;">
                ⚛️ Escanear Minha Variante
              </button>
            </div>

            <!-- Passaporte Gerado -->
            <div class="passport-result" id="passport-box">
              <div class="passport-header">
                <div>
                  <h3 style="font-family: var(--font-display); color: #fff;">PASSAPORTE MULTIVERSAL</h3>
                  <span style="font-family: var(--font-hud); color: var(--purple-portal); font-size: 0.8rem;">AUTORIDADE DE FRONTEIRAS INTERDIMENSIONAIS</span>
                </div>
                <div style="font-size: 1.8rem;">🌌</div>
              </div>
              <div class="passport-grid">
                <div class="pass-item">
                  <span class="pass-label">IDENTIDADE</span>
                  <span class="pass-val" id="p-name"></span>
                </div>
                <div class="pass-item">
                  <span class="pass-label">DIMENSÃO DE ORIGEM</span>
                  <span class="pass-val" id="p-dim"></span>
                </div>
                <div class="pass-item">
                  <span class="pass-label">OCUPAÇÃO PARALELA</span>
                  <span class="pass-val" id="p-role"></span>
                </div>
                <div class="pass-item">
                  <span class="pass-label">FREQUÊNCIA DE CORDA</span>
                  <span class="pass-val" id="p-freq"></span>
                </div>
                <div class="pass-item">
                  <span class="pass-label">HABILIDADE QUÂNTICA</span>
                  <span class="pass-val" id="p-power"></span>
                </div>
                <div class="pass-item">
                  <span class="pass-label">STATUS DE EXISTÊNCIA</span>
                  <span class="pass-val" style="color: #00ffa3;">ATIVO E SOBERANO</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      `;

    default:
      return `<p>Dimensão em calibração quântica.</p>`;
  }
}

// Lógica Interativa Individual para cada Dimensão
function initSpecificExperienceLogic(dimId) {
  if (dimId === 'chronos') {
    initChronosCanvas();
  } else if (dimId === 'cyber') {
    initCyberSynth();
  } else if (dimId === 'gaia') {
    initGaiaLens();
  } else if (dimId === 'singularity') {
    initSingularityLensing();
  } else if (dimId === 'aethel') {
    initOracleChat();
  } else if (dimId === 'mirror') {
    initAlternateMeScanner();
  }
}

// 1. Simulação Chronos (Reversão de Tempo)
function initChronosCanvas() {
  const canvas = document.getElementById('chronos-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('entropy-slider');
  const entropyText = document.getElementById('entropy-text');

  // Gerar partículas estelares de uma explosão
  const particles = [];
  const count = 120;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const maxDist = Math.random() * 220 + 30;
    const speed = Math.random() * 0.8 + 0.2;
    particles.push({
      angle,
      maxDist,
      speed,
      size: Math.random() * 3 + 1,
      color: Math.random() > 0.4 ? '#ffd166' : '#ff5964'
    });
  }

  function render(entropyVal) {
    ctx.fillStyle = '#020307';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Núcleo Estelar
    const coreRadius = Math.max(8, (100 - entropyVal) * 0.35);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 2);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#ffd166');
    grad.addColorStop(1, 'rgba(255, 209, 102, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Partículas explodindo ou regredindo conforme slider
    particles.forEach(p => {
      const currentDist = (entropyVal / 100) * p.maxDist;
      const x = cx + Math.cos(p.angle) * currentDist;
      const y = cy + Math.sin(p.angle) * currentDist;

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Traço de cauda reversa
      if (entropyVal < 80) {
        ctx.strokeStyle = 'rgba(255, 209, 102, 0.25)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(cx, cy);
        ctx.stroke();
      }
    });
  }

  render(slider.value);

  slider.addEventListener('input', (e) => {
    const val = e.target.value;
    entropyText.textContent = `⏳ Entropia Revertida: ${100 - val}% (Ano Cósmico ${Math.floor(val * 140)}M A.C.)`;
    render(val);
    if (window.cosmicAudio && Math.random() > 0.7) {
      window.cosmicAudio.playHoverBlip(200 + val * 6);
    }
  });
}

// 2. Sintetizador Cyber Matrix
function initCyberSynth() {
  document.querySelectorAll('.synth-string').forEach(str => {
    const note = parseFloat(str.dataset.note);
    const trigger = () => {
      str.classList.add('active');
      setTimeout(() => str.classList.remove('active'), 250);
      if (window.cosmicAudio) {
        window.cosmicAudio.playSynthNote(note);
      }
    };
    str.addEventListener('mouseenter', trigger);
    str.addEventListener('click', trigger);
  });
}

// 3. Lente de Realidade Gaia Lumina
function initGaiaLens() {
  const box = document.getElementById('gaia-lens-box');
  const divider = document.getElementById('gaia-divider');
  const altLayer = document.getElementById('gaia-alt-layer');
  if (!box || !divider || !altLayer) return;

  let isDragging = false;

  const updateSplit = (clientX) => {
    const rect = box.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(20, Math.min(x, rect.width - 20));
    const percent = (x / rect.width) * 100;

    divider.style.left = `${percent}%`;
    altLayer.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0% 100%)`;
  };

  box.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSplit(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) updateSplit(e.clientX);
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  box.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) updateSplit(e.touches[0].clientX);
  });
}

// 4. Buraco Negro - Gravitational Lensing Canvas
function initSingularityLensing() {
  const canvas = document.getElementById('singularity-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = 300;

  let bhX = canvas.width / 2;
  let bhY = canvas.height / 2;

  // Background estelar denso
  const stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      origX: Math.random() * canvas.width,
      origY: Math.random() * canvas.height,
      r: Math.random() * 2 + 1
    });
  }

  function draw() {
    ctx.fillStyle = '#05070f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bending de luz (Curvatura de espaço-tempo)
    stars.forEach(s => {
      const dx = s.origX - bhX;
      const dy = s.origY - bhY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Desvio gravitacional
      if (dist > 30) {
        const force = 900 / dist;
        s.x = s.origX - (dx / dist) * force;
        s.y = s.origY - (dy / dist) * force;
      } else {
        s.x = s.origX;
        s.y = s.origY;
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Disco de Acreção
    const glow = ctx.createRadialGradient(bhX, bhY, 20, bhX, bhY, 70);
    glow.addColorStop(0, '#000000');
    glow.addColorStop(0.35, 'rgba(255, 60, 100, 0.9)');
    glow.addColorStop(0.7, 'rgba(255, 170, 0, 0.5)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(bhX, bhY, 70, 0, Math.PI * 2);
    ctx.fill();

    // Sombra do Buraco Negro (Horizonte de Eventos)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(bhX, bhY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff2a5f';
    ctx.lineWidth = 2;
    ctx.stroke();

    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    bhX = e.clientX - rect.left;
    bhY = e.clientY - rect.top;
  });

  canvas.addEventListener('click', () => {
    if (window.cosmicAudio) {
      window.cosmicAudio.playSingularityDrone();
    }
  });

  draw();
}

// 5. Oráculo de Aethelgard
function initOracleChat() {
  const input = document.getElementById('oracle-input');
  const btn = document.getElementById('oracle-send-btn');
  const msgBox = document.getElementById('oracle-msg');

  const ask = async () => {
    const q = input.value.trim();
    if (!q) return;

    msgBox.textContent = "Sintonizando harmônicos através das membranas dimensionais...";
    input.value = "";

    try {
      const resp = await fetch('/api/multiverse/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      const data = await resp.json();
      msgBox.textContent = `"${data.answer}"`;
    } catch (e) {
      // Fallback cósmico procedural
      const answers = [
        "Em uma das infinitas realidades, você já descobriu a resposta antes mesmo de fazer a pergunta. O tempo é apenas um prisma.",
        "As estrelas de Aethelgard sussurram que cada escolha sua ramifica uma nova constelação no vácuo quântico.",
        "Não tema a imensidão do vácuo: tudo o que você procura está em ressonância exata com a sua frequência presente.",
        "A gravidade não é uma prisão, é a melodia que mantém os mundos dançando em uníssono."
      ];
      msgBox.textContent = `"${answers[Math.floor(Math.random() * answers.length)]}"`;
    }
  };

  btn.onclick = ask;
  input.onkeydown = (e) => { if (e.key === 'Enter') ask(); };
}

// 6. Scanner de Eu Alternativo
function initAlternateMeScanner() {
  const btn = document.getElementById('btn-scan-alt-me');
  const nameInput = document.getElementById('alt-name');
  const passBox = document.getElementById('passport-box');

  btn.onclick = () => {
    const name = nameInput.value.trim() || "Viajante Anônimo";

    if (window.cosmicAudio) {
      window.cosmicAudio.playScanTone();
    }

    // Gerar características procedurais
    const roles = [
      "Cartógrafo de Buracos de Minhoca",
      "Alquimista de Plasma em Kepler-452b",
      "Guardião da Biblioteca do Fim do Tempo",
      "Arquiteto de Ilhas Flutuantes em Gaia",
      "Piloto de Veleiro Fóton-Magnético",
      "Compositor de Frequências Estelares"
    ];

    const powers = [
      "Visão de Dobra Temporal",
      "Sintonia com Matéria Escura",
      "Manipulação de Gravidade Fóton",
      "Telepatia Taquiônica",
      "Respiração no Vácuo Interestelar"
    ];

    const dims = [
      "Dimensão 7.4-Omega",
      "Constelação de Cygnus Prime",
      "Setor Quântico Zeta-9",
      "Nebulosa de Orion Interior"
    ];

    document.getElementById('p-name').textContent = name.toUpperCase();
    document.getElementById('p-dim').textContent = dims[Math.floor(Math.random() * dims.length)];
    document.getElementById('p-role').textContent = roles[Math.floor(Math.random() * roles.length)];
    document.getElementById('p-freq').textContent = `${(Math.random() * 400 + 400).toFixed(2)} THz`;
    document.getElementById('p-power').textContent = powers[Math.floor(Math.random() * powers.length)];

    passBox.style.display = 'block';
  };
}

// Loop de Telemetria no HUD
function initTelemetryLoop() {
  const redShift = document.getElementById('tele-redshift');
  const tachyons = document.getElementById('tele-tachyons');
  const sector = document.getElementById('tele-sector');

  setInterval(() => {
    if (redShift) {
      const z = (Math.random() * 0.05 + 0.12).toFixed(4);
      redShift.textContent = `z = +${z}`;
    }
    if (tachyons) {
      const fl = (Math.random() * 80 + 920).toFixed(1);
      tachyons.textContent = `${fl} Tq/s`;
    }
  }, 2000);
}

// Event Listeners da Interface
function initEventListeners() {
  // Clique nas Realidades no Dock Lateral
  document.querySelectorAll('.reality-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dimId = btn.dataset.dim;
      warpToDimension(dimId);
    });

    btn.addEventListener('mouseenter', () => {
      if (window.cosmicAudio) {
        window.cosmicAudio.playHoverBlip(480);
      }
    });
  });

  // Botão de Fechar Modal
  const closeBtn = document.getElementById('modal-close-btn');
  const modal = document.getElementById('experience-modal');
  if (closeBtn && modal) {
    closeBtn.onclick = () => modal.classList.remove('open');
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove('open');
    };
  }

  // Botão de Áudio
  const audioBtn = document.getElementById('btn-toggle-audio');
  if (audioBtn) {
    audioBtn.onclick = () => {
      const active = window.cosmicAudio.toggleMute();
      audioBtn.classList.toggle('active', active);
      audioBtn.innerHTML = active ? '🔊 Áudio On' : '🔇 Áudio Off';
    };
  }

  // Botão de Salto Aleatório
  const randomWarpBtn = document.getElementById('btn-random-warp');
  if (randomWarpBtn) {
    randomWarpBtn.onclick = () => {
      const keys = MultiverseState.dimensions.map(d => d.id);
      const chosen = keys[Math.floor(Math.random() * keys.length)];
      warpToDimension(chosen);
    };
  }

  // Botão de Espectro Óptico
  const spectrumBtn = document.getElementById('btn-toggle-spectrum');
  if (spectrumBtn) {
    spectrumBtn.onclick = () => {
      if (MultiverseState.opticalSpectrum === 'visible') {
        MultiverseState.opticalSpectrum = 'darkmatter';
        spectrumBtn.textContent = '🟣 Espectro: Matéria Escura';
        renderer.toneMappingExposure = 1.9;
        scene.fog.color.setHex(0x1a0628);
      } else if (MultiverseState.opticalSpectrum === 'darkmatter') {
        MultiverseState.opticalSpectrum = 'gravitational';
        spectrumBtn.textContent = '🔴 Espectro: Raio-X Gravitacional';
        renderer.toneMappingExposure = 2.4;
        scene.fog.color.setHex(0x28050e);
      } else {
        MultiverseState.opticalSpectrum = 'visible';
        spectrumBtn.textContent = '👁️ Espectro: Visível';
        renderer.toneMappingExposure = 1.2;
        scene.fog.color.setHex(0x03040a);
      }
    };
  }

  // Raycasting ao clicar no Canvas 3D diretamente nos planetas
  window.addEventListener('click', onCanvasClick);
  window.addEventListener('mousemove', onCanvasHover);
}

function onCanvasHover(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onCanvasClick(event) {
  // Ignora cliques que vierem de botões da interface HUD
  if (event.target.closest('.top-hud') || event.target.closest('.realities-dock') || 
      event.target.closest('.bottom-dock') || event.target.closest('.modal-overlay')) {
    return;
  }

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  for (let hit of intersects) {
    let curr = hit.object;
    while (curr && !curr.userData.id && curr.parent) {
      curr = curr.parent;
    }
    if (curr && curr.userData.id) {
      warpToDimension(curr.userData.id);
      break;
    }
  }
}

// Loop de Renderização Contínua
function animate() {
  requestAnimationFrame(animate);

  // Rotação dos Corpos Celestes
  celestialBodies.forEach(b => {
    b.rotation.y += 0.005;
    if (b.userData.isBlackHole && blackHoleDisk) {
      blackHoleDisk.rotation.z += 0.015;
    }
  });

  // Movimento de Nebulosa
  if (nebulaParticles) {
    nebulaParticles.rotation.y += 0.0003;
  }

  // Efeito de estrelas se movendo durante Warp Drive
  if (starField && MultiverseState.isWarping) {
    starField.rotation.y += 0.015;
  } else if (starField) {
    starField.rotation.y += 0.0002;
  }

  controls.update();
  renderer.render(scene, camera);
}
