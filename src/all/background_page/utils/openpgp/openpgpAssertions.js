/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
import * as openpgp from 'openpgp';
import i18n from "../../sdk/i18n";
import Uint8ArrayConvert from "../format/uint8ArrayConvert";
import { assertNonEmptyString } from "../assertions";

/*
 * ==================================================
 * Read and creates functions
 * ==================================================
 */
/**
 * Read an open pgp armored key string.
 * @param {string} armoredKey the open pgp key in its armored version.
 * @return {Promise<openpgp.PrivateKey|openpgp.PublicKey>}
 * @throws {Error} if the armoredKey is not a string
 * @throws {Error} if the key couldn't be read
 */
const readKeyOrFail = async armoredKey => {
  if (typeof armoredKey !== "string") {
    throw new Error(i18n.t("The key should be a valid openpgp armored key string."));
  }

  try {
    return await openpgp.readKey({ armoredKey: armoredKey });
  } catch (error) {
    throw new Error(i18n.t("The key should be a valid openpgp armored key string."));
  }
};

/**
 * Read all open pgp armored key strings in the given array.
 * @param {array<string>} armoredKeys
 * @returns {Promise<array<openpgp.PrivateKey|openpgp.PublicKey>>}
 * @throws {Error} if the armoredKeys is not an array
 * @throws {Error} if one the key couldn't be read
 */
const readAllKeysOrFail = async armoredKeys => {
  if (!Array.isArray(armoredKeys)) {
    throw new Error(i18n.t("The keys should be an array of valid openpgp armored key strings."));
  }
  return Promise.all(armoredKeys.map(key => readKeyOrFail(key)));
};

/**
 * Read open pgp session key strings.
 * @param {string} sessionKey The session key represented as "integer:hexadecimal-string" (ex: 9:901D6ED579AFF935F9F157A5198BCE48B50AD87345DEADBA06F42C5D018C78CC)
 * @returns {{data: Uint8Array, algorithm: enums.symmetricNames}}
 * @throw {Error} if the parameter is not a string
 * @throw {Error} if session key does not validate the expected format "integer:hexadecimal-string"
 * @throw {Error} if session key cannot be read
 */
const readSessionKeyOrFail = sessionKey => {
  assertNonEmptyString(sessionKey, "The session key should be a string.");
  if (!/^\d{1,2}:[0-9A-F]{64}$/i.test(sessionKey)) {
    throw new TypeError('The parameter session key does not match the expected format "integer:hexadecimal-string".');
  }

  try {
    const sessionKeySplit = sessionKey.split(":");
    const algorithm = openpgp.enums.read(openpgp.enums.symmetric, sessionKeySplit[0]);
    const data = Uint8ArrayConvert.fromHex(sessionKeySplit[1]);
    return { data, algorithm };
  } catch (error) {
    throw new Error("The session key should be a valid openpgp session key.", { cause: error });
  }
};

/**
 * Creates on open pgp message from a given clear text message string.
 * @param {string} message the clear text message from which to create an openpgp.Message.
 * @return {Promise<openpgp.Message>}
 * @throws {Error} if the messageis not a string
 */
const createMessageOrFail = async message => {
  if (typeof message !== "string") {
    throw new Error(i18n.t("The message should be of type string."));
  }
  return openpgp.createMessage({ text: message, format: 'utf8' });
};

/**
 * Creates on open pgp cleartext message from a given string.
 * @param {string} text the string from which to create an openpgp.CleartextMessage.
 * @return {Promise<openpgp.CleartextMessage>}
 * @throws {Error} if the messageis not a string
 */
const createCleartextMessageOrFail = async text => {
  if (typeof text !== "string") {
    throw new Error(i18n.t("The message should be of type string."));
  }
  return openpgp.createCleartextMessage({ text });
};

/**
 * Reads a message in its armored string form.
 * @param {string} message an openg pgp message in its armored form
 * @returns {Promise<openpgp.Message>}
 * @throws {Error} if the message is not a string
 * @throws {Error} if the message can't be parsed as an armored message
 */
