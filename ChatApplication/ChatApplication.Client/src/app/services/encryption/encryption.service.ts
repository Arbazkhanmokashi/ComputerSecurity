import { Injectable } from '@angular/core';
import * as forge from 'node-forge';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

const pemHeader = "-----BEGIN PUBLIC KEY-----";
const pemFooter = "-----END PUBLIC KEY-----";

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private secretKey = environment.secretKey;
  constructor() { }

  generateKeyPair = async () => {
    const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
    return {
      publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
      privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
    };
  }

  // Encrypt message with recipient's public key and sender's private key
  encryptMessage(message: string, senderPrivateKeyPem: string, recipientPublicKeyPem: string): string {
    const senderPrivateKey = forge.pki.privateKeyFromPem(senderPrivateKeyPem);
    const recipientPublicKey = forge.pki.publicKeyFromPem(recipientPublicKeyPem);
    
    const encryptedMessage = recipientPublicKey.encrypt(message);
    const signature = senderPrivateKey.sign(forge.md.sha256.create().update(message, 'utf8'));

    return forge.util.encode64(encryptedMessage + '::' + signature);
  }

  // Decrypt message with recipient's private key and sender's public key
  decryptMessage(encryptedMessage: string, recipientPrivateKeyPem: string, senderPublicKeyPem: string): string {
    const recipientPrivateKey = forge.pki.privateKeyFromPem(recipientPrivateKeyPem);
    const senderPublicKey = forge.pki.publicKeyFromPem(senderPublicKeyPem);
    
    const decodedMessage = forge.util.decode64(encryptedMessage);
    const [encryptedData, signature] = decodedMessage.split('::');

    const decryptedMessage = recipientPrivateKey.decrypt(encryptedData);

    const verified = senderPublicKey.verify(forge.md.sha256.create().update(decryptedMessage, 'utf8').digest().bytes(), signature);

    if (!verified) {
      throw new Error('Signature verification failed');
    }

    return decryptedMessage;
  }

  symmetricEncryption(data:string){
    const ciphertext = CryptoJS.AES.encrypt(data, this.secretKey).toString();
    return ciphertext;
  }

  symmetricDecryption(data:string){
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.secretKey);
      var val = bytes.toString(CryptoJS.enc.Utf8);
      return val;
    } catch (e) {
      console.error('Error decrypting local storage item', e);
      return null;
    }
  }

}