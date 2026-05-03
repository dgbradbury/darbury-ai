export function verificationEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Darbury AI Lab access code</title>
</head>
<body style="margin:0;padding:0;background:#0a0e14;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e14;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111820;border:1px solid #1e2d3d;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #1e2d3d;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#3eb8a0;">
                DARBURY AI LAB
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:28px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#e8edf4;">
                Your access code
              </h1>
              <p style="margin:0 0 32px;font-size:15px;color:#8a9bb0;">
                This code expires in 15 minutes.
              </p>
              <!-- Code block -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  ${code
                    .split("")
                    .map(
                      (d) =>
                        `<td style="width:48px;height:56px;background:#1a2332;border:1px solid #1e2d3d;border-radius:4px;text-align:center;vertical-align:middle;font-family:monospace;font-size:28px;font-weight:700;color:#3eb8a0;margin-right:6px;">${d}</td>`
                    )
                    .join('<td style="width:6px;"></td>')}
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:14px;color:#8a9bb0;">
                You&rsquo;re accessing:
              </p>
              <ul style="margin:0 0 32px;padding-left:20px;font-size:14px;color:#8a9bb0;line-height:1.8;">
                <li>Engineering Brief Analyser</li>
                <li>Drawing Intelligence Demo</li>
                <li>Automation Opportunity Finder</li>
              </ul>
              <p style="margin:0;font-size:14px;color:#4a5568;">
                One code gives you access to all three Labs for 24 hours.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e2d3d;">
              <p style="margin:0;font-size:12px;color:#4a5568;">
                Darbury Ltd &middot; Engineering Technology Consultancy<br />
                You received this because you requested access to the Darbury AI Lab.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