const readMessageOrFail = async message => {
  if (typeof message !== "string") {
    throw new Error(i18n.t("The message should be of type string."));
  }

  try {
    return await openpgp.readMessage({ armoredMessage: message });
  } catch (error) {
    throw new Error(i18n.t("The message should be a valid openpgp message."));
  }
};

/**
 * Reads a clear text message in its armored string form.
 * @param {string} cleartextMessage an openg pgp clear text message in its armored form
 * @returns {Promise<openpgp.CleartextMessage>}
 * @throws {Error} if the message is not a string
 * @throws {Error} if the message can't be parsed as an armored message
 */
const readClearMessageOrFail = async cleartextMessage => {
  if (typeof cleartextMessage !== "string") {
    throw new Error(i18n.t("The message should be of type string."));
  }

  try {
    return await openpgp.readCleartextMessage({ cleartextMessage });
  } catch (error) {
    throw new Error(i18n.t("The message should be a valid openpgp message."));
  }
};

/*
 * ==================================================
 * Assertion functions
 * ==================================================
 */
/**
 * Assert the given key is an openpgp.PublicKey or openpgp.PrivateKey
 * @param {openpgp.PublicKey|openpgp.PrivateKey} key
 * @returns {void}
 * @throws {Error} if the key is not an openpgp.PublicKey or openpgp.PrivateKey
 */
const assertKey = key => {
  if (!(key instanceof openpgp.PublicKey) && !(key instanceof openpgp.PrivateKey)) {
    throw new Error(i18n.t("The key should be a valid openpgp key."));
  }
};

/**
 * Assert the given array of keys is an array containing openpgp.PublicKey or openpgp.PrivateKey
 * @param {array<openpgp.PublicKey|openpgp.PrivateKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not an openpgp.PublicKey or openpgp.PrivateKey
 */
const assertKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error(i18n.t("The keys should be an array."));
  }
  for (let i = 0; i < keys.length; i++) {
    assertKey(keys[i]);
  }
};

/**
 * Assert the given key is an openpgp.PublicKey
 * @param {openpgp.PublicKey} key
 * @returns {void}
 * @throws {Error} if the key is not an openpgp.PublicKey
 */
const assertPublicKey = key => {
  /*
   * we need to check for an openpgp.PublicKey is it's private or not.
   * This is due to openpgp js types where an openpgp.PrivateKey is of a type openpgp.PublicKey as well
   */
  if (!(key instanceof openpgp.PublicKey) || (key instanceof openpgp.PublicKey && key.isPrivate())) {
    throw new Error(i18n.t("The key should be a valid openpgp public key."));
  }
};

/**
 * Assert the given array of keys is an array containing openpgp.PublicKey
 * @param {array<openpgp.PublicKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not openpgp.PublicKey
 */
const assertPublicKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error(i18n.t("The keys should be an array of valid openpgp public keys."));
  }
  for (let i = 0; i < keys.length; i++) {
    assertPublicKey(keys[i]);
  }
};

/**
 * Assert the given key is an openpgp.PrivateKey
 * @param {openpgp.PrivateKey} key
 * @returns {void}
 * @throws {Error} if the key is not an openpgp.PrivateKey
 */
const assertPrivateKey = key => {
  // we do an extra check for key.isPrivate to keep things coherent with assertPublicKey.
  if (!(key instanceof openpgp.PrivateKey) || (key instanceof openpgp.PrivateKey && !key.isPrivate())) {
    throw new Error(i18n.t("The key should be a valid openpgp private key."));
  }
};

/**
 * Assert the given array of keys is an array containing openpgp.PrivateKey
 * @param {array<openpgp.PrivateKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not openpgp.PrivateKey
 */
const assertPrivateKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error(i18n.t("The keys should be an array of valid openpgp private keys."));
  }
  for (let i = 0; i < keys.length; i++) {
    assertPrivateKey(keys[i]);
  }
};

/**
 * Assert the given key is a decrypted openpgp.PrivateKey
 * @param {openpgp.PrivateKey} key
 * @returns {void}
 * @throws {Error} if the key is not a decrypted openpgp.PrivateKey
 */
const assertDecryptedPrivateKey = key => {
  assertPrivateKey(key);
  if (!key.isDecrypted()) {
    throw new Error(i18n.t("The private key should be decrypted."));
  }
};

