"use client";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════
   Z Ö L D R A D A R  ·  HOLOGRAPHIC 3D MAP
   ═══════════════════════════════════════════════════════════ */

const CITIES = [
  { name:"Budapest",       county:"Budapest",       lat:47.50, lng:19.04, aqi:72, ev:48, sol:120, co2:5.2, sc:58 },
  { name:"Székesfehérvár", county:"Fejér",           lat:47.19, lng:18.42, aqi:42, ev:12, sol:310, co2:6.1, sc:62 },
  { name:"Győr",           county:"Győr-Moson-S.",   lat:47.69, lng:17.65, aqi:44, ev:14, sol:175, co2:5.5, sc:67 },
  { name:"Szombathely",    county:"Vas",             lat:47.23, lng:16.62, aqi:28, ev:5,  sol:88,  co2:3.6, sc:78 },
  { name:"Zalaegerszeg",   county:"Zala",            lat:46.84, lng:16.84, aqi:30, ev:4,  sol:72,  co2:3.8, sc:76 },
  { name:"Pécs",           county:"Baranya",         lat:46.07, lng:18.23, aqi:38, ev:7,  sol:220, co2:4.4, sc:70 },
  { name:"Kaposvár",       county:"Somogy",          lat:46.36, lng:17.80, aqi:32, ev:3,  sol:135, co2:3.5, sc:74 },
  { name:"Szekszárd",      county:"Tolna",           lat:46.35, lng:18.71, aqi:36, ev:4,  sol:195, co2:4.0, sc:72 },
  { name:"Veszprém",       county:"Veszprém",        lat:47.09, lng:17.91, aqi:35, ev:6,  sol:145, co2:4.1, sc:71 },
  { name:"Tatabánya",      county:"Komárom-E.",      lat:47.57, lng:18.39, aqi:48, ev:8,  sol:95,  co2:7.2, sc:52 },
  { name:"Miskolc",        county:"BAZ",             lat:48.10, lng:20.78, aqi:68, ev:9,  sol:155, co2:7.8, sc:44 },
  { name:"Eger",           county:"Heves",           lat:47.90, lng:20.38, aqi:52, ev:5,  sol:125, co2:5.0, sc:60 },
  { name:"Salgótarján",    county:"Nógrád",          lat:48.10, lng:19.80, aqi:40, ev:3,  sol:45,  co2:3.9, sc:68 },
  { name:"Debrecen",       county:"Hajdú-Bihar",     lat:47.53, lng:21.63, aqi:50, ev:10, sol:320, co2:4.9, sc:64 },
  { name:"Nyíregyháza",    county:"Szabolcs",        lat:47.96, lng:21.72, aqi:46, ev:6,  sol:210, co2:4.2, sc:63 },
  { name:"Szolnok",        county:"JNSZ",            lat:47.16, lng:20.18, aqi:44, ev:5,  sol:380, co2:4.5, sc:66 },
  { name:"Békéscsaba",     county:"Békés",           lat:46.67, lng:21.09, aqi:40, ev:5,  sol:420, co2:4.3, sc:69 },
  { name:"Szeged",         county:"Csongrád",        lat:46.25, lng:20.14, aqi:45, ev:8,  sol:350, co2:4.7, sc:65 },
  { name:"Kecskemét",      county:"Bács-Kiskun",     lat:46.90, lng:19.69, aqi:41, ev:6,  sol:290, co2:4.1, sc:67 },
];

// Project lat/lng to flat 3D coords (centered on Hungary)
function project(lat, lng) {
  const cx = 19.5, cy = 47.2, scale = 0.55;
  return { x: (lng - cx) * scale, z: -(lat - cy) * scale };
}

