import { Injectable } from '@angular/core';
import { User, UserMessage } from '../../models/user/user';

const pemHeader = "-----BEGIN PUBLIC KEY-----";
const pemFooter = "-----END PUBLIC KEY-----";

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor() { }

  generateKeyPair = async () => {
    return window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    );
  }

  exportKeyAsString = async(key:any) => {
    const exported = await this.exportKey(key);
    const exportedAsString = this.ab2str(exported);
    const exportedAsBase64 = window.btoa(exportedAsString);
    const pemExported = `${pemHeader}\n${exportedAsBase64}\n${pemFooter}`;
    return pemExported;
  }

  importRsaKeyFromString = async (pem:string) => {
    // fetch the part of the PEM string between header and footer
    
    const pemContents = pem.substring(
      pemHeader.length,
      pem.length - pemFooter.length - 1,
    );
    // base64 decode the string to get the binary data
    const binaryDerString = window.atob(pemContents);
    // convert from a binary string to an ArrayBuffer
    const binaryDer = this.str2ab(binaryDerString);
  
    return window.crypto.subtle.importKey(
      "spki",
      binaryDer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"],
    );
  }

  encryptMessage = async (recipients: User[], message:string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const encryptedMessages = await Promise.all(
        recipients.map(async (user) => {
            const encryptedMessage = await window.crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP"
                },
                user.publicKey,
                data
            );
            const exportedAsString = this.ab2str(encryptedMessage);
            const exportedAsBase64 = window.btoa(exportedAsString);
            var messageData: UserMessage = { id: user.id, message: exportedAsBase64 };
            return messageData;
        })
    );
    
    return encryptedMessages;
  }

  decryptMessage = async (privateKey:CryptoKey, messageRecord:UserMessage[], id:string) => {
    // Find the encrypted message for the recipient
    const recipientMessage = messageRecord.find(
      msg => msg.id === id
    );

    if (!recipientMessage) {
      throw new Error("No message found for the recipient.");
    }
    
    // base64 decode the string to get the binary data
    const binaryDerString = window.atob(recipientMessage?.message);
    // convert from a binary string to an ArrayBuffer
    const binaryDer = this.str2ab(binaryDerString);

    const decryptedData = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP"
        },
        privateKey,
        binaryDer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  }


  private exportKey = async (key:any) => {
    return window.crypto.subtle.exportKey("spki", key);
  }

  //convert array buffer to string
  private ab2str = (buf:ArrayBuffer):string => {
    return String.fromCharCode.apply(null, [...new Uint8Array(buf)]);
  }

  //convert string to array buffer
  private str2ab = (str:string):ArrayBuffer => {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

}
