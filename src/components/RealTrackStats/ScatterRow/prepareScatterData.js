import * as R from 'ramda';

import { AvgFilter } from './AvgFilter';

// const hasBeacon = R.pipe(R.prop('loudestBeacon'), R.isNil, R.not);
const hasBeacon = R.pipe(R.prop('beacon'), R.isNil, R.not);

export function cleanRawData({
  rawDataArr,
  beaconLatlngsIndex,
  filterChart,
  filterSize,
  percentUsage,
}) {
  const newSize = Math.floor(rawDataArr.length * (percentUsage / 100));
  const subArr = rawDataArr.slice(0, newSize);
  // const subArr = rawDataArr.slice(0, 1000);
  // const subArr = rawDataArr;
  // const subArr = rawDataArr.filter(hasBeacon);
  // const res = R.unnest(subArr.map(messageToLoudestOrEmpty(beaconLatlngsIndex)));
  const res = R.unnest(subArr.map(messageToAllBeaconsOrEmpty(beaconLatlngsIndex)));
  let filteredRes = res;
  if (filterChart) {
    const avgFilter = new AvgFilter(filterSize);
    filteredRes = res.map(avgFilter.filter.bind(avgFilter));
  }
  const res2 = R.groupBy(R.prop('placement'), filteredRes);

  // const makeIndex = R.indexBy(R.path(['loudestBeacon', 'beaconId']));
  const makeIndex = R.indexBy(R.path(['beacon', 'beaconId']));
  const getBeaconIds = R.pipe(R.filter(hasBeacon), makeIndex, R.keys);

  const beaconIds = getBeaconIds(res);

  return {
    res: res2,
    beaconIds,
  };
}

function messageToLoudestOrEmpty(beaconLatlngsIndex) {
  return (el) => {
    if (el.loudestBeacon) {
      return [messageToBeacon(beaconLatlngsIndex, el, el.loudestBeacon)];
    }
    return [messageToEmpty(el)];
  };
}

function messageToAllBeaconsOrEmpty(beaconLatlngsIndex) {
  return (el) => {
    if (el.beacons.length > 0) {
      return el.beacons.map((beacon) => messageToBeacon(beaconLatlngsIndex, el, beacon));
    }
    return [messageToEmpty(el)];
  };
}

function messageToEmpty(el) {
  return {
    ...el,
    level: -120,
    beacon: null,
    placement: 'emptyMessages',
  };
}

function messageToBeacon(beaconLatlngsIndex, el, beacon) {
  return {
    ...el,
    level: beacon.level,
    beacon,
    placement: beaconLatlngsIndex[beacon.beaconId] ? 'outdoors' : 'indoors',
  };
}
