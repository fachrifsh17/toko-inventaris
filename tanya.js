async function main() {
  const pertanyaan = process.argv.slice(2).join(" ");
  if (!pertanyaan) {
    console.log('Cara pakai: node tanya.js "Halo, apa kabar?"');
    return;
  }

  // Masukkan kunci baru setelah kamu menghapus yang lama dan membuat yang baru
  const apiKey = "SK_OPENROUTER_KAMU_YANG_BARU"; 

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // Wajib diisi di OpenRouter
        "X-Title": "Asisten Coding Rofa"          // Opsional
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-preview-02-05:free",
        messages: [{ role: "user", content: pertanyaan }]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      console.log("\n🤖 Gemini (via OpenRouter):\n", data.choices[0].message.content);
    } else {
      console.log("\n❌ Error dari OpenRouter:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Gagal konek ke OpenRouter:", err.message);
  }
}

main();