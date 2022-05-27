# Pix Tools

Your PIX module for TypeScript!

### Install

```bash
yarn add pix-tools
```

### Static Pix BrCode

```ts
import {PixBrCode} from "pix-tools"

const run = async ()=>{
    const brCode = new PixBrCode({
        pixKey: "PIX_KEY_HERE",
        additionalInfo: "Some message",
        merchantName: "Guilherme Henrique",
        merchantCity: "Sao Paulo",
        postalCode: "086300000",
        transactionAmount: "10.01",
        referenceLabel: "foo123bar"
    })
    console.log(brCode.get())
}

run()
```