/* ============================================================
   九寬科技官網 - Three.js 粒子星空背景（僅首頁 Hero 用）
   依賴：Three.js (CDN)
   ============================================================ */
(function () {
  'use strict';
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    if (canvas) canvas.style.display = 'none';
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 320;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 粒子點
  const COUNT = 140;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const pts = [];
  for (let i = 0; i < COUNT; i++) {
    const x = (Math.random() - 0.5) * 600;
    const y = (Math.random() - 0.5) * 400;
    const z = (Math.random() - 0.5) * 400;
    positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
    // 藍→青色調
    const c = new THREE.Color().setHSL(0.54 + Math.random() * 0.12, 0.72, 0.6);
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    pts.push({ x: x, y: y, z: z, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({ size: 3.6, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // 粒子間連線
  const lineMat = new THREE.LineBasicMaterial({ color: 0x4f8cff, transparent: true, opacity: 0.14 });
  const lineGeo = new THREE.BufferGeometry();
  const linePos = new Float32Array(COUNT * COUNT * 3);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // 鼠標視差
  let mx = 0, my = 0;
  window.addEventListener('mousemove', function (e) {
    mx = (e.clientX / window.innerWidth - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  });

  // 尊重 reduced-motion
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animate() {
    requestAnimationFrame(animate);
    if (reduceMotion) { renderer.render(scene, camera); return; }

    for (let i = 0; i < COUNT; i++) {
      pts[i].x += pts[i].vx; pts[i].y += pts[i].vy;
      if (Math.abs(pts[i].x) > 300) pts[i].vx *= -1;
      if (Math.abs(pts[i].y) > 200) pts[i].vy *= -1;
      positions[i * 3] = pts[i].x; positions[i * 3 + 1] = pts[i].y; positions[i * 3 + 2] = pts[i].z;
    }
    geo.attributes.position.needsUpdate = true;

    // 重建連線
    let li = 0;
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dz = pts[i].z - pts[j].z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < 90) {
          linePos[li++] = pts[i].x; linePos[li++] = pts[i].y; linePos[li++] = pts[i].z;
          linePos[li++] = pts[j].x; linePos[li++] = pts[j].y; linePos[li++] = pts[j].z;
        }
      }
    }
    lineGeo.setDrawRange(0, li / 3);
    lineGeo.attributes.position.needsUpdate = true;

    camera.position.x += (mx * 40 - camera.position.x) * 0.04;
    camera.position.y += (-my * 30 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);
    particles.rotation.y += 0.0006;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
