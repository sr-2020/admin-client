import * as R from 'ramda';
import { 
  LocationRecord,
  BeaconRecord,
  UserRecord,
  Spirit,
  ManaOceanEffectSettingsData,
  ManaOceanSettingsData,
  BackgroundImage,
  EBeaconRecordsChanged2,
  ELocationRecordsChanged2,
  EUserRecordsChanged,
  EEnableManaOceanChanged,
  Req,
  Res,
  ESpiritsChanged
} from 'sr2020-mm-event-engine';

import { 
  EBackgroundImagesChange,
  ETrackedCharacterIdChanged,
  GetBackgroundImages,
} from "sr2020-mm-client-event-engine";

import { basicDataHOC } from './basicDataHOC';
// import { basicDataHOC2 } from './basicDataHOC2';
import { settingsDataHOC } from './settingsDataHOC';

export * from './withCharacterPosition';
export * from './withTriangulationData';
export * from './withCharacterHealthStatesForMap';
export * from './withCharacterHealthListForTable';
export * from './withCharacterIdHealthListForAudio';

// links in HOC typing
// https://medium.com/@jrwebdev/react-higher-order-component-patterns-in-typescript-42278f7590fb
// https://stackoverflow.com/questions/43680786/writing-a-react-higher-order-component-with-typescript
// https://www.pluralsight.com/guides/higher-order-composition-typescript-react
// https://habr.com/ru/company/sberbank/blog/354104/

export interface WithManaOceanSettings {
  manaOcean: ManaOceanSettingsData;
}
export interface WithManaOceanEffectSettings {
  manaOceanEffects: ManaOceanEffectSettingsData;
}

export interface WithBackgroundImages {
  backgroundImages: BackgroundImage[];
}
export interface WithLocationRecords {
  locationRecords: LocationRecord[];
}
export interface WithBeaconRecords {
  beaconRecords: BeaconRecord[];
}
export interface WithUserRecords {
  userRecords: UserRecord[];
}
export interface WithSpirits {
  spirits: Spirit[] | null;
}
export interface WithCharacterId {
  characterId: number | null;
}

function sortBy(prop: string) {
  return function(value: any) {
    if (Array.isArray(value)) {
      return R.sortBy(R.prop(prop), value);
    }
    return value;
  }
}

export const withManaOceanSettings = settingsDataHOC(
  'settingsChanged',
  'manaOcean',
  {},
);
export const withManaOceanEffectSettings = settingsDataHOC(
  'settingsChanged',
  'manaOceanEffects',
  {},
);

export const withBackgroundImages = basicDataHOC<[], EBackgroundImagesChange>(
  'backgroundImagesChanged',
  'backgroundImages',
  [],
);

// // type StringTypeOnly<T extends (type: string | {type: string}) => any> = (type: string) => U;
// type StringTypeOnly<
//   T extends (type: string | {type: string}) => any, 
//   In = Req<T>,
//   Out = Res<T>
// > = (type: Exclude<In, {type: string}>) => Out;

// // type f = StringTypeOnly<GetBackgroundImages>;

// export const withBackgroundImages = basicDataHOC2<
//   BackgroundImage[],
//   StringTypeOnly<GetBackgroundImages>,
//   'backgroundImagesChanged'
//   // EBackgroundImagesChange
// >(
//   'backgroundImagesChanged',
//   'backgroundImages',
// );
export const withBeaconRecords = basicDataHOC<[], EBeaconRecordsChanged2>(
  'beaconRecordsChanged2',
  'beaconRecords',
  [],
);
export const withLocationRecords = basicDataHOC<[], ELocationRecordsChanged2>(
  'locationRecordsChanged2',
  'locationRecords',
  [],
);
export const withUserRecords = basicDataHOC<[], EUserRecordsChanged>(
  'userRecordsChanged',
  'userRecords',
  [],
);

export const withSpirits = basicDataHOC<null, ESpiritsChanged>(
  'spiritsChanged',
  'spirits',
  null,
  sortBy('name')
);

export const withEnableManaOcean = basicDataHOC<true, EEnableManaOceanChanged>(
  'enableManaOceanChanged',
  'enableManaOcean',
  true,
);

export const withCharacterId = basicDataHOC<null, ETrackedCharacterIdChanged>(
  'trackedCharacterIdChanged',
  'characterId',
  null,
);

