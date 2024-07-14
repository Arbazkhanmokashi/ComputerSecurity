using System.Security.Cryptography;

namespace ChatApplication.Library.Encryption
{
    public static class Encryption
    {
        public static (string, string) GenerateKeys()
        {
            string AESkey = string.Empty, AESIV = string.Empty;
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.GenerateKey();
                aesAlg.GenerateIV();

                // Save the key and IV to files
                AESkey = Convert.ToBase64String(aesAlg.Key);
                AESIV = Convert.ToBase64String(aesAlg.IV);
            }

            return (AESkey, AESIV);
        }
        public static string EncryptString(string plainText, byte[] Key, byte[] IV)
        {
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = Key;
                aesAlg.IV = IV;

                ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                using (MemoryStream msEncrypt = new MemoryStream())
                {
                    using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                        {
                            swEncrypt.Write(plainText);
                        }
                        byte[] encrypted = msEncrypt.ToArray();
                        return Convert.ToBase64String(encrypted);
                    }
                }
            }
        }

        public static string DecryptString(string cipherText, byte[] Key, byte[] IV)
        {
            byte[] cipherTextBytes = Convert.FromBase64String(cipherText);

            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = Key;
                aesAlg.IV = IV;

                ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                using (MemoryStream msDecrypt = new MemoryStream(cipherTextBytes))
                {
                    using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                        {
                            return srDecrypt.ReadToEnd();
                        }
                    }
                }
            }
        }
    }
}
