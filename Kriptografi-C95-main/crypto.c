#include <stdio.h>
#include <string.h>

#define BLOCK_SIZE 8

// XOR
void xor_block(unsigned char *a, unsigned char *b, unsigned char *result) {
    for(int i = 0; i < BLOCK_SIZE; i++) {
        result[i] = a[i] ^ b[i];
    }
}

// Substitusi
void substitute(unsigned char *block) {
    for(int i = 0; i < BLOCK_SIZE; i++) {
        block[i] += 3;
    }
}

// Invers
void inverse_substitute(unsigned char *block) {
    for(int i = 0; i < BLOCK_SIZE; i++) {
        block[i] -= 3;
    }
}

// Convert ke HEX
void to_hex(unsigned char *data, int len) {
    for(int i = 0; i < len; i++) {
        printf("%02x", data[i]);
    }
    printf("\n");
}

// Convert dari HEX
void from_hex(char *hex, unsigned char *output, int *out_len) {
    int len = strlen(hex);
    *out_len = len / 2;

    for(int i = 0; i < *out_len; i++) {
        sscanf(hex + 2*i, "%2hhx", &output[i]);
    }
}

// ENCRYPT
int encrypt(unsigned char *plaintext, int len, unsigned char *key, unsigned char *cipher) {
    unsigned char prev[BLOCK_SIZE];
    memcpy(prev, key, BLOCK_SIZE);

    int out_len = 0;

    for(int i = 0; i < len; i += BLOCK_SIZE) {
        unsigned char block[BLOCK_SIZE] = {0};
        unsigned char result[BLOCK_SIZE];

        int block_len = (len - i >= BLOCK_SIZE) ? BLOCK_SIZE : len - i;
        memcpy(block, plaintext + i, block_len);

        xor_block(block, prev, result);
        substitute(result);

        memcpy(prev, result, BLOCK_SIZE);
        memcpy(cipher + out_len, result, BLOCK_SIZE);

        out_len += BLOCK_SIZE;
    }

    return out_len;
}

// DECRYPT
void decrypt(unsigned char *cipher, int len, unsigned char *key, unsigned char *plain) {
    unsigned char prev[BLOCK_SIZE];
    memcpy(prev, key, BLOCK_SIZE);

    int out_len = 0;

    for(int i = 0; i < len; i += BLOCK_SIZE) {
        unsigned char block[BLOCK_SIZE];
        unsigned char temp[BLOCK_SIZE];

        memcpy(block, cipher + i, BLOCK_SIZE);
        memcpy(temp, block, BLOCK_SIZE);

        inverse_substitute(block);
        xor_block(block, prev, block);

        memcpy(prev, temp, BLOCK_SIZE);
        memcpy(plain + out_len, block, BLOCK_SIZE);

        out_len += BLOCK_SIZE;
    }

    plain[out_len] = '\0';
}

// MAIN
int main() {
    int choice;
    unsigned char text[200];
    unsigned char cipher[400];
    unsigned char result[400];
    unsigned char key[BLOCK_SIZE] = "12345678";
    int cipher_len;

    printf("=== Crypto C95 (C Version) ===\n");
    printf("1. Encrypt\n2. Decrypt\nPilih: ");
    scanf("%d", &choice);
    getchar();

    if(choice == 1) {
        printf("Masukkan teks: ");
        fgets((char*)text, sizeof(text), stdin);
        text[strcspn((char*)text, "\n")] = 0;

        cipher_len = encrypt(text, strlen((char*)text), key, cipher);

        printf("\nHasil Enkripsi (HEX):\n");
        to_hex(cipher, cipher_len);

    } else if(choice == 2) {
        char hex_input[400];
        int len;

        printf("Masukkan HEX cipher: ");
        fgets(hex_input, sizeof(hex_input), stdin);
        hex_input[strcspn(hex_input, "\n")] = 0;

        from_hex(hex_input, cipher, &len);
        decrypt(cipher, len, key, result);

        printf("\nHasil Dekripsi:\n%s\n", result);
    }

    return 0;
}