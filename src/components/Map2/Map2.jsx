import React, { Component } from 'react';
import './Map2.css';
import * as R from 'ramda';

import '../../utils/gpxConverter';

import L from 'leaflet/dist/leaflet-src';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { Map2PropTypes } from '../../types';

import { MarkerPopup } from './MarkerPopup';
import { LocationPopup } from './LocationPopup';

import { baseClosedLLs, baseLLs } from '../../data/baseContours';


import { getIcon } from '../../utils/icons';

import { COLOR_PALETTE } from '../../utils/colorPalette';

import { mapConfig, geomanConfig, defaultTileLayer } from './MapConfigurations';

import { markerPopupDom, locationPopupDom } from '../../utils/domUtils';

import { applyLeafletGeomanTranslation, getZoomTranslation } from '../../translations';


// import playerTracks from '../../data/initialPlayerTracks';

// R.values(playerTracks).forEach((track, i) => {
//   L.polyline(track, {
//     color: ColorPalette[i % ColorPalette.length].color.border,
//   }).addTo(this.map);
// });

// console.log(L);
L.Icon.Default.imagePath = './images/leafletImages/';

export class Map2 extends Component {
  static propTypes = Map2PropTypes;

  constructor() {
    super();
    this.state = {
      curMarker: null,
      curLocation: null,
    };
  }

