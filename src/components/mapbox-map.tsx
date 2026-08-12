import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import type { LatLng } from '@/types';
import { Colors } from '@/constants/colors';

export interface MapboxMarker {
  id: string;
  coordinate: LatLng;
  /** Teardrop pin color. */
  color?: string;
  /** Popup label shown when the pin is tapped. */
  title?: string;
}

export interface MapboxMapHandle {
  /** Jump the map to a coordinate (used by "My Location" and search). */
  setCenter: (coordinate: LatLng, zoom?: number) => void;
  /** Draw the pickup→destination route line; `fit` frames both points.
   * `fitOptions` tune the framing (a small inline preview needs much less
   * padding than a full-screen map). */
  setRoute: (
    coords: LatLng[],
    fit?: boolean,
    fitOptions?: { padding?: number; maxZoom?: number },
  ) => void;
}

interface MapboxMapProps {
  /** Initial map center. */
  center: LatLng;
  zoom?: number;
  markers?: MapboxMarker[];
  /** A live position to keep the map centered on (e.g. the moving driver). */
  follow?: LatLng | null;
  /** Marker id that renders highlighted (used by place picking). */
  selectedId?: string;
  /** Fired when a marker pin is tapped. */
  onMarkerPress?: (id: string) => void;
  /** Fired whenever the map center changes (drag, tap, recenter). */
  onCenterChange?: (center: LatLng) => void;
  /** Fired when a spot on the map is tapped directly (tap-to-select). */
  onMapTap?: (coordinate: LatLng) => void;
  /** Fired once the map + style finish loading. */
  onReady?: () => void;
  /** Fired if the map can't load (bad token / no network / CDN blocked). */
  onError?: () => void;
  style?: StyleProp<ViewStyle>;
}

const MAPBOX_GL_VERSION = '3.4.0';
const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';
const SELECTED_COLOR = '#16A34A';

/** Mapbox GL JS map that works everywhere. Native uses a WebView-hosted map;
 * web uses mapbox-gl directly in the DOM (react-native-webview is native-only,
 * so without this branch web previews would show a blank map area). */
export const MapboxMap = forwardRef<MapboxMapHandle, MapboxMapProps>(function MapboxMap(
  props,
  ref,
) {
  if (Platform.OS === 'web') return <WebMapboxMap {...props} ref={ref} />;
  return <NativeMapboxMap {...props} ref={ref} />;
});

/* ─────────────────────────── Native (WebView) ─────────────────────────── */

function buildHtml(token: string, center: LatLng, zoom: number): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link href="https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_GL_VERSION}/mapbox-gl.css" rel="stylesheet" />
<script src="https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_GL_VERSION}/mapbox-gl.js"></script>
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  mapboxgl.accessToken = ${JSON.stringify(token)};
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [${center.longitude}, ${center.latitude}],
    zoom: ${zoom},
    attributionControl: false
  });
  var markers = {};
  var readySent = false;
  var selectedId = null;
  var SELECTED_COLOR = '${SELECTED_COLOR}';

  function post(msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  }

  // A style/tile error before first paint means something is fundamentally broken
  // (bad token, no billing, blocked CDN) — tell the app to fall back to a list.
  map.on('error', function (e) {
    if (!readySent) {
      post({ type: 'error', message: String((e && e.error && e.error.message) || (e && e.message) || 'map error') });
    }
  });

  // If the mapbox-gl script itself never loaded (offline), fail fast too.
  window.addEventListener('error', function () {
    if (!window.mapboxgl && !readySent) {
      post({ type: 'error', message: 'mapbox script failed to load' });
    }
  });

  map.on('load', function () {
    if (!readySent) {
      readySent = true;
      post({ type: 'ready' });
    }
  });

  // Center-picking: report the center after every drag / tap / recenter so the
  // app can reverse-geocode the pinned spot in real time.
  map.on('moveend', function () {
    var c = map.getCenter();
    post({ type: 'center', lat: c.lat, lng: c.lng });
  });

  // Tap-to-select: tapping any spot jumps the center there (the moveend above
  // fires afterwards and updates the address).
  map.on('click', function (e) {
    post({ type: 'tap', lat: e.lngLat.lat, lng: e.lngLat.lng });
  });

  // Called from React Native to draw / update the pins.
  window.setMarkers = function (list) {
    list = list || [];
    var seen = {};
    list.forEach(function (m) {
      seen[m.id] = true;
      var lngLat = [m.coordinate.longitude, m.coordinate.latitude];
      var color = m.id === selectedId ? SELECTED_COLOR : m.color || '${Colors.brand}';
      if (markers[m.id]) {
        markers[m.id].setLngLat(lngLat);
        if (markers[m.id].setColor) markers[m.id].setColor(color);
      } else {
        var marker = new mapboxgl.Marker({ color: color })
          .setLngLat(lngLat)
          .addTo(map);
        if (m.title) {
          marker.setPopup(new mapboxgl.Popup({ offset: 25 }).setText(m.title));
        }
        marker.getElement().addEventListener('click', function () {
          post({ type: 'marker', id: m.id });
        });
        markers[m.id] = marker;
      }
    });
    Object.keys(markers).forEach(function (id) {
      if (!seen[id]) {
        markers[id].remove();
        delete markers[id];
      }
    });
  };

  // Called from React Native to recenter (e.g. follow the driver marker).
  window.setCenter = function (lng, lat, z) {
    map.jumpTo({ center: [lng, lat], zoom: z || map.getZoom() });
  };

  // Draws the pickup→destination route as a canvas line beneath the DOM
  // markers (so pins always render on top), then optionally frames it.
  var routeReady = false;
  function ensureRoute() {
    if (routeReady) return;
    routeReady = true;
    map.addSource('route', {
      type: 'geojson',
      data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
    });
    map.addLayer({
      id: 'route-casing',
      type: 'line',
      source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': 'rgba(255, 255, 255, 0.9)', 'line-width': 9 }
    });
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '${Colors.brand}', 'line-width': 5 }
    });
  }
  window.setRoute = function (coords, fit, opts) {
    if (!coords || coords.length < 2) {
      if (routeReady) {
        map.removeLayer('route-casing');
        map.removeLayer('route-line');
        map.removeSource('route');
        routeReady = false;
      }
      return;
    }
    ensureRoute();
    map.getSource('route').setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: coords }
    });
    if (fit) {
      var padding = (opts && typeof opts.padding === 'number') ? opts.padding : 90;
      var maxZoom = (opts && typeof opts.maxZoom === 'number') ? opts.maxZoom : 15.5;
      var bounds = new mapboxgl.LngLatBounds(coords[0], coords[0]);
      for (var i = 1; i < coords.length; i++) bounds.extend(coords[i]);
      map.fitBounds(bounds, { padding: padding, duration: 900, maxZoom: maxZoom });
    }
  };
