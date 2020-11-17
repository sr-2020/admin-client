export const beaconsUrl = 'https://position.evarun.ru/api/v1/beacons';
export const locationsUrl = 'https://position.evarun.ru/api/v1/locations';
export const usersUrl = 'https://position.evarun.ru/api/v1/users';
export const positionUrl = 'https://position.evarun.ru/api/v1/positions';
export const manaOceanConfigUrl = 'https://gateway.evarun.ru/api/v1/config/manaOceanConfig';
export const billingInsurance = 'https://billing.evarun.ru/insurance/getinsurance';
export const pushServiceUrl = 'https://push.evarun.ru/send_notification';

// // /api/v1/users/{id}
// const url = 'https://position.evarun.ru/api/v1/users';
// const locationUrl = 'https://position.evarun.ru/api/v1/locations';

export const defaultBeaconRecord = {
  ssid: '',
  bssid: '',
  location_id: null,
  label: '',
  lat: 0,
  lng: 0,
};

// duplicated in LocationRecordService
const defaultLocationStyleOptions = {
  color: '#3388ff',
  weight: 3,
  fillOpacity: 0.2,
};

export const defaultLocationRecord = {
  label: '',
  created_at: null,
  updated_at: null,
  polygon: [],
  options: {
    ...defaultLocationStyleOptions,
  },
  layer_id: 1,
};

export const defaultManaOceanSettings = {
  minManaLevel: 1,
  neutralManaLevel: 4,
  maxManaLevel: 7,
  visibleMoonPeriod: 180, // minutes
  visibleMoonNewMoonTime: 0,
  visibleMoonManaTideHeight: 1,
  invisibleMoonPeriod: 270,
  invisibleMoonNewMoonTime: 120,
  invisibleMoonManaTideHeight: 1,
  moscowTime: 0,
};