/**
 * Assert the given array of keys is an array containing decrypted openpgp.PrivateKey
 * @param {array<openpgp.PrivateKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not a decrypted openpgp.PrivateKey
 */
const assertDecryptedPrivateKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error(i18n.t("The keys should be an array of valid decrypted openpgp private keys."));
  }
  for (let i = 0; i < keys.length; i++) {
    assertDecryptedPrivateKey(keys[i]);
  }
};

/**
 * Assert the given key is an encrypted openpgp.PrivateKey
 * @param {openpgp.PrivateKey} key
 * @returns {void}
 * @throws {Error} if the key is not an encrypted openpgp.PrivateKey
 */
const assertEncryptedPrivateKey = key => {
  assertPrivateKey(key);
  if (key.isDecrypted()) {
    throw new Error(i18n.t("The private key should be encrypted."));
  }
};

/**
 * Assert the given array of keys is an array containing encrypted openpgp.PrivateKey
 * @param {array<openpgp.PrivateKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not an encrypted openpgp.PrivateKey
 */
const assertEncryptedPrivateKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error(i18n.t("The keys should be an array of valid encrypted openpgp private keys."));
  }
  for (let i = 0; i < keys.length; i++) {
    assertEncryptedPrivateKey(keys[i]);
  }
};

/**
 * Assert the given message is an openpgp.Message
 * @param {openpgp.Message} message
 * @returns {void}
 * @throws {Error} if the message is not an openpgp.Message
 */
const assertMessage = message => {
  if (!(message instanceof openpgp.Message)) {
    throw new Error(i18n.t("The message should be a valid openpgp message."));
  }
};

/**
 * Assert the given message is an openpgp.Message decrypted
 * @param {openpgp.Message} message
 * @returns {void}
 * @throws {Error} if the message is not an openpgp.Message decrypted
 */
const assertDecryptedMessage = message => {
  assertMessage(message);
  const packetWithSessionKey = message.packets.findPacket(openpgp.enums.packet.publicKeyEncryptedSessionKey);
  if (!packetWithSessionKey) {
    throw new Error(i18n.t("The message should contain at least one session key."));
  }
  if (packetWithSessionKey.encrypted !== null) {
    throw new Error(i18n.t("The message should be decrypted."));
  }
};

/**
 * Assert the given message is an openpgp.SessionKey
 * @param {openpgp.SessionKey} sessionKey
 * @returns {void}
 *  @throws {Error} if the session key is not an object
 *  @throws {Error} if the session key data is not a valid Uint8Array
 *  @throws {Error} if the session key algorithm is not aes256
 */
const assertSessionKey = sessionKey => {
  if (!(Object.prototype.toString.call(sessionKey) === '[object Object]')) {
    throw new Error("The session keys should be an object.");
  }
  // Allow only AES256 algorithm for the moment
  if (!(sessionKey.data instanceof Uint8Array) || sessionKey.algorithm !== 'aes256') {
    throw new Error("The session keys should be a valid openpgp session key aes256.");
  }
};

/**
 * Assert the given message is an openpgp.CleartextMessage
 * @param {openpgp.CleartextMessage} message
 * @returns {void}
 * @throws {Error} if the message is not an openpgp.CleartextMessage
 */
const assertClearMessage = message => {
  if (!(message instanceof openpgp.CleartextMessage)) {
    throw new Error(i18n.t("The message should be a valid openpgp clear text message."));
  }
};

export const OpenpgpAssertion = {
  assertMessage,
  assertClearMessage,
  assertDecryptedMessage,
  assertEncryptedPrivateKeys,
  assertEncryptedPrivateKey,
  assertDecryptedPrivateKeys,
  assertDecryptedPrivateKey,
  assertPrivateKeys,
  assertPrivateKey,
  assertPublicKeys,
  assertPublicKey,
  assertSessionKey,
  assertKeys,
  assertKey,
  readMessageOrFail,
  readClearMessageOrFail,
  createCleartextMessageOrFail,
  createMessageOrFail,
  readAllKeysOrFail,
  readKeyOrFail,
  readSessionKeyOrFail
};
