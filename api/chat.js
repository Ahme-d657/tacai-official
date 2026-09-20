export default async function handler(req, res) {
  // Sadece POST isteklerine izin ver
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Sadece POST isteği kullanılabilir."
    });
  }

  try {
    // Kullanıcı mesajını al
    const { message } = req.body || {};

    // Mesaj kontrolü
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Lütfen bir mesaj yaz."
      });
    }

    // Boş mesaj kontrolü
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return res.status(400).json({
        error: "Lütfen bir mesaj yaz."
      });
    }

    // Çok uzun mesajları engelle
    if (cleanMessage.length > 4000) {
      return res.status(400).json({
        error: "Mesaj çok uzun. Lütfen 4000 karakterden kısa bir mesaj yaz."
      });
    }

    // API anahtarını Vercel Environment Variables'dan al
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY bulunamadı.");

      return res.status(500).json({
        error: "TAÇ AI API anahtarı yapılandırılmamış."
      });
    }

    // OpenAI Responses API
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

          instructions: `
Sen TAÇ AI'sın.

TAÇ AI, kullanıcılara günlük yaşamda ve farklı alanlarda
yardımcı olan Türkçe bir yapay zeka asistanıdır.

Görevlerin:
- Kullanıcının sorusunu doğru anlamak.
- Türkçe, açık ve anlaşılır cevap vermek.
- Eğitim konusunda yardımcı olmak.
- İş ve girişimcilik konularında fikir vermek.
- Teknoloji konusunda yardımcı olmak.
- İçerik üretimi konusunda fikirler hazırlamak.
- Yazı, metin ve plan hazırlamaya yardımcı olmak.
- Günlük soruları cevaplamak.
- Kullanıcı bir plan istediğinde uygulanabilir adımlar vermek.
- Bilmediğin bilgileri uydurmamak.
- Emin olmadığın güncel bilgiler konusunda bunu açıkça belirtmek.
- Gereksiz yere uzun cevap vermemek.
- Kullanıcıya saygılı ve yardımcı bir üslupla cevap vermek.

TAÇ AI'nin amacı:
"Yapay zekâ ile her işinde yanında."

Kullanıcı ne sorarsa sorsun, mümkün olduğunca
faydalı ve uygulanabilir bir cevap vermeye çalış.
          `,

          input: cleanMessage,

          max_output_tokens: 1000
        })
      }
    );

    // OpenAI cevabını JSON olarak oku
    const data = await response.json();

    // OpenAI hata verdiyse
    if (!response.ok) {
      console.error("OpenAI API Error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "TAÇ AI şu anda cevap veremiyor."
      });
    }

    // Cevabı al
    const answer =
      data?.output_text ||
      "Üzgünüm, şu anda bir cevap oluşturamadım.";

    // Frontend'in beklediği format
    return res.status(200).json({
      reply: answer
    });

  } catch (error) {
    // Beklenmeyen sunucu hatası
    console.error("TAÇ AI Server Error:", error);

    return res.status(500).json({
      error: "TAÇ AI sunucusunda bir hata oluştu."
    });
  }
}
