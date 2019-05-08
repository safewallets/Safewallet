import translate from '../translate/translate';

const zcashParamsCheckErrors = (zcashParamsExist) => {
  let _errors;

  if (zcashParamsExist.errors) {
    _errors = [translate('KMD_NATIVE.ZCASH_PARAMS_MISSING'), ''];

    if (!zcashParamsExist.rootDir) {
      _errors.push(translate('KMD_NATIVE.ZCASH_PARAMS_MISSING_ROOT_DIR'));
    }
    if (!zcashParamsExist.provingKey) {
      _errors.push(translate('KMD_NATIVE.ZCASH_PARAMS_MISSING_PROVING_KEY'));
    }
    if (!zcashParamsExist.verifyingKey) {
      _errors.push(translate('KMD_NATIVE.ZCASH_PARAMS_MISSING_VERIFYING_KEY'));
    }
    if (!zcashParamsExist.outputKey) {
      _errors.push(translate('KMD_NATIVE.ZCASH_PARAMS_MISSING_OUTPUT_PARAMS'));
    }
    if (!zcashParamsExist.spendKey) {
      _errors.push(translate('KMD_NATIVE.ZCASH_PARAMS_MISSING_SPEND_PARAMS'));
    }
    if (!zcashParamsExist.groth16Key) {
      _errors.push(translate('KMD_NATIVE.ZCASH_PARAMS_MISSING_GROTH16_PARAMS'));
    }
    if (!zcashParamsExist.provingKeySize &&
        zcashParamsExist.provingKey) {
      _errors.push(translate('KMD_NATIVE.ZCASH_PARAMS_MISSING_PROVING_KEY_SIZE'));
    }
    if (!zcashParamsExist.verifyingKeySize &&
        zcashParamsExist.verifyingKey) {
      _errors.push(translate('KMD_NATIVE.ZCASH_PARAMS_MISSING_VERIFYING_KEY_SIZE'));
    }
    if (!zcashParamsExist.spendKeySize &&
        zcashParamsExist.spendKey) {
      _errors.push(translate('KMD_NATIVE.ZCASH_PARAMS_MISSING_SPEND_PARAMS_SIZE'));
    }
    if (!zcashParamsExist.outputKeySize &&
        zcashParamsExist.outputKey) {
      _errors.push(translate('KMD_NATIVE.ZCASH_PARAMS_MISSING_OUTPUT_PARAMS_SIZE'));
    }
    if (!zcashParamsExist.groth16KeySize &&
        zcashParamsExist.groth16Key) {
      _errors.push(translate('KMD_NATIVE.ZCASH_PARAMS_MISSING_GROTH16_PARAMS_SIZE'));
    }
  }

  return _errors;
}

export default zcashParamsCheckErrors;