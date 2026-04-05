const { TonClient, WalletContractV4, internal, toNano } = require("@ton/ton");
const { mnemonicToPrivateKey } = require("@ton/crypto");

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ ok: false });
    const { address, points } = req.body;

    const client = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
        apiKey: '3c1af0b7c876a158c6b75aaab3944f0d2294e1f387de2918b3b3f01ace12b537'
    });

    // PON AQUÍ TUS 24 PALABRAS DE TU BILLETERA CON TON REAL
    const mnemonic = "palabra1 palabra2 ... palabra24"; 

    try {
        const key = await mnemonicToPrivateKey(mnemonic.trim().split(/\s+/));
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        const contract = client.open(wallet);
        
        const amount = (points * 0.001).toFixed(3);
        const seqno = await contract.getSeqno();

        await contract.sendTransfer({
            secretKey: key.secretKey,
            seqno: seqno,
            messages: [internal({
                to: address,
                value: toNano(amount),
                body: "Retiro Diamante",
                bounce: false
            })]
        });
        res.status(200).json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
}
