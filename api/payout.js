const { TonClient, WalletContractV4, internal, toNano } = require("@ton/ton");
const { mnemonicToPrivateKey } = require("@ton/crypto");

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ ok: false });

    const { address, points } = req.body;
    
    // Toncenter API Key de tu captura
    const client = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
        apiKey: '3c1af0b7c876a158c6b75aaab3944f0d2294e1f387de2918b3b3f01ace12b537'
    });

    // REEMPLAZA CON TUS 24 PALABRAS REALES
    const seed = "PALABRA1 PALABRA2 PALABRA3 ... PALABRA24"; 

    try {
        const key = await mnemonicToPrivateKey(seed.trim().split(/\s+/));
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        const contract = client.open(wallet);

        // Cálculo exacto: 1 punto = 0.001 TON
        const amount = (points * 0.001).toFixed(3);
        const seqno = await contract.getSeqno();

        await contract.sendTransfer({
            secretKey: key.secretKey,
            seqno: seqno,
            messages: [internal({
                to: address,
                value: toNano(amount),
                body: "Xyvenqorix Payout",
                bounce: false
            })]
        });

        res.status(200).json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
}
