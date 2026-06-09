const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// MoMo Sandbox Test Credentials (Cung cấp công khai bởi MoMo để test)
const partnerCode = 'MOMOBKUN20180529';
const accessKey = 'klm05TvNCzjOaHU1';
const secretKey = 'at67qH6mk8g5i1PeXjz9WzR114k71kFv';
const endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';

router.post('/momo', async (req, res) => {
    try {
        const { amount, orderInfo } = req.body;
        
        const redirectUrl = (process.env.FRONTEND_URL || 'http://localhost:5173') + '/checkout/success';
        const ipnUrl = (process.env.BACKEND_URL || 'http://localhost:5000') + '/api/payment/momo-ipn';
        const orderId = partnerCode + new Date().getTime();
        const requestId = orderId;
        const requestType = "captureWallet";
        const extraData = "";

        // Tạo raw signature
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        
        // Ký HMAC_SHA256
        const signature = crypto.createHmac('sha256', secretKey)
                                .update(rawSignature)
                                .digest('hex');

        // Body request gửi lên MoMo
        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            accessKey: accessKey,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: 'vi'
        });

        // Gửi request tới MoMo bằng fetch (Node 18+)
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            },
            body: requestBody
        });

        const data = await response.json();
        
        if (data && data.payUrl) {
            return res.status(200).json({ payUrl: data.payUrl });
        } else {
            console.error("MoMo Error:", data);
            return res.status(400).json({ error: "Lỗi tạo thanh toán MoMo", details: data });
        }

    } catch (error) {
        console.error("Lỗi Server:", error);
        res.status(500).json({ error: "Lỗi Server Nội Bộ" });
    }
});

// Route IPN (Webhook) để MoMo gọi lại cập nhật trạng thái đơn hàng
router.post('/momo-ipn', (req, res) => {
    console.log("MoMo IPN Callback nhận được:", req.body);
    // Tại đây bạn có thể kiểm tra signature và cập nhật trạng thái đơn hàng trong DB
    res.status(200).json({ message: "Nhận thông báo IPN thành công" });
});

module.exports = router;
