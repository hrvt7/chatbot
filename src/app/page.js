"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

/* ─── MOBILE HOOK ─────────────────────────────────────── */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

/* ═══════════════════════════════════════════════════════════
   Z Ö L D R A D A R  ·  HOLOGRAPHIC 3D MAP — LIVE DATA
   ═══════════════════════════════════════════════════════════ */

// Fallback hardcoded data
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

const SEAT_LABELS = [
  { name: "Budapest", lat: 47.50, lng: 19.04 },
  { name: "Debrecen", lat: 47.53, lng: 21.63 },
  { name: "Szeged", lat: 46.25, lng: 20.14 },
  { name: "Miskolc", lat: 48.10, lng: 20.78 },
  { name: "Pécs", lat: 46.07, lng: 18.23 },
  { name: "Győr", lat: 47.69, lng: 17.65 },
  { name: "Szombathely", lat: 47.23, lng: 16.62 },
  { name: "Zalaegerszeg", lat: 46.84, lng: 16.84 },
  { name: "Kaposvár", lat: 46.36, lng: 17.80 },
  { name: "Szekszárd", lat: 46.35, lng: 18.71 },
  { name: "Veszprém", lat: 47.09, lng: 17.91 },
  { name: "Tatabánya", lat: 47.57, lng: 18.39 },
  { name: "Eger", lat: 47.90, lng: 20.38 },
  { name: "Salgótarján", lat: 48.10, lng: 19.80 },
  { name: "Nyíregyháza", lat: 47.96, lng: 21.72 },
  { name: "Szolnok", lat: 47.16, lng: 20.18 },
  { name: "Békéscsaba", lat: 46.67, lng: 21.09 },
  { name: "Kecskemét", lat: 46.90, lng: 19.69 },
  { name: "Székesfehérvár", lat: 47.19, lng: 18.42 },
];

function project(lat, lng) {
  const cx = 19.5, cy = 47.2, scale = 0.55;
  return { x: (lng - cx) * scale, z: -(lat - cy) * scale };
}

