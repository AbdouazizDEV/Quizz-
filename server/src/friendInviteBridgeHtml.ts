/**
 * Page servie sur GET /friend : lien HTTPS cliquable (WhatsApp, SMS…)
 * → redirection vers quizzplus://friend?d=… pour ouvrir l’app.
 */
export function buildFriendInviteBridgeHtml(deepLinkBase: string): string {
  const base = JSON.stringify(deepLinkBase.replace(/\?.*$/, ''));
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Quizz+ — Invitation ami</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; max-width: 420px; margin: 0 auto; }
    p { color: #424242; line-height: 1.5; }
    a { color: #2A2D5E; font-weight: 600; }
  </style>
</head>
<body>
  <p id="msg">Ouverture de Quizz+…</p>
  <p id="fallback" style="display:none">
    Si l’application ne s’ouvre pas,
    <a id="manual" href="#">appuyez ici</a>.
  </p>
  <script>
    (function () {
      var deep = ${base};
      var qs = window.location.search;
      if (!qs || qs.indexOf('d=') < 0) {
        document.getElementById('msg').textContent =
          'Lien d’invitation invalide. Demandez un nouveau lien à votre ami.';
        return;
      }
      var target = deep + qs;
      var manual = document.getElementById('manual');
      manual.href = target;
      document.getElementById('fallback').style.display = 'block';
      window.location.replace(target);
      setTimeout(function () {
        document.getElementById('msg').textContent =
          'Ouvrez Quizz+ pour accepter l’invitation.';
      }, 2500);
    })();
  </script>
</body>
</html>`;
}
