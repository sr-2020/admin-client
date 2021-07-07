import Ajv, { JSONSchemaType } from "ajv";
import { ErrorResponse, SpiritJarQr, validateCommonQr, validateSpiritJarQr } from "sr2020-mm-event-engine";
import { createLogger } from "../logger";

const logger = createLogger('server-ee/spirits.ts');

const ajv = new Ajv({
  allErrors: true,
  // removeAdditional: true,
  // useDefaults: true
});

export interface FreeSpiritRequestBody {
  qrId: number;
  reason: string;
}

const freeSpiritRequestBodySchema: JSONSchemaType<FreeSpiritRequestBody> = {
  type: "object",
  properties: {
    qrId: { type: 'integer' },
    reason: { type: 'string' },
  },
  required: ["qrId", "reason"],
};

export const validateFreeSpiritRequestBody = ajv.compile(freeSpiritRequestBodySchema);

export interface CatchSpiritRequestBody {
  qrId: number;
  spiritId: number;
}

const catchSpiritRequestBodySchema: JSONSchemaType<CatchSpiritRequestBody> = {
  type: "object",
  properties: {
    qrId: { type: 'integer' },
    spiritId: { type: 'integer' },
  },
  required: ["qrId", "spiritId"],
};

export const validateCatchSpiritRequestBody = ajv.compile(catchSpiritRequestBodySchema);

export interface CatchSpirit2RequestBody {
  spiritJarQrString: string;
  spiritId: number;
}

const catchSpirit2RequestBodySchema: JSONSchemaType<CatchSpirit2RequestBody> = {
  type: "object",
  properties: {
    spiritJarQrString: { type: 'string' },
    spiritId: { type: 'integer' },
  },
  required: ["spiritJarQrString", "spiritId"],
};

export const validateCatchSpirit2RequestBody = ajv.compile(catchSpirit2RequestBodySchema);


export function validateQrModelData(qrModelData: unknown): 
  SpiritJarQr | ErrorResponse
{
  if (!validateCommonQr(qrModelData)) {
    const message = `Данные QR не корректны. Данные модели ${JSON.stringify(qrModelData)}, ошибки валидации ${JSON.stringify(validateCommonQr.errors)}`;
    logger.error(message, validateCommonQr.errors);
    const errorResponse: ErrorResponse = {
      errorTitle: 'Получен некорректный ответ от менеджера моделей',
      errorSubtitle: message 
    };
    return errorResponse;
  }

  if (!validateSpiritJarQr(qrModelData)) {
    let errorTitle = '';
    let errorSubtitle = '';
    if (qrModelData.workModel.type === 'spirit_jar') {
      errorTitle = 'Духохранилище некорректно';
      errorSubtitle = `Данные модели ${JSON.stringify(qrModelData)}, ошибки валидации ${JSON.stringify(validateSpiritJarQr.errors)}`;
    } else {
      errorTitle = 'QR не является духохранилищем';
      errorSubtitle = `Тип QR: ${qrModelData.workModel.type}`;
    }

    // const message = `. qrModelData ${JSON.stringify(qrModelData)}, validation errors ${JSON.stringify(validateSpiritJarQr.errors)}`;
    logger.error(errorSubtitle, validateSpiritJarQr.errors);
    const errorResponse: ErrorResponse = {
      errorTitle,
      errorSubtitle
    };
    return errorResponse;
  }
  return qrModelData;
}