// Hungary border outline
// Real Hungary border from world-geojson (Natural Earth) - 1084pts simplified to 156
const HU_BORDER = [
  [48.58512,21.44033],[48.55911,21.41544],[48.56036,21.36497],[48.56207,21.32206],
  [48.55321,21.31708],[48.54377,21.31657],[48.53320,21.31622],[48.52661,21.30730],
  [48.52741,21.27073],[48.53559,21.23383],[48.52718,21.20567],[48.51990,21.18147],
  [48.51649,21.15692],[48.49226,21.12705],[48.51524,21.09272],[48.52525,21.04637],
  [48.52593,20.99007],[48.53684,20.94612],[48.55366,20.87402],[48.58047,20.83969],
  [48.56979,20.72639],[48.55116,20.64400],[48.53866,20.58701],[48.53593,20.52074],
  [48.52024,20.50220],[48.46678,20.47405],[48.44651,20.45019],[48.42316,20.42307],
  [48.40060,20.41672],[48.37849,20.40642],[48.35830,20.39989],[48.33377,20.37174],
  [48.30969,20.35784],[48.29324,20.33209],[48.28833,20.32814],[48.26434,20.30291],
  [48.27211,20.26291],[48.27760,20.23081],[48.26263,20.22738],[48.25840,20.20369],
  [48.24925,20.17399],[48.25417,20.14086],[48.23977,20.13880],[48.21621,20.11614],
  [48.20374,20.09983],[48.19424,20.07614],[48.17822,20.06138],[48.17261,20.04421],
  [48.17204,20.00336],[48.16563,19.98121],[48.12852,19.91066],[48.16425,19.88594],
  [48.16609,19.81453],[48.19356,19.78981],[48.20179,19.71497],[48.21644,19.57214],
  [48.10101,19.48425],[48.07716,19.25903],[48.07624,19.00909],[47.98992,18.81134],
  [47.85464,18.81683],[47.75871,18.64243],[47.75779,18.02994],[47.82179,17.60616],
  [47.99544,17.32956],[47.97521,17.09473],[47.81315,17.06451],[47.68758,16.82831],
  [47.69867,16.48224],[47.63208,16.63330],[47.40021,16.53717],[47.29786,16.48499],
  [47.15237,16.50970],[47.00648,16.49872],[46.93151,16.19934],[46.84610,16.33598],
  [46.73845,16.34354],[46.65886,16.41975],[46.56641,16.48190],[46.51446,16.53305],
  [46.47783,16.58386],[46.45962,16.65939],[46.39809,16.73836],[46.38389,16.80290],
  [46.36115,16.85165],[46.32180,16.87637],[46.24160,16.97319],[46.18791,17.08511],
  [46.16889,17.15721],[46.10942,17.17781],[46.08895,17.22107],[46.06132,17.24510],
  [46.01175,17.26021],[45.97406,17.35634],[45.94303,17.35016],[45.93778,17.56508],
  [45.79338,17.99835],[45.73878,18.44742],[45.89192,18.64243],[45.91118,18.86698],
  [45.92390,18.99268],[46.03655,19.13394],[46.04941,19.36066],[46.14844,19.51447],
  [46.17317,19.71497],[46.17508,20.01846],[46.15928,20.18328],[46.11946,20.24946],
  [46.15019,20.31288],[46.14292,20.45936],[46.16271,20.71472],[46.26629,20.91522],
  [46.24825,21.06766],[46.41040,21.22421],[46.54564,21.27640],[46.64284,21.41785],
  [46.73515,21.52771],[46.90243,21.60736],[46.99899,21.68701],[47.10846,21.77216],
  [47.25593,21.86417],[47.40671,22.03445],[47.54780,22.05780],[47.69128,22.21985],
  [47.74209,22.43271],[47.80670,22.68951],[47.90622,22.82135],[47.95463,22.89731],
  [47.96709,22.89208],[47.97361,22.86698],[47.98393,22.84362],[48.05713,22.86050],
  [48.10702,22.80963],[48.10979,22.76443],[48.11074,22.71328],[48.12600,22.59407],
  [48.19651,22.57001],[48.24748,22.47024],[48.24923,22.40074],[48.32283,22.31991],
  [48.40998,22.26459],[48.39593,22.15187],[48.37313,22.08733],[48.38955,22.02209],
  [48.37039,21.92734],[48.36492,21.88957],[48.35671,21.87241],[48.33617,21.82022],
  [48.36583,21.71516],[48.43330,21.65199],[48.50933,21.61354],[48.51206,21.54282],
  [48.55218,21.50745],[48.55866,21.48960],[48.57377,21.46076],[48.58512,21.44033],
];

const aqiC = v => v<=30?"#00ffaa":v<=45?"#4ade80":v<=55?"#facc15":v<=65?"#fb923c":"#ef4444";
const scC = s => s>=70?"#00ffaa":s>=55?"#facc15":"#fb923c";

