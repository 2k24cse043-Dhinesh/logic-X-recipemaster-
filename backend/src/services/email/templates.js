const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

const content = {
  reset: {
    subject: 'Reset your RecipeMaster password',
    heading: 'Choose a new password.',
    body: 'We received a request to reset your RecipeMaster password. This link expires in 30 minutes.',
    action: 'Reset password',
    ignore: 'If you did not request a password reset, you can ignore this email.',
  },
};

export function renderAuthEmail(type, { name = 'cook', link = '' } = {}) {
  const template = content[type];
  if (!template) throw new Error('Unknown authentication email template.');
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(link);
  const action = template.action && link
    ? `<p style="margin:28px 0"><a href="${safeLink}" style="display:inline-block;background:#b5533c;color:#fffaf1;padding:13px 20px;text-decoration:none;font-weight:700">${template.action}</a></p><p style="font-size:12px;color:#766c61">Or open this link: <br><a href="${safeLink}" style="color:#8f432f;word-break:break-all">${safeLink}</a></p>`
    : '';

  return {
    subject: template.subject,
    text: `${template.heading}\n\nHello ${name},\n\n${template.body}${link ? `\n\n${template.action || 'Open RecipeMaster'}: ${link}` : ''}\n\n${template.ignore}\n\nRecipeMaster Support`,
    html: `<!doctype html><html><body style="margin:0;background:#f6efe4;color:#2b2622;font-family:Arial,sans-serif"><main style="max-width:560px;margin:32px auto;padding:34px;background:#fbf8f2"><p style="margin:0 0 28px;color:#6b6f3e;font-size:12px;font-weight:bold;letter-spacing:1px">RECIPEMASTER</p><h1 style="font-family:Georgia,serif;font-size:30px;font-weight:normal">${template.heading}</h1><p style="font-size:15px;line-height:1.7">Hello ${safeName},</p><p style="font-size:15px;line-height:1.7">${template.body}</p>${action}<p style="margin-top:32px;padding-top:18px;border-top:1px solid #d9cbb8;color:#766c61;font-size:12px;line-height:1.6">${template.ignore}<br>RecipeMaster Support</p></main></body></html>`,
  };
}