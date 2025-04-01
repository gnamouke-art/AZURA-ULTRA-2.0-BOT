const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn, text }) => {
  const fromMe = msg.key.fromMe;

  if (!fromMe) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: "⛔ Solo el *dueño del subbot* puede usar este comando."
    }, { quoted: msg });
  }

  let target;
  if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    target = msg.message.extendedTextMessage.contextInfo.participant;
  } else if (text && text.trim() !== "") {
    target = text;
  }

  if (!target) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: "⚠️ Cita el mensaje del usuario o escribe su número."
    }, { quoted: msg });
  }

  target = target.replace(/\D/g, "");

  // Obtener el ID limpio del subbot
  const rawID = conn.user?.id || "";
  const subbotID = rawID.split(":")[0] + "@s.whatsapp.net";

  const filePath = path.join(__dirname, "../listasubots.json");
  let data = {};

  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  if (!Array.isArray(data[subbotID])) {
    data[subbotID] = [];
  }

  if (data[subbotID].includes(target)) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: "ℹ️ Ese número ya está en tu lista."
    }, { quoted: msg });
  }

  data[subbotID].push(target);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  await conn.sendMessage(msg.key.remoteJid, {
    text: `✅ Usuario *${target}* agregado a tu lista.`
  }, { quoted: msg });
};

handler.command = ['addlista'];
module.exports = handler;