// Point-in-polygon for frontend border check
function isInsideHungary(lat, lng) {
  const p = project(lat, lng);
  const poly = HU_BORDER.map(([la, lo]) => project(la, lo));
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, zi = poly[i].z, xj = poly[j].x, zj = poly[j].z;
    if ((zi > p.z) !== (zj > p.z) && p.x < (xj - xi) * (p.z - zi) / (zj - zi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

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

const aqiColor = v => v<=50?"#00ffaa":v<=100?"#4ade80":v<=150?"#facc15":v<=200?"#fb923c":v<=300?"#ef4444":"#7f1d1d";
const aqiLabel = v => v<=50?"Kiváló":v<=100?"Jó":v<=150?"Mérsékelt":v<=200?"Egészségtelen (érzékenyek)":v<=300?"Egészségtelen":"Veszélyes";
const aqiDesc = v => v<=50?"A levegőminőség kiváló, semmilyen egészségügyi kockázat.":v<=100?"A levegőminőség elfogadható.":v<=150?"Érzékeny csoportoknak enyhe kockázat.":v<=200?"Mindenki tapasztalhat enyhe tüneteket.":v<=300?"Komolyabb egészségügyi hatások.":"Egészségügyi vészhelyzet.";
const scC = s => s>=70?"#00ffaa":s>=55?"#facc15":"#fb923c";
const evColor = kw => kw>=50?"#00ffaa":kw>=22?"#60a5fa":"#fb923c";
const evCategory = kw => kw>=50?"Gyorstöltő 50+ kW":kw>=22?"Normál 22 kW":"Lassú <22 kW";

/* ─── AQI SCALE BAR ──────────────────────────────────── */
const AqiScaleBar = ({ aqi, mono }) => {
  const segments = [
    { max: 50, color: "#00ffaa" },
    { max: 100, color: "#4ade80" },
    { max: 150, color: "#facc15" },
    { max: 200, color: "#fb923c" },
    { max: 300, color: "#ef4444" },
  ];
  const pct = Math.min(aqi / 300, 1) * 100;
  return (
    <div style={{ position: "relative", marginTop: 10 }}>
      <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden" }}>
        {segments.map((s, i) => (
          <div key={i} style={{ flex: 1, background: s.color, opacity: 0.3 }} />
        ))}
      </div>
      <div style={{
        position: "absolute", top: -3, left: `${pct}%`, transform: "translateX(-50%)",
        width: 12, height: 12, borderRadius: "50%", background: aqiColor(aqi),
        border: "2px solid #020608", boxShadow: `0 0 8px ${aqiColor(aqi)}80`,
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {[0, 50, 100, 150, 200, 300].map(v => (
          <span key={v} style={{ fontSize: 7, fontFamily: mono, color: "rgba(255,255,255,.15)" }}>{v}</span>
        ))}
      </div>
    </div>
  );
};

/* ─── 3D SCENE ──────────────────────────────────────────── */
function HoloMap({ onSelect, tab, airStations, chargers, isMobile }) {
  const mountRef = useRef(null);
  const sceneRef = useRef({ scene: null, markersGroup: null, camera: null, clickables: [], chargerPoints: null });
  const dataRef = useRef({ tab, airStations, chargers, onSelect, isMobile });

  useEffect(() => {
    dataRef.current = { tab, airStations, chargers, onSelect, isMobile };
  }, [tab, airStations, chargers, onSelect, isMobile]);

  // Build markers when tab or data changes
  const rebuildMarkers = useCallback(() => {
    const { markersGroup } = sceneRef.current;
    const { tab: t, airStations: air, chargers: evs } = dataRef.current;
    if (!markersGroup) return;

    // Fade out effect: set opacity to 0
    markersGroup.children.forEach(child => {
      if (child.material) child.material.opacity = 0;
    });

    // Clear old markers
    while (markersGroup.children.length) {
      const child = markersGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      markersGroup.remove(child);
    }
    sceneRef.current.clickables = [];
    sceneRef.current.chargerPoints = null;

    if (t === "air") {
      const stations = air.length > 0
        ? air.filter(s => isInsideHungary(s.lat, s.lng))
        : CITIES.map(c => ({ name: c.name, lat: c.lat, lng: c.lng, aqi: c.aqi }));
      stations.forEach((s, i) => {
        const p = project(s.lat, s.lng);
        const col = new THREE.Color(aqiColor(s.aqi));
        const beamH = 0.05 + Math.min(s.aqi, 200) / 200 * 0.7;

        const beamGeo = new THREE.CylinderGeometry(0.01, 0.01, beamH, 8);
        const beamMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(p.x, beamH / 2 + 0.01, p.z);
        beam.userData._fadeTarget = 0.45;
        markersGroup.add(beam);

        const capGeo = new THREE.SphereGeometry(0.025, 12, 12);
        const capMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(p.x, beamH + 0.02, p.z);
        cap.userData = { type: "air", index: i, data: s, _fadeTarget: 1 };
        markersGroup.add(cap);
        sceneRef.current.clickables.push(cap);

        const ringGeo = new THREE.RingGeometry(0.03, 0.042, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(p.x, 0.012, p.z);
        ring.userData._fadeTarget = 0.25;
        markersGroup.add(ring);
      });
    } else if (t === "ev") {
      const points = evs.length > 0 ? evs.filter(c => isInsideHungary(c.lat, c.lng)) : [];
      if (points.length === 0) return;

      const positions = new Float32Array(points.length * 3);
      const colors = new Float32Array(points.length * 3);

      points.forEach((c, i) => {
        const p = project(c.lat, c.lng);
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = 0.03 + Math.random() * 0.02;
        positions[i * 3 + 2] = p.z;

        const col = new THREE.Color(evColor(c.powerKW || 0));
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      });

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const mat = new THREE.PointsMaterial({
        size: 0.035, vertexColors: true, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, sizeAttenuation: true
      });
      mat._fadeTarget = 0.8;
      const pointCloud = new THREE.Points(geo, mat);
      pointCloud.userData = { type: "evCloud", chargers: points };
      markersGroup.add(pointCloud);
      sceneRef.current.chargerPoints = { cloud: pointCloud, data: points };

      const hitRadius = dataRef.current.isMobile ? 0.07 : 0.04;
      points.forEach((c, i) => {
        const p = project(c.lat, c.lng);
        const hitGeo = new THREE.SphereGeometry(hitRadius, 6, 6);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hit = new THREE.Mesh(hitGeo, hitMat);
        hit.position.set(p.x, 0.03, p.z);
        hit.userData = { type: "ev", index: i, data: c };
        markersGroup.add(hit);
        sceneRef.current.clickables.push(hit);
      });
    } else if (t === "energy") {
      CITIES.forEach((city, i) => {
        const p = project(city.lat, city.lng);
        const solNorm = Math.min(city.sol, 500) / 500;
        const col = new THREE.Color(solNorm >= 0.6 ? "#00ffaa" : solNorm >= 0.3 ? "#facc15" : "#fb923c");
        const beamH = 0.1 + solNorm * 0.6;

        const beamGeo = new THREE.CylinderGeometry(0.012, 0.012, beamH, 8);
        const beamMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(p.x, beamH / 2 + 0.01, p.z);
        beam.userData._fadeTarget = 0.5;
        markersGroup.add(beam);

        const capGeo = new THREE.SphereGeometry(0.03, 16, 16);
        const capMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(p.x, beamH + 0.02, p.z);
        cap.userData = { type: "energy", index: i, data: city, _fadeTarget: 1 };
        markersGroup.add(cap);
        sceneRef.current.clickables.push(cap);

        const ringGeo = new THREE.RingGeometry(0.035, 0.05, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(p.x, 0.015, p.z);
        ring.userData._fadeTarget = 0.3;
        markersGroup.add(ring);
      });
    }
  }, []);

  // Rebuild when tab/data changes
  useEffect(() => {
    rebuildMarkers();
  }, [tab, airStations, chargers, rebuildMarkers]);

  // Init scene once
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = mount.clientWidth, H = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020608, 0.06);

    const mob = dataRef.current.isMobile;
    const initZoom = mob ? 4.0 : 3.5;
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, initZoom, initZoom);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mob ? 1.5 : 2));
    renderer.setClearColor(0x020608, 1);
    mount.appendChild(renderer.domElement);

    // Ground grid (skip on mobile for performance)
    const gridGroup = new THREE.Group();
    if (!mob) {
      const gridMat = new THREE.LineBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.04 });
      for (let i = -5; i <= 5; i += 0.5) {
        gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i, -0.01, -5), new THREE.Vector3(i, -0.01, 5)]), gridMat));
        gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-5, -0.01, i), new THREE.Vector3(5, -0.01, i)]), gridMat));
      }
    }
    scene.add(gridGroup);

    // Hungary outline
    const mapGroup = new THREE.Group();
    const borderPts = HU_BORDER.map(([lat, lng]) => { const p = project(lat, lng); return new THREE.Vector3(p.x, 0.01, p.z); });
    const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPts);
    mapGroup.add(new THREE.Line(borderGeo, new THREE.LineBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.9 })));
    const glowLine = new THREE.Line(borderGeo.clone(), new THREE.LineBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.15 }));
    glowLine.position.y = 0.005;
    mapGroup.add(glowLine);

    const shape = new THREE.Shape();
    const projBorder = HU_BORDER.map(([lat, lng]) => project(lat, lng));
    shape.moveTo(projBorder[0].x, projBorder[0].z);
    projBorder.slice(1).forEach(p => shape.lineTo(p.x, p.z));
    shape.closePath();
    const fillGeo = new THREE.ShapeGeometry(shape);
    fillGeo.rotateX(-Math.PI / 2);
    const fillMesh = new THREE.Mesh(fillGeo, new THREE.MeshBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.04, side: THREE.DoubleSide }));
    fillMesh.position.y = 0.005;
    mapGroup.add(fillMesh);

    // City seat labels as sprite text
    SEAT_LABELS.forEach(city => {
      const canvas = document.createElement("canvas");
      canvas.width = 256; canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.font = "22px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.textAlign = "center";
      ctx.fillText(city.name, 128, 40);
      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      const p = project(city.lat, city.lng);
      sprite.position.set(p.x, 0.02, p.z);
      sprite.scale.set(0.3, 0.075, 1);
      mapGroup.add(sprite);
    });

    scene.add(mapGroup);

    // Markers group (swapped on tab change)
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    sceneRef.current = { scene, markersGroup, camera, clickables: [], chargerPoints: null };

    // Build initial markers
    rebuildMarkers();

    // Particles
    const pCount = mob ? 300 : 800;
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
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x00ffaa, size: 0.015, transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, sizeAttenuation: true
    }));
    scene.add(particles);

    // Lighting
    scene.add(new THREE.AmbientLight(0x222222, 0.5));
    const dl = new THREE.DirectionalLight(0x00ffaa, 0.4);
    dl.position.set(3, 5, 3);
    scene.add(dl);
    const pl = new THREE.PointLight(0x00ffaa, 0.6, 8);
    pl.position.set(0, 2, 0);
    scene.add(pl);

    // Interaction
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: mob ? 0.1 : 0.05 };
    const pointer = new THREE.Vector2(-10, -10);
    let targetRotY = 0, rotY = 0, targetRotX = 0.7, rotX = 0.7;
    let targetZoom = initZoom, zoom = initZoom;
    let isDragging = false, dragX = 0, dragY = 0, dragRotY = 0, dragRotX = 0;

    const onMove = (e) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (isDragging) {
        targetRotY = dragRotY + (e.clientX - dragX) * 0.008;
        targetRotX = dragRotX + (e.clientY - dragY) * 0.005;
        targetRotX = Math.max(0.2, Math.min(1.4, targetRotX));
      }
    };
    const onDown = (e) => { isDragging = true; dragX = e.clientX; dragY = e.clientY; dragRotY = targetRotY; dragRotX = targetRotX; };
    const onUp = () => { isDragging = false; };
    const onWheel = (e) => { e.preventDefault(); targetZoom += e.deltaY * 0.004; targetZoom = Math.max(1.8, Math.min(6, targetZoom)); };
    const onClick = () => {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(sceneRef.current.clickables);
      if (hits.length > 0) {
        const ud = hits[0].object.userData;
        dataRef.current.onSelect({ ...ud.data, _type: ud.type });
      }
    };

    // Touch handlers
    let lastTouchDist = 0;
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        isDragging = true; dragX = t.clientX; dragY = t.clientY; dragRotY = targetRotY; dragRotX = targetRotX;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist = Math.sqrt(dx * dx + dy * dy);
      }
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        const t = e.touches[0];
        targetRotY = dragRotY + (t.clientX - dragX) * 0.008;
        targetRotX = dragRotX + (t.clientY - dragY) * 0.005;
        targetRotX = Math.max(0.2, Math.min(1.4, targetRotX));
        const rect = mount.getBoundingClientRect();
        pointer.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastTouchDist > 0) {
          targetZoom += (lastTouchDist - dist) * 0.015;
          targetZoom = Math.max(1.8, Math.min(6, targetZoom));
        }
        lastTouchDist = dist;
      }
    };
    const onTouchEnd = (e) => {
      isDragging = false;
      lastTouchDist = 0;
      if (e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        const rect = mount.getBoundingClientRect();
        pointer.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(sceneRef.current.clickables);
        if (hits.length > 0) {
          const ud = hits[0].object.userData;
          dataRef.current.onSelect({ ...ud.data, _type: ud.type });
        }
      }
    };

    mount.addEventListener("mousemove", onMove);
    mount.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    mount.addEventListener("wheel", onWheel, { passive: false });
    mount.addEventListener("click", onClick);
    mount.addEventListener("touchstart", onTouchStart, { passive: false });
    mount.addEventListener("touchmove", onTouchMove, { passive: false });
    mount.addEventListener("touchend", onTouchEnd);

    // Animate
    let t = 0;
    let animId;
    const animate = () => {
      t += 0.01;
      if (!isDragging) targetRotY += 0.0001;
      rotY += (targetRotY - rotY) * 0.04;
      rotX += (targetRotX - rotX) * 0.04;
      zoom += (targetZoom - zoom) * 0.06;
      camera.position.x = Math.sin(rotY) * zoom;
      camera.position.z = Math.cos(rotY) * zoom * Math.cos(rotX - 0.5);
      camera.position.y = zoom * Math.sin(rotX - 0.2);
      camera.lookAt(0, 0.2, 0);

      // Animate markers with fade-in
      markersGroup.children.forEach((child, i) => {
        // Fade in new markers
        const fadeTarget = child.userData?._fadeTarget ?? child.material?._fadeTarget;
        if (fadeTarget !== undefined && child.material && child.material.opacity < fadeTarget) {
          child.material.opacity = Math.min(child.material.opacity + 0.03, fadeTarget);
        }
        if (child.isMesh && child.geometry?.type === "SphereGeometry" && child.visible) {
          const s = 1 + Math.sin(t * 3 + i) * 0.2;
          child.scale.setScalar(s);
        }
        if (child.isMesh && child.geometry?.type === "CylinderGeometry") {
          const base = child.userData?._fadeTarget || 0.45;
          if (child.material.opacity >= base - 0.05) {
            child.material.opacity = base - 0.1 + Math.sin(t * 2 + i * 0.7) * 0.12;
          }
        }
      });

      // EV point cloud pulse + fade
      const cp = sceneRef.current.chargerPoints;
      if (cp) {
        const ft = cp.cloud.material._fadeTarget || 0.8;
        if (cp.cloud.material.opacity < ft) {
          cp.cloud.material.opacity = Math.min(cp.cloud.material.opacity + 0.03, ft);
        } else {
          cp.cloud.material.opacity = 0.6 + Math.sin(t * 1.5) * 0.2;
        }
      }

      // Particles
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < pCount; i++) {
        pos[i * 3 + 1] += pVel[i].vy;
        if (pos[i * 3 + 1] > 3) { pos[i * 3 + 1] = 0; pos[i * 3] = (Math.random() - 0.5) * 8; pos[i * 3 + 2] = (Math.random() - 0.5) * 8; }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      pl.position.x = Math.sin(t * 0.5) * 2;
      pl.position.z = Math.cos(t * 0.5) * 2;
      pl.intensity = 0.4 + Math.sin(t) * 0.2;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(sceneRef.current.clickables);
      mount.style.cursor = hits.length > 0 ? "pointer" : isDragging ? "grabbing" : "grab";

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener("mousemove", onMove);
      mount.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      mount.removeEventListener("click", onClick);
      mount.removeEventListener("touchstart", onTouchStart);
      mount.removeEventListener("touchmove", onTouchMove);
      mount.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [rebuildMarkers]);

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

