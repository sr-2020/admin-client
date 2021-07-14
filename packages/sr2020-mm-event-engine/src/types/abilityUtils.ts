import { CharacterModelData } from "./characterModelData";

export enum Ability {
  ArchMage = 'arch-mage', // архетип маг
  NiceSuit = 'nice-suit', // +30 минут к ношению духа
  LeisureSuit = 'leisure-suit', // +30 минут к ношению духа, требует nice-suit
  // OwnSpirit = 'own-spirit', // способность видеть и ловить духов
  SuitUp = 'suit-up', // способность надевать духа
  FineHearing = 'fine-hearing', // способность видеть абилки духов
}

export enum Spell {
  SpiritCatcher = 'spirit-catcher',
}

export function hasAbility(characterData: CharacterModelData, ability: Ability): boolean {
  const ab1 = characterData.workModel.passiveAbilities.some(el => el.id === ability);
  const ab2 = characterData.workModel.activeAbilities.some(el => el.id === ability);
  return ab1 || ab2;
}

export function hasSpell(characterData: CharacterModelData, spell: Spell): boolean {
  return characterData.workModel.spells.some(el => el.id === spell);
}

export function getSuitSpiritDurationItems(characterData: CharacterModelData): number {
  let durationItems = 1;
  if (hasAbility(characterData, Ability.NiceSuit)) {
    durationItems++;
  }
  if (hasAbility(characterData, Ability.LeisureSuit)) {
    durationItems++;
  }
  return durationItems;
}
