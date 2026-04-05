const { TonClient, WalletContractV4, internal } = require("@ton/ton");
const { mnemonicToPrivateKey } = require("@ton/crypto");

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { address, points } = req.body;

    const client = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
        apiKey: '3c1af0b7c876a158c6b75aaab3944f0d2294e1f387de2918b3b3f01ace12b537'
    });

    // REEMPLAZA ESTO CON TUS 24 PALABRAS
    const mnemonic = "PALABRA1 PALABRA2 ... PALABRA24"; 

    try {
        const key = await mnemonicToPrivateKey(mnemonic.split(" "));
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        const contract = client.open(wallet);
        const seqno = await contract.getSeqno();

        await contract.sendTransfer({
            secretKey: key.secretKey,
            seqno: seqno,
            messages: [internal({
                to: address,
                value: (points * 0.0001).toString(), // Ajusta cuánto TON das por punto
                body: "Retiro Diamante Xyvenqorix",
                bounce: false
            })]
        });
        res.status(200).json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
}
