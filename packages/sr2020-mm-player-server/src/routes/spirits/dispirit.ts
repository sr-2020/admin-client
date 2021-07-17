import { 
  DispiritInternalRequest,
  ErrorResponse, 
  GetSpirit, 
  invalidRequestBody, 
  isEmptySpiritJar, 
  isFullBodyStorage, 
  SuitSpiritInternalRequest
} from "sr2020-mm-event-engine";
import { 
  createLogger, 
  dispirit, 
  getQrModelData, 
  PlayerAuthorizedRequest, 
  playerServerConstants, 
  validateBodyStorageQrModelData, 
  validateDispiritRequestBody, 
  validateSpiritJarQrModelData, 
  validateSuitSpiritRequestBody 
} from "sr2020-mm-server-event-engine";
import { decode, playerServerCookie } from "../../utils";
import { qrIdIsNanError } from "./utils";

const logger = createLogger('dispirit.ts');

export const playerDispirit = async (req1, res, next) => {
  const req = req1 as PlayerAuthorizedRequest;
  const { body } = req;
  if (!validateDispiritRequestBody(body)) {
    res.status(400).json(invalidRequestBody(body, validateDispiritRequestBody.errors));
    return;
  }

  const { spiritJarQrString, bodyStorageQrString } = body;

  try {
    let spiritJarId: number | null = null;
    if (spiritJarQrString !== null) {
      const spiritJarQrData = decode(spiritJarQrString);
      spiritJarId = Number(spiritJarQrData.payload);
  
      if (Number.isNaN(spiritJarId)) {
        res.status(400).json(qrIdIsNanError(spiritJarQrData.payload));
        return;
      }
    }

    const bodyStorageQrData = decode(bodyStorageQrString);
    const bodyStorageId = Number(bodyStorageQrData.payload);

    // hack to dispirit body from model
    // const res2 = await dispirit(req.userData.modelId, bodyStorageId, null);

    if (Number.isNaN(bodyStorageId)) {
      res.status(400).json(qrIdIsNanError(bodyStorageQrData.payload));
      return;
    }

    const reqBody: DispiritInternalRequest = {
      spiritJarId,
      bodyStorageId,
      characterId: req.userData.modelId
    };

    const dispiritRes = await fetch(playerServerConstants().dispiritUrl, {
      method: 'POST',
      headers: {
        'Cookie': playerServerCookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqBody)
    });

    const json = await dispiritRes.json();

    // logger.info('dispiritRes json', json);

    if (dispiritRes.status === 200) {
      setTimeout(() => {
        req.characterWatcher.forceUpdateCharacterModel(req.userData.modelId);
      }, 5000);
    }

    res.status(dispiritRes.status).json(json);

  } catch (error) {
    const message = `${error} ${JSON.stringify(error)}`;
    logger.error(message, error);
    const errorResponse: ErrorResponse = { 
      errorTitle: 'Непредвиденная ошибка',
      errorSubtitle: message 
    };
    res.status(500).json(errorResponse);
  }
}