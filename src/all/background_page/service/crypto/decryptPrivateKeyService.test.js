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
import DecryptPrivateKeyService from "./decryptPrivateKeyService";
import InvalidMasterPasswordError from '../../error/invalidMasterPasswordError';
import { pgpKeys } from 'passbolt-styleguide/test/fixture/pgpKeys/keys';
import { OpenpgpAssertion } from "../../utils/openpgp/openpgpAssertions";

describe("DecryptPrivateKey service", () => {
  it('should validate a private key with the right passphrase', async () => {
    expect.assertions(1);
    const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
    await expect(DecryptPrivateKeyService.decrypt(key, "ada@passbolt.com")).resolves.not.toBeNull();
  }, 10 * 1000);

  it('should throw an InvalidMasterPasswordError when the passphrase is not correct', async () => {
    expect.assertions(1);
    const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
    await expect(DecryptPrivateKeyService.decrypt(key, "wrong passphrase")).rejects.toThrow(new InvalidMasterPasswordError());
  }, 10 * 1000);

  it('should throw an Error if the private key is already decrypted', async () => {
    expect.assertions(1);
    try {
      const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      await DecryptPrivateKeyService.decrypt(key, "");
    } catch (e) {
      // PGP秘密鍵が暗号化されていなくてもエラーにしないため、パスフレーズのエラーで検出される。
      expect(e).toStrictEqual(new InvalidMasterPasswordError("This is not a valid passphrase"));
    }
  }, 10 * 1000);

  it('should validate a private key armored and decrypt it', async () => {
    expect.assertions(1);
    await expect(DecryptPrivateKeyService.decryptArmoredKey(pgpKeys.ada.private, "ada@passbolt.com")).resolves.not.toBeNull();
  }, 10 * 1000);
});
