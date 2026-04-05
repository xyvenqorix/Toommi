const { TonClient, WalletContractV4, internal, toNano } = require("@ton/ton");
const { mnemonicToPrivateKey } = require("@ton/crypto");

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { address, points } = req.body;

    const client = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
        apiKey: '3c1af0b7c876a158c6b75aaab3944f0d2294e1f387de2918b3b3f01ace12b537'
    });

    // REEMPLAZA CON TUS 24 PALABRAS REALES
    const mnemonic = "TU_FRASE_AQUÍ"; 

    try {
        const key = await mnemonicToPrivateKey(mnemonic.split(" "));
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        const contract = client.open(wallet);
        
        // --- EXPLICACIÓN DE PUNTOS ---
        // 1 punto = 0.001 TON
        // Si el usuario tiene 100 puntos, recibe 0.1 TON
        const montoEnviar = (points * 0.001).toFixed(3); 

        const seqno = await contract.getSeqno();

        await contract.sendTransfer({
            secretKey: key.secretKey,
            seqno: seqno,
            messages: [internal({
                to: address,
                value: toNano(montoEnviar), // Convertimos a Nanotons correctamente
                body: "Retiro Diamante Xyvenqorix",
                bounce: false
            })]
        });
        
        res.status(200).json({ ok: true, amount: montoEnviar });
    } catch (e) {
        // Si sale error de número aquí, es por el formato del monto
        res.status(500).json({ ok: false, error: "Error de red: " + e.message });
    }
}