const Glass = ({ children, style = {} }) => (
  <div style={{ background: "rgba(2,6,8,.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,.04)", borderRadius: 12, ...style }}>{children}</div>
);

/* ═══════════════════════════════════════════════════════════ */
export default function ZoldRadarHolo() {
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("air");
  const [airStations, setAirStations] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [fetchTime, setFetchTime] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => { setTimeout(() => setReady(true), 400); }, []);

  // Fetch live data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/air").then(r => r.ok ? r.json() : Promise.reject(r)),
      fetch("/api/chargers").then(r => r.ok ? r.json() : Promise.reject(r)),
    ]).then(([airData, chargerData]) => {
      setAirStations(airData.stations || []);
      setChargers(chargerData.chargers || []);
      setStats({
        avgAqi: airData.avgAqi,
        stationCount: airData.count,
        totalChargers: chargerData.totalStations,
        totalPoints: chargerData.totalPoints,
      });
      setFetchTime(Date.now());
      setIsDemo(false);
    }).catch(err => {
      console.warn("API fetch failed, using demo data:", err);
      setIsDemo(true);
      setStats({ avgAqi: 46, stationCount: 19, totalChargers: 847, totalPoints: 2847 });
    }).finally(() => setLoading(false));
  }, []);

  const d = selected;
  const font = "'Syne','Outfit',sans-serif";
  const mono = "'Space Grotesk','JetBrains Mono',monospace";

  const minsAgo = fetchTime ? Math.max(1, Math.round((Date.now() - fetchTime) / 60000)) : null;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020608", overflow: "hidden", position: "relative", fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
        @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:.3}50%{opacity:.9}}
        @keyframes shimmer{0%{opacity:.15}50%{opacity:.4}100%{opacity:.15}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(0,255,170,.12);border-radius:3px}
      `}</style>

      <HoloMap onSelect={setSelected} tab={tab} airStations={airStations} chargers={chargers} isMobile={isMobile} />

      {/* ─── TOP BAR ─── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        padding: isMobile ? "10px 12px" : "16px 28px",
        display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between",
        flexWrap: isMobile ? "wrap" : "nowrap", gap: isMobile ? 8 : 0,
        background: "linear-gradient(180deg, rgba(2,6,8,.85) 0%, transparent 100%)",
        animation: ready ? "fadeUp .8s cubic-bezier(.16,1,.3,1) both" : "none",
      }}>
        <div style={{ maxWidth: isMobile ? "100%" : 420, flex: isMobile ? "1 1 auto" : undefined }}>
          <div style={{ fontSize: isMobile ? 8 : 10, color: "#00ffaa", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 600, marginBottom: isMobile ? 2 : 6 }}>
            Magyarország · Környezeti Intelligencia
          </div>
          <h1 style={{ fontSize: isMobile ? 18 : 32, fontWeight: 800, color: "#f0fdf4", letterSpacing: "-.04em", lineHeight: 1.05, textShadow: "0 0 60px rgba(0,255,170,.12)" }}>
            Magyarország <span style={{ color: "#00ffaa" }}>környezeti térképe</span>
          </h1>
          {!isMobile && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 6, lineHeight: 1.6, fontWeight: 300 }}>
              Valós idejű levegőminőség és EV töltőhálózat
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16, ...(isMobile ? { width: "100%", justifyContent: "space-between" } : {}) }}>
          <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,.02)", borderRadius: 10, padding: 3, border: "1px solid rgba(255,255,255,.03)" }}>
            {[{ id: "air", l: "Levegő", e: "🌬" }, { id: "energy", l: "Energia", e: "☀️" }, { id: "ev", l: "Töltők", e: "⚡" }].map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); }} style={{
                padding: isMobile ? "4px 10px" : "6px 16px", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: font,
                fontSize: isMobile ? 10 : 11, fontWeight: 500, display: "flex", alignItems: "center", gap: 5,
                minHeight: isMobile ? 44 : undefined,
                background: tab === t.id ? "rgba(0,255,170,.08)" : "transparent",
                color: tab === t.id ? "#00ffaa" : "rgba(255,255,255,.22)",
                transition: "all .3s",
              }}>
                <span style={{ fontSize: 10 }}>{t.e}</span>{t.l}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: isDemo ? "#fb923c" : "#00ffaa", animation: "pulse 2s infinite", boxShadow: `0 0 10px ${isDemo ? "rgba(251,146,40,.6)" : "rgba(0,255,170,.6)"}` }} />
            <span style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,.2)" }}>{loading ? "..." : isDemo ? "DEMO" : "LIVE"}</span>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM LEFT: STATS ─── */}
      <div style={{
        position: "absolute", bottom: isMobile ? 16 : 28, left: isMobile ? 16 : 28, zIndex: 10,
        animation: ready ? "fadeUp 1s cubic-bezier(.16,1,.3,1) .3s both" : "none",
      }}>
        <div style={{ display: isMobile ? "grid" : "flex", gridTemplateColumns: "1fr 1fr", gap: isMobile ? "8px 20px" : 24 }}>
          {[
            {
              l: "AQI Átlag",
              v: loading ? "–" : stats?.avgAqi ?? "–",
              sub: loading ? null : stats?.stationCount ? `(${stats.stationCount} állomás)` : null,
              c: "#facc15", num: true,
            },
            { l: "Napenergia", v: 3.9, sub: "GW", c: "#00ffaa", num: true, dec: 1 },
            {
              l: "EV Töltők",
              v: loading ? "–" : stats?.totalPoints ?? "–",
              sub: loading ? null : stats?.totalChargers ? `(${stats.totalChargers} helyszín)` : null,
              c: "#60a5fa", num: true,
            },
            { l: "CO₂/Fő", v: 4.8, sub: "t", c: "#fb923c", num: true, dec: 1 },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,.22)", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 500 }}>{s.l}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 800, color: s.c, fontFamily: mono, letterSpacing: "-.04em", marginTop: 3, textShadow: `0 0 20px ${s.c}35`, animation: loading && s.v === "–" ? "shimmer 1.5s infinite" : "none" }}>
                  {s.num && typeof s.v === "number" ? <Num to={s.v} dec={s.dec || 0} /> : s.v}
                </div>
                {s.sub && <span style={{ fontSize: 9, color: "rgba(255,255,255,.18)", fontFamily: mono }}>{s.sub}</span>}
              </div>
            </div>
          ))}
        </div>
        {isDemo && <div style={{ fontSize: 8, color: "rgba(251,146,40,.5)", marginTop: 6, fontStyle: "italic" }}>(demo adat)</div>}
      </div>

      {/* ─── DETAIL PANEL ─── */}
      {d && (
        <div style={isMobile ? {
          position: "fixed", bottom: 0, left: 0, right: 0, maxHeight: "60vh", zIndex: 20,
          animation: "slideUp .4s cubic-bezier(.16,1,.3,1) both",
          display: "flex", flexDirection: "column", gap: 8, overflowY: "auto",
          background: "rgba(2,6,8,.92)", backdropFilter: "blur(24px)",
          borderRadius: "16px 16px 0 0", padding: "8px 16px 24px",
          border: "1px solid rgba(255,255,255,.06)", borderBottom: "none",
        } : {
          position: "absolute", top: 70, right: 24, bottom: 24, width: 330, zIndex: 10,
          animation: "slideIn .6s cubic-bezier(.16,1,.3,1) both",
          display: "flex", flexDirection: "column", gap: 8, overflowY: "auto",
        }}>
          {isMobile && (
            <div style={{ display: "flex", justifyContent: "center", padding: "4px 0 8px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,.15)" }} />
            </div>
          )}
          <button onClick={() => setSelected(null)} style={{
            alignSelf: "flex-end", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 8, width: isMobile ? 40 : 30, height: isMobile ? 40 : 30, cursor: "pointer", color: "rgba(255,255,255,.25)",
            fontSize: isMobile ? 16 : 13, display: "grid", placeItems: "center", backdropFilter: "blur(16px)",
            minWidth: 44, minHeight: 44,
          }}>✕</button>

          {/* Air station panel */}
          {d._type === "air" && (
            <>
              <Glass style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 12,
                    background: aqiColor(d.aqi), display: "grid", placeItems: "center",
                    boxShadow: `0 0 24px ${aqiColor(d.aqi)}40`,
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#000", fontFamily: mono }}>{d.aqi}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,.25)", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600 }}>AQI</div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f0fdf4", letterSpacing: "-.02em", lineHeight: 1.2, marginTop: 2 }}>{d.name}</h2>
                    <div style={{
                      display: "inline-block", marginTop: 6, fontSize: 7, fontWeight: 700,
                      color: aqiColor(d.aqi), background: `${aqiColor(d.aqi)}15`, padding: "2px 8px", borderRadius: 5,
                      letterSpacing: ".1em", textTransform: "uppercase",
                    }}>{aqiLabel(d.aqi)}</div>
                  </div>
                </div>
                <AqiScaleBar aqi={d.aqi} mono={mono} />
              </Glass>
              <Glass style={{ padding: 16 }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,.25)", letterSpacing: ".12em", fontWeight: 600, marginBottom: 10, textTransform: "uppercase" }}>Részletek</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,.2)" }}>Koordináták</div>
                    <div style={{ fontSize: 11, fontFamily: mono, color: "rgba(255,255,255,.5)", marginTop: 2 }}>{d.lat?.toFixed(2)}°N, {d.lng?.toFixed(2)}°E</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,.2)" }}>Minőség</div>
                    <div style={{ fontSize: 11, color: aqiColor(d.aqi), fontWeight: 600, marginTop: 2 }}>{aqiLabel(d.aqi)}</div>
                  </div>
                </div>
                {minsAgo && (
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,.15)", marginTop: 10, fontStyle: "italic" }}>
                    Utolsó frissítés: {minsAgo} perce
                  </div>
                )}
              </Glass>
              <Glass style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", lineHeight: 1.5 }}>
                  {aqiDesc(d.aqi)}
                </div>
              </Glass>
            </>
          )}

          {/* EV charger panel */}
          {d._type === "ev" && (
            <>
              <Glass style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 12,
                    background: "rgba(96,165,250,.15)", border: "1px solid rgba(96,165,250,.2)",
                    display: "grid", placeItems: "center",
                  }}>
                    <span style={{ fontSize: 26 }}>⚡</span>
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f0fdf4", letterSpacing: "-.02em", lineHeight: 1.2 }}>{d.name}</h2>
                    {d.town && <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 3 }}>{d.town}</div>}
                    {d.powerKW && (
                      <div style={{
                        display: "inline-block", marginTop: 6, fontSize: 7, fontWeight: 700,
                        color: evColor(d.powerKW), background: `${evColor(d.powerKW)}15`, padding: "2px 8px", borderRadius: 5,
                        letterSpacing: ".1em", textTransform: "uppercase",
                      }}>{evCategory(d.powerKW)}</div>
                    )}
                  </div>
                </div>
              </Glass>
              <Glass style={{ padding: 16 }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,.25)", letterSpacing: ".12em", fontWeight: 600, marginBottom: 10, textTransform: "uppercase" }}>Töltő adatok</div>
                {[
                  { l: "Operátor", v: d.operator || "Ismeretlen" },
                  { l: "Csatlakozók", v: `${d.numPoints || 1} db` },
                  { l: "Teljesítmény", v: d.powerKW ? `${d.powerKW} kW` : "N/A", c: evColor(d.powerKW || 0) },
                  { l: "Kategória", v: evCategory(d.powerKW || 0), c: evColor(d.powerKW || 0) },
                  { l: "Koordináták", v: `${d.lat?.toFixed(2)}°N, ${d.lng?.toFixed(2)}°E` },
                  { l: "Státusz", v: "Működik", c: "#00ffaa" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,.03)" : "none" }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{r.l}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: r.c || "rgba(255,255,255,.6)", fontFamily: mono }}>{r.v}</span>
                  </div>
                ))}
              </Glass>
            </>
          )}

          {/* Energy panel */}
          {d._type === "energy" && (
            <>
              <Glass style={{ padding: 20 }}>
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
              </Glass>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { l: "NAPENERGIA", v: d.sol, u: "MW", c: "#facc15" },
                  { l: "EV TÖLTŐK", v: d.ev, u: "pont", c: "#60a5fa" },
                  { l: "CO₂/FŐ", v: d.co2, u: "t/év", c: d.co2 > 5 ? "#fb923c" : "#00ffaa", dec: 1 },
                  { l: "LEVEGŐ", v: d.aqi, u: aqiLabel(d.aqi), c: aqiColor(d.aqi) },
                ].map((m, i) => (
                  <Glass key={i} style={{ padding: "12px 14px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -15, right: -15, width: 50, height: 50, borderRadius: "50%", background: `${m.c}05`, filter: "blur(18px)" }} />
                    <div style={{ fontSize: 7.5, color: "rgba(255,255,255,.22)", letterSpacing: ".12em", fontWeight: 600 }}>{m.l}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, fontFamily: mono, color: m.c, letterSpacing: "-.04em", lineHeight: 1, marginTop: 6, textShadow: `0 0 18px ${m.c}30` }}>
                      <Num to={m.v} dec={m.dec || 0} />
                    </div>
                    <div style={{ fontSize: 8.5, color: "rgba(255,255,255,.18)", marginTop: 3 }}>{m.u}</div>
                  </Glass>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Hint when nothing selected */}
      {!selected && !isMobile && (
        <div style={{
          position: "absolute", top: 70, right: 24, zIndex: 10,
          animation: ready ? "fadeUp 1s cubic-bezier(.16,1,.3,1) .6s both" : "none",
        }}>
          <Glass style={{ padding: "14px 18px", maxWidth: 260 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.2)", lineHeight: 1.5 }}>
              Kattints egy {tab === "air" ? "mérőállomásra" : tab === "ev" ? "töltőpontra" : "városra"} a részletekért
            </div>
          </Glass>
        </div>
      )}

      {/* Instruction */}
      {!selected && !isMobile && (
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
