/* ============================================
   Trek Map PWA - app.js
   Phidim → Charrate | erganesh.com.np
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
    return p || 'phidim-charrate';
  },
  get dataBase() {
    // Robust absolute base for /map/
    const key = this.routeKey;
    if (key === 'phidim-charrate' || key === 'phidim-sandakpur') return '/map/';
    return `/map/routes/${key}/`;
  },
  get routeGeoJSON() { return this.dataBase + 'route.geojson'; },
  get placesJSON() { return this.dataBase + 'places.json'; },

  // Map settings
  defaultCenter: [27.16, 87.93],
  defaultZoom: 13,
  offlineZoomMin: 11,
  offlineZoomMax: 15,
  
  // Tile URLs (Google Hybrid Satellite is DEFAULT; maxNativeZoom: 16 ensures Leaflet upscales seamlessly without 404s)
  tiles: {
    googleHybrid: {
      url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Satellite &amp; Maxar',
      subdomains: ['0', '1', '2', '3'],
      maxNativeZoom: 16,
      maxZoom: 21,
      name: '🛰️ Google Hybrid Satellite'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxNativeZoom: 16,
      maxZoom: 21,
      name: '🌍 Esri World Imagery'
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      maxNativeZoom: 18,
      maxZoom: 21,
      name: '🗺️ OpenStreetMap'
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenTopoMap',
      maxNativeZoom: 16,
      maxZoom: 21,
      name: '🏔️ Mountain Topo'
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
        remainingEl.innerHTML = `${stats.distToCharrateKm.toFixed(1)} <small>km</small>`;
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
    const imgSrc = place.image || 'images/places/ganesh-varieties.webp';

    // Real photo circular pin with user's verified photo and visible name label
    return L.divIcon({
      className: 'custom-photo-pin-container',
      html: `
        <div class="photo-pin ${featured ? 'featured-pin' : ''} pin-cat-${primaryCat}" title="${place.name_en} (${place.coordinates.elevation_m || ''}m)">
          <div class="photo-pin-circle">
            <img src="${imgSrc}" alt="${place.name_en}" class="photo-pin-img" onerror="this.onerror=null;this.src='images/places/ganesh-varieties.webp';" />
          </div>
          <span class="photo-pin-badge">${iconDef.emoji}</span>
          <div class="photo-pin-tip"></div>
          <div class="marker-name-label">
            <span class="mnl-title">${place.name_en}</span>
            <span class="mnl-elev">${place.coordinates.elevation_m}m</span>
          </div>
        </div>
      `,
      iconSize: [44, 52],
      iconAnchor: [22, 52],
      popupAnchor: [0, -52]
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
    this.showShopOrderDrawer(category);
  },

  showShopOrderDrawer(category) {
    const drawer = document.getElementById('shop-quick-drawer');
    const content = document.getElementById('sq-card-content');
    if (!drawer || !content) return;

    if (category === 'all') {
      drawer.classList.add('hidden');
      return;
    }

    const matching = this._markers
      .map(m => m.place)
      .filter(p => p.categories && p.categories.includes(category));

    if (matching.length === 0) {
      content.innerHTML = `
        <div class="sq-drawer-header">
          <span class="sq-drawer-title">ℹ️ यस वर्गमा अझै पसल दर्ता भएको छैन</span>
          <button class="sq-drawer-close" onclick="document.getElementById('shop-quick-drawer').classList.add('hidden')">✕</button>
        </div>
        <div class="sq-drawer-empty">
          <p>यो पदमार्गमा आफ्नो पसल/सेवा दर्ता गर्न एडमिनलाई सम्पर्क गर्नुहोस्।</p>
        </div>
      `;
      drawer.classList.remove('hidden');
      return;
    }

    const cardsHTML = matching.map(p => {
      const primaryPhone = p.phones?.[0]?.number || '+9779814065193';
      const phoneLabel = p.phones?.[0]?.label || 'Call for Order';
      const imgSrc = p.image || 'images/places/ganesh-varieties.webp';
      
      // Calculate live distance from user GPS or Phidim Trailhead
      let distText = '';
      if (GPSTracker._lastLatLng) {
        const d = MapManager.haversine(
          GPSTracker._lastLatLng[0], GPSTracker._lastLatLng[1],
          p.coordinates.lat, p.coordinates.lng
        );
        distText = ` · 📍 <strong>${d.toFixed(1)} km</strong> तपाईंको स्थानबाट`;
      } else {
        const dPhidim = MapManager.haversine(27.142431, 87.766814, p.coordinates.lat, p.coordinates.lng);
        distText = ` · 📍 <strong>${dPhidim.toFixed(1)} km</strong> फिदिम बजारबाट`;
      }

      return `
        <div class="sq-shop-item" onclick="MarkerManager.focusPlace('${p.id}')">
          <div class="sq-shop-thumb-wrap">
            <img src="${imgSrc}" alt="${p.name_en}" class="sq-shop-thumb" onerror="this.onerror=null;this.src='images/places/ganesh-varieties.webp';" />
            <span class="sq-elev-pill">${p.coordinates.elevation_m}m</span>
          </div>
          <div class="sq-shop-details">
            <div class="sq-shop-top">
              <h4 class="sq-shop-name">${p.name_en} <span class="sq-np-name">(${p.name_np || ''})</span></h4>
              <button class="sq-btn-view" onclick="event.stopPropagation(); MarkerManager.openDetails('${p.id}')">विवरण</button>
            </div>
            <p class="sq-shop-loc">${p.location_name}${distText}</p>
            <div class="sq-shop-action">
              <a href="tel:${primaryPhone}" class="sq-call-btn" onclick="event.stopPropagation();">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                <span>अर्डर / सेवाको लागि कल: ${primaryPhone}</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    content.innerHTML = `
      <div class="sq-drawer-header">
        <span class="sq-drawer-title">🏪 प्रमाणीकृत सेवा तथा पसल (${matching.length})</span>
        <button class="sq-drawer-close" onclick="document.getElementById('shop-quick-drawer').classList.add('hidden')">✕</button>
      </div>
      <div class="sq-drawer-body">
        ${cardsHTML}
      </div>
    `;
    drawer.classList.remove('hidden');
  },

  focusPlace(placeId) {
    const item = this._markers.find(m => m.place.id === placeId);
    if (item) {
      this._map.setView([item.place.coordinates.lat, item.place.coordinates.lng], 16, { animate: true });
    }
  },

  openDetails(placeId) {
    const item = this._markers.find(m => m.place.id === placeId);
    if (item) {
      BottomSheet.open(this._buildSheetHTML(item.place));
    }
  },

  _buildSheetHTML(p) {
    const coords = p.coordinates;
    const imgSrc = p.image || 'images/places/ganesh-varieties.webp';
    
    // Image section with verified photo
    const imgHTML = `<img src="${imgSrc}" alt="${p.name_en}" class="sheet-main-photo" loading="lazy" onerror="this.onerror=null;this.src='images/places/ganesh-varieties.webp';">`;
    
    const featuredHTML = p.is_featured_partner
      ? `<div class="featured-badge">⭐ Featured Partner</div>`
      : '';

    // Calculate distance
    let distBadge = '';
    if (GPSTracker._lastLatLng) {
      const d = MapManager.haversine(GPSTracker._lastLatLng[0], GPSTracker._lastLatLng[1], coords.lat, coords.lng);
      distBadge = `<div class="sheet-dist-pill">📍 तपाईंको स्थानबाट <strong>${d.toFixed(1)} km</strong> टाढा</div>`;
    } else {
      const dPhidim = MapManager.haversine(27.142431, 87.766814, coords.lat, coords.lng);
      distBadge = `<div class="sheet-dist-pill">📍 फिदिम बजारबाट <strong>${dPhidim.toFixed(1)} km</strong> टाढा</div>`;
    }

    // Why Charrate Spotlight for Yak Lodge (YL-004)
    let whyCharrateBlock = '';
    if (p.id === 'YL-004') {
      whyCharrateBlock = `
        <div class="sheet-why-section">
          <div class="sheet-why-head">
            <span class="sheet-why-badge">🏔️ किन चारराते? | WHY CHARRATE?</span>
            <h3 class="sheet-why-title">फालेलुङ–४, पाँचथर र भारत (सिक्किम–प.बङ्गाल) सीमा</h3>
          </div>

          <!-- Photo Gallery -->
          <div class="sheet-why-gallery">
            <img src="images/places/charrate-yak-lodge.webp" alt="Kanchenjunga over Yak Lodge Charrate" class="sheet-why-img" />
            <img src="images/places/charrate-yak-lodge_2.webp" alt="Vintage 4WD Jeep Safari" class="sheet-why-img" />
            <img src="images/places/charrate-yak-lodge_3.webp" alt="Alpine Meadow Lodge at Charrate" class="sheet-why-img" />
          </div>

          <p class="sheet-why-p">
            <strong>चारराते (३,४५० मिटर)</strong> पाँचथरको फालेलुङ गाउँपालिका र भारत (सिक्किम–पश्चिम बङ्गाल) को सीमामा अवस्थित एक अद्वितीय, शान्त र मनोरम उच्च हिमाली गन्तव्य हो। यहाँबाट विश्वको तेस्रो अग्लो शिखर <strong>कञ्चनजङ्घा (८,५८६ मिटर)</strong>, <strong>कुम्भकर्ण (जन्नु)</strong> तथा <strong>मकालु</strong> हिमशृङ्खलाको मनमोहक दृश्यावलोकन गर्न सकिन्छ।
          </p>

          <p class="sheet-why-p">
            भीडभाडबाट टाढा रहेको यस क्षेत्रमा चौँरी र याक चर्ने खुला हिमाली खर्कहरू, गुराँसको जङ्गल, तथा आतिथ्यको रोमाञ्चक अनुभव लिन सकिन्छ। यहाँका स्थानीय लज तथा होमस्टेहरू पदयात्रीहरूका लागि न्यानो बास, स्थानीय परिकार र सूर्योदय हेर्ने उत्कृष्ट विश्रामस्थल हुन्।
          </p>

          <div class="sheet-border-note">
            <span class="sheet-border-icon">📍</span>
            <div class="sheet-border-text">
              <strong>सीमाको विवरण (पर्वत/जिल्ला सीमा):</strong>
              चारराते पाँचथर (फालेलुङ गाउँपालिका-४) र भारत (सिक्किम र पश्चिम बङ्गाल) को सीमामा अवस्थित छ। यो पाँचथर र इलामको सीमामा होइन (सन्दकपुरचाहिँ पाँचथर, इलाम र भारतको सीमामा पर्छ)।
            </div>
          </div>

          <div class="sheet-why-highlights">
            <div class="sheet-hl-card"><span class="hl-ico">🏔️</span><strong>360° Himal Vistas</strong><p>Kanchenjunga, Jannu, Makalu</p></div>
            <div class="sheet-hl-card"><span class="hl-ico">🌿</span><strong>Alpine Meadows</strong><p>Pristine yak pastures &amp; forests</p></div>
            <div class="sheet-hl-card"><span class="hl-ico">🚙</span><strong>4WD Safari Trail</strong><p>Iconic vintage Land Rover route</p></div>
            <div class="sheet-hl-card"><span class="hl-ico">☕</span><strong>Yak Lodge Hospitality</strong><p>Warm hearth fire &amp; local tea</p></div>
          </div>
        </div>
      `;
    }

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

    // Primary Call for Order box
    const primaryPhone = p.phones?.[0]?.number || '+9779814065193';
    const phoneLabel = p.phones?.[0]?.label || 'Kamala Chapagain';

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

      ${distBadge}

      <!-- Dedicated Highlighted Order & Service Call Box -->
      <div class="shop-order-call-box">
        <a href="tel:${primaryPhone}" class="btn-primary-order-call">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
          <div class="btn-order-text">
            <span class="order-action-label">अर्डर तथा सोधपुछको लागि सिधै कल गर्नुहोस्:</span>
            <span class="order-phone-number">${primaryPhone} (${phoneLabel})</span>
          </div>
        </a>
      </div>

      <div class="shop-meta">
        <div class="meta-row"><span class="meta-icon">📍</span> ${p.location_name || ''}</div>
        ${p.opening_hours ? `<div class="meta-row"><span class="meta-icon">🕐</span> ${p.opening_hours}</div>` : ''}
        ${p.owner_name ? `<div class="meta-row"><span class="meta-icon">👤</span> ${p.owner_name}</div>` : ''}
      </div>
      ${whyCharrateBlock}
      ${facBadges ? `<div class="facility-badges">${facBadges}</div>` : ''}
      ${p.description ? `<p class="shop-description">${p.description}</p>` : ''}
      ${itemsHTML ? `<div class="section-label">Available Items / सुविधाहरू</div><ul class="items-list">${itemsHTML}</ul>` : ''}
      <div class="section-label">All Contacts / सम्पर्क नम्बरहरू</div>
      <div class="action-buttons">
        ${phonesHTML}
        ${websiteBtn}
        ${navBtn}
      </div>
    `;
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
        distToCharrateKm: 57.4,
        nearestPlace: null,
        distToPlaceKm: 999,
        altitudeM: null
      };
    }

    const startPt = trail[0];
    const endPt = trail[trail.length - 1];
    const distToPhidim = this.haversine(userLat, userLng, startPt[1], startPt[0]);
    const distToCharrate = this.haversine(userLat, userLng, endPt[1], endPt[0]);

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
      ? (this._cumDistFromSummit[closestIdx] || distToCharrate)
      : distToCharrate;
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
      distToCharrateKm: distToCharrate,
      nearestPlace,
      distToPlaceKm,
      altitudeM
    };
  },

  init() {
    this._map = L.map('map', {
      center: CONFIG.defaultCenter,
      zoom: CONFIG.defaultZoom,
      minZoom: 6,
      maxZoom: 21,
      zoomControl: true,
      attributionControl: true
    });

    // Position zoom control top-left
    this._map.zoomControl.setPosition('topleft');

    // Lightweight inline SVG fallback tile so missing/offline tiles never show blank grey
    const FALLBACK_TILE = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="#0f172a"/>
  <path d="M0 190 Q64 165 128 178 T256 168 L256 256 L0 256 Z" fill="#1e293b" opacity="0.8"/>
  <path d="M0 220 Q64 200 128 212 T256 204 L256 256 L0 256 Z" fill="#334155" opacity="0.8"/>
  <text x="128" y="128" fill="#475569" font-family="sans-serif" font-size="11" text-anchor="middle" font-weight="bold">🏔️ Phidim - Charrate Trail</text>
</svg>
    `);

    // High performance tile configuration:
    // keepBuffer: 16 keeps a large ring of tiles cached in memory
    // updateWhenIdle: false loads tiles instantly during panning
    // updateWhenZooming: true prevents tiles disappearing during zoom
    const layerOpts = (cfg) => ({
      attribution: cfg.attribution,
      subdomains: cfg.subdomains || 'abc',
      maxNativeZoom: cfg.maxNativeZoom,
      maxZoom: cfg.maxZoom,
      keepBuffer: 16,
      updateWhenIdle: false,
      updateWhenZooming: true,
      errorTileUrl: FALLBACK_TILE
    });

    // Build base layers — Google Hybrid is DEFAULT for crystal clear zoom without grey screens
    const hybridLayer = L.tileLayer(CONFIG.tiles.googleHybrid.url, layerOpts(CONFIG.tiles.googleHybrid)).addTo(this._map);
    const satelliteLayer = L.tileLayer(CONFIG.tiles.satellite.url, layerOpts(CONFIG.tiles.satellite));
    const osmLayer = L.tileLayer(CONFIG.tiles.osm.url, layerOpts(CONFIG.tiles.osm));
    const topoLayer = L.tileLayer(CONFIG.tiles.topo.url, layerOpts(CONFIG.tiles.topo));

    this._baseLayers = {
      [CONFIG.tiles.googleHybrid.name]: hybridLayer,
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
        const makeEndpointIcon = (label, color, icon) => L.divIcon({
          className: 'endpoint-marker-wrapper',
          html: `
            <div class="endpoint-pin" style="border-color:${color}">
              <span class="ep-icon">${icon}</span>
              <span class="ep-text" style="background:${color}">${label}</span>
            </div>
          `,
          iconAnchor: [45, 16]
        });
        L.marker([start[1], start[0]], { icon: makeEndpointIcon('Phidim Bazar (RL 1,180m)', '#16a34a', '🟢') }).addTo(this._map);
        L.marker([end[1], end[0]], { icon: makeEndpointIcon('Yak Lodge, Charrate (RL 3,450m)', '#dc2626', '🔴') }).addTo(this._map);
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
    const cache = await caches.open('trek-map-static-v2.0.0');
    const files = [
      './', './index.html', './style.css', './app.js', './sw.js',
      './manifest.json', CONFIG.routeGeoJSON, CONFIG.placesJSON,
      './images/places/ganesh-varieties_1.webp',
      './images/places/ganesh-varieties_2.webp',
      './images/places/ganesh-varieties.webp',
      './images/places/charrate-yak-lodge.webp',
      './images/places/charrate-yak-lodge_1.webp',
      './images/places/charrate-yak-lodge_2.webp',
      './images/places/charrate-yak-lodge_3.webp',
      './images/esewa-qr.webp',
      './images/esewa-qr.png',
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
    const cache = await caches.open('trek-map-tiles-v2.0.0');
    const total = tiles.length;
    let done = 0;
    const BATCH = 8; // parallel fetches

    for (let i = 0; i < tiles.length; i += BATCH) {
      if (this._cancelled) return;
      const batch = tiles.slice(i, i + BATCH);
      await Promise.all(batch.map(async tile => {
        try {
          // 1. Cache Google Hybrid (Default Layer)
          const hybridURL = this._tileURL(tile, 'googleHybrid');
          const hybridCached = await cache.match(hybridURL);
          if (!hybridCached) {
            try {
              const res = await fetch(hybridURL);
              if (res && (res.ok || res.type === 'opaque')) await cache.put(hybridURL, res);
            } catch (e) {}
          }
          // 2. Also cache Esri Satellite fallback
          const satURL = this._tileURL(tile, 'satellite');
          const satCached = await cache.match(satURL);
          if (!satCached) {
            try {
              const satRes = await fetch(satURL);
              if (satRes && (satRes.ok || satRes.type === 'opaque')) await cache.put(satURL, satRes);
            } catch (e) {}
          }
        } catch(e) {}
        done++;
        const pct = Math.round((done / total) * 100);
        this._setProgress(pct, `Downloading tiles: ${pct}%... (${done}/${total})`);
      }));
    }
  },

  _tileURL(tile, layer = 'googleHybrid') {
    const { z, x, y } = tile;
    if (layer === 'googleHybrid') {
      const s = Math.floor(Math.random() * 4);
      return `https://mt${s}.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`;
    }
    if (layer === 'satellite') {
      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
    }
    if (layer === 'topo') {
      const s = ['a', 'b', 'c'][Math.floor(Math.random() * 3)];
      return `https://${s}.tile.opentopomap.org/${z}/${x}/${y}.png`;
    }
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

// ============ BUY A COFFEE (ANTI-TAMPER ESEWA QR) ============
const BuyCoffeeModal = {
  modal: null,
  backdrop: null,
  _observer: null,

  SECURITY: Object.freeze({
    RECIPIENT_NAME: 'Ganesh Chapagain',
    ESEWA_ID: '9817921231',
    SHA256: '785983d0aca292443826168e42dd1791ee3580d25405cd70388dcbc1c0f1e60b',
    IMG_PATH: 'images/esewa-qr.webp'
  }),

  init() {
    this.modal = document.getElementById('coffee-modal');
    this.backdrop = document.getElementById('coffee-modal-backdrop');
    const btnOpen = document.getElementById('btn-buy-coffee');
    const btnClose = document.getElementById('btn-close-coffee');
    const btnDone = document.getElementById('btn-done-coffee');
    const btnCopy = document.getElementById('btn-copy-esewa-id');

    if (btnOpen) {
      btnOpen.addEventListener('click', () => this.open());
    }
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }
    if (btnDone) {
      btnDone.addEventListener('click', () => this.close());
    }
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    if (btnCopy) {
      btnCopy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(this.SECURITY.ESEWA_ID);
          Toast.show(`✓ eSewa ID copied: ${this.SECURITY.ESEWA_ID} (${this.SECURITY.RECIPIENT_NAME})`, 'success', 3500);
        } catch {
          Toast.show(`eSewa ID: ${this.SECURITY.ESEWA_ID}`, 'info', 4000);
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    });

    this._attachAntiTamperGuard();
  },

  _attachAntiTamperGuard() {
    const container = document.getElementById('coffee-qr-container');
    const qrImg = document.getElementById('coffee-qr-img');
    if (!container || !qrImg) return;

    const enforceOfficialState = () => {
      const currentSrc = qrImg.getAttribute('src');
      if (currentSrc !== this.SECURITY.IMG_PATH && !currentSrc.startsWith('data:image/webp')) {
        console.warn('[SECURITY] QR tampering detected! Reverting to verified official QR.');
        qrImg.src = this.SECURITY.IMG_PATH;
        Toast.show('🛡️ Tamper attempt blocked: Verified Ganesh Chapagain eSewa QR restored', 'error', 5000);
      }
      qrImg.setAttribute('alt', `Official eSewa QR for ${this.SECURITY.RECIPIENT_NAME} (${this.SECURITY.ESEWA_ID})`);
    };

    if ('MutationObserver' in window) {
      this._observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'attributes' || m.type === 'childList') {
            enforceOfficialState();
          }
        }
      });
      this._observer.observe(container, { attributes: true, subtree: true, childList: true });
    }
  },

  open() {
    if (this.modal) {
      this.modal.classList.remove('hidden');
      const nameEl = document.getElementById('coffee-acc-name');
      const idEl = document.getElementById('coffee-acc-id');
      if (nameEl) nameEl.textContent = this.SECURITY.RECIPIENT_NAME;
      if (idEl) idEl.textContent = this.SECURITY.ESEWA_ID;
    }
  },

  close() {
    if (this.modal) this.modal.classList.add('hidden');
  }
};

// ============ WHY CHARRATE MODAL ============
const WhyCharrateModal = {
  modal: null,
  backdrop: null,
  init() {
    this.modal = document.getElementById('why-charrate-modal');
    this.backdrop = document.getElementById('why-modal-backdrop');
    const btnOpen = document.getElementById('btn-why-charrate');
    const btnClose = document.getElementById('btn-close-why');
    const btnNav = document.getElementById('btn-why-start-nav');

    if (btnOpen) {
      btnOpen.addEventListener('click', () => this.open());
    }
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }
    if (btnNav) {
      btnNav.addEventListener('click', () => {
        this.close();
        GPSTracker.start(true);
        Toast.show('🚀 Live Navigation started to Charrate (3,450m)!', 'success', 3000);
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    });
  },
  open() {
    if (this.modal) this.modal.classList.remove('hidden');
  },
  close() {
    if (this.modal) this.modal.classList.add('hidden');
  }
};

// ============ MAIN INIT ============
async function init() {
  // 1. Initialize map
  const map = MapManager.init();

  // 2. Initialize sub-managers
  BottomSheet.init();
  GPSTracker.init(map);
  MarkerManager.init(map);
  initFilterBar();
  BuyCoffeeModal.init();
  WhyCharrateModal.init();

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
