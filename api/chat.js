export default async function handler(req, res) {
  // Sadece POST isteklerine izin ver
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Sadece POST isteği kullanılabilir."
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Mesaj bulunamadı."
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "Mesaj çok uzun."
      });
    }

    // API anahtarı Vercel Environment Variables'dan alınır.
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "TAÇ AI API anahtarı henüz yapılandırılmamış."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",

          instructions:
            "Sen TAÇ AI'sın. Türkçe konuşan, yardımsever, açık ve anlaşılır bir yapay zeka asistanısın. Kullanıcılara eğitim, iş, girişimcilik, içerik üretimi, teknoloji, yazı, planlama ve günlük konularda yardımcı ol. Bilmediğin bilgileri uydurma. Gerektiğinde kullanıcıya daha fazla bilgi vermesini iste.",

          input: message,

          max_output_tokens: 1000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);

      return res.status(response.status).json({
        error: "TAÇ AI şu anda yanıt veremiyor."
      });
    }

    const answer =
      data.output_text ||
      "Üzgünüm, şu anda bir yanıt oluşturamadım.";

    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error("TAÇ AI server error:", error);

    return res.status(500).json({
      error: "Sunucu tarafında bir hata oluştu."
    });
  }
}
