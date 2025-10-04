import * as THREE from 'three';

export class ThreeBackground {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.createCyberpunkBackground();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000020, 50, 200);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 15, 50);
    this.camera.lookAt(0, 0, 0);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000020, 1);

    // Add resize listener
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  createCyberpunkBackground() {
    // Digital Earth Globe
    this.createDigitalEarth();

    // Holographic Grid Floor
    this.createHolographicGrid();

    // Data Particles
    this.createDataParticles();

    // Scan Lines Effect
    this.createScanLines();

    // Orbiting Data Rings
    this.createDataRings();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0066ff, 0.3);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight1.position.set(0, 20, 20);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 0.8, 100);
    pointLight2.position.set(0, -20, 20);
    this.scene.add(pointLight2);
  }

  createDigitalEarth() {
    // Main globe sphere
    const geometry = new THREE.SphereGeometry(10, 64, 64);

    // Wireframe material for digital look
    const material = new THREE.MeshPhongMaterial({
      color: 0x0088ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      emissive: 0x0044aa,
      emissiveIntensity: 0.5
    });

    this.earth = new THREE.Mesh(geometry, material);
    this.earth.position.set(0, 0, -20);
    this.scene.add(this.earth);

    // Inner glow sphere
    const glowGeometry = new THREE.SphereGeometry(9.8, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.earth.add(glow);

    // Outer atmosphere
    const atmoGeometry = new THREE.SphereGeometry(11, 64, 64);
    const atmoMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmoGeometry, atmoMaterial);
    this.earth.add(atmosphere);
  }

  createHolographicGrid() {
    // Create large grid
    const gridSize = 100;
    const divisions = 50;

    const grid1 = new THREE.GridHelper(gridSize, divisions, 0x00ffff, 0x004488);
    grid1.position.y = -15;
    grid1.material.transparent = true;
    grid1.material.opacity = 0.3;
    this.scene.add(grid1);

    // Animated scan grid
    const geometry = new THREE.PlaneGeometry(gridSize, gridSize, divisions, divisions);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });

    this.scanGrid = new THREE.Mesh(geometry, material);
    this.scanGrid.rotation.x = -Math.PI / 2;
    this.scanGrid.position.y = -14.9;
    this.scene.add(this.scanGrid);
  }

  createDataParticles() {
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Random positions in a cube
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      // Cyan/Magenta colors
      const color = new THREE.Color();
      color.setHSL(Math.random() > 0.5 ? 0.5 : 0.8, 1, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.dataParticles = new THREE.Points(geometry, material);
    this.scene.add(this.dataParticles);
  }

  createScanLines() {
    // Vertical scan beams
    const beamGeometry = new THREE.PlaneGeometry(0.1, 100);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    this.scanBeams = [];
    for (let i = 0; i < 8; i++) {
      const beam = new THREE.Mesh(beamGeometry, beamMaterial.clone());
      const angle = (i / 8) * Math.PI * 2;
      beam.position.set(
        Math.cos(angle) * 15,
        0,
        Math.sin(angle) * 15 - 20
      );
      beam.lookAt(0, 0, -20);
      this.scanBeams.push(beam);
      this.scene.add(beam);
    }
  }

  createDataRings() {
    this.dataRings = [];

    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.TorusGeometry(12 + i * 2, 0.1, 16, 100);
      const material = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00ffff : 0xff00ff,
        transparent: true,
        opacity: 0.4
      });

      const ring = new THREE.Mesh(geometry, material);
      ring.position.set(0, 0, -20);
      ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
      this.dataRings.push(ring);
      this.scene.add(ring);
    }
  }


  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    // Rotate digital earth
    if (this.earth) {
      this.earth.rotation.y += 0.002;
      this.earth.rotation.x = Math.sin(time * 0.2) * 0.1;
    }

    // Rotate data rings
    if (this.dataRings) {
      this.dataRings.forEach((ring, index) => {
        ring.rotation.z += 0.005 * (index + 1);
      });
    }

    // Animate scan grid
    if (this.scanGrid) {
      this.scanGrid.position.z = Math.sin(time) * 5;
    }

    // Animate scan beams
    if (this.scanBeams) {
      this.scanBeams.forEach((beam, index) => {
        beam.material.opacity = 0.2 + Math.sin(time * 2 + index) * 0.2;
      });
    }

    // Particle flow
    if (this.dataParticles) {
      const positions = this.dataParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + positions[i]) * 0.02;

        // Reset particles that go too high
        if (positions[i + 1] > 30) {
          positions[i + 1] = -30;
        }
      }
      this.dataParticles.geometry.attributes.position.needsUpdate = true;
      this.dataParticles.rotation.y += 0.001;
    }

    // Camera movement
    this.camera.position.x = Math.sin(time * 0.3) * 5;
    this.camera.position.y = 15 + Math.cos(time * 0.2) * 3;
    this.camera.lookAt(0, 0, -20);

    this.renderer.render(this.scene, this.camera);
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Remove resize listener
    window.removeEventListener('resize', () => this.onWindowResize());

    // Dispose of geometries and materials
    this.scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.renderer.dispose();
  }
}
