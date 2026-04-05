const { TonClient, WalletContractV4, internal, fromNano, toNano } = require("@ton/ton");
const { mnemonicToPrivateKey } = require("@ton/crypto");

export default async function handler(req, res) {
    // Solo permitir POST
    if (req.method !== 'POST') return res.status(405).json({ error: "Método no permitido" });

    const { address, points } = req.body;

    // Configuración del Cliente
    const client = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
        apiKey: '3c1af0b7c876a158c6b75aaab3944f0d2294e1f387de2918b3b3f01ace12b537'
    });

    // --- REVISA ESTO ---
    // Asegúrate de que sean 24 palabras separadas por UN SOLO espacio.
    const seed = "PALABRA1 PALABRA2 PALABRA3 ... PALABRA24"; 

    try {
        // 1. Validar Frase Semilla
        const key = await mnemonicToPrivateKey(seed.trim().split(/\s+/));
        
        // 2. Abrir Wallet (V4 es la estándar de Tonkeeper/MyTonWallet)
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        const contract = client.open(wallet);

        // 3. Calcular monto (1 punto = 0.001 TON)
        const amountStr = (points * 0.001).toFixed(3);
        const amountNano = toNano(amountStr);

        // 4. Obtener Seqno (Número de secuencia para evitar duplicados)
        const seqno = await contract.getSeqno();

        // 5. Intentar transferencia
        await contract.sendTransfer({
            secretKey: key.secretKey,
            seqno: seqno,
            messages: [
                internal({
                    to: address,
                    value: amountNano,
                    body: "Retiro Diamante Xyvenqorix",
                    bounce: false,
                })
            ]
        });

        return res.status(200).json({ ok: true, msg: "Transferencia enviada" });

    } catch (err) {
        console.error("ERROR DETECTADO:", err.message);
        return res.status(500).json({ 
            ok: false, 
            error: "Fallo en el servidor: " + err.message,
            ayuda: "Revisa que tu frase semilla tenga 24 palabras y que la wallet tenga saldo."
        });
    }
}
