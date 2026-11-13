/* ============================================
   Trek Map PWA - app.js
   Phidim → Sandakpur | erganesh.com.np
   ============================================
   
   Architecture:
   - DATA_PATH: configurable via ?route= URL param
   - MapManager: Leaflet map, layers, route
   - MarkerManager: places.json, filters, markers
   - GPSTracker: live position, accuracy circle
   - BottomSheet: shop detail card
   - OfflineManager: SW registration, tile download
   - Toast: notifications
*/

'use strict';

// ============ CONFIG ============
const CONFIG = {
  // Dynamically switch data sources via ?route= param
  get routeKey() {
    const p = new URLSearchParams(window.location.search).get('route');
    return p || 'phidim-sandakpur';
  },
  get dataBase() {
    // Robust absolute base for /map/
    const key = this.routeKey;
    if (key === 'phidim-sandakpur') return '/map/';
    return `/map/routes/${key}/`;
  },
  get routeGeoJSON() { return this.dataBase + 'route.geojson'; },
  get placesJSON() { return this.dataBase + 'places.json'; },

  // Map settings
  defaultCenter: [27.16, 87.93],
  defaultZoom: 13,
  offlineZoomMin: 11,
  offlineZoomMax: 15,
  
  // Tile URLs (Esri Satellite is DEFAULT)
  tiles: {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxZoom: 18,
      name: '🛰️ Satellite (Default)'
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      name: '🗺️ Street Map'
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      maxZoom: 17,
      name: '🏔️ Topo Map'
    }
  }
};

// ============ TOAST ============
const Toast = {
  _el: document.getElementById('toast'),
  _timer: null,
  show(msg, type = '', duration = 3000) {
    this._el.textContent = msg;
    this._el.className = `toast ${type}`;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => { this._el.className = 'toast hidden'; }, duration);
  }
};

// ============ BOTTOM SHEET ============
const BottomSheet = {
  _sheet: document.getElementById('bottom-sheet'),
  _backdrop: document.getElementById('sheet-backdrop'),
  _content: document.getElementById('sheet-content'),
  _closeBtn: document.getElementById('btn-close-sheet'),

  init() {
    this._closeBtn.addEventListener('click', () => this.close());
    this._backdrop.addEventListener('click', () => this.close());
    // Swipe-down to close
    let startY = 0;
    this._sheet.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    this._sheet.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - startY;
      if (dy > 60) this.close();
    }, { passive: true });
  },

  open(html) {
    this._content.innerHTML = html;
    this._sheet.classList.add('open');
    this._backdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this._sheet.classList.remove('open');
    this._backdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }
};