</script>
</body>
</html>`;
}

const NativeMapboxMap = forwardRef<MapboxMapHandle, MapboxMapProps>(function NativeMapboxMap(
  {
    center,
    zoom = 14,
    markers = [],
    follow,
    selectedId,
    onMarkerPress,
    onCenterChange,
    onMapTap,
    onReady,
    onError,
    style,
  },
  ref,
) {
  const webviewRef = useRef<WebView>(null);
  const readyRef = useRef(false);

  // Build the HTML once on mount — the initial center/zoom are baked in and
  // later movement is pushed via injectJavaScript, so the webview never reloads.
  const [html] = useState(() => buildHtml(TOKEN, center, zoom));

  const push = useCallback(() => {
    if (!readyRef.current || !webviewRef.current) return;
    const recenter = follow
      ? `window.setCenter(${follow.longitude}, ${follow.latitude}, ${zoom});`
      : '';
    webviewRef.current.injectJavaScript(
      `window.selectedId = ${JSON.stringify(selectedId ?? null)};window.setMarkers(${JSON.stringify(markers)});${recenter}true;`
    );
  }, [markers, follow, zoom, selectedId]);

  // Imperative recenter for "My Location" / search — works as soon as the map
  // finished loading, without going through React props.
  useImperativeHandle(
    ref,
    () => ({
      setCenter: (coordinate, z) => {
        if (!readyRef.current || !webviewRef.current) return;
        webviewRef.current.injectJavaScript(
          `window.setCenter(${coordinate.longitude}, ${coordinate.latitude}, ${z ?? zoom});true;`
        );
      },
      setRoute: (coords, fit = true, fitOptions) => {
        if (!readyRef.current || !webviewRef.current) return;
        webviewRef.current.injectJavaScript(
          `window.setRoute(${JSON.stringify(coords.map((c) => [c.longitude, c.latitude]))}, ${fit}, ${JSON.stringify(fitOptions ?? null)});true;`
        );
      },
    }),
    [zoom],
  );

  // Push markers whenever the props change (after the map is ready).
  useEffect(() => {
    if (readyRef.current) push();
  }, [push]);

  const handleMessage = (event: WebViewMessageEvent) => {
    let data: { type?: string; id?: string; lat?: number; lng?: number } | null = null;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (data?.type === 'ready') {
      readyRef.current = true;
      onReady?.();
      push();
    } else if (data?.type === 'error') {
      onError?.();
    } else if (data?.type === 'marker') {
      onMarkerPress?.(String(data.id));
    } else if (
      data?.type === 'center' &&
      typeof data.lat === 'number' &&
      typeof data.lng === 'number'
    ) {
      onCenterChange?.({ latitude: data.lat, longitude: data.lng });
    } else if (
      data?.type === 'tap' &&
      typeof data.lat === 'number' &&
      typeof data.lng === 'number'
    ) {
      onMapTap?.({ latitude: data.lat, longitude: data.lng });
    }
  };

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        ref={webviewRef}
        source={{ html }}
        style={StyleSheet.absoluteFill}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="never"
        startInLoadingState
      />
    </View>
  );
});

/* ─────────────────────────────── Web (DOM) ─────────────────────────────── */

type WebMapbox = any;

function loadMapboxGl(): Promise<void> {
  return new Promise((resolve, reject) => {
    const win = window as any;
    if (typeof win.mapboxgl !== 'undefined') {
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_GL_VERSION}/mapbox-gl.css`;
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_GL_VERSION}/mapbox-gl.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('mapbox script failed to load'));
    document.head.appendChild(script);
  });
}