  componentDidMount = () => {
    const { center, zoom } = mapConfig;
    const { urlTemplate, options } = defaultTileLayer;

    this.map = L.map(this.mapEl, {
      center,
      zoom,
      zoomControl: false,
    });
    L.control.zoom({
      ...getZoomTranslation(),
      position: 'topleft',
    }).addTo(this.map);
    L.tileLayer(urlTemplate, options).addTo(this.map);
    this.map.pm.addControls(geomanConfig);
    applyLeafletGeomanTranslation(this.map);
    // applyZoomTranslation(this.map);
    this.initMapBackbone();
    this.populateMapData();

    this.map.on('pm:create', this.onCreateLayer);
    this.map.on('pm:remove', this.onRemoveLayer);

    // this.map.pm.toggleGlobalDragMode();
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.dataService !== this.props.dataService) {
      this.clearMapData();
      this.populateMapData();
    }
    // console.log('Map2 did update');
  }

  onCreateLayer = (event) => {
    if (event.layer instanceof L.Marker) {
      this.onCreateMarker(event.layer);
    } else {
      this.onCreateLocation(event.layer);
    }
  }

  onCreateMarker = (marker) => {
    const { dataService } = this.props;
    const { id, name } = dataService.postBeacon(marker.getLatLng());
    L.setOptions(marker, { id, name });
    this.markerGroup.addLayer(marker);

    this.setMarkerEventHandlers(marker);
    this.onMarkersChange();
    this.updateMarkersView();
  }

  onCreateLocation = (location) => {
    const { dataService } = this.props;
    const { id, name, markers } = dataService.postLocation({
      latlngs: location.getLatLngs(),
    });
    L.setOptions(location, { id, name, markers });
    this.locationsGroup.addLayer(location);
    this.setLocationEventHandlers(location);
    this.updateLocationsView();
  }

  onRemoveLayer = (event) => {
    const { dataService } = this.props;
    if (event.layer instanceof L.Marker) {
      const markerId = event.layer.options.id;
      this.removeMarkerFromLocations(markerId);
      this.updateLocationsView();
      this.markerGroup.removeLayer(event.layer);
      this.onMarkersChange();
      dataService.deleteBeacon(event.layer.options.id);
    } else {
      this.locationsGroup.removeLayer(event.layer);
      dataService.deleteLocation(event.layer.options.id);
      this.updateLocationsView();
      this.updateMarkersView();
    }
    this.closeMarkerPopup();
  }

  // eslint-disable-next-line max-lines-per-function
  initMapBackbone = () => {
    const { t } = this.props;
    const baseLine = L.polyline(baseLLs, {
      color: 'green',
      pmIgnore: true,
    });
    const baseClosedLine = L.polyline(baseClosedLLs, {
      color: 'darkviolet',
      pmIgnore: true,
    });

    this.markerPopup = L.popup();
    this.locationPopup = L.popup();

    const baseContourGroup = L.layerGroup([baseLine, baseClosedLine]);
    this.polygonsGroup = L.layerGroup([]);
    this.massCentersGroup = L.layerGroup([]);
    this.signalRadiusesGroup = L.layerGroup([]);
    this.markerGroup = L.layerGroup([]);
    this.locationsGroup = L.layerGroup([]);

    baseContourGroup.addTo(this.map);
    // polygonsGroup.addTo(this.map);
    // massCentersGroup.addTo(this.map);
    // this.signalRadiusesGroup.addTo(this.map);
    this.markerGroup.addTo(this.map);
    this.locationsGroup.addTo(this.map);

    const overlayMaps = {
      [t('baseContourLayer')]: baseContourGroup,
      [t('beaconsLayer')]: this.markerGroup,
      [t('massCentersLayer')]: this.massCentersGroup,
      [t('voronoiPolygonsLayer')]: this.polygonsGroup,
      [t('signalRadiusesLayer')]: this.signalRadiusesGroup,
      [t('locationsLayer')]: this.locationsGroup,
    };

    L.control.layers(null, overlayMaps).addTo(this.map);
  }

  populateMapData = () => {
    const { dataService } = this.props;
    const beacons2 = dataService.getBeacons();

    const markers = beacons2.map(({
      lat, lng, name, id,
    }) => L.marker({ lat, lng }, { id, name }));
    markers.forEach((marker) => {
      this.setMarkerEventHandlers(marker);
      this.markerGroup.addLayer(marker);
    });

    const locationsData = dataService.getLocations();

    const locations = locationsData.map(({
      // eslint-disable-next-line no-shadow
      latlngs, name, id, markers, manaLevel,
    }) => L.polygon(latlngs, {
      id, name, markers, manaLevel,
    }));
    locations.forEach((loc) => {
      this.setLocationEventHandlers(loc);
      this.locationsGroup.addLayer(loc);
    });

    this.updateMarkersView();
    this.updateLocationsView();
    this.onMarkersChange();
  }

  clearMapData = () => {
    this.markerGroup.clearLayers();
    this.locationsGroup.clearLayers();
  }

  setMarkerEventHandlers = (marker) => {
    marker.on({
      click: (e) => {
        this.setState({
          curMarker: {
            lat: e.target.getLatLng().lat,
            lng: e.target.getLatLng().lng,
            name: e.target.options.name,
            id: e.target.options.id,
          },
        });
        this.markerPopup.setLatLng(e.latlng).setContent(markerPopupDom).openOn(this.map);
      },
      'pm:edit': this.onMarkerEdit,
    });
  }

  updateMarkersView = () => {
    const { dataService } = this.props;
    const attachedMarkers = dataService.getAttachedBeaconIds();
    this.markerGroup.eachLayer((marker) => {
      const { id } = marker.options;
      marker.setIcon(getIcon(R.contains(id, attachedMarkers) ? 'blue' : 'red'));
    });
  }

  updateLocationsView = () => {
    this.locationsGroup.getLayers().forEach((loc, i) => {
      const { markers, manaLevel } = loc.options;
      loc.setStyle({
        color: markers.length > 0 ? 'blue' : 'red',
        // fillColor: COLOR_PALETTE[i % COLOR_PALETTE.length].color.background,
        // fillOpacity: 0.5,
        fillOpacity: 0.8,
        // eslint-disable-next-line no-nested-ternary
        // fillColor: COLOR_PALETTE[manaLevel === 'low' ? 0
        //   : (manaLevel === 'normal' ? 12
        //     : 16)].color.background,
        // eslint-disable-next-line no-nested-ternary
        fillColor: manaLevel === 'low' ? 'hsla(233, 0%, 50%, 1)'
          : (manaLevel === 'normal' ? 'hsla(233, 50%, 50%, 1)'
            : 'hsla(233, 100%, 50%, 1)'),
        // fillOpacity:
        //   // eslint-disable-next-line no-nested-ternary
        //   manaLevel === 'low' ? 0.2
        //     : (manaLevel === 'normal' ? 0.6
        //       : 1)
        // ,
      });
    });
  }

  setLocationEventHandlers = (location) => {
    location.on({
      click: this.onLocationClick,
      mouseover: this.highlightLocation,
      mouseout: this.resetLocationHighlight,
      'pm:edit': this.onLocationEdit,
    });
  }

  onLocationClick = (e) => {
    const {
      name, id, markers, manaLevel,
    } = e.target.options;
    this.setState({
      curLocation: {
        id,
        name,
        markers,
        manaLevel,
      },
    });
    this.locationPopup.setLatLng(e.latlng).setContent(locationPopupDom).openOn(this.map);
  }

  onLocationEdit = (e) => {
    const { dataService } = this.props;
    const location = e.target;
    dataService.putLocation(location.options.id, {
      latlngs: location.getLatLngs(),
    });
    this.closeMarkerPopup();
  }

  highlightLocation = (e) => {
    const layer = e.target;

    layer.setStyle({
      weight: 5,
      color: 'green',
      dashArray: '',
      fillOpacity: 1,
    });

    const { markers } = layer.options;
    this.markerGroup.eachLayer((marker) => {
      const { id } = marker.options;
      if (R.contains(id, markers)) {
        marker.setIcon(getIcon('green'));
      }
    });
  }

  resetLocationHighlight = () => {
    this.updateLocationsView();
    this.updateMarkersView();
  }

  onMarkersChange = () => {
    this.updateSignalRadiuses();
    this.updateVoronoiPolygons();
  }

  onMarkerEdit = (e) => {
    const { dataService } = this.props;
    const marker = e.target;
    dataService.putBeacon(marker.options.id, marker.getLatLng());
    this.onMarkersChange();
    this.closeMarkerPopup();
    // console.log('pm:edit', e.target.getLatLng());
  };

  updateVoronoiPolygons = () => {
    const { dataService } = this.props;
    const { boundingPolylineData, polygonData } = dataService.getVoronoiPolygonData();
    this.massCentersGroup.clearLayers();
    this.polygonsGroup.clearLayers();

    const boundingPolyline = L.polyline(boundingPolylineData, { color: 'blue' });

    const polygons = polygonData.clippedPolygons.map((polygon, i) => L.polygon(polygon, {
      fillColor: COLOR_PALETTE[i % COLOR_PALETTE.length].color.background,
      fillOpacity: 0.5,
      pmIgnore: true,
    }));

    polygons.forEach((p) => this.polygonsGroup.addLayer(p));
    this.polygonsGroup.addLayer(boundingPolyline);

    const massCenters = polygonData.clippedCenters
      .filter((massCenter) => !Number.isNaN(massCenter.x) && !Number.isNaN(massCenter.y))
      .map((massCenter) => L.circleMarker([massCenter.x, massCenter.y], {
        radius: 5,
        pmIgnore: true,
      }));
    massCenters.forEach((p) => this.massCentersGroup.addLayer(p));
  }

  updateSignalRadiuses = () => {
    const { dataService } = this.props;
    this.signalRadiusesGroup.clearLayers();
    dataService.getBeacons().forEach((beacon) => {
      this.signalRadiusesGroup.addLayer(L.circle({
        lat: beacon.lat,
        lng: beacon.lng,
      }, {
        radius: 13,
        pmIgnore: true,
      }));
    });
  }

  onMarkerChange = (prop) => (e) => {
    const { value } = e.target;
    const { dataService } = this.props;
    const { id } = this.state.curMarker;
    const marker = this.markerGroup.getLayers().find((marker2) => marker2.options.id === id);
    if (prop === 'name') {
      marker.options.name = value;
      dataService.putBeacon(id, {
        [prop]: value,
      });
    }
    if (prop === 'lat' || prop === 'lng') {
      const latLng = marker.getLatLng();
      const num = Number(value);
      if (!Number.isNaN(num)) {
        const newLatLng = { ...latLng, [prop]: num };
        marker.setLatLng(newLatLng);
        dataService.putBeacon(id, {
          [prop]: num,
        });
        this.onMarkersChange();
      }
    }

    this.setState((state) => {
      const curMarker = { ...state.curMarker, [prop]: value };
      return ({
        curMarker,
      });
    });
  }

  onLocMarkerChange = ({ action, markerId }) => {
    const { dataService } = this.props;
    const locId = this.state.curLocation.id;
    this.removeMarkerFromLocations(markerId);
    const loc = this.locationsGroup.getLayers().find((loc2) => loc2.options.id === locId);
    const props = loc.options;
    if (action === 'add') {
      props.markers = [...props.markers];
      props.markers.push(markerId);
    } else if (action === 'remove') {
      props.markers = props.markers.filter((el) => el !== markerId);
    } else {
      console.error(`Unknown action ${action}`);
    }
    dataService.putLocation(locId, {
      markers: R.clone(props.markers),
    });

    this.updateLocationsView();
    this.updateMarkersView();

    this.setState((state) => {
      const curLocation = { ...state.curLocation, markers: props.markers };
      return ({
        curLocation,
      });
    });
  }

  removeMarkerFromLocations = (markerId) => {
    const { dataService } = this.props;
    this.locationsGroup.eachLayer((loc2) => {
      const props = loc2.options;
      if (R.contains(markerId, props.markers)) {
        props.markers = props.markers.filter((el) => el !== markerId);
        dataService.putLocation(props.id, {
          markers: R.clone(props.markers),
        });
      }
    });
  }

  onLocationChange = (prop) => (e) => {
    const { value } = e.target;
    const { dataService } = this.props;
    const { id } = this.state.curLocation;
    const location = this.locationsGroup.getLayers().find((loc) => loc.options.id === id);
    if (prop === 'name' || prop === 'manaLevel') {
      location.options[prop] = value;
      dataService.putLocation(id, {
        [prop]: value,
      });
    }
    this.setState((state) => {
      const curLocation = { ...state.curLocation, [prop]: value };
      return ({
        curLocation,
      });
    });
    this.updateLocationsView();
  }

  closeMarkerPopup = () => {
    this.map.closePopup();
  }

  getMarkerPopup = () => {
    const {
      curMarker,
    } = this.state;
    if (!curMarker) {
      return null;
    }
    return (
      <MarkerPopup
        name={curMarker.name}
        lat={curMarker.lat}
        lng={curMarker.lng}
        onChange={this.onMarkerChange}
        onClose={this.closeMarkerPopup}
      />
    );
  }

  getLocationPopup = () => {
    const {
      curLocation,
    } = this.state;
    const {
      dataService,
    } = this.props;
    if (!curLocation) {
      return null;
    }
    const allBeacons = R.clone(dataService.getBeacons());
    const allLocations = R.clone(dataService.getLocations());
    return (
      <LocationPopup
        name={curLocation.name}
        id={curLocation.id}
        manaLevel={curLocation.manaLevel}
        attachedMarkers={curLocation.markers}
        allBeacons={allBeacons}
        allLocations={allLocations}
        onChange={this.onLocationChange}
        onLocMarkerChange={this.onLocMarkerChange}
        onClose={this.closeMarkerPopup}
      />
    );
  }

  render() {
    return (
      <>
        <div
          className="Map2 h-full"
          ref={(map) => (this.mapEl = map)}
        />
        {
          this.getMarkerPopup()
        }
        {
          this.getLocationPopup()
        }
      </>
    );
  }
}
