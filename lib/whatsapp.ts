const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

export async function sendWhatsAppMessage(
  to: string,
  content: string,
  type: "text" | "image" | "audio",
  mediaUrl?: string,
) {
  const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`

  const messageData: any = {
    messaging_product: "whatsapp",
    to: to,
  }

  switch (type) {
    case "text":
      messageData.type = "text"
      messageData.text = { body: content }
      break
    case "image":
      messageData.type = "image"
      messageData.image = {
        link: mediaUrl,
        caption: content,
      }
      break
    case "audio":
      messageData.type = "audio"
      messageData.audio = {
        link: mediaUrl,
      }
      break
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageData),
  })

  if (!response.ok) {
    throw new Error(`WhatsApp API error: ${response.statusText}`)
  }

  return await response.json()
}

export async function downloadWhatsAppMedia(mediaId: string) {
  const url = `https://graph.facebook.com/v18.0/${mediaId}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
  })

  if (!response.ok) {
    throw new Error(`WhatsApp Media API error: ${response.statusText}`)
  }

  const mediaData = await response.json()

  // Download the actual media file
  const mediaResponse = await fetch(mediaData.url, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
  })

  return mediaResponse
}
