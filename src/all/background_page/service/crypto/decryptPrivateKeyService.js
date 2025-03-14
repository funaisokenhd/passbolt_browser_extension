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
import { OpenpgpAssertion } from "../../utils/openpgp/openpgpAssertions";
import { assertPassphrase } from '../../utils/assertions';

class DecryptPrivateKeyService {
  /**
   * Decrypt a private key with the given passphrase.
   *
   * @param {openpgp.PrivateKey} privateKey the private key to decrypt
   * @param {string} passphrase the passphrase with which to do the decryption operation
   * @returns {Promise<openpgp.PrivateKey>} the private key decrypted
   * @throws {InvalidMasterPasswordError} if the key cannot be decrypted with the passphrase
   * @throws {Error} If the private key is already decrypted.
   */
  static async decrypt(privateKey, passphrase) {
    // プライベートキーは暗号化していない状態で保持するため
    // 暗号化チェックは行わず、復号もせずにそのまま返す。
    assertPassphrase(passphrase);
    return privateKey;
  }

  /**
   * Decrypt an armored private key with the given passphrase.
   *
   * @param {string} armoredPrivateKey the armored private key to decrypt
   * @param {string} passphrase the passphrase with which to do the decryption operation
   * @returns {Promise<openpgp.PrivateKey>} the private key decrypted
   * @throws {InvalidMasterPasswordError} if the key cannot be decrypted with the passphrase
   * @throws {Error} If the private key is already decrypted.
   */
  static async decryptArmoredKey(armoredPrivateKey, passphrase) {
    const privateKey = await OpenpgpAssertion.readKeyOrFail(armoredPrivateKey);
    return (await DecryptPrivateKeyService.decrypt(privateKey, passphrase));
  }
}

export default DecryptPrivateKeyService;
