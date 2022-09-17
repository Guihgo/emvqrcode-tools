import { PixBrCode } from ".."

const run = async () => {
    const brCode = new PixBrCode({
        pixKey: "PIX_KEY_HERE",
        additionalInfo: "Some message",
        merchantName: "Guilherme Henrique",
        merchantCity: "São Paulo",
        postalCode: "086300000",
        transactionAmount: 0.01,
        referenceLabel: "foo123bar"
    })

    const code = brCode.get()
    console.log(code)
    
    console.log(PixBrCode.parse(code))
}

run()