/** Mirrors the WebView-hosted map's API using mapbox-gl in the DOM. */
const WebMapboxMap = forwardRef<MapboxMapHandle, MapboxMapProps>(function WebMapboxMap(
  {
    center,
    zoom = 14,
    markers = [],
    follow,
    selectedId,
    onMarkerPress,
    onCenterChange,
    onMapTap,
    onReady,
    onError,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<WebMapbox | null>(null);
  const markersRef = useRef<Record<string, WebMapbox>>({});
  const readyRef = useRef(false);

  // Keep the latest callbacks so event handlers never capture a stale closure.
  const cbRef = useRef({ onMarkerPress, onCenterChange, onMapTap, onReady, onError });
  cbRef.current = { onMarkerPress, onCenterChange, onMapTap, onReady, onError };

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    let map: WebMapbox | null = null;
    loadMapboxGl()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const win = window as any;
        map = new win.mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [center.longitude, center.latitude],
          zoom,
          attributionControl: false,
          accessToken: TOKEN,
        });
        mapRef.current = map;
        map.on('load', () => {
          if (cancelled) return;
          readyRef.current = true;
          cbRef.current.onReady?.();
        });
        map.on('error', () => {
          if (!readyRef.current) cbRef.current.onError?.();
        });
        map.on('moveend', () => {
          const c = map.getCenter();
          cbRef.current.onCenterChange?.({ latitude: c.lat, longitude: c.lng });
        });
        map.on('click', (e: { lngLat: { lat: number; lng: number } }) => {
          cbRef.current.onMapTap?.({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
        });
      })
      .catch(() => {
        if (!cancelled) cbRef.current.onError?.();
      });
    return () => {
      cancelled = true;
      if (map) {
        map.remove();
        mapRef.current = null;
        markersRef.current = {};
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers (and follow the live marker) whenever props change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const win = window as any;
    const seen: Record<string, boolean> = {};
    markers.forEach((m) => {
      seen[m.id] = true;
      const lngLat = [m.coordinate.longitude, m.coordinate.latitude];
      const color = m.id === selectedId ? SELECTED_COLOR : m.color || Colors.brand;
      const existing = markersRef.current[m.id];
      if (existing) {
        existing.setLngLat(lngLat);
        if (existing.setColor) existing.setColor(color);
      } else {
        const marker = new win.mapboxgl.Marker({ color })
          .setLngLat(lngLat)
          .addTo(map);
        if (m.title) marker.setPopup(new win.mapboxgl.Popup({ offset: 25 }).setText(m.title));
        marker.getElement().addEventListener('click', () => cbRef.current.onMarkerPress?.(m.id));
        markersRef.current[m.id] = marker;
      }
    });
    Object.keys(markersRef.current).forEach((id) => {
      if (!seen[id]) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
    if (follow) {
      map.jumpTo({ center: [follow.longitude, follow.latitude] });
    }
  }, [markers, follow, selectedId]);

  useImperativeHandle(
    ref,
    () => ({
      setCenter: (coordinate, z) => {
        const map = mapRef.current;
        if (!map || !readyRef.current) return;
        map.jumpTo({ center: [coordinate.longitude, coordinate.latitude], zoom: z ?? map.getZoom() });
      },
      setRoute: (coords, fit = true, fitOptions) => {
        const map = mapRef.current;
        if (!map || !readyRef.current) return;
        const win = window as any;
        if (!(map as any).__routeReady) {
          (map as any).__routeReady = true;
          map.addSource('route', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
          });
          map.addLayer({
            id: 'route-casing',
            type: 'line',
            source: 'route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': 'rgba(255,255,255,0.9)', 'line-width': 9 },
          });
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': Colors.brand, 'line-width': 5 },
          });
        }
        map.getSource('route').setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coords.map((c) => [c.longitude, c.latitude]),
          },
        });
        if (fit && coords.length >= 2) {
          const padding = fitOptions?.padding ?? 90;
          const maxZoom = fitOptions?.maxZoom ?? 15.5;
          const bounds = new win.mapboxgl.LngLatBounds(coords[0], coords[0]);
          coords.forEach((c) => bounds.extend(c));
          map.fitBounds(bounds, { padding, duration: 900, maxZoom });
        }
      },
    }),
    [],
  );

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
});

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});