/* ─── 3D SCENE ──────────────────────────────────────────── */
function HoloMap({ onSelect, selected, dataMode }) {
  const mountRef = useRef(null);
  const stateRef = useRef({ selected, dataMode });

  useEffect(() => { stateRef.current = { selected, dataMode }; }, [selected, dataMode]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = mount.clientWidth, H = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020608, 0.06);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 3.5, 3.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020608, 1);
    mount.appendChild(renderer.domElement);

    // ── GROUND GRID ──
    const gridGroup = new THREE.Group();
    const gridMat = new THREE.LineBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.04 });
    for (let i = -5; i <= 5; i += 0.5) {
      const pts1 = [new THREE.Vector3(i, -0.01, -5), new THREE.Vector3(i, -0.01, 5)];
      const pts2 = [new THREE.Vector3(-5, -0.01, i), new THREE.Vector3(5, -0.01, i)];
      gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts1), gridMat));
      gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts2), gridMat));
    }
    scene.add(gridGroup);

    // ── HUNGARY OUTLINE (3D) ──
    const mapGroup = new THREE.Group();

    // Border line
    const borderPts = HU_BORDER.map(([lat, lng]) => {
      const p = project(lat, lng);
      return new THREE.Vector3(p.x, 0.01, p.z);
    });
    const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPts);
    const borderLine = new THREE.Line(borderGeo, new THREE.LineBasicMaterial({
      color: 0x00ffaa, transparent: true, opacity: 0.9
    }));
    mapGroup.add(borderLine);

    // Glow border (thicker, more transparent)
    const glowLine = new THREE.Line(borderGeo.clone(), new THREE.LineBasicMaterial({
      color: 0x00ffaa, transparent: true, opacity: 0.15, linewidth: 3
    }));
    glowLine.position.y = 0.005;
    mapGroup.add(glowLine);

    // Fill shape
    const shape = new THREE.Shape();
    const projBorder = HU_BORDER.map(([lat, lng]) => project(lat, lng));
    shape.moveTo(projBorder[0].x, projBorder[0].z);
    projBorder.slice(1).forEach(p => shape.lineTo(p.x, p.z));
    shape.closePath();

    const fillGeo = new THREE.ShapeGeometry(shape);
    fillGeo.rotateX(-Math.PI / 2);
    const fillMat = new THREE.MeshBasicMaterial({
      color: 0x00ffaa, transparent: true, opacity: 0.04, side: THREE.DoubleSide
    });
    const fillMesh = new THREE.Mesh(fillGeo, fillMat);
    fillMesh.position.y = 0.005;
    mapGroup.add(fillMesh);

    // ── CITY MARKERS + BEAMS ──
    const markers = [];
    const beams = [];
    const rings = [];

    CITIES.forEach((city, i) => {
      const p = project(city.lat, city.lng);
      const col = new THREE.Color(aqiC(city.aqi));

      // Data beam (height based on data)
      const beamH = 0.15 + (city.sc / 100) * 0.6;
      const beamGeo = new THREE.CylinderGeometry(0.012, 0.012, beamH, 8);
      const beamMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(p.x, beamH / 2 + 0.01, p.z);
      mapGroup.add(beam);
      beams.push(beam);

      // Top cap (glowing sphere)
      const capGeo = new THREE.SphereGeometry(0.03, 16, 16);
      const capMat = new THREE.MeshBasicMaterial({ color: col });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(p.x, beamH + 0.02, p.z);
      cap.userData = { index: i };
      mapGroup.add(cap);
      markers.push(cap);

      // Base ring
      const ringGeo = new THREE.RingGeometry(0.035, 0.05, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(p.x, 0.015, p.z);
      mapGroup.add(ring);
      rings.push(ring);

      // Pulse ring (animated in loop)
      const pulseGeo = new THREE.RingGeometry(0.04, 0.045, 32);
      const pulseMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pulse.rotation.x = -Math.PI / 2;
      pulse.position.set(p.x, 0.012, p.z);
      pulse.userData = { baseScale: 1, phase: i * 0.5 };
      mapGroup.add(pulse);
      rings.push(pulse);
    });

    scene.add(mapGroup);

    // ── FLOATING PARTICLES ──
    const pCount = 800;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pVel = [];
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 8;
      pPos[i * 3 + 1] = Math.random() * 3;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      pVel.push({ vy: 0.001 + Math.random() * 0.003 });
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00ffaa, size: 0.015, transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── LIGHTING ──
    scene.add(new THREE.AmbientLight(0x222222, 0.5));
    const dl = new THREE.DirectionalLight(0x00ffaa, 0.4);
    dl.position.set(3, 5, 3);
    scene.add(dl);
    const pl = new THREE.PointLight(0x00ffaa, 0.6, 8);
    pl.position.set(0, 2, 0);
    scene.add(pl);

    // ── INTERACTION ──
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);
    let targetRotY = 0, rotY = 0;
    let targetRotX = 0.7, rotX = 0.7; // start tilted
    let targetZoom = 3.5, zoom = 3.5;
    let isDragging = false, dragX = 0, dragY = 0, dragRotY = 0, dragRotX = 0;

    const onMove = (e) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / W) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / H) * 2 + 1;
      if (isDragging) {
        targetRotY = dragRotY + (e.clientX - dragX) * 0.008;
        targetRotX = dragRotX + (e.clientY - dragY) * 0.005;
        targetRotX = Math.max(0.2, Math.min(1.4, targetRotX));
      }
    };
    const onDown = (e) => {
      isDragging = true; dragX = e.clientX; dragY = e.clientY;
      dragRotY = targetRotY; dragRotX = targetRotX;
    };
    const onUp = () => { isDragging = false; };
    const onWheel = (e) => {
      e.preventDefault();
      targetZoom += e.deltaY * 0.004;
      targetZoom = Math.max(1.8, Math.min(6, targetZoom));
    };
    const onClick = () => {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markers);
      if (hits.length > 0) onSelect(CITIES[hits[0].object.userData.index]);
    };

    mount.addEventListener("mousemove", onMove);
    mount.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    mount.addEventListener("wheel", onWheel, { passive: false });
    mount.addEventListener("click", onClick);

    // ── ANIMATE ──
    let t = 0;
    const animate = () => {
      t += 0.01;

      // Smooth camera orbit
      if (!isDragging) targetRotY += 0.0001;
      rotY += (targetRotY - rotY) * 0.04;
      rotX += (targetRotX - rotX) * 0.04;
      zoom += (targetZoom - zoom) * 0.06;

      camera.position.x = Math.sin(rotY) * zoom;
      camera.position.z = Math.cos(rotY) * zoom * Math.cos(rotX - 0.5);
      camera.position.y = zoom * Math.sin(rotX - 0.2);
      camera.lookAt(0, 0.2, 0);

      // Beam pulse
      beams.forEach((b, i) => {
        const s = 1 + Math.sin(t * 2 + i * 0.7) * 0.08;
        b.scale.y = s;
        b.material.opacity = 0.35 + Math.sin(t * 2 + i) * 0.15;
      });

      // Cap pulse
      markers.forEach((m, i) => {
        const s = 1 + Math.sin(t * 3 + i) * 0.25;
        m.scale.setScalar(s);
      });

      // Pulse rings
      rings.forEach(r => {
        if (r.userData.phase !== undefined) {
          const s = 1 + Math.sin(t * 1.5 + r.userData.phase) * 0.4;
          r.scale.setScalar(s);
          r.material.opacity = 0.15 * (1 - (s - 1) / 0.4);
        }
      });

      // Particles float up
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < pCount; i++) {
        pos[i * 3 + 1] += pVel[i].vy;
        if (pos[i * 3 + 1] > 3) {
          pos[i * 3 + 1] = 0;
          pos[i * 3] = (Math.random() - 0.5) * 8;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Point light orbits
      pl.position.x = Math.sin(t * 0.5) * 2;
      pl.position.z = Math.cos(t * 0.5) * 2;
      pl.intensity = 0.4 + Math.sin(t) * 0.2;

      // Hover cursor
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markers);
      mount.style.cursor = hits.length > 0 ? "pointer" : isDragging ? "grabbing" : "grab";

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      mount.removeEventListener("mousemove", onMove);
      mount.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      mount.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />;
}

