import React, { Component } from 'react';
import { WithTranslation } from 'react-i18next';
import { L, CommonLayerProps } from "sr2020-mm-client-core";
import * as R from 'ramda';

import { getArrDiff } from 'sr2020-mm-event-engine';
import { WithLatLngBeacons } from "./withLatLngBeacons";

import { Beacon, makeBeacon } from "../../types";

interface InnerBeaconLayerProps {
  enableByDefault: boolean;
  onBeaconClick: L.LeafletEventHandlerFn;
  onBeaconEdit: L.LeafletEventHandlerFn;
}

export class InnerBeaconLayer extends Component<
  InnerBeaconLayerProps & 
  CommonLayerProps & 
  WithTranslation &
  WithLatLngBeacons
> {
  group = L.layerGroup([]);

  nameKey = 'beaconsLayer';

  constructor(props) {
    super(props);
    this.state = {
    };
    this.createBeacon = this.createBeacon.bind(this);
    this.updateBeacon = this.updateBeacon.bind(this);
    this.removeBeacon = this.removeBeacon.bind(this);
  }

  componentDidMount() {
    const {
      enableByDefault, layerCommunicator, latLngBeaconRecords,
    } = this.props;
    layerCommunicator.emit('setLayersMeta', {
      layersMeta: this.getLayersMeta(),
      enableByDefault,
    });
    this.updateBeacons({
      added: (latLngBeaconRecords),
    });
    console.log('InnerManaOceanLayer2 mounted');
  }

  componentDidUpdate(prevProps) {
    const {
      translator, latLngBeaconRecords,
    } = this.props;
    if (prevProps.latLngBeaconRecords !== latLngBeaconRecords) {
      const diff = getArrDiff(
        (latLngBeaconRecords),
        (prevProps.latLngBeaconRecords),
        R.prop('id'),
      );
      this.updateBeacons(diff);
    //   this.subscribe('off', prevProps.gameModel);
    //   this.subscribe('on', gameModel);
    //   this.clear();
    //   this.populate();
    }
    if (prevProps.translator !== translator) {
      // this.clear();
      // this.populate();
    }
    console.log('InnerManaOceanLayer2 did update');
  }

  componentWillUnmount() {
    this.clear();
    // this.communicatorSubscribe('off');
    console.log('InnerManaOceanLayer2 will unmount');
  }

  getLayersMeta() {
    return {
      [this.nameKey]: this.group,
    };
  }

  updateBeacons({ added = [], removed = [], updated = [] }) {
    R.map(this.createBeacon, added);
    R.map(this.updateBeacon, updated);
    R.map(this.removeBeacon, removed);
  }

  clear() {
    this.group.clearLayers();
  }

  createBeacon(beaconRecord) {
    const { t } = this.props;
    const { onBeaconClick, onBeaconEdit } = this.props;
    // const imagesData = gameModel.get('backgroundImages').map(translator.moveTo);

    const {
      lat, lng, label, id,
    } = beaconRecord;
    // const beacon = L.marker({ lat, lng }, {
    const beacon = makeBeacon({ lat, lng }, {
      id, label,
    });
    beacon.on('mouseover', function (this: Beacon, e) {
      beacon.bindTooltip(t('markerTooltip', { name: this.options.label }));
      this.openTooltip();
    });
    beacon.on('mouseout', function (this: Beacon, e) {
      this.closeTooltip();
    });

    beacon.on('click', onBeaconClick);
    beacon.on('pm:edit', onBeaconEdit);

    this.group.addLayer(beacon);
  }

  updateBeacon({ item }) {
    const {
      lat, lng, label, id,
    } = item;
    const marker = this.group.getLayers().find((rect2: Beacon) => rect2.options.id === id) as Beacon;
    marker.setLatLng({ lat, lng });
    L.Util.setOptions(marker, { label });
  }

  removeBeacon(beaconRecord) {
    const { id } = beaconRecord;
    const marker = this.group.getLayers().find((marker2: Beacon) => marker2.options.id === id);
    this.group.removeLayer(marker);
  }

  render() {
    return null;
  }
}
