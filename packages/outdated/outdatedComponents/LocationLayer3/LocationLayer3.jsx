import React, { Component } from 'react';
import './LocationLayer3.css';

import L from 'leaflet/dist/leaflet-src';
import * as R from 'ramda';

import { InnerLocationLayer3 } from './InnerLocationLayer3';

import { LocationPopup3 } from '../LocationLayer4/LocationPopup3';

export class LocationLayer3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      curLocation: null,
    };
    // this.onHighlightLocation_locations = this.onHighlightLocation_locations.bind(this);
    // this.onResetHighlightLocation_locations = this.onResetHighlightLocation_locations.bind(this);
    this.onCreateLayer = this.onCreateLayer.bind(this);
    this.onRemoveLayer = this.onRemoveLayer.bind(this);
    this.onPostLocationRecord = this.onPostLocationRecord.bind(this);
    this.onPutLocationRecord = this.onPutLocationRecord.bind(this);
    this.closePopup = this.closePopup.bind(this);
  }

  componentDidMount() {
    const {
      gameModel, enableByDefault, layerCommunicator,
    } = this.props;
    this.locationPopupDom = document.createElement('div');
    this.subscribe('on', gameModel);
    this.communicatorSubscribe('on');
    this.locationPopup = L.popup();
    this.locationsLayer = new InnerLocationLayer3();
    layerCommunicator.emit('setLayersMeta', {
      layersMeta: this.locationsLayer.getLayersMeta(),
      enableByDefault,
    });
    this.populate();
    console.log('LocationLayer3 mounted');
  }

  componentDidUpdate(prevProps) {
    const {
      gameModel, translator,
    } = this.props;
    if (prevProps.gameModel !== gameModel) {
      this.subscribe('off', prevProps.gameModel);
      this.subscribe('on', gameModel);
      this.clear();
      this.populate();
    }
    if (prevProps.translator !== translator) {
      this.clear();
      this.populate();
    }
    console.log('LocationLayer3 did update');
  }

  componentWillUnmount() {
    const {
      gameModel,
    } = this.props;
    this.subscribe('off', gameModel);
    this.communicatorSubscribe('off');
    this.clear();
    console.log('LocationLayer3 will unmount');
  }

  // eslint-disable-next-line react/sort-comp
  populate() {
    const {
      gameModel, t, translator,
    } = this.props;
    // this.locationsLayer.populate(gameModel, translator, t, this.setMarkerEventHandlers);
    this.locationsLayer.populate(gameModel, translator, this.setLocationEventHandlers, t);
  }

  clear() {
    this.locationsLayer.clear();
  }

  subscribe(action, gameModel) {
    gameModel[action]('postLocationRecord', this.onPostLocationRecord);
    gameModel[action]('putLocationRecord', this.onPutLocationRecord);
  }

  communicatorSubscribe(action) {
    const { layerCommunicator } = this.props;
    // layerCommunicator[action]('highlightLocation', this.onHighlightLocation_locations);
    // layerCommunicator[action]('resetLocationHighlight', this.onResetHighlightLocation_locations);
    layerCommunicator[action]('onCreateLayer', this.onCreateLayer);
    layerCommunicator[action]('onRemoveLayer', this.onRemoveLayer);
  }

  onCreateLayer(event) {
    const { gameModel, translator } = this.props;
    if (event.layer instanceof L.Polygon) {
      const location = event.layer;
      // this.locationsLayer.onCreateLocation(event.layer, gameModel, translator);
      const latlngs = translator.moveFrom({
        latlngs: location.getLatLngs(),
      });
      gameModel.execute({
        type: 'postLocationRecord',
        props: { polygon: latlngs.latlngs },
      });
      location.remove();
    }
  }

  onPostLocationRecord({ locationRecord }) {
    const { t } = this.props;
    this.locationsLayer.onPostLocationRecord(locationRecord, this.setLocationEventHandlers, t);
  }

  onPutLocationRecord({ locationRecord }) {
    // const { t } = this.props;
    this.locationsLayer.onPutLocationRecord(locationRecord);
  }

  onRemoveLayer(event) {
    const {
      gameModel, translator, closePopup, layerCommunicator,
    } = this.props;
    if (event.layer instanceof L.Polygon) {
      // this.markerLayer.onRemoveMarker(event.layer, gameModel, translator, this.setMarkerEventHandlers);
      this.locationsLayer.onRemoveLocation(event.layer, gameModel);
      layerCommunicator.emit('closePopup');
    }
  }

  setLocationEventHandlers = (location) => {
    location.on({
      click: this.onLocationClick,
      //   mouseover: this.highlightLocation,
      //   mouseout: this.resetLocationHighlight,
      'pm:edit': this.onLocationEdit,
    });
    return location;
  }

  // highlightLocation = (e) => {
  //   const { layerCommunicator } = this.props;
  //   const layer = e.target;
  //   layerCommunicator.emit('highlightLocation', { location: layer });
  // }

  onLocationClick = (e) => {
    const { layerCommunicator } = this.props;
    const {
      label, id, markers, manaLevel, layer_id, color, weight, fillOpacity,
    } = e.target.options;
    this.setState({
      curLocation: {
        id,
        label,
        markers,
        manaLevel,
        layer_id,
        color,
        weight,
        fillOpacity,
      },
    });
    layerCommunicator.emit('openPopup', {
      popup: this.locationPopup.setLatLng(e.latlng).setContent(this.locationPopupDom),
    });
  }

  onLocationEdit = (e) => {
    const {
      gameModel, translator, layerCommunicator,
    } = this.props;
    const location = e.target;
    const latlngs = translator.moveFrom({
      latlngs: location.getLatLngs(),
    });
    gameModel.execute({
      type: 'putLocationRecord',
      id: location.options.id,
      props: {
        polygon: latlngs.latlngs,
      },
    });
    this.closePopup();
  }

  // eslint-disable-next-line class-methods-use-this
  closePopup() {
    const {
      layerCommunicator,
    } = this.props;
    layerCommunicator.emit('closePopup');
  }

  // resetLocationHighlight = () => {
  //   const { layerCommunicator } = this.props;
  //   layerCommunicator.emit('resetLocationHighlight');
  // }

  // onHighlightLocation_locations({ location }) {
  //   location.setStyle({
  //     weight: 5,
  //     color: 'green',
  //     dashArray: '',
  //     fillOpacity: 1,
  //   });
  // }

  // onResetHighlightLocation_locations() {
  //   this.locationsLayer.updateLocationsView();
  // }

  // onLocMarkerChange = ({ action, markerId }) => {
  //   const { gameModel } = this.props;
  //   const locId = this.state.curLocation.id;
  //   const props = this.locationsLayer.onLocMarkerChange(action, markerId, gameModel, locId);

  //   this.setState((state) => {
  //     const curLocation = { ...state.curLocation, markers: props.markers };
  //     return ({
  //       curLocation,
  //     });
  //   });
  // }

  onLocationChange = (prop) => (e) => {
    let { value } = e.target;
    const { gameModel } = this.props;
    const { id } = this.state.curLocation;
    if (prop === 'weight') {
      value = Number(value);
      if (value < 0 || value > 20) {
        return;
      }
    }
    if (prop === 'fillOpacity') {
      value = Number(value);
      if (value < 0 || value > 100) {
        return;
      }
      value = 1 - value / 100;
    }
    this.locationsLayer.onLocationChange(prop, value, gameModel, id);
    this.setState((state) => {
      const curLocation = { ...state.curLocation, [prop]: value };
      return ({
        curLocation,
      });
    });
    // this.locationsLayer.updateLocationsView();
  }

  getLocationPopup() {
    const {
      curLocation,
    } = this.state;
    const {
      gameModel,
    } = this.props;
    if (!curLocation) {
      return null;
    }
    return (
      <LocationPopup3
        label={curLocation.label}
        id={curLocation.id}
        layer_id={curLocation.layer_id}
        color={curLocation.color}
        weight={curLocation.weight}
        fillOpacity={curLocation.fillOpacity}
        // manaLevel={curLocation.manaLevel}
        // attachedMarkers={curLocation.markers}
        // allBeacons={allBeacons}
        // allLocations={allLocations}
        onChange={this.onLocationChange}
        // onLocMarkerChange={this.onLocMarkerChange}
        onClose={this.closePopup}
        locationPopupDom={this.locationPopupDom}
      />
    );
  }

  render() {
    return (
      <>
        {
          this.getLocationPopup()
        }
      </>
    );
  }
}