// ============ GPS TRACKER ============
const GPSTracker = {
  _map: null,
  _watchId: null,
  _marker: null,
  _circle: null,
  _active: false,
  _firstFix: true,
  _lastLatLng: null,
  _lastAccuracy: null,
  _lastFixTime: null,
  _places: [],
  _btn: document.getElementById('btn-gps'),

  init(map) {
    this._map = map;
    this._btn.addEventListener('click', () => {
      if (this._lastLatLng) {
        // Center directly on user's real phone location at high zoom
        const zoomLevel = this._lastAccuracy && this._lastAccuracy < 60 ? 17 : 16;
        this._map.setView(this._lastLatLng, Math.max(this._map.getZoom(), zoomLevel), { animate: true });
        Toast.show(`📍 Centered on your location (±${Math.round(this._lastAccuracy)}m)`, 'success', 2500);
      } else {
        this.start(true);
      }
    });
  },

  setPlaces(places) {
    this._places = places || [];
  },

  toggle() {
    if (this._active) {
      if (this._lastLatLng) {
        this._map.setView(this._lastLatLng, Math.max(this._map.getZoom(), 16), { animate: true });
      } else {
        this.stop();
      }
    } else {
      this.start(true);
    }
  },

  start(autoZoom = false) {
    if (!('geolocation' in navigator)) {
      Toast.show('⚠️ GPS hardware not detected on this device', 'error');
      return;
    }
    this._btn.classList.add('gps-active');
    this._active = true;

    // Fast initial position lock (direct satellite GPS query)
    navigator.geolocation.getCurrentPosition(
      (pos) => this._onPosition(pos, autoZoom),
      (err) => console.warn('[GPS initial]', err.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    // Continuous real-time watch with maximumAge: 0
    if (this._watchId !== null) navigator.geolocation.clearWatch(this._watchId);
    this._watchId = navigator.geolocation.watchPosition(
      (pos) => this._onPosition(pos, false),
      (err) => this._onError(err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
  },

  stop() {
    if (this._watchId !== null) {
      navigator.geolocation.clearWatch(this._watchId);
      this._watchId = null;
    }
    if (this._marker) { this._map.removeLayer(this._marker); this._marker = null; }
    if (this._circle) { this._map.removeLayer(this._circle); this._circle = null; }
    this._btn.classList.remove('gps-active');
    this._active = false;
    this._lastLatLng = null;
    this._lastAccuracy = null;
  },

  _onPosition(pos, shouldZoom = false) {
    const { latitude: lat, longitude: lng, accuracy, speed, altitude } = pos.coords;
    const latlng = [lat, lng];

    // Clean previous layers
    if (this._marker) this._map.removeLayer(this._marker);
    if (this._circle) this._map.removeLayer(this._circle);

    // Accuracy circle
    this._circle = L.circle(latlng, {
      radius: accuracy,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.16,
      weight: 1.5
    }).addTo(this._map);

    // Pulsing high-contrast beacon with center dot
    const dotIcon = L.divIcon({
      className: '',
      html: '<div class="gps-dot"><div class="gps-dot-center"></div></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    this._marker = L.marker(latlng, { icon: dotIcon, zIndexOffset: 1000 })
      .addTo(this._map)
      .bindPopup(`<b>तपाईंको वास्तविक लोकेशन (Your Location)</b><br>Coordinates: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E<br>Accuracy: &plusmn;${Math.round(accuracy)}m`);

    // Update Live Trek Dashboard (HUD)
    this._updateHUD(lat, lng, accuracy, speed, altitude);

    // Update timestamps for delta speed calculation
    this._lastLatLng = latlng;
    this._lastAccuracy = accuracy;
    this._lastFixTime = Date.now();

    // Zoom directly in on user position if requested
    if (shouldZoom) {
      const zoomLevel = accuracy < 50 ? 17 : 16;
      this._map.setView(latlng, Math.max(this._map.getZoom(), zoomLevel), { animate: true });
      Toast.show(`📍 Location locked (±${Math.round(accuracy)}m)`, 'success', 2500);
    }
  },

  _updateHUD(lat, lng, accuracy, speedRaw, altitudeRaw) {
    const speedEl = document.getElementById('hud-speed');
    const remainingEl = document.getElementById('hud-remaining');
    const altitudeEl = document.getElementById('hud-altitude');
    const locTextEl = document.getElementById('hud-location-text');
    const accPillEl = document.getElementById('hud-accuracy-pill');

    // 1. Live speed calculation (km/h)
    let speedKmH = '0.0';
    if (speedRaw !== null && !isNaN(speedRaw) && speedRaw >= 0.25) {
      speedKmH = (speedRaw * 3.6).toFixed(1);
    } else if (this._lastFixTime && this._lastLatLng) {
      const dtSec = (Date.now() - this._lastFixTime) / 1000;
      if (dtSec >= 1.5 && dtSec <= 45) {
        const dKm = MapManager.haversine(this._lastLatLng[0], this._lastLatLng[1], lat, lng);
        const calcSpeed = (dKm / (dtSec / 3600));
        if (calcSpeed >= 0.5 && calcSpeed <= 130) {
          speedKmH = calcSpeed.toFixed(1);
        }
      }
    }
    if (speedEl) speedEl.innerHTML = `${speedKmH} <small>km/h</small>`;

    // 2. Trek statistics (remaining distance along trail)
    const stats = MapManager.getTrekStats(lat, lng, this._places);

    if (remainingEl) {
      if (stats.onTrail) {
        remainingEl.innerHTML = `${stats.remainingKm.toFixed(1)} <small>km</small>`;
      } else {
        remainingEl.innerHTML = `${stats.distToSandakpurKm.toFixed(1)} <small>km</small>`;
      }
    }

    // 3. Live altitude
    if (altitudeEl) {
      if (altitudeRaw !== null && !isNaN(altitudeRaw) && altitudeRaw > 0) {
        altitudeEl.innerHTML = `${Math.round(altitudeRaw)} <small>m</small>`;
      } else if (stats.altitudeM) {
        altitudeEl.innerHTML = `~${Math.round(stats.altitudeM)} <small>m</small>`;
      } else {
        altitudeEl.innerHTML = `-- <small>m</small>`;
      }
    }

    // 4. Exact locality / distance text
    if (locTextEl) {
      if (stats.onTrail) {
        if (stats.nearestPlace && stats.distToPlaceKm < 1.5) {
          locTextEl.textContent = `Near ${stats.nearestPlace.name_en} (${(stats.distToPlaceKm * 1000).toFixed(0)}m)`;
        } else {
          locTextEl.textContent = `On Trail · ${stats.coveredKm.toFixed(1)}km from Phidim`;
        }
      } else {
        // User testing from off-trail location (e.g. Kathmandu or hometown)
        locTextEl.textContent = `📍 ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (${stats.distToPhidimKm.toFixed(0)}km to Phidim)`;
      }
    }

    // 5. Accuracy Pill
    if (accPillEl) {
      const roundedAcc = Math.round(accuracy);
      accPillEl.textContent = `±${roundedAcc}m`;
      if (roundedAcc <= 35) {
        accPillEl.className = 'hud-acc-pill';
        accPillEl.title = 'High accuracy satellite GPS lock';
      } else {
        accPillEl.className = 'hud-acc-pill warn';
        accPillEl.title = 'Wi-Fi / Cellular estimate. Enable GPS for precision.';
      }
    }
  },

  _onError(err) {
    console.warn('[GPS Error]', err);
    this._btn.classList.remove('gps-active');
    this._active = false;
    const locTextEl = document.getElementById('hud-location-text');
    const msgs = {
      1: '🔒 Location permission denied. Please allow location access in your browser settings.',
      2: '📡 Searching for GPS satellite signal... Move to open sky.',
      3: '⏳ GPS timed out. Tap GPS button to retry.'
    };
    if (locTextEl) locTextEl.textContent = msgs[err.code] || '❌ GPS error';
    Toast.show(msgs[err.code] || '❌ Unable to acquire GPS position', 'error', 5000);
  }
};

// ============ MARKER MANAGER ============
const MarkerManager = {
  _map: null,
  _markers: [],     // { layer, place }
  _currentFilter: 'all',

  ICONS: {
    tea_food:   { emoji: '🍵', color: '#ef4444' },
    essentials: { emoji: '🎒', color: '#8b5cf6' },
    fuel:       { emoji: '⛽', color: '#f97316' },
    garage:     { emoji: '🔧', color: '#3b82f6' },
    default:    { emoji: '📍', color: '#6b7280' }
  },

  init(map) { this._map = map; },

  _makeIcon(place) {
    const primaryCat = place.categories?.[0] || 'default';
    const iconDef = this.ICONS[primaryCat] || this.ICONS.default;
    const featured = place.is_featured_partner;
    return L.divIcon({
      className: '',
      html: `<div class="map-marker marker-${primaryCat}${featured ? ' marker-featured' : ''}" title="${place.name_en}">
               <span class="marker-inner">${iconDef.emoji}</span>
             </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -38]
    });
  },

  addPlaces(places) {
    places.forEach(place => {
      const { lat, lng } = place.coordinates;
      const marker = L.marker([lat, lng], { icon: this._makeIcon(place) })
        .addTo(this._map)
        .on('click', () => BottomSheet.open(this._buildSheetHTML(place)));
      this._markers.push({ layer: marker, place });
    });
  },

  filter(category) {
    this._currentFilter = category;
    this._markers.forEach(({ layer, place }) => {
      const show = category === 'all' || (place.categories && place.categories.includes(category));
      if (show) this._map.addLayer(layer);
      else this._map.removeLayer(layer);
    });
  },

  _buildSheetHTML(p) {
    const coords = p.coordinates;
    const imgSrc = p.image || '';
    
    // Image section with robust fallback between relative and root paths
    const imgHTML = imgSrc
      ? `<img src="${imgSrc}" alt="${p.name_en}" loading="lazy" onerror="this.onerror=null;if(this.src.startsWith('/')&&!this.src.includes('./')){this.src='.'+this.getAttribute('src');}else if(!this.src.includes('ganesh-varieties_1')){this.src='./images/places/ganesh-varieties_1.webp';}else{this.parentElement.innerHTML='<div class=shop-image-placeholder><span class=ph-icon>🏪</span><span>No image available</span></div>';}">`
      : `<div class="shop-image-placeholder"><span class="ph-icon">🏪</span><span>No image available</span></div>`;
    
    const featuredHTML = p.is_featured_partner
      ? `<div class="featured-badge">⭐ Featured Partner</div>`
      : '';

    // Facilities
    const fac = p.facilities || {};
    const facBadges = [
      fac.wifi_available && `<span class="facility-badge badge-wifi">📶 Wi-Fi</span>`,
      fac.online_payment_qr && `<span class="facility-badge badge-qr">📲 QR Pay</span>`,
      fac.emergency_fuel && `<span class="facility-badge badge-fuel">⛽ Emergency Fuel</span>`,
      fac.home_delivery && `<span class="facility-badge badge-delivery">🚚 Delivery</span>`
    ].filter(Boolean).join('');

    // Items
    const itemsHTML = (p.items_available || [])
      .map(i => `<li>${i}</li>`).join('');

    // Phone buttons
    const phonesHTML = (p.phones || []).map(ph => `
      <a href="tel:${ph.number}" class="btn-call">
        <div>
          <div class="call-label">${ph.label}</div>
          <div>${ph.number}</div>
        </div>
        <span>📞 Call</span>
      </a>`).join('');

    // Website & Navigate
    const websiteBtn = p.website
      ? `<a href="${p.website}" target="_blank" rel="noopener" class="btn-website">🌐 Website</a>`
      : '';
    const navBtn = `<a href="geo:${coords.lat},${coords.lng}" class="btn-navigate">🧭 Navigate</a>`;

    return `
      <div class="shop-image-wrap">
        ${imgHTML}
        ${featuredHTML}
      </div>
      <div class="shop-names">
        <div class="shop-name-en">
          ${p.name_en}
          <span class="elevation-badge">↑ ${coords.elevation_m}m</span>
        </div>
        <div class="shop-name-np">${p.name_np || ''}</div>
      </div>
      <div class="shop-meta">
        <div class="meta-row"><span class="meta-icon">📍</span> ${p.location_name || ''}</div>
        ${p.opening_hours ? `<div class="meta-row"><span class="meta-icon">🕐</span> ${p.opening_hours}</div>` : ''}
        ${p.owner_name ? `<div class="meta-row"><span class="meta-icon">👤</span> ${p.owner_name}</div>` : ''}
      </div>
      ${facBadges ? `<div class="facility-badges">${facBadges}</div>` : ''}
      ${p.description ? `<p class="shop-description">${p.description}</p>` : ''}
      ${itemsHTML ? `<div class="section-label">Available</div><ul class="items-list">${itemsHTML}</ul>` : ''}
      <div class="section-label">Contact</div>
      <div class="action-buttons">
        ${phonesHTML}
        <div class="btn-action-row">
          ${websiteBtn}
          ${navBtn}
        </div>
      </div>`;
  }
};

// ============ MAP MANAGER ============
const MapManager = {
  _map: null,
  _routeLayer: null,
  _routeBounds: null,
  _baseLayers: {},
  _trailCoords: [],
  _cumDistFromSummit: [],
  _totalTrailDist: 57.44,

  haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  _initTrailMath(coords) {
    this._trailCoords = coords;
    this._cumDistFromSummit = new Array(coords.length);
    this._cumDistFromSummit[coords.length - 1] = 0;
    for (let i = coords.length - 2; i >= 0; i--) {
      const d = this.haversine(coords[i][1], coords[i][0], coords[i + 1][1], coords[i + 1][0]);
      this._cumDistFromSummit[i] = this._cumDistFromSummit[i + 1] + d;
    }
    this._totalTrailDist = this._cumDistFromSummit[0] || 57.44;
  },

  getTrekStats(userLat, userLng, places = []) {
    const trail = this._trailCoords;
    if (!trail || trail.length === 0) {
      return {
        onTrail: false,
        remainingKm: 57.4,
        coveredKm: 0,
        distToPhidimKm: 0,
        distToSandakpurKm: 57.4,
        nearestPlace: null,
        distToPlaceKm: 999,
        altitudeM: null
      };
    }

    const startPt = trail[0];
    const endPt = trail[trail.length - 1];
    const distToPhidim = this.haversine(userLat, userLng, startPt[1], startPt[0]);
    const distToSandakpur = this.haversine(userLat, userLng, endPt[1], endPt[0]);

    // Find closest point on trail
    let minD = Infinity;
    let closestIdx = 0;
    for (let i = 0; i < trail.length; i++) {
      const d = this.haversine(userLat, userLng, trail[i][1], trail[i][0]);
      if (d < minD) {
        minD = d;
        closestIdx = i;
      }
    }

    const onTrail = minD <= 4.0; // Within 4km of trail corridor
    const remainingKm = onTrail
      ? (this._cumDistFromSummit[closestIdx] || distToSandakpur)
      : distToSandakpur;
    const coveredKm = Math.max(0, this._totalTrailDist - remainingKm);

    // Closest verified place (e.g. Ganesh Varieties)
    let nearestPlace = null;
    let distToPlaceKm = Infinity;
    for (const pl of places) {
      if (pl.coordinates) {
        const dp = this.haversine(userLat, userLng, pl.coordinates.lat, pl.coordinates.lng);
        if (dp < distToPlaceKm) {
          distToPlaceKm = dp;
          nearestPlace = pl;
        }
      }
    }

    const altitudeM = trail[closestIdx] && trail[closestIdx][2] ? trail[closestIdx][2] : null;

    return {
      onTrail,
      minD,
      remainingKm,
      coveredKm,
      distToPhidimKm: distToPhidim,
      distToSandakpurKm: distToSandakpur,
      nearestPlace,
      distToPlaceKm,
      altitudeM
    };
  },

  init() {
    this._map = L.map('map', {
      center: CONFIG.defaultCenter,
      zoom: CONFIG.defaultZoom,
      zoomControl: true,
      attributionControl: true
    });

    // Position zoom control top-left
    this._map.zoomControl.setPosition('topleft');

    // Build base layers — Esri Satellite is DEFAULT
    const satelliteLayer = L.tileLayer(CONFIG.tiles.satellite.url, {
      attribution: CONFIG.tiles.satellite.attribution,
      maxZoom: CONFIG.tiles.satellite.maxZoom
    }).addTo(this._map);

    const osmLayer = L.tileLayer(CONFIG.tiles.osm.url, {
      attribution: CONFIG.tiles.osm.attribution,
      maxZoom: CONFIG.tiles.osm.maxZoom
    });

    const topoLayer = L.tileLayer(CONFIG.tiles.topo.url, {
      attribution: CONFIG.tiles.topo.attribution,
      maxZoom: CONFIG.tiles.topo.maxZoom
    });

    this._baseLayers = {
      [CONFIG.tiles.satellite.name]: satelliteLayer,
      [CONFIG.tiles.osm.name]: osmLayer,
      [CONFIG.tiles.topo.name]: topoLayer
    };

    L.control.layers(this._baseLayers, {}, { position: 'topright', collapsed: true }).addTo(this._map);

    return this._map;
  },

  async loadRoute() {
    try {
      const res = await fetch(CONFIG.routeGeoJSON);
      if (!res.ok) throw new Error('Route file not found');
      const geojson = await res.json();

      // Initialize trail distance calculations
      const coords = geojson.features?.[0]?.geometry?.coordinates;
      if (coords && coords.length > 0) {
        this._initTrailMath(coords);
      }

      // Draw high-contrast single route
      // Outer crisp white halo for visibility on dark satellite terrain
      L.geoJSON(geojson, {
        style: { color: '#ffffff', weight: 6, opacity: 0.95, lineJoin: 'round', lineCap: 'round' }
      }).addTo(this._map);

      // Core crimson trail
      this._routeLayer = L.geoJSON(geojson, {
        style: { color: '#e11d48', weight: 3.5, opacity: 1, lineJoin: 'round', lineCap: 'round' }
      }).addTo(this._map);

      // Start/End markers on single route
      if (coords && coords.length >= 2) {
        const start = coords[0];
        const end = coords[coords.length - 1];
        const makeEndpointIcon = (label, color) => L.divIcon({
          className: '',
          html: `<div style="background:${color};color:#fff;padding:5px 10px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.4)">${label}</div>`,
          iconAnchor: [35, 12]
        });
        L.marker([start[1], start[0]], { icon: makeEndpointIcon('🚩 Phidim Trailhead (~1,180m)', '#dc2626') }).addTo(this._map);
        L.marker([end[1], end[0]], { icon: makeEndpointIcon('🏔️ Sandakpur / Charrate (3,450m)', '#16a34a') }).addTo(this._map);
      }

      this._routeBounds = this._routeLayer.getBounds();
      this._map.fitBounds(this._routeBounds, { padding: [30, 30] });

      return this._routeBounds;
    } catch (err) {
      console.warn('Route load error:', err);
      Toast.show('⚠️ Route file missing. Add route.geojson to /map/', 'error', 6000);
      return null;
    }
  },

  async loadPlaces() {
    try {
      const res = await fetch(CONFIG.placesJSON);
      if (!res.ok) throw new Error('Places file not found');
      const data = await res.json();
      const places = data.places || [];
      GPSTracker.setPlaces(places);
      return places;
    } catch (err) {
      console.warn('Places load error:', err);
      Toast.show('⚠️ Could not load places data', 'error');
      return [];
    }
  },

  fitRoute() {
    if (this._routeBounds) {
      this._map.fitBounds(this._routeBounds, { padding: [30, 30], animate: true });
      Toast.show('🗺️ Full trail route (57.4 km)', '', 2000);
    }
  },

  getMap() { return this._map; }
};

// ============ OFFLINE MANAGER ============
const OfflineManager = {
  _sw: null,
  _downloading: false,
  _cancelled: false,
  
  _badgeEl: document.getElementById('offline-badge'),
  _btnSave: document.getElementById('btn-save-offline'),
  _overlay: document.getElementById('download-overlay'),
  _statusEl: document.getElementById('download-status'),
  _barEl: document.getElementById('progress-bar'),
  _labelEl: document.getElementById('progress-label'),
  _tileCountEl: document.getElementById('tile-count-label'),
  _cancelBtn: document.getElementById('btn-cancel-download'),

  async init() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
        this._sw = reg;
        console.log('[SW] Registered:', reg.scope);
      } catch (e) {
        console.warn('[SW] Registration failed:', e);
      }
    }

    // Check if already offline-ready
    const isReady = await localforage.getItem('offline_ready_phidim');
    if (isReady) this._showBadge();

    // Bind buttons
    this._btnSave.addEventListener('click', () => this._startDownload());
    this._cancelBtn.addEventListener('click', () => this._cancelDownload());
  },

  _showBadge() {
    this._badgeEl.classList.remove('hidden');
  },

  _setProgress(pct, status) {
    if (this._barEl) this._barEl.style.width = pct + '%';
    if (this._labelEl) this._labelEl.textContent = pct + '%';
    if (status && this._statusEl) this._statusEl.textContent = status;
  },

  _setStatus(msg) {
    if (this._statusEl) this._statusEl.textContent = msg;
  },

  async _startDownload() {
    if (this._downloading) return;
    this._downloading = true;
    this._cancelled = false;
    this._overlay.classList.remove('hidden');
    this._setProgress(0, 'Preparing download...');

    try {
      // 1. Get route bounds
      const res = await fetch(CONFIG.routeGeoJSON);
      const geojson = await res.json();
      const bbox = this._getBoundingBox(geojson);
      
      // 2. Calculate tiles
      const tiles = this._getTileList(bbox, CONFIG.offlineZoomMin, CONFIG.offlineZoomMax);
      this._tileCountEl.textContent = `~${tiles.length} tiles`;
      
      // 3. Cache static files first
      this._setStatus('Caching app files...');
      await this._cacheStaticFiles();
      if (this._cancelled) return;

      // 4. Download tiles with progress
      this._setStatus('Downloading map tiles...');
      await this._downloadTiles(tiles);
      if (this._cancelled) return;

      // 5. Mark offline ready
      await localforage.setItem('offline_ready_phidim', true);
      this._setProgress(100, '✓ Map saved offline!');
      this._showBadge();
      
      setTimeout(() => {
        this._overlay.classList.add('hidden');
        Toast.show('✅ Offline map ready! You can now go offline.', 'success', 5000);
        this._downloading = false;
      }, 1500);

    } catch (err) {
      console.error('Download error:', err);
      this._setStatus('❌ Download failed. Check Wi-Fi connection.');
      this._downloading = false;
      setTimeout(() => this._overlay.classList.add('hidden'), 2500);
    }
  },

  _cancelDownload() {
    this._cancelled = true;
    this._downloading = false;
    this._overlay.classList.add('hidden');
    Toast.show('Download cancelled', '', 2000);
  },

  async _cacheStaticFiles() {
    if (!('caches' in window)) return;
    const cache = await caches.open('trek-map-static-v1.0.0');
    const files = [
      './', './index.html', './style.css', './app.js', './sw.js',
      './manifest.json', CONFIG.routeGeoJSON, CONFIG.placesJSON,
      './images/places/ganesh-varieties_1.webp',
      './images/places/ganesh-varieties_2.webp',
      './images/places/ganesh-varieties.webp',
      '/images/places/ganesh-varieties.webp',
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      'https://unpkg.com/localforage@1.10.0/dist/localforage.min.js'
    ];
    for (const url of files) {
      try { await cache.add(url); } catch(e) { /* skip if fails */ }
    }
  },

  async _downloadTiles(tiles) {
    if (!('caches' in window)) {
      Toast.show('⚠️ Cache API not available', 'error');
      return;
    }
    const cache = await caches.open('trek-map-tiles-v1.0.0');
    const total = tiles.length;
    let done = 0;
    const BATCH = 8; // parallel fetches

    for (let i = 0; i < tiles.length; i += BATCH) {
      if (this._cancelled) return;
      const batch = tiles.slice(i, i + BATCH);
      await Promise.all(batch.map(async tile => {
        try {
          // Cache Satellite (Default Layer)
          const satURL = this._tileURL(tile, 'satellite');
          const satCached = await cache.match(satURL);
          if (!satCached) {
            const res = await fetch(satURL, { mode: 'cors' });
            if (res.ok) await cache.put(satURL, res);
          }
          // Also cache Topo for mountain elevation contours
          const topoURL = this._tileURL(tile, 'topo');
          const topoCached = await cache.match(topoURL);
          if (!topoCached) {
            try {
              const topoRes = await fetch(topoURL, { mode: 'cors' });
              if (topoRes.ok) await cache.put(topoURL, topoRes);
            } catch(e) {}
          }
        } catch(e) {}
        done++;
        const pct = Math.round((done / total) * 100);
        this._setProgress(pct, `Downloading tiles: ${pct}%... (${done}/${total})`);
      }));
    }
  },

  _tileURL(tile, layer = 'satellite') {
    const { z, x, y } = tile;
    if (layer === 'satellite') {
      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
    }
    if (layer === 'topo') {
      const s = ['a', 'b', 'c'][Math.floor(Math.random() * 3)];
      return `https://${s}.tile.opentopomap.org/${z}/${x}/${y}.png`;
    }
    // OSM
    const s = ['a', 'b', 'c'][Math.floor(Math.random() * 3)];
    return `https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
  },

  _getBoundingBox(geojson) {
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    const walk = (coords) => {
      if (typeof coords[0] === 'number') {
        minLng = Math.min(minLng, coords[0]);
        maxLng = Math.max(maxLng, coords[0]);
        minLat = Math.min(minLat, coords[1]);
        maxLat = Math.max(maxLat, coords[1]);
      } else coords.forEach(walk);
    };
    geojson.features?.forEach(f => walk(f.geometry.coordinates));
    // Add a small buffer (0.02 degrees ~ 2km)
    return { minLng: minLng - 0.02, minLat: minLat - 0.02, maxLng: maxLng + 0.02, maxLat: maxLat + 0.02 };
  },

  _getTileList(bbox, minZ, maxZ) {
    const tiles = [];
    for (let z = minZ; z <= maxZ; z++) {
      const minX = this._lng2tile(bbox.minLng, z);
      const maxX = this._lng2tile(bbox.maxLng, z);
      const minY = this._lat2tile(bbox.maxLat, z);
      const maxY = this._lat2tile(bbox.minLat, z);
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          tiles.push({ z, x, y });
        }
      }
    }
    return tiles;
  },

  _lng2tile(lng, z) {
    return Math.floor((lng + 180) / 360 * Math.pow(2, z));
  },

  _lat2tile(lat, z) {
    return Math.floor(
      (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI)
      / 2 * Math.pow(2, z)
    );
  }
};

// ============ FILTER BAR ============
function initFilterBar() {
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      MarkerManager.filter(btn.dataset.filter);
    });
  });
}

// ============ MAIN INIT ============
async function init() {
  // 1. Initialize map
  const map = MapManager.init();

  // 2. Initialize sub-managers
  BottomSheet.init();
  GPSTracker.init(map);
  MarkerManager.init(map);
  initFilterBar();

  // 3. Fit route button
  document.getElementById('btn-fit-route').addEventListener('click', () => MapManager.fitRoute());

  // 4. Load data concurrently
  const [, places] = await Promise.all([
    MapManager.loadRoute(),
    MapManager.loadPlaces()
  ]);

  // 5. Add place markers
  if (places.length > 0) {
    MarkerManager.addPlaces(places);
  }

  // 6. Init offline manager (registers SW)
  await OfflineManager.init();

  // 7. Auto-request & lock live high-accuracy satellite GPS (updates HUD & places live beacon)
  GPSTracker.start(false);
}

// Boot
init().catch(err => {
  console.error('App init error:', err);
  Toast.show('❌ App failed to load. Try refreshing.', 'error', 8000);
});