/* ─── HELPERS ──────────────────────────────────────────── */
function Num({ to, sfx = "", dec = 0 }) {
  const [v, setV] = useState(0);
  const f = useRef();
  useEffect(() => {
    const s = performance.now();
    const tick = (n) => {
      const p = Math.min((n - s) / 1100, 1);
      setV((1 - Math.pow(1 - p, 4)) * to);
      if (p < 1) f.current = requestAnimationFrame(tick);
    };
    f.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(f.current);
  }, [to]);
  return <>{dec ? v.toFixed(dec) : Math.round(v)}{sfx}</>;
}

/* ═══════════════════════════════════════════════════════════ */
export default function ZoldRadarHolo() {
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("air");

  useEffect(() => { setTimeout(() => setReady(true), 400); }, []);

  const d = selected;
  const font = "'Syne','Outfit',sans-serif";
  const mono = "'Space Grotesk','JetBrains Mono',monospace";

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020608", overflow: "hidden", position: "relative", fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(0,255,170,.2)}50%{box-shadow:0 0 40px rgba(0,255,170,.4)}}
        @keyframes textGlow{0%,100%{text-shadow:0 0 20px rgba(0,255,170,.3)}50%{text-shadow:0 0 50px rgba(0,255,170,.6)}}
        @keyframes pulse{0%,100%{opacity:.3}50%{opacity:.9}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(0,255,170,.12);border-radius:3px}
      `}</style>

      {/* 3D Scene */}
      <HoloMap onSelect={setSelected} selected={selected} dataMode={tab} />

      {/* ─── TOP BAR ─── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(180deg, rgba(2,6,8,.85) 0%, transparent 100%)",
        animation: ready ? "fadeUp .8s cubic-bezier(.16,1,.3,1) both" : "none",
      }}>
        {/* Hero content - top left */}
        <div style={{ maxWidth: 420 }}>
          <div style={{ fontSize: 10, color: "#00ffaa", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>
            Magyarország · Környezeti Intelligencia
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0fdf4", letterSpacing: "-.04em", lineHeight: 1.05, textShadow: "0 0 60px rgba(0,255,170,.12)" }}>
            A zöld átmenet <span style={{ color: "#00ffaa" }}>élő hologramja</span>
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 6, lineHeight: 1.6, fontWeight: 300 }}>
            Forgasd a 3D térképet · Görgess a zoomhoz · Kattints a városokra
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,.02)", borderRadius: 10, padding: 3, border: "1px solid rgba(255,255,255,.03)" }}>
            {[{ id: "air", l: "Levegő", e: "🌬" }, { id: "energy", l: "Energia", e: "☀️" }, { id: "ev", l: "Töltők", e: "⚡" }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "6px 16px", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: font,
                fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", gap: 5,
                background: tab === t.id ? "rgba(0,255,170,.08)" : "transparent",
                color: tab === t.id ? "#00ffaa" : "rgba(255,255,255,.22)",
                transition: "all .3s",
              }}>
                <span style={{ fontSize: 10 }}>{t.e}</span>{t.l}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ffaa", animation: "pulse 2s infinite", boxShadow: "0 0 10px rgba(0,255,170,.6)" }} />
            <span style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,.2)" }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM LEFT: STATS ONLY ─── */}
      <div style={{
        position: "absolute", bottom: 28, left: 28, zIndex: 10,
        animation: ready ? "fadeUp 1s cubic-bezier(.16,1,.3,1) .3s both" : "none",
      }}>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { l: "AQI Átlag", v: "46", c: "#facc15" },
            { l: "Napenergia", v: "3.9 GW", c: "#00ffaa" },
            { l: "EV Töltők", v: "2,847", c: "#60a5fa" },
            { l: "CO₂/Fő", v: "4.8 t", c: "#fb923c" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,.22)", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 500 }}>{s.l}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.c, fontFamily: mono, letterSpacing: "-.04em", marginTop: 3, textShadow: `0 0 20px ${s.c}35` }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── RIGHT: DETAIL PANEL ─── */}
      {d && (
        <div style={{
          position: "absolute", top: 70, right: 24, bottom: 24, width: 330, zIndex: 10,
          animation: "slideIn .6s cubic-bezier(.16,1,.3,1) both",
          display: "flex", flexDirection: "column", gap: 8, overflowY: "auto",
        }}>
          <button onClick={() => setSelected(null)} style={{
            alignSelf: "flex-end", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "rgba(255,255,255,.25)",
            fontSize: 13, display: "grid", placeItems: "center", backdropFilter: "blur(16px)",
          }}>✕</button>

          {/* Header */}
          <div style={{
            background: "rgba(2,6,8,.7)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(0,255,170,.08)", borderRadius: 14, padding: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 12,
                background: `conic-gradient(${scC(d.sc)} ${d.sc}%, rgba(255,255,255,.03) 0)`,
                display: "grid", placeItems: "center", boxShadow: `0 0 20px ${scC(d.sc)}25`,
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 9, background: "rgba(2,6,8,.9)", display: "grid", placeItems: "center" }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: scC(d.sc), fontFamily: mono }}>{d.sc}</span>
                </div>
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f0fdf4", letterSpacing: "-.03em", lineHeight: 1 }}>{d.county}</h2>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 3 }}>{d.name}</div>
                <div style={{
                  display: "inline-block", marginTop: 6, fontSize: 7, fontWeight: 700,
                  color: scC(d.sc), background: `${scC(d.sc)}12`, padding: "2px 8px", borderRadius: 5,
                  letterSpacing: ".1em", textTransform: "uppercase",
                }}>{d.sc >= 70 ? "ZÖLD ÉLLOVAS" : d.sc >= 55 ? "FEJLŐDŐ" : "FEJLESZTENDŐ"}</div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { l: "LEVEGŐ", v: d.aqi, u: d.aqi <= 30 ? "Kiváló" : d.aqi <= 45 ? "Jó" : d.aqi <= 55 ? "Mérsékelt" : "Gyenge", c: aqiC(d.aqi) },
              { l: "EV TÖLTŐK", v: d.ev, u: "pont", c: "#60a5fa" },
              { l: "NAPENERGIA", v: d.sol, u: "MW", c: "#facc15" },
              { l: "CO₂/FŐ", v: d.co2, u: "t/év", c: d.co2 > 5 ? "#fb923c" : "#00ffaa", dec: 1 },
            ].map((m, i) => (
              <div key={i} style={{
                background: "rgba(2,6,8,.6)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,.035)", borderRadius: 12, padding: "12px 14px",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: -15, right: -15, width: 50, height: 50, borderRadius: "50%", background: `${m.c}05`, filter: "blur(18px)" }} />
                <div style={{ fontSize: 7.5, color: "rgba(255,255,255,.22)", letterSpacing: ".12em", fontWeight: 600 }}>{m.l}</div>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: mono, color: m.c, letterSpacing: "-.04em", lineHeight: 1, marginTop: 6, textShadow: `0 0 18px ${m.c}30` }}>
                  <Num to={m.v} dec={m.dec || 0} />
                </div>
                <div style={{ fontSize: 8.5, color: "rgba(255,255,255,.18)", marginTop: 3 }}>{m.u}</div>
              </div>
            ))}
          </div>

          {/* AI */}
          <div style={{
            background: "rgba(2,6,8,.6)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(0,255,170,.06)", borderRadius: 12, padding: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                background: "linear-gradient(135deg, #00ffaa, #059669)",
                display: "grid", placeItems: "center",
                boxShadow: "0 0 12px rgba(0,255,170,.4)",
              }}><span style={{ fontSize: 9, color: "#000", fontWeight: 900 }}>✦</span></div>
              <span style={{ fontSize: 8, color: "#00ffaa", fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase" }}>AI Elemzés</span>
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.8, color: "rgba(255,255,255,.4)", fontWeight: 300 }}>
              {d.county} zöld indexe {d.sc}/100. Levegő: AQI {d.aqi}. Telepített napenergia: {d.sol} MW. EV hálózat: {d.ev} töltőpont. CO₂: {d.co2} t/fő/év.
            </p>
          </div>
        </div>
      )}

      {/* Instruction */}
      {!selected && (
        <div style={{
          position: "absolute", bottom: 24, right: 28, zIndex: 10,
          animation: ready ? "fadeUp 1s cubic-bezier(.16,1,.3,1) 1s both" : "none",
        }}>
          <div style={{
            background: "rgba(2,6,8,.5)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(0,255,170,.06)", borderRadius: 10, padding: "10px 16px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>🖱</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>Húzd · Görgess · Kattints</span>
          </div>
        </div>
      )}
    </div>
  );
}
