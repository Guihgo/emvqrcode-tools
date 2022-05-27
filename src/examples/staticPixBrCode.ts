import {PixBrCode} from "../"

const run = async ()=>{
    const brCode = new PixBrCode({
        pixKey: "PIX_KEY_HERE",
        additionalInfo: "Some message",
        merchantName: "Guilherme Henrique",
        merchantCity: "São Paulo",
        postalCode: "086300000",
        transactionAmount: "10.01",
        referenceLabel: "foo123bar"
    })
    console.log(brCode.get())
}

run()